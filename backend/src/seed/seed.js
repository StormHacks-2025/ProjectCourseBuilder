import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Thread from '../models/Thread.js';
import Comment from '../models/Comment.js';
import Activity from '../models/Activity.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, 'demo-data.json');

async function seed() {
  await connectDB();

  const raw = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(raw);

  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Thread.deleteMany({}),
    Comment.deleteMany({}),
    Activity.deleteMany({}),
  ]);

  const users = await Promise.all(
    data.users.map(async (user) => ({
      ...user,
      passwordHash: await bcrypt.hash(user.password, 10),
    }))
  );

  const insertedUsers = await User.insertMany(
    users.map(({ password, ...rest }) => rest)
  );

  const courses = await Course.insertMany(data.courses);

  const threads = await Promise.all(
    courses.map((course) =>
      Thread.create({
        courseCode: course.code,
        courseTitle: course.title,
        postsCount: 0,
        likesCount: 0,
        lastActivityAt: new Date(),
      })
    )
  );

  const [annu, prachi, chris] = insertedUsers;

  const comments = await Comment.insertMany([
    {
      threadCourseCode: 'CMPT 310',
      author: prachi._id,
      parentId: null,
      text: 'Anyone else taking CMPT 310 this term? Looking for study buddies!',
      likes: [annu._id],
    },
    {
      threadCourseCode: 'CMPT 310',
      author: annu._id,
      parentId: null,
      text: 'Midterm tips: focus on heuristics and practice with search problems.',
      likes: [prachi._id, chris._id],
    },
    {
      threadCourseCode: 'CMPT 310',
      author: chris._id,
      parentId: null,
      text: 'I loved the project component—try building an A* pathfinder!',
      likes: [],
    },
  ]);

  await Comment.insertMany([
    {
      threadCourseCode: 'CMPT 310',
      author: annu._id,
      parentId: comments[0]._id,
      text: 'Count me in! I want to go over the assignment this weekend.',
      likes: [],
    },
    {
      threadCourseCode: 'CMPT 310',
      author: prachi._id,
      parentId: comments[1]._id,
      text: 'Thanks! That course pack looks intimidating 😅',
      likes: [],
    },
  ]);

  for (const thread of threads) {
    const postsCount = await Comment.countDocuments({ threadCourseCode: thread.courseCode, parentId: null });
    const likesAgg = await Comment.aggregate([
      { $match: { threadCourseCode: thread.courseCode } },
      { $project: { likesCount: { $size: '$likes' } } },
      { $group: { _id: null, total: { $sum: '$likesCount' } } },
    ]);
    const likesCount = likesAgg[0]?.total || 0;

    await Thread.updateOne(
      { _id: thread._id },
      {
        $set: {
          postsCount,
          likesCount,
          lastActivityAt: new Date(),
        },
      }
    );
  }

  await Activity.insertMany([
    {
      type: 'join',
      actor: annu._id,
      message: 'Annu joined CourseCompass',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    },
    {
      type: 'post',
      actor: prachi._id,
      courseCode: 'CMPT 310',
      commentId: comments[0]._id,
      message: 'Prachi posted in CMPT 310',
    },
    {
      type: 'reply',
      actor: annu._id,
      courseCode: 'CMPT 310',
      commentId: comments[0]._id,
      message: 'Annu replied in CMPT 310',
    },
    {
      type: 'like',
      actor: chris._id,
      courseCode: 'CMPT 310',
      commentId: comments[1]._id,
      message: 'Chris liked a post in CMPT 310',
    },
  ]);

  console.log('✅ Seed complete');
  console.table(
    insertedUsers.map(({ username, email }) => ({ username, email, password: 'Passw0rd!' }))
  );

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
