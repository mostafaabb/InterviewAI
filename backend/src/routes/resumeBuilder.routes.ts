import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getTemplates, saveTemplate } from '../controllers/resumeBuilder.controller';

const router = Router();
router.get('/', authenticate, getTemplates);
router.post('/', authenticate, saveTemplate);
export default router;
