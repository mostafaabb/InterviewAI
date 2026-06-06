import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

const TOPIC_DATABASE: Record<string, { name: string; resources: string; difficulty: string }[]> = {
  'Frontend Developer': [
    { name: 'HTML/CSS Fundamentals', resources: 'MDN Web Docs, Flexbox Froggy', difficulty: 'beginner' },
    { name: 'JavaScript Core Concepts', resources: 'You Don\'t Know JS, JavaScript.info', difficulty: 'beginner' },
    { name: 'React/Next.js Mastery', resources: 'React Docs, Next.js Learn', difficulty: 'intermediate' },
    { name: 'State Management', resources: 'Zustand, Redux Toolkit Docs', difficulty: 'intermediate' },
    { name: 'TypeScript Advanced', resources: 'TypeScript Handbook, Type Challenges', difficulty: 'intermediate' },
    { name: 'Performance Optimization', resources: 'Web.dev, Lighthouse CI', difficulty: 'advanced' },
    { name: 'Testing Strategies', resources: 'Testing Library, Cypress Docs', difficulty: 'advanced' },
    { name: 'Build Tools & Bundlers', resources: 'Webpack Docs, Vite Guide', difficulty: 'advanced' },
  ],
  'Backend Developer': [
    { name: 'RESTful API Design', resources: 'REST API Tutorial, Microsoft API Guidelines', difficulty: 'beginner' },
    { name: 'Database Design & SQL', resources: 'PostgreSQL Tutorial, Prisma Docs', difficulty: 'beginner' },
    { name: 'Authentication & Authorization', resources: 'JWT.io, OAuth 2.0 Simplified', difficulty: 'intermediate' },
    { name: 'Caching Strategies', resources: 'Redis Docs, CDN Best Practices', difficulty: 'intermediate' },
    { name: 'Message Queues', resources: 'RabbitMQ Tutorial, Kafka Docs', difficulty: 'intermediate' },
    { name: 'Microservices Architecture', resources: 'Microservices.io, AWS Docs', difficulty: 'advanced' },
    { name: 'CI/CD Pipelines', resources: 'GitHub Actions Docs, Docker Guides', difficulty: 'advanced' },
    { name: 'System Design', resources: 'System Design Primer, Designing Data-Intensive Applications', difficulty: 'advanced' },
  ],
  'Full Stack Developer': [
    { name: 'Frontend Fundamentals', resources: 'MDN Web Docs, CSS Tricks', difficulty: 'beginner' },
    { name: 'Backend Fundamentals', resources: 'Express.js Docs, Node.js Best Practices', difficulty: 'beginner' },
    { name: 'Database Management', resources: 'Prisma Docs, MongoDB University', difficulty: 'beginner' },
    { name: 'API Integration', resources: 'REST vs GraphQL, tRPC Docs', difficulty: 'intermediate' },
    { name: 'Authentication Flows', resources: 'NextAuth.js, Session Management', difficulty: 'intermediate' },
    { name: 'Deployment & DevOps', resources: 'Vercel Docs, Railway Guides', difficulty: 'intermediate' },
    { name: 'Full Stack Architecture', resources: 'The Hard Parts Series, Web Architecture 101', difficulty: 'advanced' },
    { name: 'Security Best Practices', resources: 'OWASP Top 10, Security Headers Guide', difficulty: 'advanced' },
  ],
  'Data Analyst': [
    { name: 'Statistics Fundamentals', resources: 'Khan Academy Statistics, OpenIntro Stats', difficulty: 'beginner' },
    { name: 'Python for Data Analysis', resources: 'Pandas Docs, NumPy Guide', difficulty: 'beginner' },
    { name: 'SQL for Analytics', resources: 'Mode Analytics SQL Tutorial, LeetCode SQL', difficulty: 'beginner' },
    { name: 'Data Visualization', resources: 'Matplotlib Docs, Tableau Public Gallery', difficulty: 'intermediate' },
    { name: 'Statistical Modeling', resources: 'Scikit-learn Docs, ISLR Book', difficulty: 'intermediate' },
    { name: 'A/B Testing', resources: 'Evan Miller A/B Testing, Google Analytics', difficulty: 'intermediate' },
    { name: 'Machine Learning Basics', resources: 'Fast.ai Course, Kaggle Learn', difficulty: 'advanced' },
    { name: 'Big Data Tools', resources: 'Spark Docs, dbt Learn', difficulty: 'advanced' },
  ],
};

export const generateLearningPath = async (req: AuthRequest, res: Response) => {
  try {
    const { targetRole, experienceLevel, focusAreas } = req.body;
    const userId = req.user!.id;

    const topics = TOPIC_DATABASE[targetRole] || TOPIC_DATABASE['Full Stack Developer'];

    const interviewCount = await prisma.interview.count({
      where: { userId, status: 'COMPLETED' },
    });

    const challengeCount = await prisma.submission.count({ where: { userId } });

    const avgScore = await prisma.interview.aggregate({
      _avg: { score: true },
      where: { userId, status: 'COMPLETED', score: { not: null } },
    });

    const weekGoal = Math.max(3, 10 - interviewCount);
    const level = experienceLevel === 'beginner' ? 0 : experienceLevel === 'intermediate' ? 1 : 2;

    const path = topics.slice(level * 2, level * 2 + 4).map((topic, i) => ({
      topic: topic.name,
      difficulty: topic.difficulty,
      resources: topic.resources,
      order: i + 1,
      status: i === 0 ? 'current' : 'upcoming',
      progress: 0,
    }));

    res.json({
      path,
      stats: {
        interviewsCompleted: interviewCount,
        challengesSolved: challengeCount,
        averageScore: Math.round(avgScore._avg.score || 0),
        weekGoal,
        currentLevel: experienceLevel,
        targetRole,
      },
      focusAreas: focusAreas || [],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate learning path.' });
  }
};

export const getLearningPaths = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const paths = await prisma.learningPath.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(paths);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get learning paths.' });
  }
};
