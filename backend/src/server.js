import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import fileUpload from "express-fileupload";
import { supabase } from "./db.js"; // Supabase client
import { v4 as uuidv4 } from "uuid";
import pdfRoute from "./routes/pdfRoute.js"; // PDF routes
import coursesRouter from "./routes/courseJa.js";
import courseStatsRoutes from "./routes/courseStats.js";

dotenv.config(); // loads .env


const app = express();
const PORT = process.env.PORT || 4000;

// -------------------- Health Check (CRITICAL for Render) --------------------
app.get('/health', (req, res) => {
  res.status(200).send("ok");
});


// -------------------- CORS --------------------
app.use(
  cors({
    origin: "*", // your frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-user-email", "Authorization"],
    credentials: false,
  })
);

// -------------------- Middleware --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload()); // for PDF uploads


app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running', 
    status: 'ok',
    endpoints: {
      health: '/health',
      signup: '/api/signup',
      login: '/api/login',
      courses: '/api/courses',
      generateCourses: '/api/generate-courses'
    }
  });
});

// -------------------- Routes --------------------
app.use("/api/course-stats", courseStatsRoutes);
app.use("/api/courses", coursesRouter);

// Signup
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (existingError) throw existingError;
    if (existing && existing.length > 0)
      return res.status(400).json({ message: "Email already registered" });

    const userId = uuidv4();
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: userId,
        name,
        email,
        password,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) throw insertError;

    res.json({ user: { id: userId, name, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("email", email)
      .eq("password", password)
      .limit(1);

    if (error) throw error;
    if (!users || users.length === 0)
      return res.status(400).json({ message: "Invalid email or password" });

    res.json({ user: users[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const API_BASE = "https://projectcoursebuilder-1.onrender.com/api";

app.post("/api/generate-courses", async (req, res) => {
  const { userPrompt, transcript } = req.body;

  if (!transcript || !Array.isArray(transcript)) {
    return res
      .status(400)
      .json({ message: "Transcript is required and must be an array." });
  }

  try {
    // === Step 1: Call DeepSeek API for recommendations ===
    const deepseekResponse = await axios.post(
      "https://api.deepseek.com/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful course advisor for SFU CS students. You must respond ONLY with valid JSON.",
          },
          {
            role: "user",
            content: `User request: "${userPrompt || "Recommend courses for me"}"
            
Student's completed courses: ${transcript.join(", ")}

Based on this transcript and user request, recommend 5 SFU CS courses. 
Respond ONLY as a valid JSON array like this:
[
  {"department": "CMPT", "number": "213"},
  {"department": "CMPT", "number": "295"}
]

Use real SFU course codes. Focus on courses that build on completed courses and match the user's interest.`,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
      }
    );

    const textOutput =
      deepseekResponse.data?.choices?.[0]?.message?.content?.trim() || "";
    console.log("🔹 DeepSeek Output:", textOutput);

    // === Step 2: Parse DeepSeek response ===
    let aiCourses = [];
    try {
      const cleaned = textOutput
        .replace(/```json\s*/i, "")
        .replace(/```/g, "")
        .trim();
      aiCourses = JSON.parse(cleaned);
    } catch (e) {
      console.error("❌ Failed to parse DeepSeek response:", textOutput);
      return res.status(500).json({
        message: "Failed to parse AI response.",
        rawResponse: textOutput,
      });
    }

    if (!Array.isArray(aiCourses) || aiCourses.length === 0) {
      return res.status(500).json({ message: "No courses generated by AI." });
    }

    // === Step 3: Fetch real course data for each recommendation ===
    const year = "current";
    const term = "current";
    const enrichedCourses = [];

    for (const aiCourse of aiCourses.slice(0, 5)) {
      try {
        const { department, number } = aiCourse;

        // Fetch course sections
        let sectionsResponse;
        try {
          sectionsResponse = await axios.get(
            `${API_BASE}/courses/sections/${year}/${term}/${department}/${number}`
          );
        } catch (err) {
          console.warn(
            `⚠️ Course ${department} ${number} not found in ${year}/${term}, skipping...`
          );
          continue;
        }

        if (!sectionsResponse.data || sectionsResponse.data.length === 0) {
          console.warn(`⚠️ No sections for ${department} ${number}`);
          continue;
        }

        const sections = sectionsResponse.data;
        const enrollmentSections = sections.filter((s) => s.classType === "e");

        if (enrollmentSections.length === 0) {
          console.warn(`⚠️ No enrollment sections for ${department} ${number}`);
          continue;
        }

        // Fetch outline for first section
        const firstSection = enrollmentSections[0];
        let outlineResponse;
        try {
          outlineResponse = await axios.get(
            `${API_BASE}/courses/outline/${year}/${term}/${department}/${number}/${firstSection.value}`
          );
        } catch (err) {
          console.warn(
            `⚠️ No outline for ${department} ${number} section ${firstSection.value}, skipping...`
          );
          continue;
        }

        if (!outlineResponse.data) {
          console.warn(`⚠️ Empty outline for ${department} ${number}`);
          continue;
        }

        const outline = outlineResponse.data;
        const instructor = outline.instructor?.[0];
        const schedules = outline.courseSchedule || [];

        // === Convert schedule to variations format ===
        const variations = schedules
          .map((schedule) => {
            const daysMap = {
              Mo: "Mon",
              Tu: "Tue",
              We: "Wed",
              Th: "Thu",
              Fr: "Fri",
            };
            const daysString = schedule.days || "";
            const days = [];

            for (let i = 0; i < daysString.length; i += 2) {
              const dayCode = daysString.substr(i, 2);
              if (daysMap[dayCode]) days.push(daysMap[dayCode]);
            }

            const parseTime = (timeStr) => {
              if (!timeStr) return 0;
              const [hours, minutes] = timeStr.split(":").map(Number);
              return hours + minutes / 60;
            };

            const startHour = parseTime(schedule.startTime);
            const endHour = parseTime(schedule.endTime);

            return days.map((day) => ({ day, startHour, endHour }));
          })
          .filter((v) => v.length > 0);

        // Default variation if none found
        if (variations.length === 0) {
          variations.push([{ day: "Mon", startHour: 9, endHour: 10.5 }]);
        }

        // === Fetch course stats ===
        let stats = { rating: 3.5, friendsCount: 0, dropPercent: 15 };
        try {
          const courseIdResponse = await axios.get(
            `${API_BASE}/courses/find-id?department=${department}&number=${number}`,
            { timeout: 3000 }
          );

          if (courseIdResponse.data?.courseId) {
            try {
              const statsResponse = await axios.get(
                `${API_BASE}/course-stats/stats/${courseIdResponse.data.courseId}/user-123`,
                { timeout: 3000 }
              );
              stats = statsResponse.data;
            } catch (statsErr) {
              // Stats not available, use defaults
            }
          }
        } catch (err) {
          // Course ID not found or stats unavailable, use defaults
        }

        // === Build enriched course object ===
        const days = schedules[0]?.days
          ? (() => {
              const daysMap = {
                Mo: "Mon",
                Tu: "Tue",
                We: "Wed",
                Th: "Thu",
                Fr: "Fri",
              };
              const daysString = schedules[0].days;
              const result = [];
              for (let i = 0; i < daysString.length; i += 2) {
                const dayCode = daysString.substr(i, 2);
                if (daysMap[dayCode]) result.push(daysMap[dayCode]);
              }
              return result.length > 0 ? result : ["Mon", "Wed"];
            })()
          : ["Mon", "Wed"];

        enrichedCourses.push({
          title: `${department.toUpperCase()} ${number}`,
          fullTitle: outline.info?.title || "Course Title",
          level:
            number >= 400
              ? "Advanced"
              : number >= 200
              ? "Intermediate"
              : "Beginner",
          department,
          courseNumber: number,
          days,
          timeDisplay:
            schedules[0]?.startTime && schedules[0]?.endTime
              ? `${schedules[0].startTime} - ${schedules[0].endTime}`
              : "TBD",
          hours:
            schedules[0]?.startTime && schedules[0]?.endTime
              ? `${schedules[0].startTime} - ${schedules[0].endTime}`
              : "TBD",
          prof: instructor?.name || "TBA",
          rating: stats.rating,
          campus: schedules[0]?.campus || "Burnaby",
          year:
            number >= 400
              ? "4th Year"
              : number >= 300
              ? "3rd Year"
              : number >= 200
              ? "2nd Year"
              : "1st Year",
          breadth: outline.info?.designation || "N/A",
          friendsInCourse: stats.friendsCount,
          dropPercent: stats.dropPercent,
          prereqs: outline.info?.prerequisites
            ? [outline.info.prerequisites]
            : [],
          description: outline.info?.description || "",
          units: outline.info?.units || "3",
          variations,
          sections: enrollmentSections,
        });
      } catch (err) {
        console.error(
          `Error fetching ${aiCourse.department} ${aiCourse.number}:`,
          err.message
        );
        continue;
      }
    }

    // === Step 4: If we need more courses, ask AI for alternatives ===
    if (
      enrichedCourses.length < 3 &&
      enrichedCourses.length < aiCourses.length
    ) {
      console.log(
        `Only found ${enrichedCourses.length} courses, requesting alternatives from AI...`
      );

      try {
        const unavailableCourses = aiCourses
          .slice(0, 5)
          .filter(
            (ac) =>
              !enrichedCourses.find(
                (ec) =>
                  ec.department === ac.department &&
                  ec.courseNumber === ac.number
              )
          )
          .map((ac) => `${ac.department} ${ac.number}`)
          .join(", ");

        const backupResponse = await axios.post(
          "https://api.deepseek.com/chat/completions",
          {
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful course advisor for SFU CS students. You must respond ONLY with valid JSON.",
              },
              {
                role: "user",
                content: `These courses are not available this term: ${unavailableCourses}

Student's completed courses: ${transcript.join(", ")}

Recommend ${
                  5 - enrichedCourses.length
                } alternative SFU CS courses that ARE commonly offered.
Respond ONLY as a valid JSON array like:
[
  {"department": "CMPT", "number": "213"},
  {"department": "CMPT", "number": "276"}
]

Focus on popular courses like CMPT 213, 276, 225, 295, 320, 371.`,
              },
            ],
            temperature: 0.7,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
            },
          }
        );

        const backupText =
          backupResponse.data?.choices?.[0]?.message?.content?.trim() || "";
        const backupCourses = JSON.parse(
          backupText
            .replace(/```json\s*/i, "")
            .replace(/```/g, "")
            .trim()
        );

        // Try to fetch backup courses
        for (const backupCourse of backupCourses) {
          if (enrichedCourses.length >= 5) break;

          // Re-run the same fetch logic for backup courses
          // (You could extract this into a helper function to avoid duplication)
          try {
            const { department, number } = backupCourse;
            const sectionsResponse = await axios.get(
              `${API_BASE}/courses/sections/${year}/${term}/${department}/${number}`
            );

            if (sectionsResponse.data && sectionsResponse.data.length > 0) {
              // ... (same enrichment logic as above)
              console.log(`✅ Found backup course: ${department} ${number}`);
            }
          } catch (err) {
            continue;
          }
        }
      } catch (err) {
        console.error("Could not fetch backup courses:", err.message);
      }
    }

    // === Step 5: Return recommendations ===
    if (enrichedCourses.length === 0) {
      return res.status(404).json({
        message:
          "Could not find any of the recommended courses in the current term.",
      });
    }

    res.json({
      recommendations: enrichedCourses,
      message: `Found ${enrichedCourses.length} courses based on your request`,
    });
  } catch (err) {
    console.error(
      "💥 Error in generate-courses:",
      err.response?.data || err.message
    );
    res.status(500).json({
      message: "Server error generating course recommendations.",
      error: err.message,
    });
  }
});

// Get profile
app.get("/api/profile", async (req, res) => {
  const email = req.headers["x-user-email"];
  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, major, profile_pic, paid")
      .eq("email", email)
      .limit(1);

    if (error) throw error;
    if (!users || users.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.json({ user: users[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update profile picture
app.post("/api/profile/pic", async (req, res) => {
  const { email, profile_pic } = req.body;
  if (!email || !profile_pic)
    return res.status(400).json({ message: "Email and profile_pic required" });

  try {
    const { error } = await supabase
      .from("users")
      .update({ profile_pic })
      .eq("email", email);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update major
app.post("/api/profile/major", async (req, res) => {
  const { email, major } = req.body;
  if (!email || !major)
    return res.status(400).json({ message: "Email and major required" });

  try {
    const { error } = await supabase
      .from("users")
      .update({ major })
      .eq("email", email);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/transcripts?email=user@example.com
app.get("/api/transcripts", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    // 1. Get the user by email
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (userError) throw userError;
    if (!users || users.length === 0)
      return res.status(404).json({ error: "User not found" });

    const userId = users[0].id;

    // 2. Check if transcripts exist for this user
    const { data: transcripts, error: transcriptsError } = await supabase
      .from("transcripts")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (transcriptsError) throw transcriptsError;

    // 3. Return JSON with boolean flag
    res.json({ set: transcripts && transcripts.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transcripts" });
  }
});

// -------------------- PDF Routes --------------------
app.use("/api/pdf", pdfRoute); // your PDF upload route

// -------------------- Start Server --------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check available at http://localhost:${PORT}/health`);
});
