import { supabase } from "../db.js";

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

// Helper function to find course ID from course code
async function findCourseId(courseCode) {
  try {
    const parts = courseCode.split(" ");
    if (parts.length < 2) return null;

    const department = parts[0];
    const number = parts.slice(1).join(" ");

    const { data: course, error } = await supabase
      .from("courses")
      .select("id")
      .eq("department", department)
      .eq("number", number)
      .single();

    if (error) return null;
    return course?.id || null;
  } catch (error) {
    console.error(`Error finding course ID for ${courseCode}:`, error);
    return null;
  }
}

export async function computeAndStoreStudentGoodness(userId) {
  try {
    // 1️⃣ Fetch transcript courses + linked transcript info
    const { data: transcriptCourses, error: transcriptError } = await supabase
      .from("transcript_courses")
      .select(
        `
        semester,
        grade,
        units,
        course_code,
        transcripts!inner(user_id)
      `
      )
      .eq("transcripts.user_id", userId)
      .order("semester", { ascending: true });

    if (transcriptError) throw transcriptError;
    if (!transcriptCourses?.length) {
      console.log("No transcript courses found for user");
      return 0;
    }

    // Group courses by semester
    const coursesBySemester = {};
    for (const row of transcriptCourses) {
      if (!coursesBySemester[row.semester])
        coursesBySemester[row.semester] = [];
      coursesBySemester[row.semester].push(row);
    }

    const semesterKeys = Object.keys(coursesBySemester);
    const totalSemesters = semesterKeys.length;
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (let i = 0; i < totalSemesters; i++) {
      const semester = semesterKeys[i];
      const weight = (i + 1) / totalSemesters;
      const courses = coursesBySemester[semester];

      let semesterScoreSum = 0;
      let semesterUnitsSum = 0;

      for (const course of courses) {
        const G = gradePointsMap[course.grade] || 0;
        const U = course.units || 3;

        // 2️⃣ Look up course ID first, then fetch ratings
        const courseId = await findCourseId(course.course_code);

        let D = 1,
          H = 10; // Default values

        if (courseId) {
          // Only fetch ratings if we found the course ID
          const { data: ratingData, error: ratingError } = await supabase
            .from("course_ratings")
            .select("difficulty_rating, avg_hours")
            .eq("course_id", courseId); // ✅ Use the actual UUID

          if (ratingError) {
            console.error(
              `Error fetching ratings for ${course.course_code}:`,
              ratingError
            );
            // Continue with default values
          } else if (ratingData?.length) {
            const avgDifficulty =
              ratingData.reduce(
                (sum, r) => sum + (r.difficulty_rating || 0),
                0
              ) / ratingData.length;
            const avgHours =
              ratingData.reduce((sum, r) => sum + (r.avg_hours || 0), 0) /
              ratingData.length;

            D = avgDifficulty || 1;
            H = avgHours || 10;
          }
        } else {
          console.log(
            `Course not found in database: ${course.course_code}, using default values`
          );
        }

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

    // 3️⃣ Update user goodness_score
    const { error: updateError } = await supabase
      .from("users")
      .update({ goodness_score: goodnessScore })
      .eq("id", userId);

    if (updateError) throw updateError;

    console.log(
      `Updated goodness score to ${goodnessScore} for user: ${userId}`
    );
    return goodnessScore;
  } catch (error) {
    console.error("Error in computeAndStoreStudentGoodness:", error);
    // Don't throw the error - just return a default value
    return 0;
  }
}
