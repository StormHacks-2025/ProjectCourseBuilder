import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/generate-courses", async (req, res) => {
  try {
    const { userPrompt, transcript } = req.body;

    console.log("📩 Received request:", { userPrompt, transcript });

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are a course recommendation assistant.
Given this transcript: ${transcript.join(", ")} and user request: "${userPrompt}", 
respond ONLY in strict JSON format (no markdown or explanations).

Return an array called "courses" like this example:
{
  "courses": [
    { "title": "CMPT 225 - Data Structures", "level": "Intermediate", "prof": "Dr. Smith", "rating": 4.8, "campus": "Burnaby", "year": "2", "breadth": "Quantitative", "friendsInCourse": 2 },
    { "title": "MACM 101 - Discrete Mathematics", "level": "Intermediate", "prof": "Dr. Tan", "rating": 4.5, "campus": "Burnaby", "year": "1", "breadth": "Mathematics", "friendsInCourse": 1 }
  ]
}
`
                },
              ],
            },
          ],
        }),
      }
    );

    // 🔍 Get raw response text
    const rawText = await response.text();
    console.log("🔍 Raw Gemini response text:", rawText);

    // 🔍 Parse top-level API response
    const data = JSON.parse(rawText);

    // 🔍 Extract model-generated text and clean it
    let modelText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    modelText = modelText.replace(/```json|```/g, "").trim();

    // 🔍 Parse the actual JSON of courses
    let recommendations = [];
    try {
      const parsed = JSON.parse(modelText);
      recommendations = parsed.courses || [];
    } catch (err) {
      console.error("⚠️ Failed to parse model JSON:", err);
      // fallback: treat each line as a simple course object
      recommendations = modelText
        .split("\n")
        .filter(Boolean)
        .map((title) => ({ title }));
    }

    // ✅ Return structured array
    res.json({ recommendations });

  } catch (error) {
    console.error("💥 Gemini API call failed:", error);
    res.status(500).json({ error: "Failed to generate courses" });
  }
});

export default router;






