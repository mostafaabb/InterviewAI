import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalInterviews = await prisma.interview.count();
    const totalChallenges = await prisma.codingChallenge.count();
    const totalSubmissions = await prisma.submission.count();

    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'ACTIVE', plan: { not: 'FREE' } },
    });

    const proCount = await prisma.subscription.count({ where: { plan: 'PRO', status: 'ACTIVE' } });
    const premiumCount = await prisma.subscription.count({ where: { plan: 'PREMIUM', status: 'ACTIVE' } });
    const estimatedRevenue = (proCount * 12) + (premiumCount * 25);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: lastMonth } },
    });

    res.json({
      totalUsers,
      totalInterviews,
      totalChallenges,
      totalSubmissions,
      activeSubscriptions,
      estimatedRevenue,
      newUsers,
      proCount,
      premiumCount,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to get admin data.' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(String(req.query.page || '1'));
    const limit = parseInt(String(req.query.limit || '20'));
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, plan: true, createdAt: true },
    });

    const total = await prisma.user.count();
    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users.' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { role, plan } = req.body;
    const user = await prisma.user.update({
      where: { id: String(req.params.id) },
      data: { role, plan },
      select: { id: true, name: true, email: true, role: true, plan: true },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'User deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
};

export const createChallenge = async (req: AuthRequest, res: Response) => {
  try {
    const challenge = await prisma.codingChallenge.create({ data: req.body });
    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create challenge.' });
  }
};

export const updateChallenge = async (req: AuthRequest, res: Response) => {
  try {
    const challenge = await prisma.codingChallenge.update({
      where: { id: String(req.params.id) },
      data: req.body,
    });
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update challenge.' });
  }
};

export const deleteChallenge = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.codingChallenge.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Challenge deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete challenge.' });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const interviewsByType = await prisma.interview.groupBy({
      by: ['type'],
      _count: { id: true },
    });

    const interviewsByCategory = await prisma.interview.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    const usersByPlan = await prisma.user.groupBy({
      by: ['plan'],
      _count: { id: true },
    });

    res.json({ interviewsByType, interviewsByCategory, usersByPlan });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics.' });
  }
};
