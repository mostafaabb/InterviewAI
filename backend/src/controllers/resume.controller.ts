import { Response } from 'express';
import prisma from '../config/prisma';
import { analyzeResume } from '../services/ai.service';
import { AuthRequest } from '../middleware/auth';

export const uploadResume = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const resumeText = file.buffer?.toString() || '';
    const analysis = await analyzeResume(resumeText);

    const resume = await prisma.resume.create({
      data: {
        userId: String(req.user!.id),
        fileUrl: file.path || '',
        fileName: file.originalname,
        fileSize: file.size,
        atsScore: analysis.atsScore,
        missingKeywords: JSON.stringify(analysis.missingKeywords),
        weakPoints: JSON.stringify(analysis.weakPoints),
        formattingIssues: JSON.stringify(analysis.formattingIssues),
        suggestions: JSON.stringify(analysis.suggestions),
      },
    });

    res.status(201).json({ resume, analysis });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ error: 'Failed to analyze resume.' });
  }
};

export const getResumes = async (req: AuthRequest, res: Response) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: String(req.user?.id) },
      orderBy: { createdAt: 'desc' },
    });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get resumes.' });
  }
};

export const getResume = async (req: AuthRequest, res: Response) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: String(req.params.id), userId: String(req.user?.id) },
    });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found.' });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get resume.' });
  }
};
