import { Router } from 'express';
import { getPosts, createPost } from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', getPosts);
router.post('/', protect, createPost);

export default router;
