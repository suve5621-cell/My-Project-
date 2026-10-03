require('dotenv').config();
const path = require('path');
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { analyzeLocal, analyzeWithGemini } = require('./analyzer');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Multer for memory storage with 5MB limit
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (ext === '.pdf' || ext === '.docx') {
      return cb(null, true);
    }

    if (allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error('Invalid file type. Only PDF (.pdf) and Word (.docx) files are supported.'));
  }
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Clean and normalize extracted text
 */
function cleanExtractedText(rawText) {
  if (!rawText) return '';
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * POST /api/extract
 * Extracts text from uploaded PDF or DOCX file
 */
app.post('/api/extract', (req, res) => {
  upload.single('resume')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File size exceeds the 5MB limit. Please upload a smaller resume file.'
        });
      }
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please select a .pdf or .docx resume file.'
      });
    }

    try {
      const ext = path.extname(req.file.originalname).toLowerCase();
      let extractedText = '';

      if (ext === '.pdf') {
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text || '';
      } else if (ext === '.docx' || ext === '.doc') {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        extractedText = result.value || '';
      } else {
        return res.status(400).json({
          success: false,
          error: 'Unsupported file format. Please upload a .pdf or .docx document.'
        });
      }

      const cleanText = cleanExtractedText(extractedText);

      // Validate minimum text requirement to catch scanned/image PDFs
      if (cleanText.length < 100) {
        return res.status(400).json({
          success: false,
          error: 'Looks like a scanned/image-only PDF, please upload a text-based resume.'
        });
      }

      const wordCount = (cleanText.match(/\b\w+\b/g) || []).length;

      return res.json({
        success: true,
        text: cleanText,
        wordCount,
        filename: req.file.originalname
      });
    } catch (extractErr) {
      console.error('Error during file text extraction:', extractErr);
      return res.status(500).json({
        success: false,
        error: 'Failed to extract text from the document. The file may be password protected or corrupted.'
      });
    }
  });
});

/**
 * POST /api/analyze
 * Analyzes resume against job description
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Resume text is missing or too short (minimum 50 characters required).'
      });
    }

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Job description must be at least 50 characters long to perform an accurate analysis.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    let result;

    if (apiKey && apiKey.trim().length > 0) {
      try {
        result = await analyzeWithGemini(apiKey.trim(), resumeText, jobDescription);
      } catch (aiErr) {
        console.warn('Gemini AI analysis failed, falling back to local analysis:', aiErr.message);
        result = analyzeLocal(resumeText, jobDescription);
      }
    } else {
      result = analyzeLocal(resumeText, jobDescription);
    }

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('Unexpected error in /api/analyze:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while analyzing the resume.'
    });
  }
});

/**
 * GET /health
 * Health check endpoint for Render and deployment monitors
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log(`=========================================`);
  console.log(`AI Resume Scorer is running!`);
  console.log(`Local URL: http://${HOST}:${PORT}`);
  console.log(`AI Mode: ${process.env.GEMINI_API_KEY || process.env.AI_API_KEY ? 'Gemini 2.0 Flash (Active)' : 'Local Engine (No API Key set)'}`);
  console.log(`=========================================`);
});

module.exports = app;
