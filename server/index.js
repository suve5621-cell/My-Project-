require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const resumesRoutes = require('./routes/resumes');
const analysesRoutes = require('./routes/analyses');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Enable CORS and body parsers
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiEnabled: !!(process.env.GEMINI_API_KEY || process.env.AI_API_KEY)
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumesRoutes);
app.use('/api/analyses', analysesRoutes);

// Serve frontend dist if built, otherwise legacy public or 안내
const distPath = path.resolve(__dirname, '../dist');
const publicPath = path.resolve(__dirname, '../public');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error occurred.'
  });
});

// Start listening
app.listen(PORT, HOST, () => {
  console.log('====================================================');
  console.log(' AI Resume Scorer Full-Stack Server Running');
  console.log(` Endpoint: http://${HOST}:${PORT}`);
  console.log(` AI Provider: ${process.env.GEMINI_API_KEY || process.env.AI_API_KEY ? 'Gemini 2.0 Flash (Active)' : 'Local Engine'}`);
  console.log('====================================================');
});

module.exports = app;
