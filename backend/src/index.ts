import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import interviewRoutes from './routes/interview.routes';
import challengeRoutes from './routes/challenge.routes';
import resumeRoutes from './routes/resume.routes';
import jobDescriptionRoutes from './routes/jobDescription.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import progressRoutes from './routes/progress.routes';
import learningPathRoutes from './routes/learningPath.routes';
import whiteboardRoutes from './routes/whiteboard.routes';
import peerRoutes from './routes/peer.routes';
import starRoutes from './routes/star.routes';
import insightsRoutes from './routes/insights.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import studyRoutes from './routes/study.routes';
import resumeBuilderRoutes from './routes/resumeBuilder.routes';
import systemDesignRoutes from './routes/systemDesign.routes';
import { handleWebhook } from './controllers/payment.controller';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

app.post('/api/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/job-descriptions', jobDescriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/whiteboards', whiteboardRoutes);
app.use('/api/peer-sessions', peerRoutes);
app.use('/api/star-answers', starRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/study-plans', studyRoutes);
app.use('/api/resume-templates', resumeBuilderRoutes);
app.use('/api/system-design-templates', systemDesignRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`InterviewAI Backend running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

export default app;
