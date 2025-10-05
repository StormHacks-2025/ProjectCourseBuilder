import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import { supabase } from "./db.js"; // Supabase client
import { v4 as uuidv4 } from "uuid";
import pdfRoute from "./routes/pdfRoute.js"; // PDF routes

import coursesRouter from "./routes/courseJa.js";
import courseStatsRoutes from "./routes/courseStats.js";

// Add this with your other route imports

const app = express();
const PORT = process.env.PORT || 4000;

// -------------------- CORS --------------------
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-user-email", "Authorization"],
    credentials: false,
  })
);

// -------------------- Middleware --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload()); // for PDF uploads

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

app.get("/api/profile", async (req, res) => {
  const userEmail = req.headers["x-user-email"];
  if (!userEmail) return res.status(400).json({ error: "Email required" });

  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", userEmail)
    .limit(1)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!users) return res.status(404).json({ error: "User not found" });

  res.json({ user: users });
});

app.get("/api/transcripts", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    // 1️⃣ Find the user by email
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (userError) throw userError;
    if (!users || users.length === 0)
      return res.status(404).json({ error: "User not found" });

    const userId = users[0].id;

    // 2️⃣ Check if the user has transcripts
    const { data: transcripts, error: transcriptsError } = await supabase
      .from("transcripts")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (transcriptsError) throw transcriptsError;

    // 3️⃣ Return boolean flag
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
  console.log(`Server is running on http://localhost:${PORT}`);
});
