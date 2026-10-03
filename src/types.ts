export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  _count?: {
    resumes: number;
    analyses: number;
  };
}

export interface Resume {
  id: string;
  userId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  wordCount: number;
  extractedText?: string;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    analyses: number;
  };
}

export interface Analysis {
  id: string;
  userId?: string;
  resumeId: string;
  jobDescription: string;
  overallScore: number;
  atsScore: number;
  jobMatchPercentage: number;
  detectedSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  keywordsFound: string[];
  missingKeywords: string[];
  strengths: string[];
  areasToImprove: string[];
  experienceRelevance: string;
  educationRelevance: string;
  projectRelevance: string;
  suggestions: string[];
  analysisType: string;
  createdAt: string;
  resume?: {
    id: string;
    fileName: string;
    fileType: string;
    wordCount?: number;
    createdAt?: string;
  };
}

export interface AnalysisSummaryItem {
  id: string;
  resumeId: string;
  resumeName: string;
  jobSnippet: string;
  overallScore: number;
  atsScore: number;
  jobMatchPercentage: number;
  analysisType: string;
  matchedCount: number;
  missingCount: number;
  createdAt: string;
}
