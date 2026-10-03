/**
 * Comprehensive Full-Stack Integration Test Suite
 * Tests Auth, File Upload, Text Extraction, Storage, DB Models, Heuristics, AI Analysis, and History.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Test Data
const TEST_USER = {
  name: 'Alex Johnson',
  email: `alex_${Date.now()}@example.com`,
  password: 'Password123!'
};

const SAMPLE_RESUME_TEXT = `
ALEX JOHNSON
San Francisco, CA | alex.johnson@email.com | (555) 123-4567 | linkedin.com/in/alexjohnson | github.com/alexjohnson

PROFESSIONAL SUMMARY
Results-driven Senior Full Stack Software Engineer with 5+ years of experience designing and deploying scalable web applications and cloud architectures. Proven track record of improving application performance by 40% and leading high-performing agile engineering teams.

TECHNICAL SKILLS
Languages: JavaScript (ES6+), TypeScript, Python, SQL, HTML5, CSS3, SASS
Frameworks & Libraries: React, Next.js, Node.js, Express.js, Redux Toolkit, Tailwind CSS
Databases & Cloud: PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS (EC2, S3, RDS), CI/CD
Methodologies & Tools: Git, GitHub Actions, Agile, Scrum, Jest, Cypress, REST API, GraphQL, Microservices

WORK EXPERIENCE
Senior Full Stack Engineer | TechCorp Solutions
June 2021 – Present | San Francisco, CA
• Architected and developed responsive client-facing web applications using React, TypeScript, and Tailwind CSS, serving over 150,000 active monthly users.
• Engineered robust backend RESTful APIs and microservices with Node.js and Express, cutting average server response times by 35%.
• Optimized database queries and indexed PostgreSQL tables, reducing query latency by 45% across 20M+ records.
• Spearheaded migration of legacy monolith to Docker containers and automated CI/CD deployment pipelines using GitHub Actions and AWS.
• Mentored 6 junior developers, conducted rigorous code reviews, and championed unit testing with Jest, achieving 90% test coverage.

Software Developer | CloudWave Systems
July 2019 – May 2021 | San Jose, CA
• Built interactive dashboards and data visualizations with React, Redux, and Chart.js for enterprise analytics platform.
• Designed and integrated secure OAuth2 and JWT authentication mechanisms for multi-tenant SaaS application.
• Collaborated with cross-functional product managers and designers in an Agile/Scrum environment to deliver 12 major product features.
• Implemented automated integration tests with Cypress, reducing regression bug incidents by 25%.

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley
Graduated: May 2019

KEY PROJECTS
E-Commerce Cloud Platform: Built end-to-end fullstack platform using Next.js, Node.js, PostgreSQL, Stripe API, and Docker. Supported 10k+ concurrent requests.
TaskFlow Agile Manager: Created real-time collaborative task manager using React, WebSockets, and Redis.
`;

const SAMPLE_JD_TEXT = `
Senior Full Stack Engineer (React / Node.js / AWS)
We are seeking an experienced Full Stack Engineer to lead the development of our core cloud platforms.
Requirements:
- 4+ years of hands-on experience with JavaScript, TypeScript, React, and Node.js.
- Strong knowledge of Express.js, Next.js, and state management (Redux).
- Experience with databases: PostgreSQL, MongoDB, and Redis.
- Proven experience with Cloud platforms (AWS), Docker, Kubernetes, and CI/CD pipelines.
- Deep understanding of REST API design, Microservices, and Unit Testing (Jest).
- Strong communication, teamwork, leadership, problem solving, and Agile/Scrum experience.
`;

// Minimal valid PDF generator
function createPdfBuffer(text) {
  const clean = text.replace(/\r?\n/g, ' ');
  const pdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length ${clean.length + 50} >>
stream
BT /F1 12 Tf 72 700 Td (${clean.replace(/[()\\]/g, '\\$&')}) Tj ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000350 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
440
%%EOF`;
  return Buffer.from(pdf, 'utf-8');
}

// HTTP request helpers
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function makeJsonPost(port, path, body, token = null) {
  const payload = JSON.stringify(body);
  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return makeRequest({
    hostname: '127.0.0.1',
    port,
    path,
    method: 'POST',
    headers
  }, payload);
}

function makeJsonGet(port, path, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return makeRequest({
    hostname: '127.0.0.1',
    port,
    path,
    method: 'GET',
    headers
  });
}

function makeJsonDelete(port, path, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return makeRequest({
    hostname: '127.0.0.1',
    port,
    path,
    method: 'DELETE',
    headers
  });
}

function makeMultipartUpload(port, path, fieldName, filename, fileBuffer, mimeType, token = null) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  let header = `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`;
  let footer = `\r\n--${boundary}--\r\n`;
  const body = Buffer.concat([Buffer.from(header), fileBuffer, Buffer.from(footer)]);

  const headers = {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': body.length
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return makeRequest({
    hostname: '127.0.0.1',
    port,
    path,
    method: 'POST',
    headers
  }, body);
}

async function runFullStackTests() {
  console.log('======================================================');
  console.log(' Starting Full-Stack AI Resume Scorer Test Suite');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  const PORT = 3098;
  process.env.PORT = PORT;
  const app = require('./server/index');

  // Allow server startup
  await new Promise(r => setTimeout(r, 600));

  let authToken = '';
  let uploadedResumeId = '';
  let createdAnalysisId = '';

  // 1. Health Check
  console.log('[1] Testing GET /health ...');
  const healthRes = await makeJsonGet(PORT, '/health');
  assert(healthRes.status === 200, `Health check status 200 (got ${healthRes.status})`);
  assert(healthRes.body.status === 'ok', 'Health response status is "ok"');

  // 2. Auth: Register
  console.log('\n[2] Testing POST /api/auth/register ...');
  const registerRes = await makeJsonPost(PORT, '/api/auth/register', TEST_USER);
  assert(registerRes.status === 201, `Register status 201 (got ${registerRes.status})`);
  assert(registerRes.body.success === true, 'Register success is true');
  assert(typeof registerRes.body.token === 'string', 'JWT token returned on register');
  assert(registerRes.body.user.email === TEST_USER.email.toLowerCase(), 'User email stored correctly');
  authToken = registerRes.body.token;

  // 3. Auth: Login
  console.log('\n[3] Testing POST /api/auth/login ...');
  const loginRes = await makeJsonPost(PORT, '/api/auth/login', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  assert(loginRes.status === 200, `Login status 200 (got ${loginRes.status})`);
  assert(loginRes.body.success === true, 'Login success is true');
  assert(typeof loginRes.body.token === 'string', 'JWT token returned on login');

  // 4. Auth: Profile Me
  console.log('\n[4] Testing GET /api/auth/me (Protected Route) ...');
  const meRes = await makeJsonGet(PORT, '/api/auth/me', authToken);
  assert(meRes.status === 200, `Me status 200 (got ${meRes.status})`);
  assert(meRes.body.user.name === TEST_USER.name, 'Profile matches registered user name');

  // 5. Auth Error: Unauthorized access
  console.log('\n[5] Testing Unauthorized Access handling ...');
  const unauthRes = await makeJsonGet(PORT, '/api/auth/me');
  assert(unauthRes.status === 401, `Missing token returns 401 (got ${unauthRes.status})`);

  // 6. Resume: Upload & Text Extraction
  console.log('\n[6] Testing POST /api/resumes/upload (PDF text parsing & DB storage) ...');
  const pdfBuffer = createPdfBuffer(SAMPLE_RESUME_TEXT);
  const uploadRes = await makeMultipartUpload(PORT, '/api/resumes/upload', 'resume', 'alex_johnson_resume.pdf', pdfBuffer, 'application/pdf', authToken);
  assert(uploadRes.status === 201, `Resume upload status 201 (got ${uploadRes.status})`);
  assert(uploadRes.body.success === true, 'Resume upload success is true');
  assert(uploadRes.body.resume.wordCount > 50, `Extracted word count: ${uploadRes.body.resume.wordCount}`);
  assert(uploadRes.body.resume.fileName === 'alex_johnson_resume.pdf', 'Original filename preserved');
  uploadedResumeId = uploadRes.body.resume.id;

  // 7. Resume: Scanned / Empty text error
  console.log('\n[7] Testing error handling on scanned/image-only PDF (<100 chars) ...');
  const shortPdfBuffer = createPdfBuffer('Too short');
  const shortUploadRes = await makeMultipartUpload(PORT, '/api/resumes/upload', 'resume', 'scanned.pdf', shortPdfBuffer, 'application/pdf', authToken);
  assert(shortUploadRes.status === 400, `Short PDF returns 400 (got ${shortUploadRes.status})`);
  assert(shortUploadRes.body.error.includes('scanned/image-only'), `Correct error message: "${shortUploadRes.body.error}"`);

  // 8. Resumes: List
  console.log('\n[8] Testing GET /api/resumes ...');
  const listRes = await makeJsonGet(PORT, '/api/resumes', authToken);
  assert(listRes.status === 200, `Get resumes status 200 (got ${listRes.status})`);
  assert(Array.isArray(listRes.body.resumes), 'resumes is an array');
  assert(listRes.body.resumes.length >= 1, `Found ${listRes.body.resumes.length} saved resume(s) in DB`);

  // 9. Resumes: Get Details
  console.log('\n[9] Testing GET /api/resumes/:id ...');
  const resumeDetailRes = await makeJsonGet(PORT, `/api/resumes/${uploadedResumeId}`, authToken);
  assert(resumeDetailRes.status === 200, `Get resume details status 200`);
  assert(resumeDetailRes.body.resume.extractedText.includes('ALEX JOHNSON'), 'Extracted text preserved in PostgreSQL/Prisma');

  // 10. Analysis: Create Analysis
  console.log('\n[10] Testing POST /api/analyses (Heuristics & AI Analysis) ...');
  const createAnalysisRes = await makeJsonPost(PORT, '/api/analyses', {
    resumeId: uploadedResumeId,
    jobDescription: SAMPLE_JD_TEXT
  }, authToken);

  assert(createAnalysisRes.status === 201, `Create analysis status 201 (got ${createAnalysisRes.status})`);
  assert(createAnalysisRes.body.success === true, 'Analysis creation success is true');
  
  const a = createAnalysisRes.body.analysis;
  createdAnalysisId = a.id;
  assert(a.overallScore >= 70 && a.overallScore <= 100, `Overall Score calculated: ${a.overallScore}/100`);
  assert(a.atsScore >= 70 && a.atsScore <= 100, `ATS Score calculated: ${a.atsScore}/100`);
  assert(a.jobMatchPercentage >= 70 && a.jobMatchPercentage <= 100, `Job Match %: ${a.jobMatchPercentage}%`);
  assert(Array.isArray(a.matchedSkills) && a.matchedSkills.length >= 5, `Matched skills count: ${a.matchedSkills.length}`);
  assert(Array.isArray(a.detectedSkills) && a.detectedSkills.length >= 10, `Detected skills count: ${a.detectedSkills.length}`);
  assert(Array.isArray(a.strengths) && a.strengths.length > 0, `Strengths generated: ${a.strengths.length}`);
  assert(Array.isArray(a.suggestions) && a.suggestions.length > 0, `Suggestions generated: ${a.suggestions.length}`);
  assert(typeof a.experienceRelevance === 'string' && a.experienceRelevance.length > 10, 'Experience relevance evaluated');
  assert(typeof a.educationRelevance === 'string' && a.educationRelevance.length > 10, 'Education relevance evaluated');
  assert(typeof a.projectRelevance === 'string' && a.projectRelevance.length > 10, 'Project relevance evaluated');

  // 11. Analysis: Get Analysis History List
  console.log('\n[11] Testing GET /api/analyses (History from DB) ...');
  const historyRes = await makeJsonGet(PORT, '/api/analyses', authToken);
  assert(historyRes.status === 200, `Get analyses status 200`);
  assert(Array.isArray(historyRes.body.analyses), 'analyses is an array');
  assert(historyRes.body.analyses.length >= 1, `Found ${historyRes.body.analyses.length} analysis records in DB`);

  // 12. Analysis: Get Single Analysis Report
  console.log('\n[12] Testing GET /api/analyses/:id ...');
  const singleAnalysisRes = await makeJsonGet(PORT, `/api/analyses/${createdAnalysisId}`, authToken);
  assert(singleAnalysisRes.status === 200, `Get single analysis status 200`);
  assert(singleAnalysisRes.body.analysis.id === createdAnalysisId, 'Analysis ID matches');
  assert(Array.isArray(singleAnalysisRes.body.analysis.matchedSkills), 'JSON array fields deserialized correctly');

  // 13. Analysis: Delete Analysis
  console.log('\n[13] Testing DELETE /api/analyses/:id ...');
  const deleteAnalysisRes = await makeJsonDelete(PORT, `/api/analyses/${createdAnalysisId}`, authToken);
  assert(deleteAnalysisRes.status === 200, `Delete analysis status 200`);

  // 14. Resume: Delete Resume & File cleanup
  console.log('\n[14] Testing DELETE /api/resumes/:id (Deletes DB record & storage file) ...');
  const deleteResumeRes = await makeJsonDelete(PORT, `/api/resumes/${uploadedResumeId}`, authToken);
  assert(deleteResumeRes.status === 200, `Delete resume status 200`);

  const verifyDeleteRes = await makeJsonGet(PORT, `/api/resumes/${uploadedResumeId}`, authToken);
  assert(verifyDeleteRes.status === 404, `Deleted resume returns 404`);

  console.log('\n======================================================');
  console.log(` Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runFullStackTests().catch(err => {
  console.error('Fatal error in full-stack test suite:', err);
  process.exit(1);
});
