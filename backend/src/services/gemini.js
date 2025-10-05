import axios from "axios";

export const generateCoursesWithGemini = async (userPrompt, transcript) => {
  try {
    const response = await axios.post(
      "https://generativeai.googleapis.com/v1beta2/models/text-bison-001:generate",
      {
        prompt: `Based on this transcript ${transcript.join(", ")}, recommend some SFU CS courses for the user. Keep the response as a JSON array with courseId and courseName.`,
        maxOutputTokens: 300,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
        },
      }
    );

    // Gemini returns text in response.data.candidates[0].content
    const rawText = response.data?.candidates?.[0]?.content;
    if (!rawText) return [];

    // Parse JSON safely
    let courses = [];
    try {
      courses = JSON.parse(rawText);
    } catch (e) {
      console.warn("Gemini response is not valid JSON:", rawText);
      courses = [];
    }

    return courses;
  } catch (err) {
    console.error("Gemini API error:", err.message);
    return [];
  }
};
