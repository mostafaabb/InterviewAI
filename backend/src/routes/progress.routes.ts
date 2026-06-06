import { Router } from 'express';
import { getProgress, getDashboardStats, getSkillLevels } from '../controllers/progress.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getProgress);
router.get('/stats', getDashboardStats);
router.get('/skills', getSkillLevels);

export default router;
