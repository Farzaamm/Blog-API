import { Router } from 'express';
import { addComment, deleteComment, getCommentsByPostId } from '../controllers/commentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/post/:postId', getCommentsByPostId);
router.post('/', protect, addComment);
router.delete('/:id', protect, deleteComment);

export default router;
