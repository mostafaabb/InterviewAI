import { Router } from 'express';
import { startInterview, sendMessage, endInterview, getInterviews, getInterview } from '../controllers/interview.controller';
import { authenticate, checkPlan } from '../middleware/auth';
import { interviewValidation, handleValidationErrors } from '../middleware/validate';

const router = Router();

router.use(authenticate);
router.post('/', interviewValidation, handleValidationErrors, startInterview);
router.post('/:id/message', sendMessage);
router.post('/:id/end', endInterview);
router.get('/', getInterviews);
router.get('/:id', getInterview);

export default router;
