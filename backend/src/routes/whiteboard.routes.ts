import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { saveWhiteboard, getWhiteboards, getWhiteboard, deleteWhiteboard } from '../controllers/whiteboard.controller';

const router = Router();

router.post('/', authenticate, saveWhiteboard);
router.get('/', authenticate, getWhiteboards);
router.get('/:id', authenticate, getWhiteboard);
router.delete('/:id', authenticate, deleteWhiteboard);

export default router;
