import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db, User } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'hirescan_jwt_secret_key_987654321';

// Custom interface to extend Express Request object
export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: 'student' | 'recruiter';
    name: string;
  };
}

export function hashPassword(password: string): string {
  const salt = 'hirescan_secure_salt_string_2026';
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      _id: decoded._id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    if (role !== 'student' && role !== 'recruiter') {
      res.status(400).json({ error: 'Invalid role selected.' });
      return;
    }

    const existingUser = db.findOne('users', { email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists.' });
      return;
    }

    const passwordHash = hashPassword(password);
    const user = db.insert('users', {
      email: email.toLowerCase(),
      passwordHash,
      name,
      role,
    });

    const token = generateToken(user);
    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.findOne('users', { email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
