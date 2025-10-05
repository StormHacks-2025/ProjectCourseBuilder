import { parsePDF } from "../utils/pdfParser.js";
import pool from "../db.js";

export const uploadPDF = async (req, res) => {
  try {
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ error: "No PDF uploaded" });
    }

    const pdfFile = req.files.pdf.data; 

    // Parse the PDF
    const parsedData = await parsePDF(pdfFile);

  
    const transcriptResult = await pool.query(
      `INSERT INTO transcripts (user_id, name) VALUES ($1, $2) RETURNING id`,
      [req.user.id, `Transcript Upload ${new Date().toISOString()}`]
    );
    const transcriptId = transcriptResult.rows[0].id;

    // Insert each course from the PDF
    for (const semester of parsedData) {
      for (const course of semester.courses) {
        await pool.query(
          `INSERT INTO transcript_courses 
            (transcript_id, semester, course_code, course_name, grade, units) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            transcriptId,
            semester.semester,
            course.courseCode,
            course.courseName,
            course.grade,
            course.units,
          ]
        );
      }
    }

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
