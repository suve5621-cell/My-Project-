/**
 * Real Resume & Job Description Analyzer
 * Supports deterministic local scoring engine (200+ skills dictionary) and Gemini 2.0 Flash AI.
 */

const SKILLS_DATABASE = [
  // Programming Languages
  { name: 'JavaScript', aliases: ['javascript', 'js', 'es6', 'es2015', 'ecmascript'] },
  { name: 'TypeScript', aliases: ['typescript', 'ts'] },
  { name: 'Python', aliases: ['python', 'py', 'python3'] },
  { name: 'Java', aliases: ['java', 'core java', 'j2ee'] },
  { name: 'C++', aliases: ['c++', 'cpp'] },
  { name: 'C#', aliases: ['c#', 'csharp', 'c sharp'] },
  { name: 'C Language', aliases: ['c lang', 'c language', 'ansi c'] },
  { name: 'PHP', aliases: ['php', 'php7', 'php8'] },
  { name: 'Ruby', aliases: ['ruby', 'ruby on rails', 'rails'] },
  { name: 'Go', aliases: ['go', 'golang'] },
  { name: 'Rust', aliases: ['rust', 'rustlang'] },
  { name: 'Swift', aliases: ['swift', 'swiftui'] },
  { name: 'Kotlin', aliases: ['kotlin'] },
  { name: 'Dart', aliases: ['dart', 'flutter'] },
  { name: 'Scala', aliases: ['scala'] },
  { name: 'R Language', aliases: ['r lang', 'r programming', 'r language'] },
  { name: 'MATLAB', aliases: ['matlab'] },
  { name: 'Shell Scripting', aliases: ['bash', 'shell', 'powershell', 'zsh', 'unix shell'] },
  { name: 'SQL', aliases: ['sql', 't-sql', 'pl/sql', 'plsql'] },
  { name: 'HTML5', aliases: ['html', 'html5'] },
  { name: 'CSS3', aliases: ['css', 'css3'] },
  { name: 'SASS/SCSS', aliases: ['sass', 'scss'] },

  // Frontend Libraries & Frameworks
  { name: 'React', aliases: ['react', 'reactjs', 'react.js'] },
  { name: 'Next.js', aliases: ['nextjs', 'next.js', 'next js'] },
  { name: 'Vue.js', aliases: ['vue', 'vuejs', 'vue.js', 'vue3'] },
  { name: 'Nuxt.js', aliases: ['nuxt', 'nuxtjs', 'nuxt.js'] },
  { name: 'Angular', aliases: ['angular', 'angularjs', 'angular.js', 'angular2+'] },
  { name: 'Svelte', aliases: ['svelte', 'sveltekit'] },
  { name: 'Astro', aliases: ['astro', 'astrojs'] },
  { name: 'Remix', aliases: ['remix', 'remix run'] },
  { name: 'Redux', aliases: ['redux', 'redux toolkit', 'rtk'] },
  { name: 'Zustand', aliases: ['zustand'] },
  { name: 'MobX', aliases: ['mobx'] },
  { name: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss', 'tailwind-css'] },
  { name: 'Bootstrap', aliases: ['bootstrap', 'bootstrap5'] },
  { name: 'Material UI', aliases: ['material-ui', 'mui', 'material ui'] },
  { name: 'Chakra UI', aliases: ['chakra ui', 'chakra-ui'] },
  { name: 'Webpack', aliases: ['webpack'] },
  { name: 'Vite', aliases: ['vite', 'vitejs'] },

  // Backend & APIs
  { name: 'Node.js', aliases: ['node', 'nodejs', 'node.js'] },
  { name: 'Express.js', aliases: ['express', 'expressjs', 'express.js'] },
  { name: 'NestJS', aliases: ['nestjs', 'nest.js'] },
  { name: 'Fastify', aliases: ['fastify'] },
  { name: 'Django', aliases: ['django'] },
  { name: 'Flask', aliases: ['flask'] },
  { name: 'FastAPI', aliases: ['fastapi'] },
  { name: 'Spring Boot', aliases: ['spring boot', 'springboot', 'spring framework'] },
  { name: '.NET Core', aliases: ['.net', 'dotnet', '.net core', 'asp.net', 'asp.net core'] },
  { name: 'Laravel', aliases: ['laravel'] },
  { name: 'GraphQL', aliases: ['graphql', 'apollo graphql'] },
  { name: 'REST API', aliases: ['rest', 'rest api', 'restful api', 'restful', 'rest apis'] },
  { name: 'gRPC', aliases: ['grpc'] },
  { name: 'WebSockets', aliases: ['websocket', 'websockets', 'socket.io'] },
  { name: 'Microservices', aliases: ['microservices', 'microservice architecture'] },
  { name: 'Serverless', aliases: ['serverless', 'lambda', 'aws lambda'] },

  // Databases & Storage
  { name: 'PostgreSQL', aliases: ['postgres', 'postgresql'] },
  { name: 'MySQL', aliases: ['mysql'] },
  { name: 'SQLite', aliases: ['sqlite', 'sqlite3'] },
  { name: 'MongoDB', aliases: ['mongo', 'mongodb'] },
  { name: 'Redis', aliases: ['redis', 'redis cache'] },
  { name: 'Cassandra', aliases: ['cassandra'] },
  { name: 'DynamoDB', aliases: ['dynamodb', 'aws dynamodb'] },
  { name: 'Elasticsearch', aliases: ['elasticsearch', 'elastic search'] },
  { name: 'Firebase', aliases: ['firebase', 'firestore'] },
  { name: 'Supabase', aliases: ['supabase'] },
  { name: 'Prisma ORM', aliases: ['prisma', 'prisma orm'] },

  // Cloud & DevOps
  { name: 'AWS', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'rds', 'cloudformation', 'iam'] },
  { name: 'Microsoft Azure', aliases: ['azure', 'microsoft azure', 'azure devops'] },
  { name: 'Google Cloud Platform', aliases: ['gcp', 'google cloud', 'google cloud platform'] },
  { name: 'Docker', aliases: ['docker', 'docker compose', 'containerization'] },
  { name: 'Kubernetes', aliases: ['k8s', 'kubernetes', 'kubectl'] },
  { name: 'CI/CD', aliases: ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment'] },
  { name: 'GitHub Actions', aliases: ['github actions', 'gh actions'] },
  { name: 'Jenkins', aliases: ['jenkins'] },
  { name: 'Terraform', aliases: ['terraform', 'iac'] },
  { name: 'Linux', aliases: ['linux', 'ubuntu', 'debian', 'centos', 'redhat', 'unix'] },

  // AI, Data Science & ML
  { name: 'Machine Learning', aliases: ['machine learning', 'ml'] },
  { name: 'Deep Learning', aliases: ['deep learning', 'neural networks'] },
  { name: 'Natural Language Processing', aliases: ['nlp', 'natural language processing'] },
  { name: 'Computer Vision', aliases: ['computer vision', 'cv'] },
  { name: 'Large Language Models', aliases: ['llm', 'llms', 'large language models', 'gpt', 'transformers'] },
  { name: 'Generative AI', aliases: ['generative ai', 'genai', 'prompt engineering'] },
  { name: 'LangChain', aliases: ['langchain'] },
  { name: 'RAG', aliases: ['rag', 'retrieval-augmented generation', 'vector search'] },
  { name: 'PyTorch', aliases: ['pytorch'] },
  { name: 'TensorFlow', aliases: ['tensorflow', 'tf', 'keras'] },
  { name: 'Scikit-Learn', aliases: ['scikit-learn', 'sklearn'] },
  { name: 'Pandas', aliases: ['pandas'] },
  { name: 'NumPy', aliases: ['numpy'] },
  { name: 'Apache Spark', aliases: ['spark', 'pyspark', 'apache spark'] },
  { name: 'Apache Kafka', aliases: ['kafka', 'apache kafka'] },

  // Testing & Quality Assurance
  { name: 'Unit Testing', aliases: ['unit testing', 'unit test', 'unit tests'] },
  { name: 'Integration Testing', aliases: ['integration testing', 'integration tests'] },
  { name: 'End-to-End Testing', aliases: ['e2e testing', 'e2e', 'end to end testing'] },
  { name: 'Jest', aliases: ['jest'] },
  { name: 'Cypress', aliases: ['cypress'] },
  { name: 'Playwright', aliases: ['playwright'] },
  { name: 'PyTest', aliases: ['pytest'] },
  { name: 'JUnit', aliases: ['junit'] },

  // Architecture, Methodologies & Soft Skills
  { name: 'Git', aliases: ['git', 'version control', 'github', 'gitlab', 'bitbucket'] },
  { name: 'Agile', aliases: ['agile', 'agile methodology', 'scrum', 'kanban', 'sprint'] },
  { name: 'System Design', aliases: ['system design', 'distributed systems', 'scalability'] },
  { name: 'Data Structures & Algorithms', aliases: ['data structures', 'algorithms', 'dsa'] },
  { name: 'OAuth & JWT', aliases: ['oauth', 'oauth2', 'jwt', 'json web token'] },
  { name: 'Communication', aliases: ['communication', 'verbal communication', 'presentation skills'] },
  { name: 'Leadership', aliases: ['leadership', 'team leadership', 'lead', 'spearheaded'] },
  { name: 'Problem Solving', aliases: ['problem solving', 'troubleshooting', 'analytical thinking'] },
  { name: 'Teamwork & Collaboration', aliases: ['teamwork', 'collaboration', 'cross-functional'] },
  { name: 'Project Management', aliases: ['project management', 'program management'] }
];

function escapeRegex(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Extract skills from text using word boundaries and aliases
 */
function extractSkills(text) {
  if (!text || typeof text !== 'string') return [];
  const normalizedText = ` ${text.toLowerCase()} `;
  const foundSkills = new Set();

  for (const entry of SKILLS_DATABASE) {
    for (const alias of entry.aliases) {
      const lowerAlias = alias.toLowerCase();
      let pattern;
      if (lowerAlias.startsWith('.')) {
        pattern = new RegExp(`(?:\\s|^)${escapeRegex(lowerAlias)}(?:[\\s,.;:!?()\\[\\]{}]|$)`, 'i');
      } else if (lowerAlias.endsWith('++') || lowerAlias.endsWith('#')) {
        pattern = new RegExp(`(?:[\\s,.;:!?()\\[\\]{}]|^)${escapeRegex(lowerAlias)}(?:[\\s,.;:!?()\\[\\]{}]|$)`, 'i');
      } else {
        pattern = new RegExp(`\\b${escapeRegex(lowerAlias)}\\b`, 'i');
      }

      if (pattern.test(normalizedText)) {
        foundSkills.add(entry.name);
        break;
      }
    }
  }

  return Array.from(foundSkills).sort();
}

/**
 * Extract important domain keywords from job description
 */
function extractKeywords(text) {
  if (!text) return [];
  const words = text.match(/\b[A-Za-z0-9+#.-]{3,}\b/g) || [];
  const stopWords = new Set([
    'with', 'have', 'from', 'this', 'that', 'will', 'your', 'about', 'more', 'work', 'role',
    'team', 'years', 'looking', 'must', 'should', 'join', 'help', 'make', 'good', 'well',
    'such', 'able', 'plus', 'need', 'high', 'their', 'they', 'what', 'when', 'where', 'which',
    'who', 'whom', 'whose', 'why', 'how', 'than', 'them', 'then', 'there', 'these', 'those'
  ]);
  const counts = {};
  for (const w of words) {
    const lw = w.toLowerCase();
    if (!stopWords.has(lw) && lw.length >= 3) {
      const proper = w.charAt(0).toUpperCase() + w.slice(1);
      counts[proper] = (counts[proper] || 0) + 1;
    }
  }
  return Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, 15);
}

/**
 * Deterministic local analysis engine
 */
function analyzeLocal(resumeText, jobDescription) {
  const resume = (resumeText || '').trim();
  const jd = (jobDescription || '').trim();

  // 1. Skill Extraction
  const resumeSkills = extractSkills(resume);
  const jdSkills = extractSkills(jd);

  let targetSkills = jdSkills;
  if (targetSkills.length === 0) {
    targetSkills = extractKeywords(jd).slice(0, 8);
  }

  const resumeLower = resume.toLowerCase();
  const matchedSkills = [];
  const missingSkills = [];

  for (const s of targetSkills) {
    if (resumeSkills.some(rs => rs.toLowerCase() === s.toLowerCase()) || resumeLower.includes(s.toLowerCase())) {
      matchedSkills.push(s);
    } else {
      missingSkills.push(s);
    }
  }

  const jobMatchPercentage = targetSkills.length > 0
    ? Math.min(100, Math.round((matchedSkills.length / targetSkills.length) * 100))
    : 100;

  // 2. Keywords Found & Missing
  const jdKeywords = extractKeywords(jd);
  const keywordsFound = [];
  const missingKeywords = [];

  for (const kw of jdKeywords) {
    if (resumeLower.includes(kw.toLowerCase())) {
      keywordsFound.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const keywordMatchScore = jdKeywords.length > 0
    ? Math.min(100, Math.round((keywordsFound.length / jdKeywords.length) * 100))
    : 100;

  // 3. Section Checks & ATS Scoring (Total 100 pts)
  const standardSections = [
    { name: 'Experience', regex: /experience|employment history|work history|career history/i, weight: 8 },
    { name: 'Education', regex: /education|academic background|degree|university/i, weight: 6 },
    { name: 'Skills', regex: /skills|technical skills|core competencies|technologies/i, weight: 8 },
    { name: 'Projects', regex: /projects|key projects|personal projects|portfolio/i, weight: 4 },
    { name: 'Summary', regex: /summary|professional summary|profile|about me|objective/i, weight: 4 }
  ];

  let sectionScore = 0;
  const detectedSections = [];
  const missingSections = [];

  for (const sec of standardSections) {
    if (sec.regex.test(resume)) {
      sectionScore += sec.weight;
      detectedSections.push(sec.name);
    } else {
      missingSections.push(sec.name);
    }
  }

  // Contact Info (up to 20 pts)
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resume);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/.test(resume);
  const contactScore = (hasEmail ? 10 : 0) + (hasPhone ? 10 : 0);

  // Readability & Word Count (up to 15 pts)
  const words = (resume.match(/\b\w+\b/g) || []).length;
  let lengthScore = 15;
  if (words < 200) lengthScore = 5;
  else if (words < 300) lengthScore = 10;
  else if (words > 1200) lengthScore = 8;

  // Action Verbs (up to 20 pts)
  const actionVerbs = ['developed', 'engineered', 'architected', 'led', 'managed', 'created', 'built', 'optimized', 'designed', 'implemented', 'scaled', 'automated', 'spearheaded', 'reduced', 'increased', 'mentored'];
  const verbCount = actionVerbs.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(resumeLower)).length;
  const verbScore = Math.min(20, verbCount * 4);

  // Quantified Achievements (up to 15 pts)
  const metricMatches = resume.match(/\b\d+%\b|\$\d+[\d,]*|\b\d+x\b|\b\d+\+?\s*(?:users|clients|projects|team|members|downloads|requests|ms|revenue|features)\b/gi) || [];
  const metricScore = Math.min(15, metricMatches.length * 5);

  const atsScore = Math.min(100, Math.max(0, sectionScore + contactScore + lengthScore + verbScore + metricScore));

  // 4. Experience, Education & Project Relevance
  let experienceRelevance = '';
  const experienceYearsMatch = resume.match(/(\d+)\+?\s*years(?:\s+of)?\s+experience/i);
  if (experienceYearsMatch) {
    experienceRelevance = `Strong experience profile detected: ${experienceYearsMatch[1]}+ years of industry background matching role seniorities.`;
  } else if (/experience|senior|lead|engineer|developer/i.test(resume)) {
    experienceRelevance = `Relevant practical experience identified across past roles with ${verbCount} action verbs demonstrating technical execution.`;
  } else {
    experienceRelevance = `Experience section could be expanded with more concrete responsibilities and technical accomplishments.`;
  }

  let educationRelevance = '';
  if (/bachelor|master|phd|b\.s\.|m\.s\.|computer science|engineering/i.test(resume)) {
    educationRelevance = `Formal technical degree or equivalent academic credentials identified, satisfying educational baseline.`;
  } else if (/education|university|college|bootcamp|certified/i.test(resume)) {
    educationRelevance = `Educational background or specialized training noted.`;
  } else {
    educationRelevance = `Consider adding formal education, certifications, or degree details.`;
  }

  let projectRelevance = '';
  if (metricMatches.length >= 2) {
    projectRelevance = `High-impact projects with ${metricMatches.length} quantifiable metrics (e.g., performance boosts, user scale, efficiency improvements).`;
  } else if (/projects|built|deployed|implemented/i.test(resume)) {
    projectRelevance = `Projects and systems implementations demonstrate applied knowledge in required tech stack.`;
  } else {
    projectRelevance = `Add dedicated technical projects highlighting real-world problem solving and modern frameworks.`;
  }

  // 5. Strengths, Areas to Improve, Suggestions
  const strengths = [];
  const areasToImprove = [];
  const suggestions = [];

  if (matchedSkills.length >= 4) {
    strengths.push(`Strong alignment on ${matchedSkills.length} key technical skills requested by the job.`);
  }
  if (detectedSections.length >= 4) {
    strengths.push(`Clean ATS structure with standard sections present (${detectedSections.join(', ')}).`);
  }
  if (hasEmail && hasPhone) {
    strengths.push(`Complete and accessible contact information provided.`);
  }
  if (metricMatches.length >= 3) {
    strengths.push(`Excellent quantification of accomplishments with measurable data and percentages.`);
  }
  if (strengths.length === 0) {
    strengths.push('Clear baseline resume format ready for domain-specific tailoring.');
  }

  if (missingSkills.length > 0) {
    areasToImprove.push(`Missing ${missingSkills.length} required skill keywords from the job description: ${missingSkills.slice(0, 4).join(', ')}.`);
    suggestions.push(`Incorporate experience with ${missingSkills.slice(0, 4).join(', ')} into your bullet points or skills section.`);
  }
  if (missingSections.length > 0) {
    areasToImprove.push(`Missing standard resume sections: ${missingSections.join(', ')}.`);
    suggestions.push(`Add clear headings for ${missingSections.join(' and ')} to improve ATS parsing.`);
  }
  if (metricMatches.length < 2) {
    areasToImprove.push(`Few quantified metrics or percentages to prove project impact.`);
    suggestions.push(`Use the XYZ formula: Accomplished [X], as measured by [Y], by doing [Z] with numbers and percentages.`);
  }
  if (!hasPhone || !hasEmail) {
    suggestions.push('Ensure both a professional email and contact phone number are clearly visible at the top.');
  }

  // 6. Overall Score (Weighted based on spec)
  // Overall Score: Skills match: 35%, Keyword match: 20%, Experience relevance: 20%, Education relevance: 10%, Projects: 10%, Completeness: 5%
  const skillsScore = jobMatchPercentage;
  const expScore = verbCount >= 4 ? 85 : 65;
  const eduScore = /bachelor|master|computer science/i.test(resume) ? 90 : 70;
  const projScore = metricMatches.length >= 2 ? 85 : 60;
  const completeScore = (detectedSections.length / 5) * 100;

  const overallScore = Math.min(100, Math.max(0, Math.round(
    (0.35 * skillsScore) +
    (0.20 * keywordMatchScore) +
    (0.20 * expScore) +
    (0.10 * eduScore) +
    (0.10 * projScore) +
    (0.05 * completeScore)
  )));

  return {
    overallScore,
    atsScore,
    jobMatchPercentage,
    detectedSkills: resumeSkills,
    matchedSkills,
    missingSkills,
    keywordsFound,
    missingKeywords,
    strengths,
    areasToImprove,
    experienceRelevance,
    educationRelevance,
    projectRelevance,
    suggestions,
    analysisType: 'Local Analysis'
  };
}

/**
 * Gemini 2.0 Flash AI Analysis
 */
async function analyzeWithGemini(apiKey, resumeText, jobDescription) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  const prompt = `You are a Principal Technical Recruiter and ATS Expert.
Analyze the following extracted candidate resume against the target job description.

RESUME TEXT:
"""
${resumeText.slice(0, 9000)}
"""

TARGET JOB DESCRIPTION:
"""
${jobDescription.slice(0, 5000)}
"""

Evaluate strictly and return ONLY a valid JSON object matching the exact structure below:
{
  "overallScore": <integer 0-100: calculated from skills match 35%, keyword match 20%, experience 20%, education 10%, projects 10%, completeness 5%>,
  "atsScore": <integer 0-100: parseability, standard sections, contact info, structure>,
  "jobMatchPercentage": <integer 0-100: percentage of required JD skills found in resume>,
  "detectedSkills": [<array of strings: all real technical and professional skills detected in resume>],
  "matchedSkills": [<array of strings: skills present in BOTH resume and JD>],
  "missingSkills": [<array of strings: required/preferred skills in JD but MISSING in resume>],
  "keywordsFound": [<array of strings: important domain keywords from JD present in resume>],
  "missingKeywords": [<array of strings: important keywords in JD missing in resume>],
  "strengths": [<array of 3-6 strings: concise bullet points of actual strong qualifications>],
  "areasToImprove": [<array of 3-6 strings: concise gaps or missing requirements>],
  "experienceRelevance": "<1-3 sentences evaluating how closely candidate's past experience matches the job responsibilities>",
  "educationRelevance": "<1-2 sentences evaluating degrees/academic background vs requirements>",
  "projectRelevance": "<1-2 sentences evaluating technical project impact and scope vs requirements>",
  "suggestions": [<array of 3-6 strings: specific actionable steps to improve alignment and interview chances>]
}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.15
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawJsonText) {
    throw new Error('Gemini API returned an empty output');
  }

  let parsed;
  try {
    parsed = JSON.parse(rawJsonText.trim());
  } catch (err) {
    const match = rawJsonText.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error('Failed to parse Gemini output as JSON');
    }
  }

  // Sanitize and ensure array types
  return {
    overallScore: Math.min(100, Math.max(0, parseInt(parsed.overallScore, 10) || 50)),
    atsScore: Math.min(100, Math.max(0, parseInt(parsed.atsScore, 10) || 50)),
    jobMatchPercentage: Math.min(100, Math.max(0, parseInt(parsed.jobMatchPercentage, 10) || 50)),
    detectedSkills: Array.isArray(parsed.detectedSkills) ? parsed.detectedSkills : [],
    matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
    keywordsFound: Array.isArray(parsed.keywordsFound) ? parsed.keywordsFound : [],
    missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
    strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : ['Resume submitted successfully.'],
    areasToImprove: Array.isArray(parsed.areasToImprove) && parsed.areasToImprove.length > 0 ? parsed.areasToImprove : ['Review required skills for keyword alignment.'],
    experienceRelevance: parsed.experienceRelevance || 'Experience evaluated against role requirements.',
    educationRelevance: parsed.educationRelevance || 'Educational background reviewed.',
    projectRelevance: parsed.projectRelevance || 'Projects reviewed against technical scope.',
    suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0 ? parsed.suggestions : ['Tailor resume descriptions to emphasize matching technologies.'],
    analysisType: 'AI Analysis (Gemini)'
  };
}

module.exports = {
  extractSkills,
  extractKeywords,
  analyzeLocal,
  analyzeWithGemini
};
