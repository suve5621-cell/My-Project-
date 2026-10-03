/**
 * Comprehensive Automated Test Suite for AI Resume Scorer
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { analyzeLocal, extractSkills } = require('./analyzer');

// Sample test data
const SAMPLE_RESUME = `
ALEX JOHNSON
San Francisco, CA | alex.johnson@email.com | (555) 123-4567 | linkedin.com/in/alexjohnson | github.com/alexjohnson

PROFESSIONAL SUMMARY
Results-driven Full Stack Software Engineer with 5+ years of experience designing and deploying scalable web applications and cloud architectures. Proven track record of improving application performance by 40% and leading high-performing agile engineering teams.

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

const SAMPLE_JD = `
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

// Helper to create minimal valid PDF buffer in memory
function createMinimalPdfBuffer(textContent) {
  const content = textContent.replace(/\r?\n/g, ' ');
  const pdfSource = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${content.length + 50} >>
stream
BT
/F1 12 Tf
72 700 Td
(${content.replace(/[()\\]/g, '\\$&')}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000350 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
440
%%EOF`;
  return Buffer.from(pdfSource, 'utf-8');
}

// Helper to create minimal valid DOCX buffer (zip with word/document.xml)
function createMinimalDocxBuffer(textContent) {
  const AdmZip = (() => {
    // Construct minimal standard docx zip manually
    const zlib = require('zlib');
    
    // We can use a simple zip builder or zip structure
    const entries = [
      {
        name: '[Content_Types].xml',
        data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'
      },
      {
        name: '_rels/.rels',
        data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
      },
      {
        name: 'word/document.xml',
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t></w:r></w:p></w:body></w:document>`
      }
    ];

    // Build raw zip archive
    const zipBuffers = [];
    const cdHeaders = [];
    let offset = 0;

    for (const file of entries) {
      const nameBuf = Buffer.from(file.name, 'utf-8');
      const dataBuf = Buffer.from(file.data, 'utf-8');

      // Local file header
      const lfh = Buffer.alloc(30 + nameBuf.length);
      lfh.writeUInt32LE(0x04034b50, 0); // signature
      lfh.writeUInt16LE(20, 4); // version needed
      lfh.writeUInt16LE(0, 6); // flags
      lfh.writeUInt16LE(0, 8); // compression = 0 (store)
      lfh.writeUInt16LE(0, 10); // time
      lfh.writeUInt16LE(0, 12); // date
      lfh.writeUInt32LE(crc32(dataBuf), 14); // crc32
      lfh.writeUInt32LE(dataBuf.length, 18); // compressed size
      lfh.writeUInt32LE(dataBuf.length, 22); // uncompressed size
      lfh.writeUInt16LE(nameBuf.length, 26); // file name length
      lfh.writeUInt16LE(0, 28); // extra field length
      nameBuf.copy(lfh, 30);

      // Central directory header
      const cdh = Buffer.alloc(46 + nameBuf.length);
      cdh.writeUInt32LE(0x02014b50, 0); // signature
      cdh.writeUInt16LE(20, 4); // version made by
      cdh.writeUInt16LE(20, 6); // version needed
      cdh.writeUInt16LE(0, 8); // flags
      cdh.writeUInt16LE(0, 10); // compression
      cdh.writeUInt16LE(0, 12); // time
      cdh.writeUInt16LE(0, 14); // date
      cdh.writeUInt32LE(crc32(dataBuf), 16); // crc32
      cdh.writeUInt32LE(dataBuf.length, 20); // comp size
      cdh.writeUInt32LE(dataBuf.length, 24); // uncomp size
      cdh.writeUInt16LE(nameBuf.length, 28); // name length
      cdh.writeUInt16LE(0, 30); // extra length
      cdh.writeUInt16LE(0, 32); // comment length
      cdh.writeUInt16LE(0, 34); // disk start
      cdh.writeUInt16LE(0, 36); // internal attr
      cdh.writeUInt32LE(0, 38); // external attr
      cdh.writeUInt32LE(offset, 42); // relative offset
      nameBuf.copy(cdh, 46);

      cdHeaders.push(cdh);
      zipBuffers.push(lfh);
      zipBuffers.push(dataBuf);
      offset += lfh.length + dataBuf.length;
    }

    const cdStart = offset;
    let cdSize = 0;
    for (const cdh of cdHeaders) {
      zipBuffers.push(cdh);
      cdSize += cdh.length;
    }

    // End of central directory record
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(0, 4);
    eocd.writeUInt16LE(0, 6);
    eocd.writeUInt16LE(entries.length, 8);
    eocd.writeUInt16LE(entries.length, 10);
    eocd.writeUInt32LE(cdSize, 12);
    eocd.writeUInt32LE(cdStart, 16);
    eocd.writeUInt16LE(0, 20);
    zipBuffers.push(eocd);

    return Buffer.concat(zipBuffers);
  })();

  return AdmZip;
}

// Simple CRC32 implementation
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

// Helper to make HTTP POST request with FormData / Multipart
function makeMultipartRequest(port, path, fieldName, filename, fileBuffer, mimeType) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    
    let postDataHeader = `--${boundary}\r\n`;
    postDataHeader += `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n`;
    postDataHeader += `Content-Type: ${mimeType}\r\n\r\n`;
    
    const postDataFooter = `\r\n--${boundary}--\r\n`;
    
    const headerBuf = Buffer.from(postDataHeader, 'utf-8');
    const footerBuf = Buffer.from(postDataFooter, 'utf-8');
    const fullBody = Buffer.concat([headerBuf, fileBuffer, footerBuf]);

    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length
      }
    }, (res) => {
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
    req.write(fullBody);
    req.end();
  });
}

// Helper to make JSON POST request
function makeJsonRequest(port, path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
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
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('==============================================');
  console.log('Starting Test Suite for AI Resume Scorer');
  console.log('==============================================\n');

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

  // 1. Test Local Skill Extraction & Analyzer
  console.log('[1] Testing Local Skills & ATS Analyzer...');
  const skills = extractSkills(SAMPLE_RESUME);
  assert(skills.length >= 10, `Extracted ${skills.length} skills from resume (expected >= 10)`);
  assert(skills.includes('React'), 'Detected React skill');
  assert(skills.includes('TypeScript'), 'Detected TypeScript skill');
  assert(skills.includes('Node.js'), 'Detected Node.js skill');
  assert(skills.includes('PostgreSQL'), 'Detected PostgreSQL skill');
  assert(skills.includes('Docker'), 'Detected Docker skill');
  assert(skills.includes('AWS'), 'Detected AWS skill');

  const localAnalysis = analyzeLocal(SAMPLE_RESUME, SAMPLE_JD);
  assert(localAnalysis.overallScore >= 75, `Overall match score calculated: ${localAnalysis.overallScore}/100`);
  assert(localAnalysis.atsScore >= 80, `ATS score calculated: ${localAnalysis.atsScore}/100`);
  assert(localAnalysis.keywordMatchScore >= 70, `Keyword match score: ${localAnalysis.keywordMatchScore}%`);
  assert(localAnalysis.matchedSkills.length >= 5, `Matched skills count: ${localAnalysis.matchedSkills.length}`);
  assert(localAnalysis.strengths.length > 0, `Strengths generated (${localAnalysis.strengths.length})`);
  assert(localAnalysis.summary.length > 20, `Summary generated properly`);

  // 2. Start Test Express Server
  console.log('\n[2] Testing Express API Server Endpoints...');
  const express = require('express');
  const multer = require('multer');
  const pdfParse = require('pdf-parse');
  const mammoth = require('mammoth');

  // We can start server on ephemeral port 3099
  const TEST_PORT = 3099;
  process.env.PORT = TEST_PORT;
  const server = require('./server');

  // Wait 1 second for server to bind
  await new Promise(r => setTimeout(r, 800));

  // 3. Test /api/extract with PDF
  console.log('\n[3] Testing /api/extract with PDF document...');
  const samplePdfBuffer = createMinimalPdfBuffer(SAMPLE_RESUME);
  const pdfRes = await makeMultipartRequest(TEST_PORT, '/api/extract', 'resume', 'sample_resume.pdf', samplePdfBuffer, 'application/pdf');
  assert(pdfRes.status === 200, `PDF extract status 200 (got ${pdfRes.status})`);
  assert(pdfRes.body.success === true, 'PDF extract success is true');
  assert(pdfRes.body.wordCount > 50, `PDF extracted word count: ${pdfRes.body.wordCount}`);
  assert(pdfRes.body.text.includes('ALEX JOHNSON'), 'PDF extracted text contains candidate name');

  // 4. Test /api/extract with DOCX
  console.log('\n[4] Testing /api/extract with DOCX document...');
  const sampleDocxBuffer = createMinimalDocxBuffer(SAMPLE_RESUME);
  const docxRes = await makeMultipartRequest(TEST_PORT, '/api/extract', 'resume', 'sample_resume.docx', sampleDocxBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  assert(docxRes.status === 200, `DOCX extract status 200 (got ${docxRes.status})`);
  assert(docxRes.body.success === true, 'DOCX extract success is true');
  assert(docxRes.body.wordCount > 50, `DOCX extracted word count: ${docxRes.body.wordCount}`);

  // 5. Test Scanned / Low text PDF error handling
  console.log('\n[5] Testing error handling for short/scanned PDF (<100 chars)...');
  const shortPdfBuffer = createMinimalPdfBuffer('Short text.');
  const shortPdfRes = await makeMultipartRequest(TEST_PORT, '/api/extract', 'resume', 'scanned.pdf', shortPdfBuffer, 'application/pdf');
  assert(shortPdfRes.status === 400, `Short PDF returns 400 (got ${shortPdfRes.status})`);
  assert(shortPdfRes.body.error.includes('scanned/image-only'), `Correct scanned error message: "${shortPdfRes.body.error}"`);

  // 6. Test Invalid file extension / MIME
  console.log('\n[6] Testing error handling for invalid file type (.txt)...');
  const invalidFileBuffer = Buffer.from('Just some plain text');
  const invalidRes = await makeMultipartRequest(TEST_PORT, '/api/extract', 'resume', 'test.txt', invalidFileBuffer, 'text/plain');
  assert(invalidRes.status === 400, `Invalid file type returns 400 (got ${invalidRes.status})`);
  assert(invalidRes.body.error.includes('Invalid file type') || invalidRes.body.error.includes('Only PDF'), 'Error message informs user of allowed formats');

  // 7. Test /api/analyze with valid payload
  console.log('\n[7] Testing /api/analyze with valid resume and job description...');
  const analyzeRes = await makeJsonRequest(TEST_PORT, '/api/analyze', {
    resumeText: SAMPLE_RESUME,
    jobDescription: SAMPLE_JD
  });
  assert(analyzeRes.status === 200, `Analyze status 200 (got ${analyzeRes.status})`);
  assert(analyzeRes.body.success === true, 'Analyze response success is true');
  assert(analyzeRes.body.data.overallScore >= 0 && analyzeRes.body.data.overallScore <= 100, `Overall score within bounds (0-100): ${analyzeRes.body.data.overallScore}`);
  assert(Array.isArray(analyzeRes.body.data.matchedSkills), 'matchedSkills is an array');
  assert(Array.isArray(analyzeRes.body.data.missingSkills), 'missingSkills is an array');
  assert(Array.isArray(analyzeRes.body.data.detectedSkills), 'detectedSkills is an array');
  assert(Array.isArray(analyzeRes.body.data.strengths), 'strengths is an array');
  assert(Array.isArray(analyzeRes.body.data.improvements), 'improvements is an array');
  assert(Array.isArray(analyzeRes.body.data.suggestions), 'suggestions is an array');
  assert(typeof analyzeRes.body.data.summary === 'string' && analyzeRes.body.data.summary.length > 0, 'summary is present');

  // 8. Test /api/analyze validations (empty JD, short resume)
  console.log('\n[8] Testing /api/analyze validation errors...');
  const shortJdRes = await makeJsonRequest(TEST_PORT, '/api/analyze', {
    resumeText: SAMPLE_RESUME,
    jobDescription: 'Too short JD'
  });
  assert(shortJdRes.status === 400, `Short JD returns 400 (got ${shortJdRes.status})`);
  assert(shortJdRes.body.error.includes('50 characters'), 'Error specifies min 50 characters required for JD');

  const shortResumeRes = await makeJsonRequest(TEST_PORT, '/api/analyze', {
    resumeText: 'Too short',
    jobDescription: SAMPLE_JD
  });
  assert(shortResumeRes.status === 400, `Short resume returns 400 (got ${shortResumeRes.status})`);

  console.log('\n==============================================');
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('==============================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test runner encountered fatal error:', err);
  process.exit(1);
});
