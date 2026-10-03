const express = require('express');
const router = express.Router();
const { prisma, serializeArray, formatAnalysisRecord } = require('../db');
const { authenticateToken } = require('../auth');
const { analyzeLocal, analyzeWithGemini } = require('../analyzer');

/**
 * POST /api/analyses
 * Creates a new analysis for an uploaded resume and job description
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || typeof resumeId !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid resumeId is required.' });
    }

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Job description must be at least 50 characters long to perform an accurate analysis.'
      });
    }

    // Verify resume exists and belongs to user
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: req.user.userId
      }
    });

    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found or unauthorized.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    let analysisResult;

    if (apiKey && apiKey.trim().length > 0) {
      try {
        analysisResult = await analyzeWithGemini(apiKey.trim(), resume.extractedText, jobDescription.trim());
      } catch (aiErr) {
        console.warn('Gemini AI failed, using local deterministic fallback:', aiErr.message);
        analysisResult = analyzeLocal(resume.extractedText, jobDescription.trim());
      }
    } else {
      analysisResult = analyzeLocal(resume.extractedText, jobDescription.trim());
    }

    // Persist analysis in database
    const createdAnalysis = await prisma.analysis.create({
      data: {
        userId: req.user.userId,
        resumeId: resume.id,
        jobDescription: jobDescription.trim(),
        overallScore: analysisResult.overallScore,
        atsScore: analysisResult.atsScore,
        jobMatchPercentage: analysisResult.jobMatchPercentage,
        detectedSkills: serializeArray(analysisResult.detectedSkills),
        matchedSkills: serializeArray(analysisResult.matchedSkills),
        missingSkills: serializeArray(analysisResult.missingSkills),
        keywordsFound: serializeArray(analysisResult.keywordsFound),
        missingKeywords: serializeArray(analysisResult.missingKeywords),
        strengths: serializeArray(analysisResult.strengths),
        areasToImprove: serializeArray(analysisResult.areasToImprove),
        experienceRelevance: analysisResult.experienceRelevance,
        educationRelevance: analysisResult.educationRelevance,
        projectRelevance: analysisResult.projectRelevance,
        suggestions: serializeArray(analysisResult.suggestions),
        analysisType: analysisResult.analysisType || 'Local Analysis'
      },
      include: {
        resume: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            wordCount: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      analysis: formatAnalysisRecord(createdAnalysis)
    });
  } catch (err) {
    console.error('Error creating analysis:', err);
    return res.status(500).json({ success: false, error: 'Failed to create analysis. Please try again.' });
  }
});

/**
 * GET /api/analyses
 * Retrieves list of past analyses for current user
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const rawAnalyses = await prisma.analysis.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        resume: {
          select: {
            id: true,
            fileName: true,
            fileType: true
          }
        }
      }
    });

    const analyses = rawAnalyses.map(a => {
      const formatted = formatAnalysisRecord(a);
      return {
        id: formatted.id,
        resumeId: formatted.resumeId,
        resumeName: formatted.resume?.fileName || 'Resume',
        jobSnippet: formatted.jobDescription.slice(0, 100) + (formatted.jobDescription.length > 100 ? '...' : ''),
        overallScore: formatted.overallScore,
        atsScore: formatted.atsScore,
        jobMatchPercentage: formatted.jobMatchPercentage,
        analysisType: formatted.analysisType,
        matchedCount: formatted.matchedSkills.length,
        missingCount: formatted.missingSkills.length,
        createdAt: formatted.createdAt
      };
    });

    return res.json({
      success: true,
      analyses
    });
  } catch (err) {
    console.error('Error fetching analyses list:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve analysis history.' });
  }
});

/**
 * GET /api/analyses/:id
 * Retrieves full details for a specific analysis
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const rawAnalysis = await prisma.analysis.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      },
      include: {
        resume: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            wordCount: true,
            createdAt: true
          }
        }
      }
    });

    if (!rawAnalysis) {
      return res.status(404).json({ success: false, error: 'Analysis record not found.' });
    }

    return res.json({
      success: true,
      analysis: formatAnalysisRecord(rawAnalysis)
    });
  } catch (err) {
    console.error('Error fetching analysis details:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch analysis details.' });
  }
});

/**
 * DELETE /api/analyses/:id
 * Deletes a specific analysis record
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Analysis not found or unauthorized.' });
    }

    await prisma.analysis.delete({
      where: { id: analysis.id }
    });

    return res.json({
      success: true,
      message: 'Analysis record deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting analysis:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete analysis.' });
  }
});

module.exports = router;
