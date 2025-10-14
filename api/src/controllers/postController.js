import prisma from '../config/prisma.js';

const safeUserSelect = {
  id: true,
  username: true,
  email: true,
  role: true,
};

const isAdmin = (user) => user?.role === 'ADMIN';
const parseId = (value) => {
  const id = Number.parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
};
const canManagePost = (post, user) => isAdmin(user) || post.authorId === user.id;

export const getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: safeUserSelect },
        comments: {
          include: {
            user: { select: safeUserSelect },
          },
        },
      },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllPostsForAdmin = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Only admins can view all posts' });
    }

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: safeUserSelect },
      },
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Only admins can create posts' });
    }

    if (typeof title !== 'string' || typeof content !== 'string' || !title.trim() || !content.trim()) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        authorId: req.user.id,
      },
      include: {
        author: { select: safeUserSelect },
      },
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const postId = parseId(req.params.id);
    if (postId === null) {
      return res.status(400).json({ message: 'Invalid post id' });
    }
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: safeUserSelect },
        comments: {
          include: {
            user: { select: safeUserSelect },
          },
        },
      },
    });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (!post.published) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const postId = parseId(req.params.id);
    if (postId === null) {
      return res.status(400).json({ message: 'Invalid post id' });
    }
    const { title, content } = req.body;

    const existingPost = await prisma.post.findUnique({ where: { id: postId } });
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!canManagePost(existingPost, req.user)) {
      return res.status(403).json({ message: 'You cannot modify this post' });
    }

    const data = {};
    if (typeof title === 'string' && title.trim()) {
      data.title = title.trim();
    }
    if (typeof content === 'string' && content.trim()) {
      data.content = content.trim();
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data,
      include: {
        author: { select: safeUserSelect },
      },
    });

    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = parseId(req.params.id);
    if (postId === null) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    const existingPost = await prisma.post.findUnique({ where: { id: postId } });
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!canManagePost(existingPost, req.user)) {
      return res.status(403).json({ message: 'You cannot delete this post' });
    }

    await prisma.post.delete({ where: { id: postId } });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const publishPost = async (req, res) => {
  try {
    const postId = parseId(req.params.id);
    if (postId === null) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    const existingPost = await prisma.post.findUnique({ where: { id: postId } });
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!canManagePost(existingPost, req.user)) {
      return res.status(403).json({ message: 'You cannot publish this post' });
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: { published: true },
      include: {
        author: { select: safeUserSelect },
      },
    });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const unpublishPost = async (req, res) => {
  try {
    const postId = parseId(req.params.id);
    if (postId === null) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    const existingPost = await prisma.post.findUnique({ where: { id: postId } });
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!canManagePost(existingPost, req.user)) {
      return res.status(403).json({ message: 'You cannot unpublish this post' });
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: { published: false },
      include: {
        author: { select: safeUserSelect },
      },
    });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

