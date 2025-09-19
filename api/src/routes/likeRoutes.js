import { Router } from 'express';
import { likePost, unlikePost, getLikesByPostId } from '../controllers/likeController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/post/:postId', getLikesByPostId);
router.post('/', protect, likePost);
router.delete('/', protect, unlikePost);

export default router;
