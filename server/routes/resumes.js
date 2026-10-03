const express = require('express');
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const router = express.Router();
const { prisma } = require('../db');
const { authenticateToken } = require('../auth');
const { saveFile, deleteFile } = require('../storage');

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (ext === '.pdf' || ext === '.docx' || allowedMimes.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only PDF (.pdf) and Word (.docx) files are supported.'));
  }
});

// Helper to clean extracted text
function cleanText(raw) {
  if (!raw) return '';
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * POST /api/resumes/upload
 */
router.post('/upload', authenticateToken, (req, res) => {
  upload.single('resume')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'File size exceeds the 5MB limit.' });
      }
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No resume file uploaded.' });
    }

    try {
      const ext = path.extname(req.file.originalname).toLowerCase();
      let extracted = '';

      if (ext === '.pdf') {
        const pdfData = await pdfParse(req.file.buffer);
        extracted = pdfData.text || '';
      } else if (ext === '.docx' || ext === '.doc') {
        const docxData = await mammoth.extractRawText({ buffer: req.file.buffer });
        extracted = docxData.value || '';
      } else {
        return res.status(400).json({ success: false, error: 'Unsupported file format.' });
      }

      const cleanExtracted = cleanText(extracted);

      if (cleanExtracted.length < 100) {
        return res.status(400).json({
          success: false,
          error: 'Looks like a scanned/image-only PDF, please upload a text-based resume.'
        });
      }

      const wordCount = (cleanExtracted.match(/\b\w+\b/g) || []).length;

      // Persist file in storage directory
      const { storagePath } = saveFile(req.file.originalname, req.file.buffer);

      // Create database record
      const resume = await prisma.resume.create({
        data: {
          userId: req.user.userId,
          fileName: req.file.originalname,
          fileType: ext.replace('.', '').toUpperCase(),
          fileSize: req.file.size,
          extractedText: cleanExtracted,
          storagePath,
          wordCount
        }
      });

      return res.status(201).json({
        success: true,
        resume: {
          id: resume.id,
          fileName: resume.fileName,
          fileType: resume.fileType,
          fileSize: resume.fileSize,
          extractedText: resume.extractedText,
          wordCount: resume.wordCount,
          createdAt: resume.createdAt
        }
      });
    } catch (extractErr) {
      console.error('Resume upload error:', extractErr);
      return res.status(500).json({
        success: false,
        error: 'Failed to extract text from document. The file might be corrupted or password protected.'
      });
    }
  });
});

/**
 * GET /api/resumes
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        wordCount: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { analyses: true }
        }
      }
    });

    return res.json({
      success: true,
      resumes
    });
  } catch (err) {
    console.error('Error fetching resumes:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve resumes from database.' });
  }
});

/**
 * GET /api/resumes/:id
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found.' });
    }

    return res.json({
      success: true,
      resume
    });
  } catch (err) {
    console.error('Error fetching resume details:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch resume details.' });
  }
});

/**
 * DELETE /api/resumes/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found or unauthorized.' });
    }

    // Delete stored file from disk
    if (resume.storagePath) {
      deleteFile(resume.storagePath);
    }

    // Delete from database (cascade deletes analyses)
    await prisma.resume.delete({
      where: { id: resume.id }
    });

    return res.json({
      success: true,
      message: 'Resume and related analyses deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting resume:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete resume.' });
  }
});

module.exports = router;
