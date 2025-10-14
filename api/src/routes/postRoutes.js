import { Router } from 'express';
import {
  getPosts,
  getAllPostsForAdmin,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
} from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', getPosts);
router.get('/admin', protect, getAllPostsForAdmin);
router.get('/:id', getPostById);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/publish', protect, publishPost);
router.post('/:id/unpublish', protect, unpublishPost);

export default router;
