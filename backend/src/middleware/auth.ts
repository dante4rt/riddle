import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallbacksecret'
      ) as JwtPayload;

      req.user = { id: decoded.id };

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }
};
