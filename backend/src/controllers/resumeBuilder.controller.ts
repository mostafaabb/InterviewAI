import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

const TEMPLATES = [
  { name: 'Modern Clean', description: 'Minimalist two-column layout with accent color', structure: JSON.stringify({ sections: ['header', 'summary', 'experience', 'education', 'skills', 'projects'], columns: 2, accentColor: '#6366f1', font: 'Inter' }), category: 'general', isPublic: true },
  { name: 'ATS Optimized', description: 'Single-column, keyword-optimized for ATS systems', structure: JSON.stringify({ sections: ['header', 'summary', 'experience', 'education', 'skills', 'certifications'], columns: 1, accentColor: '#000000', font: 'Calibri' }), category: 'ats', isPublic: true },
  { name: 'Technical Focus', description: 'Emphasizes projects, skills, and GitHub stats', structure: JSON.stringify({ sections: ['header', 'technical-skills', 'projects', 'experience', 'education', 'github'], columns: 2, accentColor: '#22c55e', font: 'JetBrains Mono' }), category: 'tech', isPublic: true },
  { name: 'Executive', description: 'Professional layout with achievement metrics', structure: JSON.stringify({ sections: ['header', 'executive-summary', 'achievements', 'experience', 'education', 'publications'], columns: 1, accentColor: '#1e293b', font: 'Georgia' }), category: 'executive', isPublic: true },
];

export const getTemplates = async (_req: AuthRequest, res: Response) => {
  try {
    const dbTemplates = await prisma.resumeTemplate.findMany({ where: { isPublic: true }, orderBy: { createdAt: 'desc' } });
    const all = [...TEMPLATES, ...dbTemplates];
    res.json(all);
  } catch { res.status(500).json({ error: 'Failed to get templates.' }); }
};

export const saveTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, structure, category } = req.body;
    const template = await prisma.resumeTemplate.create({
      data: { name, description, structure: JSON.stringify(structure), category, userId: req.user!.id },
    });
    res.json(template);
  } catch { res.status(500).json({ error: 'Failed to save template.' }); }
};
