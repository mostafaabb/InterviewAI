import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { generateLearningPath, getLearningPaths } from '../controllers/learningPath.controller';

const router = Router();

router.post('/generate', authenticate, generateLearningPath);
router.get('/', authenticate, getLearningPaths);

export default router;
