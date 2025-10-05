import * as pdfParse from "pdf-parse";

export const parsePDF = async (buffer) => {
  const data = await pdfParse(buffer);
  const lines = data.text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const result = [];
  let currentSemester = null;
  let semesterCourses = [];

  const semesterRegex = /^\d{4} (Fall|Spring|Summer)$/;
  const courseCodeRegex = /^[A-Z]{2,4}\s?\d{2,3}[A-Z]*$/;
  const gradeRegex = /^[A-F][+-]?$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect semester
    if (semesterRegex.test(line)) {
      if (currentSemester && semesterCourses.length > 0) {
        result.push({
          semester: currentSemester,
          courses: semesterCourses,
        });
      }
      currentSemester = line;
      semesterCourses = [];
      continue;
    }

    // Detect course code
    if (courseCodeRegex.test(line)) {
      const courseCode = line;
      const courseName = lines[i + 1] || "";
      const grade =
        lines[i + 2] && gradeRegex.test(lines[i + 2]) ? lines[i + 2] : null;
      const units =
        lines[i + 3] && !isNaN(parseFloat(lines[i + 3]))
          ? parseFloat(lines[i + 3])
          : null;

      semesterCourses.push({
        courseCode,
        courseName,
        grade,
        units,
      });

      i += 3;
      continue;
    }
  }

  if (currentSemester && semesterCourses.length > 0) {
    result.push({ semester: currentSemester, courses: semesterCourses });
  }

  return result;
};
