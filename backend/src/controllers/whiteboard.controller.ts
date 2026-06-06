import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const saveWhiteboard = async (req: AuthRequest, res: Response) => {
  try {
    const { name, data, type } = req.body;
    const userId = req.user!.id;

    const board = await prisma.whiteboard.create({
      data: {
        userId,
        name: name || 'Untitled Diagram',
        data: JSON.stringify(data),
        type: type || 'system-design',
      },
    });

    res.json(board);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save whiteboard.' });
  }
};

export const getWhiteboards = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const boards = await prisma.whiteboard.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    const parsed = boards.map((b) => ({
      ...b,
      data: typeof b.data === 'string' ? JSON.parse(b.data) : b.data,
    }));

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get whiteboards.' });
  }
};

export const getWhiteboard = async (req: AuthRequest, res: Response) => {
  try {
    const board = await prisma.whiteboard.findFirst({
      where: { id: String(req.params.id), userId: req.user!.id },
    });
    if (!board) return res.status(404).json({ error: 'Whiteboard not found.' });

    res.json({
      ...board,
      data: typeof board.data === 'string' ? JSON.parse(board.data) : board.data,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get whiteboard.' });
  }
};

export const deleteWhiteboard = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.whiteboard.deleteMany({
      where: { id: String(req.params.id), userId: req.user!.id },
    });
    res.json({ message: 'Whiteboard deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete whiteboard.' });
  }
};
