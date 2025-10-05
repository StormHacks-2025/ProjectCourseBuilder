import Activity from '../models/Activity.js';
import { emitActivity } from '../sockets/io.js';

export async function recordActivity(payload) {
  const activity = await Activity.create(payload);
  const populated = await activity.populate('actor', 'username avatar');
  const formatted = {
    type: populated.type,
    actor: {
      _id: populated.actor?._id,
      username: populated.actor?.username,
      avatar: populated.actor?.avatar,
    },
    courseCode: populated.courseCode,
    message: populated.message,
    createdAt: populated.createdAt,
  };
  emitActivity(formatted);
  return formatted;
}

export async function getRecentActivity(limit = 20) {
  const activities = await Activity.find()
    .populate('actor', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return activities.map((a) => ({
    type: a.type,
    actor: {
      _id: a.actor?._id,
      username: a.actor?.username,
      avatar: a.actor?.avatar,
    },
    courseCode: a.courseCode,
    message: a.message,
    createdAt: a.createdAt,
  }));
}
