import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { score: { not: null } },
      include: { user: { select: { id: true, name: true, image: true } }, challenge: { select: { title: true, difficulty: true } } },
      orderBy: { score: 'desc' },
      take: 50,
    });

    const scoreMap = new Map<string, { user: any; totalScore: number; count: number; bestScore: number; challenges: string[] }>();
    submissions.forEach((s) => {
      const existing = scoreMap.get(s.userId);
      if (existing) {
        existing.totalScore += s.score || 0;
        existing.count += 1;
        existing.bestScore = Math.max(existing.bestScore, s.score || 0);
        if (s.challenge) existing.challenges.push(s.challenge.title);
      } else {
        scoreMap.set(s.userId, { user: s.user, totalScore: s.score || 0, count: 1, bestScore: s.score || 0, challenges: s.challenge ? [s.challenge.title] : [] });
      }
    });

    const leaderboard = Array.from(scoreMap.entries())
      .map(([userId, data]) => ({ userId, name: data.user.name, image: data.user.image, totalScore: Math.round(data.totalScore), challengesSolved: data.count, bestScore: Math.round(data.bestScore), averageScore: Math.round(data.totalScore / data.count), challenges: data.challenges.slice(0, 5) }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 50);

    const userRank = req.user ? leaderboard.findIndex((e) => e.userId === req.user!.id) + 1 : -1;

    res.json({ leaderboard, userRank: userRank > 0 ? userRank : null });
  } catch { res.status(500).json({ error: 'Failed to get leaderboard.' }); }
};

export const getWeeklyChallenge = async (_req: AuthRequest, res: Response) => {
  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weeklySubs = await prisma.submission.findMany({
      where: { createdAt: { gte: weekStart }, score: { not: null } },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { score: 'desc' },
    });

    const weekly = weeklySubs.map((s) => ({
      userId: s.userId, name: s.user.name, score: Math.round(s.score || 0), language: s.language, createdAt: s.createdAt,
    }));

    res.json(weekly);
  } catch { res.status(500).json({ error: 'Failed to get weekly challenge.' }); }
};
