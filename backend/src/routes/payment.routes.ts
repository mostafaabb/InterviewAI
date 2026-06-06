import { Router } from 'express';
import { createCheckoutSession, createPortalSession, getSubscription } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/create-checkout-session', authenticate, createCheckoutSession);
router.post('/create-portal-session', authenticate, createPortalSession);
router.get('/subscription', authenticate, getSubscription);

export default router;
