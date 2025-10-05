import Course from '../models/Course.js';
import { parsePaging } from '../utils/paging.js';

export async function searchCourses(req, res) {
  try {
    const { q = '' } = req.query;
    const { page, limit, skip } = parsePaging(req.query);

    const filter = q
      ? {
          $text: { $search: q },
        }
      : {};

    const [results, total] = await Promise.all([
      Course.find(filter)
        .sort(q ? { score: { $meta: 'textScore' } } : { code: 1 })
        .skip(skip)
        .limit(limit)
        .select('code title termsOffered prereqs description')
        .lean(),
      Course.countDocuments(filter),
    ]);

    res.json({
      page,
      pageSize: limit,
      total,
      results: results.map((course) => ({
        code: course.code,
        title: course.title,
        termsOffered: course.termsOffered,
        prereqs: course.prereqs,
        description: course.description,
      })),
    });
  } catch (error) {
    console.error('searchCourses error', error);
    res.status(500).json({ error: 'Unable to search courses' });
  }
}
