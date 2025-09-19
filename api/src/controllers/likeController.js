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

export const likePost = async (req, res) => {
  try {
    const postId = parseId(req.body.postId ?? req.params.postId);
    if (postId === null) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    const like = await prisma.like.create({
      data: {
        postId,
        userId: req.user.id,
      },
    });

    res.status(201).json(like);
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ message: 'You already liked this post' });
    }
    res.status(400).json({ error: error.message });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const postId = parseId(req.body.postId ?? req.params.postId);
    if (postId === null) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    const like = await prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId: req.user.id,
        },
      },
    });

    res.status(200).json(like);
  } catch (error) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ message: 'Like not found' });
    }
    res.status(400).json({ error: error.message });
  }
};

export const getLikesByPostId = async (req, res) => {
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
    const likes = await prisma.like.findMany({
      where: { postId },
      include: { user: { select: safeUserSelect } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(likes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

