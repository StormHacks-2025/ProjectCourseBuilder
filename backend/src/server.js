import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import coursesRouter from "./routes/courses.js";


dotenv.config(); // loads .env
console.log("Gemini API key loaded:", process.env.GEMINI_API_KEY ? "✅ Yes" : "❌ No");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount the courses router
app.use("/api", coursesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


