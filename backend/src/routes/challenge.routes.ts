import { Router } from 'express';
import { getChallenges, getChallenge, submitCode, getSubmissions, getSubmission } from '../controllers/challenge.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getChallenges);
router.get('/submissions', getSubmissions);
router.get('/submissions/:id', getSubmission);
router.get('/:id', getChallenge);
router.post('/:id/submit', submitCode);

export default router;
