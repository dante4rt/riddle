import { Request, Response } from 'express';
import { Riddle } from '../models/riddle';
import { User } from '../models/user';
import { successResponse, errorResponse } from '../utils/responseHandler';
import {
  markUserAsWinner,
  checkUserEligibility,
} from '../services/blockchainService';

// @desc    Get all riddles
// @route   GET /api/riddles
// @access  Public
export const getRiddles = async (req: Request, res: Response) => {
  try {
    const riddles = await Riddle.find({ active: true }).select('-answer');
    successResponse(res, 'Riddles fetched successfully', riddles);
  } catch (error) {
    errorResponse(
      res,
      'Error fetching riddles',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
};

// @desc    Get single riddle
// @route   GET /api/riddles/:id
// @access  Public
export const getRiddle = async (req: Request, res: Response) => {
  try {
    const riddle = await Riddle.findById(req.params.id).select('-answer');

    if (!riddle) {
      errorResponse(res, 'Riddle not found', null, 404);
      return;
    }

    successResponse(res, 'Riddle fetched successfully', riddle);
  } catch (error) {
    errorResponse(
      res,
      'Error fetching riddle',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
};

// @desc    Create a riddle
// @route   POST /api/riddles
// @access  Private (Admin only)
export const createRiddle = async (req: Request, res: Response) => {
  try {
    const { title, description, difficulty, answer, rewardAmount } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user?.isAdmin) {
      errorResponse(res, 'Not authorized as admin', null, 403);
      return;
    }

    const riddle = await Riddle.create({
      title,
      description,
      difficulty,
      answer,
      rewardAmount,
    });

    successResponse(res, 'Riddle created successfully', riddle, 201);
  } catch (error) {
    errorResponse(
      res,
      'Error creating riddle',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
};

// @desc    Submit riddle answer
// @route   POST /api/riddles/:id/submit
// @access  Private
export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { answer } = req.body;
    const riddleId = req.params.id;

    const riddle = await Riddle.findById(riddleId).select('+answer');
    if (!riddle) {
      errorResponse(res, 'Riddle not found', null, 404);
      return;
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      errorResponse(res, 'User not found', null, 404);
      return;
    }

    if (user.solvedRiddles.includes(riddleId as any)) {
      errorResponse(res, 'You have already solved this riddle', null, 400);
      return;
    }

    if (answer.trim().toLowerCase() !== riddle.answer.trim().toLowerCase()) {
      errorResponse(res, 'Incorrect answer', null, 400);
      return;
    }

    try {
      await markUserAsWinner(user.walletAddress);
    } catch (error) {
      errorResponse(
        res,
        'Error marking user as winner on blockchain',
        error instanceof Error ? error.message : 'Unknown error',
        500
      );
      return;
    }

    user.solvedRiddles.push(riddleId as any);
    await user.save();

    riddle.solvedBy.push(user._id);
    await riddle.save();

    successResponse(res, 'Correct answer! You can now claim your reward.', {
      riddleId: riddle._id,
      rewardAmount: riddle.rewardAmount,
      walletAddress: user.walletAddress,
    });
  } catch (error) {
    errorResponse(
      res,
      'Error submitting answer',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
};

// @desc    Check claim eligibility
// @route   GET /api/riddles/check-eligibility
// @access  Private
export const checkEligibility = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      errorResponse(res, 'User not found', null, 404);
      return;
    }

    const isEligible = await checkUserEligibility(user.walletAddress);

    successResponse(res, 'Eligibility checked', { isEligible });
  } catch (error) {
    errorResponse(
      res,
      'Error checking eligibility',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
};
