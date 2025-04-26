import express from "express";
import { Leaderboard } from "../models/Leaderboard";

const router = express.Router();

router.post("/", async (req, res) => {
    const { user } = req.body;

    if (!user) return res.status(400).json({ error: "User address required" });

    try {
        const existing = await Leaderboard.findOne({ user });

        if (existing) {
            existing.totalWins += 1;
            await existing.save();
        } else {
            await Leaderboard.create({ user });
        }

        res.json({ success: true, message: "Leaderboard updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update leaderboard" });
    }
});

router.get("/", async (_req, res) => {
    try {
        const topPlayers = await Leaderboard.find().sort({ totalWins: -1 }).limit(100);

        res.json({ success: true, data: topPlayers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});

export default router;
