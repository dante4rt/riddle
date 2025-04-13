import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  username: string;
  email: string;
  password: string;
  walletAddress: string;
  isAdmin: boolean;
  solvedRiddles: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    walletAddress: {
      type: String,
      required: [true, 'Wallet address is required'],
      unique: true,
      trim: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    solvedRiddles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Riddle',
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
