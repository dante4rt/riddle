import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { successResponse, errorResponse } from '../utils/responseHandler';
import { ethers } from 'ethers';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, walletAddress } = req.body;

    if (!ethers.utils.isAddress(walletAddress)) {
      errorResponse(res, 'Invalid wallet address');
      return;
    }

    const userExists = await User.findOne({
      $or: [{ email }, { username }, { walletAddress }],
    });

    if (userExists) {
      errorResponse(res, 'User already exists', null, 400);
      return;
    }

    const user = await User.create({
      username,
      email,
      password,
      walletAddress,
    });

    if (user) {
      successResponse(
        res,
        'User registered successfully',
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          walletAddress: user.walletAddress,
          isAdmin: user.isAdmin,
          token: generateToken(user._id.toString()),
        },
        201
      );
    } else {
      errorResponse(res, 'Invalid user data', null, 400);
    }
  } catch (error) {
    errorResponse(
      res,
      'Error registering user',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      errorResponse(res, 'Invalid credentials', null, 401);
      return;
    }

    successResponse(res, 'Login successful', {
      _id: user._id,
      username: user.username,
      email: user.email,
      walletAddress: user.walletAddress,
      isAdmin: user.isAdmin,
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    errorResponse(
      res,
      'Error logging in',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      errorResponse(res, 'User not found', null, 404);
      return;
    }

    successResponse(res, 'User found', {
      _id: user._id,
      username: user.username,
      email: user.email,
      walletAddress: user.walletAddress,
      isAdmin: user.isAdmin,
      solvedRiddles: user.solvedRiddles,
    });
  } catch (error) {
    errorResponse(
      res,
      'Error getting user',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
};

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallbacksecret', {
    expiresIn: '30d',
  });
};
