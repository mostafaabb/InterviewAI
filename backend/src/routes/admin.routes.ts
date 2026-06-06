import { Router } from 'express';
import { getDashboard, getUsers, updateUser, deleteUser, createChallenge, updateChallenge, deleteChallenge, getAnalytics } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/challenges', createChallenge);
router.put('/challenges/:id', updateChallenge);
router.delete('/challenges/:id', deleteChallenge);
router.get('/analytics', getAnalytics);

export default router;
