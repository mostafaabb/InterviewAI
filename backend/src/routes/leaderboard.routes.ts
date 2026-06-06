import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getLeaderboard, getWeeklyChallenge } from '../controllers/leaderboard.controller';

const router = Router();
router.get('/', authenticate, getLeaderboard);
router.get('/weekly', authenticate, getWeeklyChallenge);
export default router;
