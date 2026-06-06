import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createStudyPlan, getStudyPlans, updateStudyPlan } from '../controllers/study.controller';

const router = Router();
router.post('/', authenticate, createStudyPlan);
router.get('/', authenticate, getStudyPlans);
router.put('/:id', authenticate, updateStudyPlan);
export default router;
