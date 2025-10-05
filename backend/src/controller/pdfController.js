import { parsePDF } from "../util/parser.js";
import { supabase } from "../db.js"; // make sure this is a named export
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

    // 6️⃣ Insert courses (batch insert)
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

    if (courseRows.length > 0) {
      const { error: coursesError } = await supabase
        .from("transcript_courses")
        .insert(courseRows);

      if (coursesError) throw coursesError;
    }

    // 7️⃣ Compute and store student goodness
    await computeAndStoreStudentGoodness(userId);

    res.json({
      success: true,
      transcriptId,
      coursesCount: parsedData.reduce(
        (acc, sem) => acc + sem.courses.length,
        0
      ),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process PDF" });
  }
};
