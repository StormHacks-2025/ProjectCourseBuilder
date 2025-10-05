import { parsePDF } from "../utils/pdfParser.js";
import pool from "../db.js";
import { computeAndStoreStudentGoodness } from "../utils/goodness.js";

export const uploadPDF = async (req, res) => {
  try {
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ error: "No PDF uploaded" });
    }

    const pdfFile = req.files.pdf.data;

    // Parse the PDF
    const parsedData = await parsePDF(pdfFile);

    // Start transaction
    await pool.query("BEGIN");

    // Insert transcript record
    const transcriptResult = await pool.query(
      `INSERT INTO transcripts (user_id, name) 
       VALUES ($1, $2) 
       RETURNING id`,
      [req.user.id, `Transcript Upload ${new Date().toISOString()}`]
    );
    const transcriptId = transcriptResult.rows[0].id;

    // Prepare batch insert for courses
    const values = [];
    const placeholders = [];
    let i = 1;

    for (const semester of parsedData) {
      for (const course of semester.courses) {
        values.push(
          transcriptId,
          semester.semester,
          course.courseCode,
          course.courseName,
          course.grade,
          course.units
        );
        placeholders.push(
          `($${i}, $${i + 1}, $${i + 2}, $${i + 3}, $${i + 4}, $${i + 5})`
        );
        i += 6;
      }
    }

    if (values.length > 0) {
      await pool.query(
        `INSERT INTO transcript_courses 
          (transcript_id, semester, course_code, course_name, grade, units)
         VALUES ${placeholders.join(", ")}`,
        values
      );
    }

    // Calculate and store student goodness based on transcript
    await computeAndStoreStudentGoodness(req.user.id);

    // Commit transaction
    await pool.query("COMMIT");

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
    await pool.query("ROLLBACK");
    res.status(500).json({ error: "Failed to process PDF" });
  }
};
