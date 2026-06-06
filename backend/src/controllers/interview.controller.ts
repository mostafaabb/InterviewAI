import { Response } from 'express';
import prisma from '../config/prisma';
import { generateAIResponse, generateInterviewReport } from '../services/ai.service';
import { AuthRequest } from '../middleware/auth';

export const startInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { category, difficulty, type, style, timed } = req.body;

    const user = await prisma.user.findUnique({ where: { id: String(req.user?.id) } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const aiResponse = await generateAIResponse(type, category, difficulty, style);

    const interview = await prisma.interview.create({
      data: {
        userId: user.id,
        category,
        difficulty,
        type,
        style: style || 'faang',
        timed: timed ? 'true' : 'false',
        status: 'IN_PROGRESS',
        messages: {
          create: [{ role: 'assistant', content: aiResponse }],
        },
      },
      include: { messages: true },
    });

    res.status(201).json(interview);
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ error: 'Failed to start interview.' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { answer } = req.body;

    const interview = await prisma.interview.findFirst({
      where: { id, userId: String(req.user?.id) },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    const lastAiMessage = [...interview.messages].reverse().find(m => m.role === 'assistant');
    const history = interview.messages.map(m => ({ role: m.role, content: m.content }));

    await prisma.interviewMessage.create({
      data: { interviewId: id, role: 'user', content: answer },
    });

    const aiResponse = await generateAIResponse(
      interview.type,
      interview.category,
      interview.difficulty,
      lastAiMessage?.content,
      answer,
      history,
      interview.style || 'faang'
    );

    const newMessage = await prisma.interviewMessage.create({
      data: { interviewId: id, role: 'assistant', content: aiResponse },
    });

    res.json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
};

export const endInterview = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);

    const interview = await prisma.interview.findFirst({
      where: { id, userId: String(req.user?.id) },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    const transcript = interview.messages.map(m => ({ role: m.role, content: m.content }));
    const report = await generateInterviewReport(transcript);

    const interviewReport = await prisma.interviewReport.create({
      data: {
        interviewId: id,
        overallScore: report.overallScore,
        communication: report.communication,
        technicalAccuracy: report.technicalAccuracy,
        problemSolving: report.problemSolving,
        confidence: report.confidence,
        clarity: report.clarity,
        strengths: JSON.stringify(report.strengths),
        weaknesses: JSON.stringify(report.weaknesses),
        recommendations: JSON.stringify(report.recommendations),
        summary: report.summary,
      },
    });

    await prisma.interview.update({
      where: { id },
      data: { status: 'COMPLETED', score: report.overallScore },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.progress.upsert({
      where: {
        userId_date_type: {
          userId: String(req.user!.id),
          date: today,
          type: 'interview',
        },
      },
      update: { interviewsCompleted: { increment: 1 }, score: report.overallScore },
      create: {
        userId: String(req.user!.id),
        date: today,
        type: 'interview',
        interviewsCompleted: 1,
        score: report.overallScore,
      },
    });

    res.json({ interview, report: interviewReport });
  } catch (error) {
    console.error('End interview error:', error);
    res.status(500).json({ error: 'Failed to end interview.' });
  }
};

export const getInterviews = async (req: AuthRequest, res: Response) => {
  try {
    const interviews = await prisma.interview.findMany({
      where: { userId: String(req.user?.id) },
      include: { report: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get interviews.' });
  }
};

export const getInterview = async (req: AuthRequest, res: Response) => {
  try {
    const interview = await prisma.interview.findFirst({
      where: { id: String(req.params.id), userId: String(req.user?.id) },
      include: { messages: { orderBy: { createdAt: 'asc' } }, report: true },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get interview.' });
  }
};
