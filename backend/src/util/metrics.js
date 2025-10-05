// utils/courseStats.js
import supabase from "../db.js"; // your supabase client

export async function calculateCourseRating(courseId) {
  const { data: rows, error } = await supabase
    .from("course_ratings")
    .select("liked, disliked, difficulty_rating, avg_hours")
    .eq("course_id", courseId);

  if (error) throw error;
  if (!rows || !rows.length) return null;

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

  // Update course avg_rating
  const { error: updateError } = await supabase
    .from("courses")
    .update({ avg_rating: avgRating })
    .eq("id", courseId);

  if (updateError) throw updateError;

  return avgRating;
}

export async function likelihoodToSucceed(userId, courseId) {
  const { data: userRows, error: userError } = await supabase
    .from("users")
    .select("goodness_score")
    .eq("id", userId)
    .single();

  if (userError) throw userError;

  const goodness = userRows?.goodness_score ?? 3;

  const { data: courseRows, error: courseError } = await supabase
    .from("courses")
    .select("avg_rating")
    .eq("id", courseId)
    .single();

  if (courseError) throw courseError;

  const courseRating = courseRows?.avg_rating ?? 3;

  const likelihood = Math.min(
    1,
    Math.max(0, (goodness * 0.6 + courseRating * 0.4) / 5)
  );

  // Upsert likelihood
  const { error: upsertError } = await supabase
    .from("course_success_chances")
    .upsert(
      { user_id: userId, course_id: courseId, likelihood },
      { onConflict: ["user_id", "course_id"] }
    );

  if (upsertError) throw upsertError;

  return +(likelihood * 100).toFixed(1);
}

export async function dropLikelihood(courseId) {
  const { data: rows, error } = await supabase
    .from("course_drop_feedback")
    .select("likely_to_drop")
    .eq("course_id", courseId);

  if (error) throw error;
  if (!rows || !rows.length) return 0;

  const total = rows.length;
  const drops = rows.filter((r) => r.likely_to_drop).length;

  const percent = +((drops / total) * 100).toFixed(1);

  // Update course drop_percent
  const { error: updateError } = await supabase
    .from("courses")
    .update({ drop_percent: percent })
    .eq("id", courseId);

  if (updateError) throw updateError;

  return percent;
}
