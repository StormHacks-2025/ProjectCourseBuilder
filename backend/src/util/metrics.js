import pool from "../db.js";

export async function calculateCourseRating(courseId) {
  const { rows } = await pool.query(
    `SELECT liked, disliked, difficulty_rating, avg_hours
     FROM course_ratings
     WHERE course_id = $1`,
    [courseId]
  );

  if (!rows.length) return null;


  
  let score = 0;
  let total = 0;

  rows.forEach((r) => {
    let rating = 3;

    if (r.liked) rating += 1;
    if (r.disliked) rating -= 1;
    if (r.difficulty_rating) rating -= (r.difficulty_rating - 3) * 0.2;
    if (r.avg_hours) rating -= (r.avg_hours - 5) * 0.1;

    rating = Math.min(Math.max(rating, 1), 5);
    score += rating;
    total++;
  });

  const avgRating = total ? +(score / total).toFixed(2) : null;

  await pool.query(`UPDATE courses SET avg_rating = $1 WHERE id = $2`, [
    avgRating,
    courseId,
  ]);

  return avgRating;
}

export async function likelihoodToSucceed(userId, courseId) {
  const { rows: userRows } = await pool.query(
    `SELECT goodness_score FROM users WHERE id = $1`,
    [userId]
  );
  const goodness = userRows[0]?.goodness_score || 3;

  const { rows: courseRows } = await pool.query(
    `SELECT avg_rating FROM courses WHERE id = $1`,
    [courseId]
  );
  const courseRating = courseRows[0]?.avg_rating || 3;

  const likelihood = Math.min(
    1,
    Math.max(0, (goodness * 0.6 + courseRating * 0.4) / 5)
  );

  await pool.query(
    `INSERT INTO course_success_chances (user_id, course_id, likelihood)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, course_id) DO UPDATE
     SET likelihood = EXCLUDED.likelihood`,
    [userId, courseId, likelihood]
  );

  return +(likelihood * 100).toFixed(1);
}

export async function dropLikelihood(courseId) {
  const { rows } = await pool.query(
    `SELECT likely_to_drop FROM course_drop_feedback WHERE course_id = $1`,
    [courseId]
  );

  if (!rows.length) return 0;

  const total = rows.length;
  const drops = rows.filter((r) => r.likely_to_drop).length;

  const percent = +((drops / total) * 100).toFixed(1);

  await pool.query(`UPDATE courses SET drop_percent = $1 WHERE id = $2`, [
    percent,
    courseId,
  ]);

  return percent;
}
