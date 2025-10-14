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

const buildResponseError = (res, message) => res.status(400).json({ message });

const resolveTarget = (req, res) => {
  const source = { ...(req.params ?? {}), ...(req.body ?? {}) };

  const hasPost = source.postId !== undefined && source.postId !== null;
  const hasComment = source.commentId !== undefined && source.commentId !== null;

  if (hasPost && hasComment) {
    buildResponseError(res, 'Provide either postId or commentId, not both');
    return null;
  }

  if (!hasPost && !hasComment) {
    buildResponseError(res, 'A postId or commentId is required');
    return null;
  }

  if (hasPost) {
    const postId = parseId(source.postId);
    if (postId === null) {
      buildResponseError(res, 'Invalid post id');
      return null;
    }
    return { field: 'postId', value: postId };
  }

  const commentId = parseId(source.commentId);
  if (commentId === null) {
    buildResponseError(res, 'Invalid comment id');
    return null;
  }
  return { field: 'commentId', value: commentId };
};

export const likeItem = async (req, res) => {
  const target = resolveTarget(req, res);
  if (!target) {
    return;
  }

  try {
    const like = await prisma.like.create({
      data: {
        userId: req.user.id,
        postId: target.field === 'postId' ? target.value : null,
        commentId: target.field === 'commentId' ? target.value : null,
      },
    });

    res.status(201).json(like);
  } catch (error) {
    if (error?.code === 'P2002') {
      const scope = target.field === 'postId' ? 'post' : 'comment';
      return res.status(409).json({ message: `You already liked this ${scope}` });
    }
    res.status(400).json({ error: error.message });
  }
};

export const unlikeItem = async (req, res) => {
  const target = resolveTarget(req, res);
  if (!target) {
    return;
  }

  const compositeKey =
    target.field === 'postId'
      ? { postId_userId: { postId: target.value, userId: req.user.id } }
      : { commentId_userId: { commentId: target.value, userId: req.user.id } };

  try {
    const like = await prisma.like.delete({
      where: compositeKey,
    });
    res.status(200).json(like);
  } catch (error) {
    if (error?.code === 'P2025') {
      const scope = target.field === 'postId' ? 'post' : 'comment';
      return res.status(404).json({ message: `Like not found for this ${scope}` });
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

export const getLikesByCommentId = async (req, res) => {
  try {
    const commentId = parseId(req.params.commentId ?? req.params.id);
    if (commentId === null) {
      return res.status(400).json({ message: 'Invalid comment id' });
    }
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: { select: { published: true } },
      },
    });
    if (!comment || !comment.post?.published) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const likes = await prisma.like.findMany({
      where: { commentId },
      include: { user: { select: safeUserSelect } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(likes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
