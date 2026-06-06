import { Router } from 'express';
import { uploadResume, getResumes, getResume } from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.use(authenticate);
router.post('/upload', authenticate, upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);

export default router;
