// backend/src/auth.js
import express from "express";
import pool from "./db.js"; // your Postgres pool
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
router.use(cookieParser());

// Signup
router.post("/signup", async (req, res) => {
  const { email, password, name, major, profile_pic, paid } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  const id = uuidv4();

  const result = await pool.query(
    `INSERT INTO users (id, email, password, name, major, profile_pic, paid)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,email,paid`,
    [
      id,
      email,
      password,
      name || null,
      major || null,
      profile_pic || null,
      paid || false,
    ]
  );

  const user = result.rows[0];

  // Set cookie with plain user id (for demo purposes)
  res.cookie("user_id", user.id, { maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ user });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1 AND password=$2",
    [email, password]
  );
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  res.cookie("user_id", user.id, { maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ user: { id: user.id, email: user.email, paid: user.paid } });
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.json({ success: true });
});

// Auth middleware
export const authenticate = async (req, res, next) => {
  const userId = req.cookies.user_id;
  if (!userId) {
    req.user = { paid: false };
    return next();
  }

  const result = await pool.query("SELECT * FROM users WHERE id=$1", [userId]);
  const user = result.rows[0];
  req.user = user || { paid: false };
  next();
};

export default router;
