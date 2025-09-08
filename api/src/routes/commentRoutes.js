import { Router } from 'express';
import { addComment } from '../controllers/commentController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', authenticateJWT, addComment);

export default router;
