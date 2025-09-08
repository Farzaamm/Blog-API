import { Router } from 'express';
import { likePost } from '../controllers/likeController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', authenticateJWT, likePost);

export default router;
