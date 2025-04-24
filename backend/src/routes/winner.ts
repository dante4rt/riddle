import express from "express";
import { WinnerLog } from "../models/WinnerLog";
import { markWinner } from "../services/riddleRewards";

const router = express.Router();

router.post("/", async (req, res) => {
  const { user, chainId } = req.body;

  if (!user) return res.status(400).json({ error: "User address required" });

  try {
    const txHash = await markWinner(user, chainId);
    await WinnerLog.create({ user, txHash });

    res.json({ success: true, txHash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark winner" });
  }
});

export default router;
