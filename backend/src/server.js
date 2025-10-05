import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import pool from "./db.js"; // your PostgreSQL connection
import { v4 as uuidv4 } from "uuid";
import pdfRoutes from "./routes/pdfRoute.js"; // PDF routes

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- CORS --------------------
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-user-email", "Authorization"],
    credentials: false, // we are not using cookies
  })
);
app.options("/*", cors());


// Handle preflight requests

// -------------------- Middleware --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload()); // for PDF uploads

// -------------------- Routes --------------------

// Signup
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [
      email,
    ]);
    if (existing.rows.length)
      return res.status(400).json({ message: "Email already registered" });

    const userId = uuidv4();
    await pool.query(
      `INSERT INTO users (id, name, email, password, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, name, email, password]
    );

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
    const { rows } = await pool.query(
      "SELECT id, name, email FROM users WHERE email=$1 AND password=$2",
      [email, password]
    );

    if (!rows.length)
      return res.status(400).json({ message: "Invalid email or password" });

    res.json({ user: rows[0] });
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
    const { rows } = await pool.query(
      "SELECT id, name, email, major, profile_pic, paid FROM users WHERE email=$1",
      [email]
    );
    if (!rows.length)
      return res.status(404).json({ message: "User not found" });

    res.json({ user: rows[0] });
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
    await pool.query("UPDATE users SET profile_pic=$1 WHERE email=$2", [
      profile_pic,
      email,
    ]);
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
    await pool.query("UPDATE users SET major=$1 WHERE email=$2", [
      major,
      email,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- PDF Routes --------------------
app.use("/api/pdf", pdfRoutes); // your PDF upload route

// -------------------- Start Server --------------------
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
