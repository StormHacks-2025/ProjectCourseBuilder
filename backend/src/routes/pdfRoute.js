import express from "express";
import { uploadPDF } from "../controllers/pdfController.js";

const router = express.Router();

// POST route to upload a PDF
router.post("/upload", uploadPDF);

export default router;
