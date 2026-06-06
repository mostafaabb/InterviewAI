import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const createStudyPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { targetRole, targetDate, focusAreas } = req.body;
    const daysUntilTarget = targetDate ? Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30;
    const numDays = Math.max(7, Math.min(daysUntilTarget, 90));

    const schedule = [];
    const topicPool: Record<string, string[]> = {
      'Frontend Developer': ['HTML/CSS Review', 'JavaScript Fundamentals', 'React Patterns', 'TypeScript', 'State Management', 'Performance Optimization', 'Testing', 'Build Tools', 'System Design (Frontend)', 'Behavioral Prep'],
      'Backend Developer': ['REST API Design', 'Database Design', 'Authentication', 'Caching', 'Message Queues', 'Microservices', 'System Design', 'DevOps Basics', 'Security', 'Behavioral Prep'],
      'Full Stack Developer': ['Frontend Basics', 'Backend Basics', 'Database Management', 'API Integration', 'Auth Flows', 'Deployment', 'Full Stack Architecture', 'Security', 'System Design', 'Behavioral Prep'],
    };

    const topics = topicPool[targetRole] || topicPool['Full Stack Developer'];
    for (let d = 0; d < numDays; d++) {
      const day = new Date(Date.now() + d * 86400000);
      schedule.push({ day: d + 1, date: day.toISOString().split('T')[0], topic: topics[d % topics.length], duration: d % 7 < 5 ? 60 : 120, completed: false });
    }

    const plan = await prisma.studyPlan.create({
      data: { userId: req.user!.id, targetRole, targetDate: targetDate ? new Date(targetDate) : null, planData: JSON.stringify(schedule) },
    });

    res.json({ ...plan, schedule, stats: { totalDays: numDays, totalHours: numDays * 1.5, topicCount: topics.length } });
  } catch { res.status(500).json({ error: 'Failed to create study plan.' }); }
};

export const getStudyPlans = async (req: AuthRequest, res: Response) => {
  try {
    const plans = await prisma.studyPlan.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    const parsed = plans.map((p) => ({ ...p, schedule: JSON.parse(p.planData) }));
    res.json(parsed);
  } catch { res.status(500).json({ error: 'Failed to get study plans.' }); }
};

export const updateStudyPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { dayIndex } = req.body;
    const plan = await prisma.studyPlan.findFirst({ where: { id: String(req.params.id), userId: req.user!.id } });
    if (!plan) return res.status(404).json({ error: 'Plan not found.' });
    const schedule = JSON.parse(plan.planData);
    if (schedule[dayIndex]) { schedule[dayIndex].completed = !schedule[dayIndex].completed; }
    const completed = schedule.filter((d: any) => d.completed).length;
    const progress = Math.round((completed / schedule.length) * 100);
    const updated = await prisma.studyPlan.update({ where: { id: String(req.params.id) }, data: { planData: JSON.stringify(schedule), progress } });
    res.json({ ...updated, schedule });
  } catch { res.status(500).json({ error: 'Failed to update study plan.' }); }
};
