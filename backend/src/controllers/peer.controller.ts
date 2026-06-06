import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    const { category, difficulty } = req.body;
    const session = await prisma.peerSession.create({
      data: { creatorId: req.user!.id, category, difficulty, status: 'WAITING' },
    });
    res.json(session);
  } catch { res.status(500).json({ error: 'Failed to create session.' }); }
};

export const findMatch = async (req: AuthRequest, res: Response) => {
  try {
    const { category, difficulty } = req.query;
    const match = await prisma.peerSession.findFirst({
      where: { status: 'WAITING', creatorId: { not: req.user!.id }, category: String(category), difficulty: String(difficulty) },
      include: { creator: { select: { id: true, name: true, image: true } } },
    });
    res.json(match || null);
  } catch { res.status(500).json({ error: 'Failed to find match.' }); }
};

export const joinSession = async (req: AuthRequest, res: Response) => {
  try {
    const session = await prisma.peerSession.update({
      where: { id: String(req.params.id) },
      data: { partnerId: req.user!.id, status: 'MATCHED' },
    });
    res.json(session);
  } catch { res.status(500).json({ error: 'Failed to join session.' }); }
};

export const submitFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { score, feedback } = req.body;
    const session = await prisma.peerSession.findUnique({ where: { id: String(req.params.id) } });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    const update: any = { status: 'COMPLETED', feedback };
    if (session.creatorId === req.user!.id) update.creatorScore = score;
    else update.partnerScore = score;
    const updated = await prisma.peerSession.update({ where: { id: String(req.params.id) }, data: update });
    res.json(updated);
  } catch { res.status(500).json({ error: 'Failed to submit feedback.' }); }
};

export const getMySessions = async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await prisma.peerSession.findMany({
      where: { OR: [{ creatorId: req.user!.id }, { partnerId: req.user!.id }] },
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { id: true, name: true } }, partner: { select: { id: true, name: true } } },
    });
    res.json(sessions);
  } catch { res.status(500).json({ error: 'Failed to get sessions.' }); }
};
