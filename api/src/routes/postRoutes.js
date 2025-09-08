import { Router } from 'express';
import { getPosts, createPost } from '../controllers/postController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', getPosts);
router.post('/', authenticateJWT, createPost);

export default router;
