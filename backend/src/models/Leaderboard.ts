import mongoose, { Document, Schema } from "mongoose";

export interface ILeaderboard extends Document {
    user: string;
    totalWins: number;
}

const LeaderboardSchema: Schema = new Schema(
    {
        user: { type: String, required: true, unique: true },
        totalWins: { type: Number, default: 1 },
    },
    { timestamps: true }
);

export const Leaderboard = mongoose.model<ILeaderboard>("Leaderboard", LeaderboardSchema);
