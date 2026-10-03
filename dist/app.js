/**
 * AI Resume Scorer - Vanilla Frontend Application
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const dropZone = document.getElementById('dropZone');
  const resumeFileInput = document.getElementById('resumeFileInput');
  const extractLoading = document.getElementById('extractLoading');
  const uploadPrompt = dropZone.querySelector('.upload-prompt');
  
  const fileInfoCard = document.getElementById('fileInfoCard');
  const selectedFileName = document.getElementById('selectedFileName');
  const fileStatsMeta = document.getElementById('fileStatsMeta');
  const removeFileBtn = document.getElementById('removeFileBtn');

  const previewContainer = document.getElementById('previewContainer');
  const togglePreviewBtn = document.getElementById('togglePreviewBtn');
  const previewBody = document.getElementById('previewBody');
  const resumeTextArea = document.getElementById('resumeTextArea');
  const extractedWordCount = document.getElementById('extractedWordCount');

  const jobDescInput = document.getElementById('jobDescInput');
  const sampleJdSelect = document.getElementById('sampleJdSelect');
  const jdCharCount = document.getElementById('jdCharCount');
  const jdCharStatus = document.getElementById('jdCharStatus');

  const analyzeBtn = document.getElementById('analyzeBtn');
  const analyzeSpinner = document.getElementById('analyzeSpinner');
  const clearAllBtn = document.getElementById('clearAllBtn');

  const globalBanner = document.getElementById('globalBanner');
  const bannerIcon = document.getElementById('bannerIcon');
  const bannerMessage = document.getElementById('bannerMessage');
  const bannerClose = document.getElementById('bannerClose');

  const analysisLoadingCard = document.getElementById('analysisLoadingCard');
  const loadingProgressText = document.getElementById('loadingProgressText');
  const resultsSection = document.getElementById('resultsSection');
  const inputSection = document.getElementById('inputSection');

  const resetTopBtn = document.getElementById('resetTopBtn');
  const resetBottomBtn = document.getElementById('resetBottomBtn');
  const printBtn = document.getElementById('printBtn');

  // Result Elements
  const analysisTypeBadge = document.getElementById('analysisTypeBadge');
  const analysisTypeText = document.getElementById('analysisTypeText');
  const summaryText = document.getElementById('summaryText');

  const overallScoreVal = document.getElementById('overallScoreVal');
  const overallProgressFill = document.getElementById('overallProgressFill');
  const overallScoreBadge = document.getElementById('overallScoreBadge');

  const atsScoreVal = document.getElementById('atsScoreVal');
  const atsProgressFill = document.getElementById('atsProgressFill');

  const keywordMatchVal = document.getElementById('keywordMatchVal');
  const keywordProgressFill = document.getElementById('keywordProgressFill');

  const qualityScoreVal = document.getElementById('qualityScoreVal');
  const qualityProgressFill = document.getElementById('qualityProgressFill');

  const matchedCount = document.getElementById('matchedCount');
  const matchedSkillsChips = document.getElementById('matchedSkillsChips');

  const missingCount = document.getElementById('missingCount');
  const missingSkillsChips = document.getElementById('missingSkillsChips');

  const detectedCount = document.getElementById('detectedCount');
  const detectedSkillsChips = document.getElementById('detectedSkillsChips');

  const strengthsList = document.getElementById('strengthsList');
  const improvementsList = document.getElementById('improvementsList');
  const suggestionsList = document.getElementById('suggestionsList');

  // Sample Job Descriptions
  const SAMPLE_JDS = {
    frontend: `Senior Frontend Engineer (React / TypeScript)
We are seeking a talented Senior Frontend Engineer to build responsive, high-performance web applications.
Key Requirements:
- 4+ years of professional experience with JavaScript (ES6+), TypeScript, React, and Next.js.
- Deep expertise in HTML5, CSS3, Tailwind CSS, SASS, and responsive design principles.
- Experience with state management (Redux Toolkit, Zustand) and REST API / GraphQL integration.
- Proficiency in automated testing using Jest, Cypress, or Playwright.
- Strong knowledge of Git, Webpack, Vite, CI/CD pipelines, and performance optimization.
- Excellent communication, collaboration, problem solving, and agile methodology experience.`,

    fullstack: `Full Stack Developer (Node.js + React + Cloud)
Looking for a Full Stack Software Engineer to build scalable microservices and intuitive user interfaces.
Responsibilities & Skills:
- Proficiency in JavaScript, TypeScript, Node.js, Express.js, and React.
- Solid experience with databases: PostgreSQL, MySQL, MongoDB, and Redis caching.
- Hands-on experience with Docker containerization, Kubernetes, and AWS (EC2, S3, RDS, Lambda).
- Experience designing and consuming RESTful APIs, WebSockets, and OAuth/JWT authentication.
- Familiarity with Git, Linux environments, Unit Testing, and Agile/Scrum practices.
- Strong analytical skills, teamwork, attention to detail, and problem solving.`,

    backend: `Backend & Cloud Infrastructure Engineer (Python / Go / AWS)
We are looking for a Backend Engineer to scale our distributed systems and data pipelines.
Required Qualifications:
- 3+ years experience with Python (Django, FastAPI), Go, or Java (Spring Boot).
- Deep knowledge of relational and NoSQL databases (PostgreSQL, MongoDB, DynamoDB, Redis).
- Strong background in Cloud computing (AWS or GCP), Docker, Kubernetes, Terraform, and CI/CD.
- Experience building high-throughput microservices, gRPC, Apache Kafka, and message queues.
- Solid grasp of Data Structures, Algorithms, System Design, and Clean Code principles.
- Excellent critical thinking, mentorship, and documentation skills.`,

    data: `Data Scientist & Machine Learning Engineer (Python / AI / RAG)
Join our AI team to research, build, and deploy production-grade machine learning models and LLM solutions.
Requirements:
- Strong programming skills in Python, SQL, and data analysis libraries (Pandas, NumPy, Scikit-Learn).
- Hands-on experience with Deep Learning frameworks: PyTorch, TensorFlow, Keras.
- Expertise in Generative AI, Large Language Models (LLMs), LangChain, RAG pipelines, and vector databases.
- Experience deploying ML models to AWS/GCP using Docker, FastAPI, and MLflow.
- Proficient in data visualization with Tableau or Power BI.
- Strong mathematical background, analytical problem solving, and effective communication skills.`
  };

  // State
  let currentFile = null;
  let extractedText = '';

  // Banner helper
  function showBanner(message, type = 'error') {
    globalBanner.className = `alert-banner ${type === 'error' ? 'alert-error' : 'alert-success'}`;
    bannerMessage.innerHTML = message;
    bannerIcon.innerHTML = type === 'error'
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    globalBanner.classList.remove('hidden');
    globalBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideBanner() {
    globalBanner.classList.add('hidden');
  }

  bannerClose.addEventListener('click', hideBanner);

  // Form Validation and State Updating
  function updateAnalyzeButtonState() {
    const textVal = resumeTextArea.value.trim();
    const jdVal = jobDescInput.value.trim();
    const isTextValid = textVal.length >= 50;
    const isJdValid = jdVal.length >= 50;

    analyzeBtn.disabled = !(isTextValid && isJdValid);
  }

  function updateJdCharCount() {
    const len = jobDescInput.value.trim().length;
    jdCharCount.textContent = `${len} / 50 min chars`;
    if (len >= 50) {
      jdCharStatus.textContent = '✓ Ready';
      jdCharStatus.className = 'char-status-ok';
    } else {
      jdCharStatus.textContent = len === 0 ? 'Required' : 'Too short';
      jdCharStatus.className = 'char-status-warn';
    }
    updateAnalyzeButtonState();
  }

  function updateResumeWordCount() {
    const text = resumeTextArea.value.trim();
    const words = (text.match(/\b\w+\b/g) || []).length;
    extractedWordCount.textContent = words;
    if (fileStatsMeta && currentFile) {
      fileStatsMeta.textContent = `${words} words extracted`;
    }
    updateAnalyzeButtonState();
  }

  // Drag & Drop Upload
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  });

  resumeFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  });

  // Handle File Selection and Upload
  async function handleFileSelection(file) {
    hideBanner();
    const allowedExtensions = ['.pdf', '.docx'];
    const fileName = file.name.toLowerCase();
    const isValidExt = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidExt) {
      showBanner('Invalid file type. Please upload a PDF (.pdf) or Word document (.docx).', 'error');
      resumeFileInput.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showBanner(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.`, 'error');
      resumeFileInput.value = '';
      return;
    }

    currentFile = file;

    // Show loading UI
    uploadPrompt.classList.add('hidden');
    extractLoading.classList.remove('hidden');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract text from file.');
      }

      extractedText = data.text;
      resumeTextArea.value = data.text;
      extractedWordCount.textContent = data.wordCount;
      selectedFileName.textContent = data.filename;
      fileStatsMeta.textContent = `${data.wordCount} words extracted`;

      // Update UI components
      dropZone.classList.add('hidden');
      fileInfoCard.classList.remove('hidden');
      previewContainer.classList.remove('hidden');
      previewBody.classList.remove('hidden');
      togglePreviewBtn.classList.add('open');

      showBanner(`Successfully extracted ${data.wordCount} words from ${data.filename}.`, 'success');
      updateAnalyzeButtonState();
    } catch (err) {
      showBanner(err.message, 'error');
      resetFileUpload();
    } finally {
      uploadPrompt.classList.remove('hidden');
      extractLoading.classList.add('hidden');
    }
  }

  function resetFileUpload() {
    currentFile = null;
    extractedText = '';
    resumeFileInput.value = '';
    resumeTextArea.value = '';
    extractedWordCount.textContent = '0';
    dropZone.classList.remove('hidden');
    fileInfoCard.classList.add('hidden');
    previewContainer.classList.add('hidden');
    previewBody.classList.add('hidden');
    togglePreviewBtn.classList.remove('open');
    updateAnalyzeButtonState();
  }

  removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetFileUpload();
  });

  // Toggle Extracted Text Preview
  togglePreviewBtn.addEventListener('click', () => {
    previewBody.classList.toggle('hidden');
    togglePreviewBtn.classList.toggle('open');
  });

  resumeTextArea.addEventListener('input', () => {
    updateResumeWordCount();
  });

  // Job Description Input & Samples
  jobDescInput.addEventListener('input', updateJdCharCount);

  sampleJdSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (SAMPLE_JDS[val]) {
      jobDescInput.value = SAMPLE_JDS[val];
      updateJdCharCount();
    }
  });

  // Reset Everything
  function resetAll() {
    hideBanner();
    resetFileUpload();
    jobDescInput.value = '';
    sampleJdSelect.value = '';
    updateJdCharCount();
    resultsSection.classList.add('hidden');
    analysisLoadingCard.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearAllBtn.addEventListener('click', resetAll);
  resetTopBtn.addEventListener('click', resetAll);
  resetBottomBtn.addEventListener('click', resetAll);

  // Print Report
  printBtn.addEventListener('click', () => {
    window.print();
  });

  // Run Analysis
  analyzeBtn.addEventListener('click', async () => {
    const resume = resumeTextArea.value.trim();
    const jd = jobDescInput.value.trim();

    if (resume.length < 50) {
      showBanner('Resume text is too short. Please upload a valid resume or provide at least 50 characters.', 'error');
      return;
    }

    if (jd.length < 50) {
      showBanner('Job description must be at least 50 characters long.', 'error');
      return;
    }

    hideBanner();
    analyzeBtn.disabled = true;
    analyzeSpinner.classList.remove('hidden');
    analysisLoadingCard.classList.remove('hidden');
    resultsSection.classList.add('hidden');

    // Smooth scroll to loading card
    analysisLoadingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Progress text simulation
    let progressStep = 0;
    const progressTexts = [
      'Extracting and mapping key skills & technologies...',
      'Evaluating ATS parseability and section formatting...',
      'Computing keyword relevance against job criteria...',
      'Synthesizing actionable recommendations...'
    ];
    const progressInterval = setInterval(() => {
      progressStep = (progressStep + 1) % progressTexts.length;
      loadingProgressText.textContent = progressTexts[progressStep];
    }, 900);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: resume, jobDescription: jd })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to complete resume analysis.');
      }

      renderResults(result.data);
    } catch (err) {
      console.error(err);
      showBanner(`Analysis failed: ${err.message}. <button id="retryBtn" class="btn btn-sm btn-outline" style="margin-left: 10px; vertical-align: middle;">Retry</button>`, 'error');
      
      const retryBtn = document.getElementById('retryBtn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          analyzeBtn.click();
        });
      }
    } finally {
      clearInterval(progressInterval);
      analyzeBtn.disabled = false;
      analyzeSpinner.classList.add('hidden');
      analysisLoadingCard.classList.add('hidden');
    }
  });

  // Render Analysis Results
  function renderResults(data) {
    // Mode badge
    const isAi = data.analysisType && data.analysisType.includes('AI');
    analysisTypeBadge.className = `badge badge-pill ${isAi ? 'badge-ai' : 'badge-local'}`;
    analysisTypeText.textContent = data.analysisType || 'Local Analysis';

    // Summary
    summaryText.textContent = data.summary || 'Resume analyzed successfully.';

    // Score helpers
    const overall = data.overallScore ?? 0;
    const ats = data.atsScore ?? 0;
    const keyword = data.keywordMatchScore ?? 0;
    const quality = data.contentQualityScore ?? 0;

    // Overall Score & Badge
    overallScoreVal.textContent = overall;
    overallProgressFill.style.width = `${overall}%`;

    if (overall >= 80) {
      overallScoreBadge.textContent = 'Excellent Match';
      overallScoreBadge.className = 'score-badge badge-excellent';
    } else if (overall >= 65) {
      overallScoreBadge.textContent = 'Good Match';
      overallScoreBadge.className = 'score-badge badge-good';
    } else if (overall >= 50) {
      overallScoreBadge.textContent = 'Needs Improvement';
      overallScoreBadge.className = 'score-badge badge-needs-work';
    } else {
      overallScoreBadge.textContent = 'Low Match';
      overallScoreBadge.className = 'score-badge badge-poor';
    }

    // ATS Score
    atsScoreVal.textContent = ats;
    atsProgressFill.style.width = `${ats}%`;

    // Keyword Score
    keywordMatchVal.textContent = `${keyword}%`;
    keywordProgressFill.style.width = `${keyword}%`;

    // Quality Score
    qualityScoreVal.textContent = quality;
    qualityProgressFill.style.width = `${quality}%`;

    // Skills Breakdown
    renderChips(matchedSkillsChips, data.matchedSkills, 'chip-matched', 'No matched skills found in resume');
    matchedCount.textContent = data.matchedSkills ? data.matchedSkills.length : 0;

    renderChips(missingSkillsChips, data.missingSkills, 'chip-missing', 'No missing skills identified');
    missingCount.textContent = data.missingSkills ? data.missingSkills.length : 0;

    renderChips(detectedSkillsChips, data.detectedSkills, 'chip-detected', 'No skills detected in resume');
    detectedCount.textContent = data.detectedSkills ? data.detectedSkills.length : 0;

    // Feedback Lists
    renderList(strengthsList, data.strengths, 'No strengths noted.');
    renderList(improvementsList, data.improvements, 'No major issues detected.');
    renderList(suggestionsList, data.suggestions, 'No suggestions needed.');

    // Show Results & Scroll
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderChips(container, items, chipClass, emptyMessage) {
    container.innerHTML = '';
    if (!items || items.length === 0) {
      const note = document.createElement('span');
      note.className = 'empty-chip-note';
      note.textContent = emptyMessage;
      container.appendChild(note);
      return;
    }

    items.forEach(item => {
      const chip = document.createElement('span');
      chip.className = `chip ${chipClass}`;
      chip.textContent = item;
      container.appendChild(chip);
    });
  }

  function renderList(container, items, emptyMessage) {
    container.innerHTML = '';
    if (!items || items.length === 0) {
      const li = document.createElement('li');
      li.textContent = emptyMessage;
      container.appendChild(li);
      return;
    }

    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      container.appendChild(li);
    });
  }
});
