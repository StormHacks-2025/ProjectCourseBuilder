import pool from "./db.js";

const gradePointsMap = {
  "A+": 4.3,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  D: 1.0,
  F: 0,
};

export async function computeAndStoreStudentGoodness(userId) {
  const res = await pool.query(
    `
    SELECT semester, grade, units
    FROM transcript_courses tc
    JOIN transcripts t ON tc.transcript_id = t.id
    WHERE t.user_id = $1
    ORDER BY semester ASC
  `,
    [userId]
  );

  const coursesBySemester = {};
  res.rows.forEach((row) => {
    if (!coursesBySemester[row.semester]) coursesBySemester[row.semester] = [];
    coursesBySemester[row.semester].push(row);
  });

  const semesterKeys = Object.keys(coursesBySemester);
  const totalSemesters = semesterKeys.length;
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (let i = 0; i < semesterKeys.length; i++) {
    const semester = semesterKeys[i];
    const weight = (i + 1) / totalSemesters;
    const courses = coursesBySemester[semester];

    let semesterScoreSum = 0;
    let semesterUnitsSum = 0;

    for (const course of courses) {
      const G = gradePointsMap[course.grade] || 0;
      const U = course.units || 3;

      const ratingRes = await pool.query(
        `
        SELECT AVG(difficulty_rating) AS avgDifficulty, AVG(avg_hours) AS avgHours
        FROM course_ratings cr
        JOIN courses c ON cr.course_id = c.id
        WHERE c.number = $1
      `,
        [course.course_code]
      );

      const D = parseFloat(ratingRes.rows[0].avgdifficulty) || 1;
      const H = parseFloat(ratingRes.rows[0].avghours) || 10;

      let fH = 1;
      if (H < 5) fH = 0.9;
      else if (H > 20) fH = 0.95;

      semesterScoreSum += (G / 4.3) * U * D * fH;
      semesterUnitsSum += U;
    }

    const semesterScore = semesterUnitsSum
      ? semesterScoreSum / semesterUnitsSum
      : 0;
    totalWeightedScore += semesterScore * weight;
    totalWeight += weight;
  }

  const goodnessScore = totalWeight ? totalWeightedScore / totalWeight : 0;

  await pool.query(
    `
    UPDATE users
    SET goodness_score = $1
    WHERE id = $2
  `,
    [goodnessScore, userId]
  );

  return goodnessScore;
}
