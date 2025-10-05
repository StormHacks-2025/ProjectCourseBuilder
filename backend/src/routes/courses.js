import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
const courses = [
  { courseId: 'CMPT 102', courseName: 'Introduction to Scientific Computer Programming', units: 3 },
  { courseId: 'CMPT 125', courseName: 'Introduction to Computing Science and Programming II', units: 3 },
  { courseId: 'CMPT 130', courseName: 'Introduction to Computer Programming I', units: 3 },
  { courseId: 'CMPT 135', courseName: 'Introduction to Computer Programming II (Advanced)', units: 3 },
  { courseId: 'CMPT 213', courseName: 'Object-Oriented Design in Java', units: 3 },
  { courseId: 'CMPT 225', courseName: 'Data Structures and Programming', units: 3 },
  { courseId: 'CMPT 263', courseName: 'Introduction to Human-Centered Computing', units: 3 },
  { courseId: 'CMPT 276', courseName: 'Introduction to Software Engineering', units: 3 },
  { courseId: 'CMPT 295', courseName: 'Introduction to Computer Systems', units: 3 },
  { courseId: 'CMPT 307', courseName: 'Data Structures', units: 3 },
  { courseId: 'CMPT 308', courseName: 'Computability', units: 3 },
  { courseId: 'CMPT 310', courseName: 'Introduction to Artificial Intelligence', units: 3 },
  { courseId: 'CMPT 340', courseName: 'Biomedical Computing', units: 3 },
  { courseId: 'CMPT 354', courseName: 'Database Systems I', units: 3 },
  { courseId: 'CMPT 361', courseName: 'Introduction to Visual Computing', units: 3 },
  { courseId: 'CMPT 362', courseName: 'Mobile App Programming', units: 3 },
  { courseId: 'CMPT 365', courseName: 'Multimedia Systems', units: 3 },
  { courseId: 'CMPT 371', courseName: 'Data Communications and Networking', units: 3 },
  { courseId: 'CMPT 373', courseName: 'Software Development Methods', units: 3 },
  { courseId: 'CMPT 376W', courseName: 'Professional Responsibility and Technical Writing', units: 3 },
  { courseId: 'CMPT 383', courseName: 'Comparative Programming Languages', units: 3 },
  { courseId: 'CMPT 403', courseName: 'System Security and Privacy', units: 3 },
  { courseId: 'CMPT 405', courseName: 'Computational Algorithms', units: 3 },
  { courseId: 'CMPT 409', courseName: 'Special Topics in Theoretical Computing', units: 3 },
  { courseId: 'CMPT 410', courseName: 'Machine Learning', units: 3 },
  { courseId: 'CMPT 413', courseName: 'Computational Linguistics', units: 3 },
  { courseId: 'CMPT 415', courseName: 'Special Research Project', units: 3 },
];

app.post("/api/generate-courses", async (req, res) => {
  const { userPrompt, transcript } = req.body; // transcript could be an array of course names or objects

  // Build a structured prompt
  const prompt = `
You are a course recommendation assistant.

- User input: ${userPrompt}

- User transcript: ${JSON.stringify(transcript)}

- Available SFU CS courses:
  ${JSON.stringify(courses)}

- Pick courses from this list that best match the user’s academic background.
- Return the result as JSON array of objects: { courseId, courseName, units }.
- If you need more information, ask the user clarifying questions.
- Include a field "done": true if no more questions are needed, otherwise false.
`;

  try {
    const response = await axios.post(
      "https://gemini.googleapis.com/v1/models/YOUR_MODEL:generate",
      {
        prompt: prompt,
        max_output_tokens: 400,
        temperature: 0.7,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const generatedText = response.data?.candidates?.[0]?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(generatedText);
    } catch {
      parsed = { error: "Failed to parse JSON", raw: generatedText };
    }

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini request failed" });
  }
});


app.listen(5000, () => console.log("Server running on port 5000"));
