import mongoose from "mongoose";

const WordSchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true },
});

export const Word = mongoose.model("Word", WordSchema);
