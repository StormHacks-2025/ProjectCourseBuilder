import Thread from '../models/Thread.js';
import Activity from '../models/Activity.js';

const WEIGHTS = {
  post: 3,
  reply: 2,
  like: 1,
};

function decay(createdAt, windowHours = 168) {
  const hours = (Date.now() - new Date(createdAt).getTime()) / 36e5;
  return 1 / (1 + hours / 12);
}

export async function computeTrending({ window = '7d', limit = 5 } = {}) {
  const match = {};
  if (window) {
    const multiplier = parseInt(window, 10) || 7;
    const since = new Date(Date.now() - multiplier * 24 * 60 * 60 * 1000);
    match.createdAt = { $gte: since };
  }

  const activities = await Activity.find(match).lean();
  const scores = activities.reduce((acc, act) => {
    if (!act.courseCode) return acc;
    const weight = WEIGHTS[act.type] || 1;
    const score = weight * decay(act.createdAt);
    acc[act.courseCode] = (acc[act.courseCode] || 0) + score;
    return acc;
  }, {});

  const threads = await Thread.find({ courseCode: { $in: Object.keys(scores) } })
    .sort({ lastActivityAt: -1 })
    .lean();

  const combined = threads
    .map((thread) => ({
      courseCode: thread.courseCode,
      courseTitle: thread.courseTitle,
      score: Number(scores[thread.courseCode]?.toFixed(2) || 0),
      postsCount: thread.postsCount,
      lastActivityAt: thread.lastActivityAt,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (!combined.length) {
    const fallbacks = await Thread.find().sort({ lastActivityAt: -1 }).limit(limit).lean();
    return fallbacks.map((thread) => ({
      courseCode: thread.courseCode,
      courseTitle: thread.courseTitle,
      score: 1,
      postsCount: thread.postsCount,
      lastActivityAt: thread.lastActivityAt,
    }));
  }

  return combined;
}
