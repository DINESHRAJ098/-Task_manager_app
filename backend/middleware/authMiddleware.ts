import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/User.js';

export interface AuthenticatedRequest extends Request {
  user?: Omit<IUser, 'matchPassword'>;
}

interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_task_manager_jwt_secret_key_98234710293847';

/**
 * Protect Middleware:
 * Verifies JWT token from Authorization header and injects authenticated user into request object
 */
export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, no Bearer token provided in request headers',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await UserModel.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized, user token is invalid or user no longer exists',
      });
      return;
    }

    req.user = user;
    next();
  } catch (err: unknown) {
    const error = err as Error;
    console.error('JWT Verification error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Not authorized, token verification failed or expired',
    });
  }
};
