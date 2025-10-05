// routes/courseStats.js
import express from "express";
import {supabase} from "../db.js"; // your supabase client
import * as courseStats from "../util/metrics.js";

const router = express.Router();

// Get course rating
router.get("/rating/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    // First try to get existing rating
    const { data: course, error } = await supabase
      .from("courses")
      .select("avg_rating")
      .eq("id", courseId)
      .single();

    if (error) throw error;

    if (course?.avg_rating) {
      return res.json({ rating: course.avg_rating });
    }

    // Calculate fresh rating
    const rating = await calculateCourseRating(courseId);
    res.json({ rating: rating || 3.5 }); // Default if no ratings
  } catch (error) {
    console.error("Error fetching course rating:", error);
    res.status(500).json({ error: "Failed to fetch course rating" });
  }
});

// Get friends in course
router.get("/friends/:courseId/:userId", async (req, res) => {
  try {
    const { courseId, userId } = req.params;

    const { data: friendData, error } = await supabase
      .from("course_friends")
      .select("friend_ids")
      .eq("course_id", courseId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      throw error;
    }

    const friendsCount = friendData?.friend_ids?.length || 0;
    res.json({ friendsCount });
  } catch (error) {
    console.error("Error fetching friends data:", error);
    res.status(500).json({ error: "Failed to fetch friends data" });
  }
});

// Get course drop likelihood
router.get("/drop-likelihood/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const { data: course, error } = await supabase
      .from("courses")
      .select("drop_percent")
      .eq("id", courseId)
      .single();

    if (error) throw error;

    if (course?.drop_percent !== null) {
      return res.json({ dropPercent: course.drop_percent });
    }

    // Calculate fresh drop likelihood
    const dropPercent = await dropLikelihood(courseId);
    res.json({ dropPercent: dropPercent || 15 }); // Default if no data
  } catch (error) {
    console.error("Error fetching drop likelihood:", error);
    res.status(500).json({ error: "Failed to fetch drop likelihood" });
  }
});

// Get comprehensive course stats
router.get("/stats/:courseId/:userId", async (req, res) => {
  try {
    const { courseId, userId } = req.params;

    const [ratingRes, friendsRes, dropRes] = await Promise.allSettled([
      fetch(`http://localhost:4000/api/course-stats/rating/${courseId}`).then(
        (r) => r.json()
      ),
      fetch(
        `http://localhost:4000/api/course-stats/friends/${courseId}/${userId}`
      ).then((r) => r.json()),
      fetch(
        `http://localhost:4000/api/course-stats/drop-likelihood/${courseId}`
      ).then((r) => r.json()),
    ]);

    const stats = {
      rating: ratingRes.status === "fulfilled" ? ratingRes.value.rating : 3.5,
      friendsCount:
        friendsRes.status === "fulfilled" ? friendsRes.value.friendsCount : 0,
      dropPercent:
        dropRes.status === "fulfilled" ? dropRes.value.dropPercent : 15,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching course stats:", error);
    res.status(500).json({ error: "Failed to fetch course stats" });
  }
});

export default router;
