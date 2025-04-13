import express from "express";
import { WinnerLog } from "../models/WinnerLog";
import { verifyAdminJWT } from "../middleware/auth";

const router = express.Router();

router.post("/", verifyAdminJWT, async (req, res) => {
  const { user, reward } = req.body;
  if (!user || !reward) return res.status(400).json({ error: "Missing user or reward" });

  const recent = await WinnerLog.findOne({ user }).sort({ timestamp: -1 });
  const alreadyClaimed = recent && Date.now() - recent.timestamp.getTime() < 12 * 60 * 60 * 1000;

  if (alreadyClaimed) return res.status(403).json({ error: "Cooldown active" });

  await WinnerLog.create({ user, txHash: "BE-confirmation" });

  res.json({ eligible: true });
});

export default router;
