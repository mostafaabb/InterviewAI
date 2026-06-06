import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const createStarAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { situation, task, action, result, category } = req.body;
    const score = Math.floor(Math.random() * 30) + 65;
    const feedbacks = [
      'Strong STAR structure. Consider adding more measurable outcomes.',
      'Good use of the STAR format. The action step could be more detailed.',
      'Well-structured answer. Try to quantify your results more.',
      'Clear and concise. The task section could be more specific.',
    ];
    const answer = await prisma.starAnswer.create({
      data: { userId: req.user!.id, situation, task, action, result, category: category || 'behavioral', score, feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)] },
    });
    res.json(answer);
  } catch { res.status(500).json({ error: 'Failed to create STAR answer.' }); }
};

export const getStarAnswers = async (req: AuthRequest, res: Response) => {
  try {
    const answers = await prisma.starAnswer.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(answers);
  } catch { res.status(500).json({ error: 'Failed to get STAR answers.' }); }
};

export const getStarAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const answer = await prisma.starAnswer.findFirst({ where: { id: String(req.params.id), userId: req.user!.id } });
    if (!answer) return res.status(404).json({ error: 'Answer not found.' });
    res.json(answer);
  } catch { res.status(500).json({ error: 'Failed to get STAR answer.' }); }
};

export const deleteStarAnswer = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.starAnswer.deleteMany({ where: { id: String(req.params.id), userId: req.user!.id } });
    res.json({ message: 'Deleted.' });
  } catch { res.status(500).json({ error: 'Failed to delete.' }); }
};
