import express from "express";
import { markWinner } from "../services/riddleRewards";
import { verifyAdminJWT } from "../middleware/auth";
import { WinnerLog } from "../models/WinnerLog";

const router = express.Router();

router.post("/", verifyAdminJWT, async (req, res) => {
  const { user } = req.body;

  if (!user) return res.status(400).json({ error: "User address required" });

  try {
    const txHash = await markWinner(user);
    await WinnerLog.create({ user, txHash });

    res.json({ success: true, txHash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark winner" });
  }
});

export default router;
