import mongoose from "mongoose";

const WinnerLogSchema = new mongoose.Schema({
  user: { type: String, required: true },
  txHash: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const WinnerLog = mongoose.model("WinnerLog", WinnerLogSchema);
