import prisma from '../config/prisma.js';

export const likePost = async (req, res) => {
  try {
    const { postId } = req.body;

    const like = await prisma.like.create({
      data: {
        postId,
        userId: req.user.userId
      }
    });

    res.status(201).json(like);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.body;

    const like = await prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId: req.user.userId
        }
      }
    });

    res.status(200).json(like);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getLikesByPostId = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const likes = await prisma.like.findMany({
      where: { postId },
      include: { user: true }
    });
    res.json(likes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

