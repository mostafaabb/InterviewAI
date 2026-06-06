import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/prisma';
import { env } from '../config/env';
import { generateToken, generateRandomToken } from '../utils/token';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { AuthRequest } from '../middleware/auth';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = generateRandomToken();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
        subscription: { create: { plan: 'FREE', status: 'ACTIVE' } },
      },
    });

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role, plan: user.plan });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed.' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role, plan: user.plan });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
};

export const googleAuth = async (req: AuthRequest, res: Response) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Google auth failed.' });
    }

    let user = await prisma.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: payload.name || 'User',
          email: payload.email,
          image: payload.picture,
          googleId: payload.sub,
          emailVerified: true,
          subscription: { create: { plan: 'FREE', status: 'ACTIVE' } },
        },
      });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role, plan: user.plan });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role, plan: user.plan },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed.' });
  }
};

export const verifyEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.query;

    const user = await prisma.user.findFirst({ where: { verificationToken: token as string } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Email verification failed.' });
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const resetToken = generateRandomToken();
    const resetTokenExp = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'Password reset email sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send reset email.' });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExp: { gte: new Date() } },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExp: null },
    });

    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { id: true, name: true, email: true, image: true, role: true, plan: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, image } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user?.id },
      data: { name, image },
      select: { id: true, name: true, email: true, image: true, role: true, plan: true },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};
