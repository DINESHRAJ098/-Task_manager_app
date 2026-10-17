import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_task_manager_jwt_secret_key_98234710293847';

/**
 * Generate signed JWT token
 */
const generateToken = (id: string, email: string): string => {
  return jwt.sign({ id, email }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account & return JWT
 * @access  Public
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email format',
      });
      return;
    }

    // Check if user already exists
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
      return;
    }

    // Create user
    const newUser = await UserModel.create({
      name,
      email,
      password,
    });

    const token = generateToken(newUser._id, newUser.email);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during registration: ' + err.message,
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return JWT token
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
      return;
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const token = generateToken(user._id, user.email);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login: ' + err.message,
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile from token
 * @access  Private (Protected by JWT)
 */
router.get('/me', protect, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not found in context' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile: ' + err.message,
    });
  }
});

export default router;
