import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getInsights, createInsight } from '../controllers/insights.controller';

const router = Router();
router.get('/', authenticate, getInsights);
router.post('/', authenticate, createInsight);
export default router;
