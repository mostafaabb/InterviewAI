import { Response } from 'express';
import prisma from '../config/prisma';
import { evaluateCodeSubmission } from '../services/ai.service';
import { AuthRequest } from '../middleware/auth';

const PISTON_API = 'https://emkc.org/api/v2/piston';

const languageMap: Record<string, string> = {
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Python: 'python',
  Java: 'java',
  'C++': 'cpp',
  PHP: 'php',
};

async function executeWithPiston(code: string, language: string) {
  try {
    const lang = languageMap[language] || 'javascript';
    const response = await fetch(`${PISTON_API}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: lang,
        version: '*',
        files: [{ name: `index.${lang}`, content: code }],
      }),
    });
    const data: any = await response.json();
    return {
      output: data?.run?.output || '',
      stdout: data?.run?.stdout || '',
      stderr: data?.run?.stderr || '',
      exitCode: data?.run?.code ?? -1,
    };
  } catch {
    return null;
  }
}

export const getChallenges = async (req: AuthRequest, res: Response) => {
  try {
    const { category, difficulty } = req.query;
    const where: any = {};
    if (category) where.category = String(category);
    if (difficulty) where.difficulty = String(difficulty);

    const challenges = await prisma.codingChallenge.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get challenges.' });
  }
};

export const getChallenge = async (req: AuthRequest, res: Response) => {
  try {
    const challenge = await prisma.codingChallenge.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found.' });
    }

    res.json(challenge);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get challenge.' });
  }
};

export const submitCode = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { code, language } = req.body;

    const user = await prisma.user.findUnique({ where: { id: String(req.user?.id) } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const challenge = await prisma.codingChallenge.findUnique({ where: { id } });
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found.' });
    }

    const evaluation = await evaluateCodeSubmission(code, language, challenge.description);

    const execResult = await executeWithPiston(code, language);

    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        challengeId: id,
        code,
        language,
        score: evaluation.score,
        timeComplexity: evaluation.timeComplexity,
        spaceComplexity: evaluation.spaceComplexity,
        readability: evaluation.readability,
        bestPractices: evaluation.bestPractices,
        feedback: evaluation.feedback,
        status: 'EVALUATED',
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.progress.upsert({
      where: {
        userId_date_type: {
          userId: String(req.user!.id),
          date: today,
          type: 'challenge',
        },
      },
      update: { challengesSolved: { increment: 1 }, score: evaluation.score },
      create: {
        userId: String(req.user!.id),
        date: today,
        type: 'challenge',
        challengesSolved: 1,
        score: evaluation.score,
      },
    });

    res.json({ submission, evaluation, execution: execResult });
  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({ error: 'Failed to evaluate code.' });
  }
};

export const getSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { userId: String(req.user?.id) },
      include: { challenge: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get submissions.' });
  }
};

export const getSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const submission = await prisma.submission.findFirst({
      where: { id: String(req.params.id), userId: String(req.user?.id) },
      include: { challenge: true },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get submission.' });
  }
};
