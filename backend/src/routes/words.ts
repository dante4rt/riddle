import express from "express";
import { Word } from "../models/Word";
import crypto from "crypto";

const router = express.Router();

const activeWordMap = new Map<string, string>();

router.post("/", async (req, res) => {
  const { words } = req.body;
  if (!Array.isArray(words)) return res.status(400).json({ error: "words must be array" });

  const docs = words.map((w) => ({ value: w.toUpperCase() }));
  await Word.insertMany(docs, { ordered: false }).catch(() => {});
  res.json({ success: true });
});

router.get("/random", async (req, res) => {
  const user = req.query.user as string;
  if (!user) return res.status(400).json({ error: "Missing user address" });

  const count = await Word.countDocuments();
  const random = Math.floor(Math.random() * count);
  const wordDoc = await Word.findOne().skip(random);
  const word = wordDoc?.value;

  if (!word) return res.status(500).json({ error: "No word found" });

  activeWordMap.set(user, word);

  const hash = crypto.createHash("sha256").update(word).digest("hex");
  res.json({ hash });
});

function getStatus(guess: string, target: string): string[] {
  return guess.split("").map((char, i) => {
    if (char === target[i]) return "correct";
    if (target.includes(char)) return "present";
    return "absent";
  });
}

router.post("/check", async (req, res) => {
  const { user, guess } = req.body;
  if (!user || !guess) return res.status(400).json({ error: "Missing user or guess" });

  const actual = activeWordMap.get(user);
  if (!actual) return res.status(404).json({ error: "No game started for user" });

  const normalizedGuess = guess.toUpperCase();
  const correct = normalizedGuess === actual;
  const status = getStatus(normalizedGuess, actual);

  res.json({ correct, status });
});

export default router;
