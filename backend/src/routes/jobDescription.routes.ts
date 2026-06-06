import { Router } from 'express';
import { analyzeJD, getJobDescriptions } from '../controllers/jobDescription.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.post('/analyze', authenticate, analyzeJD);
router.get('/', getJobDescriptions);

export default router;
