import { Router } from 'express';
import { likePost } from '../controllers/likeController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', protect, likePost);

export default router;
