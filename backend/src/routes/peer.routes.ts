import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createSession, findMatch, joinSession, submitFeedback, getMySessions } from '../controllers/peer.controller';

const router = Router();
router.post('/', authenticate, createSession);
router.get('/find', authenticate, findMatch);
router.post('/:id/join', authenticate, joinSession);
router.post('/:id/feedback', authenticate, submitFeedback);
router.get('/mine', authenticate, getMySessions);
export default router;
