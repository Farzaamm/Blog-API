import prisma from '../config/prisma.js';

export const getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: { author: true, comments: true }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: req.user.userId
      }
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true, comments: true }
    });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { title, content } = req.body;

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content
      }
    });

    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    await prisma.post.delete({ where: { id: postId } });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const publishPost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await prisma.post.update({
      where: { id: postId },
      data: { published: true }
    });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const unpublishPost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await prisma.post.update({
      where: { id: postId },
      data: { published: false }
    });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

