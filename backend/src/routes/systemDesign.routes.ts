import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getTemplates, getTemplate, saveTemplate } from '../controllers/systemDesign.controller';

const router = Router();
router.get('/', authenticate, getTemplates);
router.get('/:id', authenticate, getTemplate);
router.post('/', authenticate, saveTemplate);
export default router;
