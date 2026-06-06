import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'weekly' } = req.query;

    let dateFilter: Date;
    const now = new Date();

    switch (period) {
      case 'daily':
        dateFilter = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        dateFilter = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        dateFilter = new Date(now.setDate(now.getDate() - 7));
    }

    const progress = await prisma.progress.findMany({
      where: {
        userId: req.user?.id,
        date: { gte: dateFilter },
      },
      orderBy: { date: 'asc' },
    });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get progress.' });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const interviewsCompleted = await prisma.interview.count({
      where: { userId, status: 'COMPLETED' },
    });

    const challengesSolved = await prisma.submission.count({
      where: { userId },
    });

    const avgScore = await prisma.interview.aggregate({
      _avg: { score: true },
      where: { userId, status: 'COMPLETED', score: { not: null } },
    });

    const avgCodingScore = await prisma.submission.aggregate({
      _avg: { score: true },
      where: { userId, score: { not: null } },
    });

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentActivity = await prisma.interview.count({
      where: { userId, createdAt: { gte: lastWeek } },
    });

    const recentSubmissions = await prisma.submission.count({
      where: { userId, createdAt: { gte: lastWeek } },
    });

    const achievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });

    const currentStreak = await calculateStreak(userId);

    res.json({
      interviewsCompleted,
      challengesSolved,
      averageScore: Math.round(avgScore._avg.score || 0),
      averageCodingScore: Math.round(avgCodingScore._avg.score || 0),
      weeklyActivity: recentActivity + recentSubmissions,
      currentStreak,
      achievements,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats.' });
  }
};

async function calculateStreak(userId: string): Promise<number> {
  const progress = await prisma.progress.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 30,
  });

  if (progress.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < progress.length; i++) {
    const day = progress[i];
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - streak);

    if (dayDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export const getSkillLevels = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const interviews = await prisma.interview.findMany({
      where: { userId, status: 'COMPLETED' },
      include: { report: true },
    });

    const categories: Record<string, { count: number; totalScore: number }> = {};

    interviews.forEach((interview) => {
      if (!categories[interview.category]) {
        categories[interview.category] = { count: 0, totalScore: 0 };
      }
      categories[interview.category].count++;
      categories[interview.category].totalScore += interview.score || 0;
    });

    const skillLevels = Object.entries(categories).map(([name, data]) => ({
      name,
      level: Math.round(data.totalScore / data.count),
      interviewsCount: data.count,
    }));

    res.json(skillLevels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get skill levels.' });
  }
};
