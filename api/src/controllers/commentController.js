import prisma from '../config/prisma.js';

const safeUserSelect = {
  id: true,
  username: true,
  email: true,
  role: true,
};

const parseId = (value) => {
  const id = Number.parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
};
const isAdmin = (user) => user?.role === 'ADMIN';

export const addComment = async (req, res) => {
  try {
    const { postId, content } = req.body;

    const parsedPostId = parseId(postId);
    if (parsedPostId === null) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    if (typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: parsedPostId,
        userId: req.user.id,
      },
      include: {
        user: { select: safeUserSelect },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const commentId = parseId(req.params.id);
    if (commentId === null) {
      return res.status(400).json({ message: 'Invalid comment id' });
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (!isAdmin(req.user) && comment.userId !== req.user.id) {
      return res.status(403).json({ message: 'You cannot delete this comment' });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCommentsByPostId = async (req, res) => {
  try {
    const postId = parseId(req.params.postId ?? req.params.id);
    if (postId === null) {
      return res.status(400).json({ message: 'Invalid post id' });
    }
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { published: true },
    });
    if (!post || !post.published) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: { user: { select: safeUserSelect } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
