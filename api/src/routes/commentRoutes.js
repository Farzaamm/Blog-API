import { Router } from 'express';
import { addComment } from '../controllers/commentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', protect, addComment);

export default router;
