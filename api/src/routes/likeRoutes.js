import { Router } from 'express';
import { getLikesByCommentId, getLikesByPostId, likeItem, unlikeItem } from '../controllers/likeController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/post/:postId', getLikesByPostId);
router.get('/comment/:commentId', getLikesByCommentId);
router.post('/', protect, likeItem);
router.delete('/', protect, unlikeItem);

export default router;
