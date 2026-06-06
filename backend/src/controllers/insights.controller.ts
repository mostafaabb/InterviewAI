import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

const SEED_INSIGHTS = [
  { company: 'Google', role: 'Software Engineer', level: 'L3/L4', process: 'Phone screen (2 coding) → Onsite (4-5 rounds: 2 coding, 2 system design, 1 behavioral)', questions: '["Design a URL shortener","Reverse a linked list","Explain Googleyness","Design a distributed cache"]', timeline: '["Week 1: Application","Week 2-3: Phone screen","Week 4-5: Onsite","Week 6: Hiring committee","Week 7-8: Offer"]', salary: '$180K-$250K', tips: 'Focus on algorithms and scalability. Know Googleyness principles.', source: 'community' },
  { company: 'Meta', role: 'Software Engineer', level: 'E4/E5', process: 'Phone screen (1 coding) → Onsite (4 rounds: 2 coding, 1 system design, 1 behavioral)', questions: '["Design a news feed","Merge k sorted lists","Describe a time you led a project","Design a chat system"]', timeline: '["Week 1: Recruiter screen","Week 2: Phone screen","Week 3-4: Onsite","Week 5: Team match","Week 6: Offer"]', salary: '$190K-$260K', tips: 'Product sense is critical. Practice behavioral STAR stories.', source: 'community' },
  { company: 'Amazon', role: 'Software Engineer', level: 'SDE II', process: 'Online assessment → Phone screen → Onsite (4 rounds: 2 coding, 1 system design, 1 bar raiser)', questions: '["Design a recommendation system","Two sum with all combinations","Tell me about a time you disagreed with your manager","Design an e-commerce checkout"]', timeline: '["Week 1: Online assessment","Week 2: Phone screen","Week 3-4: Onsite","Week 4-5: Bar raiser","Week 5-6: Offer"]', salary: '$160K-$230K', tips: 'Study Leadership Principles. Use STAR for all behavioral answers.', source: 'community' },
];

export const getInsights = async (req: AuthRequest, res: Response) => {
  try {
    const { company } = req.query;
    const where: any = {};
    if (company) where.company = String(company);
    const insights = await prisma.companyInsight.findMany({ where, orderBy: { createdAt: 'desc' } });
    const seed = !company ? SEED_INSIGHTS : SEED_INSIGHTS.filter((i) => i.company === String(company));
    res.json([...seed, ...insights]);
  } catch { res.status(500).json({ error: 'Failed to get insights.' }); }
};

export const createInsight = async (req: AuthRequest, res: Response) => {
  try {
    const { company, role, level, process, questions, timeline, salary, tips } = req.body;
    const insight = await prisma.companyInsight.create({
      data: { company, role, level, process, questions: JSON.stringify(questions), timeline: JSON.stringify(timeline), salary, tips, userId: req.user!.id },
    });
    res.json(insight);
  } catch { res.status(500).json({ error: 'Failed to create insight.' }); }
};
