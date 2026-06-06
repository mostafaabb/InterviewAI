import { Response } from 'express';
import prisma from '../config/prisma';
import { analyzeJobDescription } from '../services/ai.service';
import { AuthRequest } from '../middleware/auth';

export const analyzeJD = async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Job description content is required.' });
    }

    const analysis = await analyzeJobDescription(content);

    const jobDesc = await prisma.jobDescription.create({
      data: {
        userId: String(req.user!.id),
        content,
        requiredSkills: JSON.stringify(analysis.requiredSkills),
        missingSkills: JSON.stringify(analysis.missingSkills),
        interviewTopics: JSON.stringify(analysis.interviewTopics),
        customQuestions: JSON.stringify(analysis.customQuestions),
      },
    });

    res.status(201).json({ jobDescription: jobDesc, analysis });
  } catch (error) {
    console.error('Analyze JD error:', error);
    res.status(500).json({ error: 'Failed to analyze job description.' });
  }
};

export const getJobDescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const jobDescriptions = await prisma.jobDescription.findMany({
      where: { userId: String(req.user?.id) },
      orderBy: { createdAt: 'desc' },
    });
    res.json(jobDescriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get job descriptions.' });
  }
};
