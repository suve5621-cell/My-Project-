const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

// Ensure database URL is set
if (!process.env.DATABASE_URL) {
  const dbPath = path.resolve(__dirname, '../prisma/dev.db');
  process.env.DATABASE_URL = `file:${dbPath}`;
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});

// Helper to safely serialize array fields to JSON strings
function serializeArray(arr) {
  if (Array.isArray(arr)) {
    return JSON.stringify(arr);
  }
  if (typeof arr === 'string') {
    return arr;
  }
  return JSON.stringify([]);
}

// Helper to safely deserialize JSON strings back to arrays
function deserializeArray(str) {
  if (!str) return [];
  if (Array.isArray(str)) return str;
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// Helper to format analysis record for API output
function formatAnalysisRecord(record) {
  if (!record) return null;
  return {
    ...record,
    detectedSkills: deserializeArray(record.detectedSkills),
    matchedSkills: deserializeArray(record.matchedSkills),
    missingSkills: deserializeArray(record.missingSkills),
    keywordsFound: deserializeArray(record.keywordsFound),
    missingKeywords: deserializeArray(record.missingKeywords),
    strengths: deserializeArray(record.strengths),
    areasToImprove: deserializeArray(record.areasToImprove),
    suggestions: deserializeArray(record.suggestions)
  };
}

module.exports = {
  prisma,
  serializeArray,
  deserializeArray,
  formatAnalysisRecord
};
