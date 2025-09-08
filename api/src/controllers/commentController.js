import prisma from '../config/prisma.js';

export const addComment = async (req, res) => {
  try {
    const { postId, content } = req.body;

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: req.user.userId
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    await prisma.comment.delete({ where: { id: commentId } });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCommentsByPostId = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: { user: true }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
