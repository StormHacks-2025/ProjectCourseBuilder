import Thread from '../models/Thread.js';
import { computeTrending } from '../services/trending.service.js';
import { getRecentActivity } from '../services/activity.service.js';

export async function trending(req, res) {
  try {
    const { window = '7d', limit = 5 } = req.query;
    const data = await computeTrending({ window, limit: Number(limit) });
    res.json(data);
  } catch (error) {
    console.error('trending error', error);
    res.status(500).json({ error: 'Unable to fetch trending courses' });
  }
}

export async function activityFeed(req, res) {
  try {
    const limit = Number(req.query.limit) || 20;
    const data = await getRecentActivity(limit);
    res.json(data);
  } catch (error) {
    console.error('activityFeed error', error);
    res.status(500).json({ error: 'Unable to fetch activity' });
  }
}

export async function dashboardBundle(req, res) {
  try {
    const [trendingCourses, activity, topThreads] = await Promise.all([
      computeTrending({ window: req.query.window, limit: req.query.limit }),
      getRecentActivity(10),
      Thread.find()
        .sort({ lastActivityAt: -1 })
        .limit(5)
        .lean()
        .then((threads) =>
          threads.map((thread) => ({
            courseCode: thread.courseCode,
            courseTitle: thread.courseTitle,
            postsCount: thread.postsCount,
            lastActivityAt: thread.lastActivityAt,
          }))
        ),
    ]);

    res.json({
      trending: trendingCourses,
      activity,
      topThreads,
    });
  } catch (error) {
    console.error('dashboardBundle error', error);
    res.status(500).json({ error: 'Unable to load dashboard bundle' });
  }
}
