import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createStarAnswer, getStarAnswers, getStarAnswer, deleteStarAnswer } from '../controllers/star.controller';

const router = Router();
router.post('/', authenticate, createStarAnswer);
router.get('/', authenticate, getStarAnswers);
router.get('/:id', authenticate, getStarAnswer);
router.delete('/:id', authenticate, deleteStarAnswer);
export default router;
