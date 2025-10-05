import Thread from '../models/Thread.js';
import Course from '../models/Course.js';

function normalizeCode(code = '') {
  return code.trim().toUpperCase();
}

export async function getThread(req, res) {
  try {
    const courseCodeRaw = req.params.courseCode || req.query.courseCode;
    if (!courseCodeRaw) {
      return res.status(400).json({ error: 'courseCode is required' });
    }

    const courseCode = normalizeCode(courseCodeRaw);
    const { courseTitle } = req.body || {};

    let thread = await Thread.findOne({ courseCode });
    if (!thread) {
      const course = await Course.findOne({ code: courseCode });
      thread = await Thread.create({
        courseCode,
        courseTitle: course?.title || courseTitle || courseCode,
        postsCount: 0,
        likesCount: 0,
        lastActivityAt: new Date(),
      });
    }

    res.json({
      courseCode: thread.courseCode,
      courseTitle: thread.courseTitle,
      postsCount: thread.postsCount,
      likesCount: thread.likesCount,
      lastActivityAt: thread.lastActivityAt,
    });
  } catch (error) {
    console.error('getThread error', error);
    res.status(500).json({ error: 'Unable to load thread' });
  }
}
