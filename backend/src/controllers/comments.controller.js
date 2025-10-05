import Comment from '../models/Comment.js';
import Thread from '../models/Thread.js';
import { cleanText } from '../utils/sanitize.js';
import { parsePaging } from '../utils/paging.js';
import { recordActivity } from '../services/activity.service.js';
import { emitNewPost, emitNewReply, emitLikeUpdate } from '../sockets/io.js';

function normalizeCode(code = '') {
  return code.trim().toUpperCase();
}

export async function getComments(req, res) {
  try {
    const courseCode = normalizeCode(req.params.courseCode);
    const parentId = req.query.parentId || null;
    const { page, limit, skip } = parsePaging(req.query);

    const query = { threadCourseCode: courseCode };
    if (parentId) {
      query.parentId = parentId;
    } else {
      query.parentId = null;
    }

    const comments = await Comment.find(query)
      .populate('author', 'username avatar')
      .sort(parentId ? { createdAt: 1 } : { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Comment.countDocuments(query);

    res.json({
      page,
      pageSize: limit,
      total,
     items: comments.map((c) => ({
        _id: c._id,
        id: c._id,
        author: {
          _id: c.author?._id,
          username: c.author?.username,
          avatar: c.author?.avatar,
        },
        text: c.text,
        likesCount: c.likes?.length || 0,
        createdAt: c.createdAt,
        parentId: c.parentId,
      })),
    });
  } catch (error) {
    console.error('getComments error', error);
    res.status(500).json({ error: 'Unable to fetch comments' });
  }
}

export async function createRootComment(req, res) {
  try {
    const courseCode = normalizeCode(req.params.courseCode);
    const text = cleanText(req.body.text);
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const thread = await Thread.findOneAndUpdate(
      { courseCode },
      { $setOnInsert: { courseTitle: courseCode }, $inc: { postsCount: 1 }, lastActivityAt: new Date() },
      { new: true, upsert: true }
    );

    const comment = await Comment.create({
      threadCourseCode: courseCode,
      author: req.user.id,
      parentId: null,
      text,
    });

    const populated = await comment.populate('author', 'username avatar');

    await recordActivity({
      type: 'post',
      actor: req.user.id,
      courseCode,
      commentId: populated._id,
      message: `${populated.author.username} posted in ${courseCode}`,
    });

   const payload = {
      _id: populated._id,
      id: populated._id,
      courseCode,
      author: populated.author,
      text: populated.text,
      likesCount: 0,
      createdAt: populated.createdAt,
      parentId: null,
    };

    emitNewPost({ ...payload, courseCode });

    res.status(201).json(payload);
  } catch (error) {
    console.error('createRootComment error', error);
    res.status(500).json({ error: 'Unable to create post' });
  }
}

export async function createReply(req, res) {
  try {
    const courseCode = normalizeCode(req.params.courseCode);
    const parentId = req.params.commentId;
    const text = cleanText(req.body.text);
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const parent = await Comment.findById(parentId);
    if (!parent || parent.threadCourseCode !== courseCode) {
      return res.status(404).json({ error: 'Parent comment not found' });
    }

    const reply = await Comment.create({
      threadCourseCode: courseCode,
      author: req.user.id,
      parentId,
      text,
    });

    const populated = await reply.populate('author', 'username avatar');

    await Thread.findOneAndUpdate(
      { courseCode },
      { $inc: { postsCount: 0 }, lastActivityAt: new Date() }
    );

    await recordActivity({
      type: 'reply',
      actor: req.user.id,
      courseCode,
      commentId: populated._id,
      message: `${populated.author.username} replied in ${courseCode}`,
    });

   const payload = {
      _id: populated._id,
      id: populated._id,
      courseCode,
      author: populated.author,
      text: populated.text,
      likesCount: 0,
      createdAt: populated.createdAt,
      parentId,
    };

    emitNewReply(payload);

    res.status(201).json(payload);
  } catch (error) {
    console.error('createReply error', error);
    res.status(500).json({ error: 'Unable to create reply' });
  }
}

export async function toggleLike(req, res) {
  try {
    const courseCode = normalizeCode(req.params.courseCode);
    const commentId = req.params.commentId;

    const comment = await Comment.findById(commentId);
    if (!comment || comment.threadCourseCode !== courseCode) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const userId = req.user.id;
    const alreadyLiked = comment.likes.some((id) => id.toString() === userId);

   if (alreadyLiked) {
     comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
      await recordActivity({
        type: 'like',
        actor: userId,
        courseCode,
        commentId,
        message: `${req.user.username || 'Someone'} liked a post in ${courseCode}`,
      });
    }

    await comment.save();
    const threadUpdate = {
      $set: { lastActivityAt: new Date() },
    };
    if (alreadyLiked) {
      threadUpdate.$inc = { likesCount: -1 };
    } else {
      threadUpdate.$inc = { likesCount: 1 };
    }

    await Thread.findOneAndUpdate({ courseCode }, threadUpdate);

    const likesCount = comment.likes.length;
    emitLikeUpdate({ courseCode, commentId, likesCount });

    res.json({ commentId, likesCount, liked: !alreadyLiked });
  } catch (error) {
    console.error('toggleLike error', error);
    res.status(500).json({ error: 'Unable to toggle like' });
  }
}
