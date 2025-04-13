import mongoose from 'mongoose';

export interface IRiddle {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answer: string;
  rewardAmount: number;
  solvedBy: mongoose.Types.ObjectId[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const riddleSchema = new mongoose.Schema<IRiddle>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: ['easy', 'medium', 'hard'],
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      select: false,
    },
    rewardAmount: {
      type: Number,
      required: [true, 'Reward amount is required'],
      min: 0,
    },
    solvedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Riddle = mongoose.model<IRiddle>('Riddle', riddleSchema);
