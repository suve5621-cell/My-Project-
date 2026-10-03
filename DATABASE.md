# 🗄️ Database Documentation — AI Resume Scorer

This project uses **Prisma ORM** with a relational database architecture.

---

## 📊 Database Schema & Tables

```mermaid
erDiagram
    USERS ||--o{ RESUMES : "owns"
    USERS ||--o{ ANALYSES : "creates"
    RESUMES ||--o{ ANALYSES : "analyzed_in"

    USERS {
        string id PK "UUID"
        string name "User Full Name"
        string email UK "Unique Email Address"
        string passwordHash "Bcrypt Encrypted Password"
        datetime createdAt "Created Timestamp"
        datetime updatedAt "Updated Timestamp"
    }

    RESUMES {
        string id PK "UUID"
        string userId FK "References users(id)"
        string fileName "Original Document Name"
        string fileType "PDF / DOCX"
        int fileSize "Size in Bytes"
        string filePath "Stored File Location"
        string extractedText "Parsed Resume Text Content"
        int wordCount "Calculated Word Count"
        datetime createdAt "Upload Timestamp"
        datetime updatedAt "Updated Timestamp"
    }

    ANALYSES {
        string id PK "UUID"
        string userId FK "References users(id)"
        string resumeId FK "References resumes(id)"
        string jobTitle "Target Job Role"
        string companyName "Company Name"
        string jobDescription "Target Job Description"
        int overallScore "Match Score 0-100"
        int atsScore "ATS Parseability Score 0-100"
        int jobMatchPercentage "Keyword Match Rate %"
        string detectedSkills "JSON Array of Resume Skills"
        string matchedSkills "JSON Array of Matching Skills"
        string missingSkills "JSON Array of Missing Skills"
        string strengths "JSON Array of Candidate Strengths"
        string areasToImprove "JSON Array of Gaps"
        string suggestions "JSON Array of Actionable Steps"
        string summary "Executive Assessment"
        string analysisType "AI Analysis / Local Engine"
        datetime createdAt "Analysis Timestamp"
    }
```

---

## 🖥️ How to View & Manage Database (Prisma Studio GUI)

To open the visual database dashboard in your browser:

```powershell
npx prisma studio
```

Then open **[http://localhost:5555](http://localhost:5555)** in your browser to view, add, or edit rows visually.

---

## 🐘 Connecting to PostgreSQL (Render / Supabase / Neon / Local)

### 1. Update `prisma/schema.prisma`
Change provider from `"sqlite"` to `"postgresql"`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Add connection string in `.env`
```env
DATABASE_URL="postgresql://username:password@localhost:5432/resume_scorer_db"
```

### 3. Push schema to PostgreSQL
```powershell
npx prisma db push
```

---

## 📜 Raw SQL DDL Schema (PostgreSQL)

```sql
-- Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Resumes Table
CREATE TABLE resumes (
    id VARCHAR(36) PRIMARY KEY,
    "userId" VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "fileName" VARCHAR(255) NOT NULL,
    "fileType" VARCHAR(50) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "filePath" TEXT,
    "storagePath" TEXT,
    "extractedText" TEXT NOT NULL,
    "wordCount" INTEGER DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX idx_resumes_userId ON resumes("userId");

-- Analyses Table
CREATE TABLE analyses (
    id VARCHAR(36) PRIMARY KEY,
    "userId" VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "resumeId" VARCHAR(36) NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    "jobTitle" VARCHAR(255) DEFAULT 'Target Role',
    "companyName" VARCHAR(255) DEFAULT '',
    "jobDescription" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "atsScore" INTEGER NOT NULL,
    "jobMatchPercentage" INTEGER NOT NULL,
    "detectedSkills" TEXT NOT NULL,
    "matchedSkills" TEXT NOT NULL,
    "missingSkills" TEXT NOT NULL,
    "keywordsFound" TEXT NOT NULL,
    "missingKeywords" TEXT NOT NULL,
    "strengths" TEXT NOT NULL,
    "areasToImprove" TEXT NOT NULL,
    "experienceRelevance" TEXT,
    "educationRelevance" TEXT,
    "projectRelevance" TEXT,
    "educationAnalysis" TEXT,
    "experienceAnalysis" TEXT,
    "projectAnalysis" TEXT,
    "suggestions" TEXT NOT NULL,
    "summary" TEXT,
    "analysisType" VARCHAR(100) DEFAULT 'Local Analysis',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX idx_analyses_userId ON analyses("userId");
CREATE INDEX idx_analyses_resumeId ON analyses("resumeId");
```
