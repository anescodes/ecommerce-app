import { Request, Response } from 'express';
import { registerUser, loginUser } from './auth.service';

export const registerHandler = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const result = await registerUser({ name, email, password });
    return res.status(201).json({
      message: 'User registered successfully',
      ...result,
    });
  } catch (error: any) {
    if (error.message === 'EMAIL_EXISTS') {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await loginUser({ email, password });
    return res.status(200).json({
      message: 'Login successful',
      ...result,
    });
  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};