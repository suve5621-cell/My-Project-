# AI Resume Scorer & ATS Optimizer

A full-stack, single-pass web application that scores and optimizes resumes against target job descriptions using deterministic ATS rules, a 200+ skill ontology, and Google Gemini AI integration with automatic local fallback.

---

## Features

- **Multi-Format Resume Text Extraction**: Supports `.pdf` (via `pdf-parse`) and `.docx` (via `mammoth`) with client and server-side validation (max 5MB, scanned PDF detection).
- **Dual-Engine Analysis**:
  - **AI Analysis (Google Gemini 2.0 Flash)**: Uses native fetch server-side with structured JSON output schema.
  - **Deterministic Local Engine**: Built-in 200+ technical and soft skills dictionary with aliases, ATS standard section checks, contact validation, length scoring, action verb analysis, and quantifiable impact checks.
  - **Zero-Config Fallback**: Automatically falls back to the local engine if no API key is provided or if network/API errors occur.
- **Interactive Results Dashboard**: Overall match score (50% keyword match + 30% ATS + 20% quality), progress bars, categorized skill chips (Matched, Missing, Detected), structured strengths, weaknesses, and concrete next steps.
- **Modern Responsive UI**: Clean blue and white theme, drag-and-drop file upload, live character counting, sample job descriptions, and one-click report printing.

---

## Installation & Setup

1. **Clone or navigate to the project directory**:
   ```bash
   cd "c:\Users\DELL\Desktop\My project"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

---

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Port the Express server listens on | `3000` |
| `GEMINI_API_KEY` | Google Gemini API Key for AI-driven resume scoring | *(Optional)* Falls back to local engine |
| `AI_API_KEY` | Alternative key alias for Gemini API key | *(Optional)* |

### How to Obtain a Free Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account and click **Create API key**.
3. Add your key to `.env` as `GEMINI_API_KEY=your_key_here`.

---

## Running the Application

### Start Production Server
```bash
npm start
```
Open your browser at [http://localhost:3000](http://localhost:3000).

### Start Development Server (Auto-reload)
```bash
npm run dev
```

---

## API Endpoints

### 1. `POST /api/extract`
Extracts raw text from uploaded resume files (`.pdf` or `.docx`).
- **Body**: `multipart/form-data` with field `resume`.
- **Response**:
  ```json
  {
    "success": true,
    "text": "Extracted text...",
    "wordCount": 420,
    "filename": "resume.pdf"
  }
  ```

### 2. `POST /api/analyze`
Analyzes resume text against a job description.
- **Body**: `application/json`
  ```json
  {
    "resumeText": "...",
    "jobDescription": "..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "overallScore": 85,
      "atsScore": 90,
      "keywordMatchScore": 80,
      "contentQualityScore": 85,
      "matchedSkills": ["JavaScript", "React", "Node.js"],
      "missingSkills": ["GraphQL"],
      "detectedSkills": ["JavaScript", "React", "Node.js", "Docker"],
      "strengths": ["..."],
      "improvements": ["..."],
      "suggestions": ["..."],
      "summary": "...",
      "analysisType": "Local Analysis"
```

---

## Deploy to Render (Free Tier)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "AI Resume Scorer"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Sign in to [Render](https://render.com) with GitHub.
   - Click **New +** -> **Web Service**.
   - Select your repository.
   - Configuration settings:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: `Free`
   - In the **Environment** tab, add your optional key:
     - `GEMINI_API_KEY`: `your_api_key_here`
   - Click **Deploy Web Service**.
