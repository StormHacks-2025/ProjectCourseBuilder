import { parsePDF } from "../utils/pdfParser.js";

export const uploadPDF = async (req, res) => {
  try {
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ error: "No PDF uploaded" });
    }

    const pdfFile = req.files.pdf;

    // Call PDF parser utility
    const data = await parsePDF(pdfFile);

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process PDF" });
  }
};
