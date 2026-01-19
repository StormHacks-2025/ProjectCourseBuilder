// util/parser.js

export const parsePDF = async (buffer) => {
  try {
    // Dynamic import to avoid loading pdf-parse at module initialization
    const pdfParse = (await import("pdf-parse")).default;
    
    const data = await pdfParse(buffer);
    const lines = data.text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    console.log("Raw PDF text:", lines);
    const result = [];
    let currentSemester = null;
    let semesterCourses = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Semester detection - SFU format
      if (/^\d{4} (Fall|Spring|Summer)$/.test(line)) {
        if (currentSemester && semesterCourses.length > 0) {
          result.push({
            semester: currentSemester,
            courses: [...semesterCourses],
          });
        }
        currentSemester = line;
        semesterCourses = [];
        continue;
      }
      // Course line detection - SFU specific format
      // Format: "CMPT 120 Intro.Cmpt.Sci/Programming I 3.00 3.00 A- 11.01 B+ 185"
      const coursePattern =
        /^([A-Z]{2,4} \d{2,3}[A-Z]?)\s+(.+?)\s+(\d+\.\d{2})\s+(\d+\.\d{2})\s+([A-Z][+-]?|WD)\s+([\d.]+)\s+([A-Z][+-]?)\s+(\d+)$/;
      const match = line.match(coursePattern);
      if (match && currentSemester) {
        const [
          ,
          courseCode,
          courseName,
          unitsAttempted,
          unitsCompleted,
          grade,
          gradePoints,
          classAverage,
          classEnrollment,
        ] = match;
        // Extract just the course name without the extra numbers
        const cleanCourseName = courseName
          .replace(
            /\s+\d+\.\d{2}\s+\d+\.\d{2}\s+[A-Z][+-]?\s+[\d.]+\s+[A-Z][+-]?\s+\d+$/,
            ""
          )
          .trim();
        semesterCourses.push({
          courseCode: courseCode.trim(),
          courseName: cleanCourseName || courseName,
          grade: grade,
          units: parseFloat(unitsCompleted), // Use completed units, not enrollment number!
          unitsAttempted: parseFloat(unitsAttempted),
          gradePoints: parseFloat(gradePoints),
          classAverage: classAverage,
          classEnrollment: parseInt(classEnrollment),
        });
      }
    }
    // Don't forget the last semester
    if (currentSemester && semesterCourses.length > 0) {
      result.push({
        semester: currentSemester,
        courses: semesterCourses,
      });
    }
    console.log("Parsed result:", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};
