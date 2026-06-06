import { Router } from 'express';
import { register, login, googleAuth, verifyEmail, forgotPassword, resetPassword, getMe, updateProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { registerValidation, loginValidation, handleValidationErrors } from '../middleware/validate';

const router = Router();

router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/google', googleAuth);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;
