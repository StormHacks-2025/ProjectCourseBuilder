import { parsePDF } from "../util/parser.js";
import { supabase } from "../db.js";
import { computeAndStoreStudentGoodness } from "../util/goodnress.js";

export const uploadPDF = async (req, res) => {
  try {
    // 1️⃣ Get user email
    const userEmail = req.headers["x-user-email"];
    if (!userEmail) {
      return res.status(400).json({ error: "Email required" });
    }

    // 2️⃣ Find user ID
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", userEmail)
      .limit(1);

    if (userError) throw userError;
    if (!users || users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = users[0].id;

    // 3️⃣ Check PDF file
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ error: "No PDF uploaded" });
    }
    const pdfFile = req.files.pdf.data;

    // 4️⃣ Parse PDF
    const parsedData = await parsePDF(pdfFile);
    console.log("Parsed transcript data successfully");

    // 5️⃣ Insert transcript
    const { data: transcriptData, error: transcriptError } = await supabase
      .from("transcripts")
      .insert([
        {
          user_id: userId,
          name: `Transcript Upload ${new Date().toISOString()}`,
        },
      ])
      .select()
      .single();

    if (transcriptError) throw transcriptError;
    const transcriptId = transcriptData.id;

    // 6️⃣ Insert courses WITHOUT any course_id references
    const courseRows = [];

    for (const semester of parsedData) {
      for (const course of semester.courses) {
        courseRows.push({
          transcript_id: transcriptId,
          semester: semester.semester,
          course_code: course.courseCode,
          course_name: course.courseName,
          grade: course.grade,
          units: course.units,
        });
      }
    }

    // 7️⃣ Batch insert courses
    if (courseRows.length > 0) {
      const { error: coursesError } = await supabase
        .from("transcript_courses")
        .insert(courseRows);

      if (coursesError) {
        console.error("Error inserting courses:", coursesError);
        throw coursesError;
      }
    }

    console.log(`Successfully inserted ${courseRows.length} courses`);

    // 8️⃣ Compute and store student goodness
    console.log("About to compute student goodness...");
    let goodnessScore = 0;
    try {
      goodnessScore = await computeAndStoreStudentGoodness(userId);
      console.log("Goodness calculation completed. Score:", goodnessScore);
    } catch (goodnessError) {
      console.error("Goodness calculation failed:", goodnessError);
      // Set default score if calculation fails
      goodnessScore = 75;
    }

    res.json({
      success: true,
      transcriptId,
      coursesCount: courseRows.length,
      goodnessScore: goodnessScore, // Return the calculated score
      message: `Successfully processed ${courseRows.length} courses from transcript`,
    });
  } catch (err) {
    console.error("PDF upload error:", err);
    res.status(500).json({
      error: "Failed to process PDF",
      details: err.message,
    });
  }
};
