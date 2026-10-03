/**
 * Local Resume Analyzer
 * Provides deterministic ATS scoring, comprehensive skills extraction (~200+ skills),
 * keyword matching against job descriptions, and structured feedback.
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
  { name: 'Shell Scripting', aliases: ['bash', 'shell', 'sh', 'powershell', 'zsh', 'unix shell'] },
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
  { name: 'Styled Components', aliases: ['styled-components', 'styled components'] },
  { name: 'Webpack', aliases: ['webpack'] },
  { name: 'Vite', aliases: ['vite', 'vitejs'] },
  { name: 'Babel', aliases: ['babel'] },
  { name: 'jQuery', aliases: ['jquery'] },

  // Backend & APIs
  { name: 'Node.js', aliases: ['node', 'nodejs', 'node.js'] },
  { name: 'Express.js', aliases: ['express', 'expressjs', 'express.js'] },
  { name: 'NestJS', aliases: ['nestjs', 'nest.js'] },
  { name: 'Fastify', aliases: ['fastify'] },
  { name: 'Koa', aliases: ['koa', 'koajs'] },
  { name: 'Django', aliases: ['django'] },
  { name: 'Flask', aliases: ['flask'] },
  { name: 'FastAPI', aliases: ['fastapi'] },
  { name: 'Spring Boot', aliases: ['spring boot', 'springboot', 'spring framework'] },
  { name: '.NET Core', aliases: ['.net', 'dotnet', '.net core', 'asp.net', 'asp.net core'] },
  { name: 'Laravel', aliases: ['laravel'] },
  { name: 'Ruby on Rails', aliases: ['rails', 'ruby on rails'] },
  { name: 'GraphQL', aliases: ['graphql', 'apollo graphql', 'relay'] },
  { name: 'REST API', aliases: ['rest', 'rest api', 'restful api', 'restful', 'rest apis', 'restful apis'] },
  { name: 'gRPC', aliases: ['grpc'] },
  { name: 'WebSockets', aliases: ['websocket', 'websockets', 'socket.io'] },
  { name: 'Microservices', aliases: ['microservices', 'microservice architecture', 'micro-services'] },
  { name: 'Serverless', aliases: ['serverless', 'lambda', 'aws lambda', 'azure functions'] },

  // Databases & Caching
  { name: 'PostgreSQL', aliases: ['postgres', 'postgresql'] },
  { name: 'MySQL', aliases: ['mysql'] },
  { name: 'SQLite', aliases: ['sqlite', 'sqlite3'] },
  { name: 'MongoDB', aliases: ['mongo', 'mongodb'] },
  { name: 'Redis', aliases: ['redis', 'redis cache'] },
  { name: 'Cassandra', aliases: ['cassandra', 'apache cassandra'] },
  { name: 'DynamoDB', aliases: ['dynamodb', 'aws dynamodb'] },
  { name: 'Oracle DB', aliases: ['oracle database', 'oracle db', 'plsql'] },
  { name: 'Microsoft SQL Server', aliases: ['mssql', 'ms sql', 'sql server'] },
  { name: 'Elasticsearch', aliases: ['elasticsearch', 'elastic search', 'elk stack'] },
  { name: 'Neo4j', aliases: ['neo4j', 'graph database'] },
  { name: 'Firebase', aliases: ['firebase', 'firestore', 'firebase auth'] },
  { name: 'Supabase', aliases: ['supabase'] },
  { name: 'Prisma', aliases: ['prisma', 'prisma orm'] },
  { name: 'TypeORM', aliases: ['typeorm'] },
  { name: 'Hibernate', aliases: ['hibernate'] },
  { name: 'Sequelize', aliases: ['sequelize'] },

  // Cloud & DevOps
  { name: 'AWS', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'rds', 'cloudformation', 'iam'] },
  { name: 'Microsoft Azure', aliases: ['azure', 'microsoft azure', 'azure devops'] },
  { name: 'Google Cloud Platform', aliases: ['gcp', 'google cloud', 'google cloud platform'] },
  { name: 'Docker', aliases: ['docker', 'docker compose', 'containerization'] },
  { name: 'Kubernetes', aliases: ['k8s', 'kubernetes', 'kubectl'] },
  { name: 'CI/CD', aliases: ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment'] },
  { name: 'GitHub Actions', aliases: ['github actions', 'gh actions'] },
  { name: 'GitLab CI', aliases: ['gitlab ci', 'gitlab-ci'] },
  { name: 'Jenkins', aliases: ['jenkins'] },
  { name: 'Terraform', aliases: ['terraform', 'iac', 'infrastructure as code'] },
  { name: 'Ansible', aliases: ['ansible'] },
  { name: 'Linux', aliases: ['linux', 'ubuntu', 'debian', 'centos', 'redhat', 'unix'] },
  { name: 'Nginx', aliases: ['nginx'] },
  { name: 'Apache HTTP', aliases: ['apache', 'apache http'] },
  { name: 'Prometheus', aliases: ['prometheus'] },
  { name: 'Grafana', aliases: ['grafana'] },
  { name: 'Datadog', aliases: ['datadog'] },
  { name: 'Cloudflare', aliases: ['cloudflare'] },

  // Data Science, AI & Machine Learning
  { name: 'Machine Learning', aliases: ['machine learning', 'ml', 'statistical modeling'] },
  { name: 'Deep Learning', aliases: ['deep learning', 'neural networks', 'ann', 'cnn', 'rnn'] },
  { name: 'Natural Language Processing', aliases: ['nlp', 'natural language processing', 'text analytics'] },
  { name: 'Computer Vision', aliases: ['computer vision', 'cv', 'image processing'] },
  { name: 'Large Language Models', aliases: ['llm', 'llms', 'large language models', 'gpt', 'transformers'] },
  { name: 'Generative AI', aliases: ['generative ai', 'genai', 'prompt engineering'] },
  { name: 'LangChain', aliases: ['langchain'] },
  { name: 'RAG', aliases: ['rag', 'retrieval-augmented generation', 'vector search', 'pinecone', 'chroma'] },
  { name: 'PyTorch', aliases: ['pytorch'] },
  { name: 'TensorFlow', aliases: ['tensorflow', 'tf', 'keras'] },
  { name: 'Scikit-Learn', aliases: ['scikit-learn', 'sklearn'] },
  { name: 'Pandas', aliases: ['pandas'] },
  { name: 'NumPy', aliases: ['numpy'] },
  { name: 'SciPy', aliases: ['scipy'] },
  { name: 'OpenCV', aliases: ['opencv'] },
  { name: 'Apache Spark', aliases: ['spark', 'pyspark', 'apache spark'] },
  { name: 'Apache Kafka', aliases: ['kafka', 'apache kafka'] },
  { name: 'RabbitMQ', aliases: ['rabbitmq'] },
  { name: 'Airflow', aliases: ['airflow', 'apache airflow'] },
  { name: 'Hadoop', aliases: ['hadoop', 'mapreduce'] },
  { name: 'Power BI', aliases: ['power bi', 'powerbi'] },
  { name: 'Tableau', aliases: ['tableau'] },
  { name: 'Excel', aliases: ['excel', 'advanced excel', 'vba', 'spreadsheets'] },

  // Testing & Quality Assurance
  { name: 'Unit Testing', aliases: ['unit testing', 'unit test', 'unit tests'] },
  { name: 'Integration Testing', aliases: ['integration testing', 'integration tests'] },
  { name: 'End-to-End Testing', aliases: ['e2e testing', 'e2e', 'end to end testing'] },
  { name: 'Test-Driven Development', aliases: ['tdd', 'test driven development'] },
  { name: 'Jest', aliases: ['jest'] },
  { name: 'Mocha', aliases: ['mocha', 'chai'] },
  { name: 'Cypress', aliases: ['cypress'] },
  { name: 'Playwright', aliases: ['playwright'] },
  { name: 'Selenium', aliases: ['selenium', 'selenium webdriver'] },
  { name: 'PyTest', aliases: ['pytest'] },
  { name: 'JUnit', aliases: ['junit', 'junit5'] },
  { name: 'Postman', aliases: ['postman', 'api testing'] },

  // Architecture, Security & Methodologies
  { name: 'Git', aliases: ['git', 'version control', 'github', 'gitlab', 'bitbucket'] },
  { name: 'Agile', aliases: ['agile', 'agile methodology', 'scrum', 'kanban', 'sprint'] },
  { name: 'Jira', aliases: ['jira', 'confluence'] },
  { name: 'System Design', aliases: ['system design', 'distributed systems', 'scalability', 'high availability'] },
  { name: 'Data Structures & Algorithms', aliases: ['data structures', 'algorithms', 'dsa'] },
  { name: 'Object-Oriented Programming', aliases: ['oop', 'object oriented programming', 'object-oriented design'] },
  { name: 'Functional Programming', aliases: ['functional programming', 'fp'] },
  { name: 'Design Patterns', aliases: ['design patterns', 'solid principles', 'clean architecture', 'clean code'] },
  { name: 'Cybersecurity', aliases: ['cybersecurity', 'information security', 'infosec', 'penetration testing', 'owasp'] },
  { name: 'OAuth & JWT', aliases: ['oauth', 'oauth2', 'jwt', 'json web token', 'authentication', 'authorization'] },
  { name: 'Figma', aliases: ['figma', 'ui/ux design', 'wireframing', 'prototyping'] },

  // Soft Skills & Professional Attributes
  { name: 'Communication', aliases: ['communication', 'verbal communication', 'written communication', 'presentation skills'] },
  { name: 'Leadership', aliases: ['leadership', 'team leadership', 'lead', 'spearheaded', 'coaching'] },
  { name: 'Problem Solving', aliases: ['problem solving', 'troubleshooting', 'analytical thinking', 'root cause analysis'] },
  { name: 'Teamwork & Collaboration', aliases: ['teamwork', 'collaboration', 'cross-functional', 'cross-functional collaboration'] },
  { name: 'Critical Thinking', aliases: ['critical thinking', 'analytical skills'] },
  { name: 'Time Management', aliases: ['time management', 'prioritization', 'multitasking'] },
  { name: 'Adaptability', aliases: ['adaptability', 'flexibility', 'fast learner', 'quick learner'] },
  { name: 'Mentorship', aliases: ['mentorship', 'mentoring', 'peer review', 'code reviews'] },
  { name: 'Project Management', aliases: ['project management', 'program management', 'scrum master', 'product management'] },
  { name: 'Stakeholder Management', aliases: ['stakeholder management', 'client communication', 'vendor management'] },
  { name: 'Attention to Detail', aliases: ['attention to detail', 'detail-oriented', 'meticulous'] },
  { name: 'Negotiation', aliases: ['negotiation', 'conflict resolution'] },
  { name: 'Customer Service', aliases: ['customer service', 'client relations', 'user experience'] },
  { name: 'Decision Making', aliases: ['decision making', 'strategic thinking', 'strategic planning'] },
  { name: 'Work Ethic', aliases: ['work ethic', 'self-motivated', 'initiative', 'ownership'] }
];

// Helper to escape regex symbols
function escapeRegex(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Extract skills from any text using word boundary matching and alias lookup.
 */
function extractSkills(text) {
  if (!text || typeof text !== 'string') return [];
  const normalizedText = ` ${text.toLowerCase()} `;
  const foundSkills = new Set();

  for (const entry of SKILLS_DATABASE) {
    for (const alias of entry.aliases) {
      const lowerAlias = alias.toLowerCase();
      // Regex handling for special characters in tech terms like c++, c#, .net, ci/cd
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
        break; // Matched this skill category, proceed to next skill
      }
    }
  }

  return Array.from(foundSkills).sort();
}

/**
 * Standard ATS section definitions
 */
const ATS_SECTIONS = [
  { name: 'Work Experience', patterns: [/experience/i, /employment history/i, /work history/i, /professional experience/i, /career history/i] },
  { name: 'Education', patterns: [/education/i, /academic background/i, /qualifications/i, /degrees/i] },
  { name: 'Skills', patterns: [/skills/i, /technical skills/i, /core competencies/i, /technologies/i, /areas of expertise/i] },
  { name: 'Projects', patterns: [/projects/i, /key projects/i, /personal projects/i, /technical projects/i, /portfolio/i] },
  { name: 'Summary / Profile', patterns: [/summary/i, /professional summary/i, /profile/i, /about me/i, /objective/i, /executive summary/i] }
];

/**
 * Action verbs list for resume impact scoring
 */
const ACTION_VERBS = [
  'accelerated', 'achieved', 'administered', 'analyzed', 'architected', 'automated',
  'built', 'championed', 'collaborated', 'configured', 'constructed', 'coordinated',
  'created', 'decreased', 'delivered', 'deployed', 'designed', 'developed', 'devised',
  'directed', 'engineered', 'enhanced', 'established', 'executed', 'expanded',
  'formulated', 'generated', 'guided', 'headed', 'implemented', 'improved',
  'increased', 'initiated', 'inspected', 'integrated', 'introduced', 'invented',
  'launched', 'lead', 'led', 'maintained', 'managed', 'mentored', 'migrated',
  'minimized', 'modernized', 'negotiated', 'optimized', 'orchestrated', 'organized',
  'overhauled', 'oversaw', 'performed', 'pioneered', 'planned', 'programmed',
  're-architected', 'rebuilt', 'reduced', 'refactored', 'resolved', 'restructured',
  'revamped', 'saved', 'scaled', 'simplified', 'spearheaded', 'standardized',
  'streamlined', 'strengthened', 'structured', 'supervised', 'transformed', 'upgraded'
];

/**
 * Deterministic Local ATS Analyzer
 */
function analyzeLocal(resumeText, jobDescription) {
  const resume = (resumeText || '').trim();
  const jd = (jobDescription || '').trim();

  // 1. Skill Extraction
  const resumeSkills = extractSkills(resume);
  const jdSkills = extractSkills(jd);

  // If JD doesn't have matches from DB, extract top words as fallback
  let effectiveJdSkills = jdSkills;
  if (effectiveJdSkills.length === 0 && jd.length >= 50) {
    // Extract keywords from JD (capitalized or frequent tech terms)
    const words = jd.match(/\b[A-Za-z0-9+#.-]{3,}\b/g) || [];
    const counts = {};
    const stopWords = new Set(['with', 'have', 'from', 'this', 'that', 'will', 'your', 'about', 'more', 'work', 'role', 'team', 'years', 'looking', 'must', 'should', 'join', 'help', 'make', 'good', 'well', 'such', 'able', 'plus', 'need', 'high']);
    for (const w of words) {
      const lw = w.toLowerCase();
      if (!stopWords.has(lw) && lw.length > 3) {
        counts[w] = (counts[w] || 0) + 1;
      }
    }
    const topKeywords = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 8);
    effectiveJdSkills = topKeywords;
  }

  // Calculate skill match
  const resumeSkillsLower = new Set(resumeSkills.map(s => s.toLowerCase()));
  const matchedSkills = [];
  const missingSkills = [];

  for (const s of effectiveJdSkills) {
    if (resumeSkillsLower.has(s.toLowerCase()) || resume.toLowerCase().includes(s.toLowerCase())) {
      matchedSkills.push(s);
    } else {
      missingSkills.push(s);
    }
  }

  const keywordMatchScore = effectiveJdSkills.length > 0
    ? Math.min(100, Math.round((matchedSkills.length / effectiveJdSkills.length) * 100))
    : 100;

  // 2. ATS Compatibility Rule Checks
  let atsScore = 0;
  const strengths = [];
  const improvements = [];
  const suggestions = [];

  // A. Section Checks (Total 25 pts)
  let detectedSectionsCount = 0;
  const missingSections = [];
  for (const sec of ATS_SECTIONS) {
    const isPresent = sec.patterns.some(p => p.test(resume));
    if (isPresent) {
      detectedSectionsCount++;
      atsScore += 5;
    } else {
      missingSections.push(sec.name);
    }
  }

  if (detectedSectionsCount >= 4) {
    strengths.push(`Standard ATS section headings detected (${detectedSectionsCount}/5 standard sections present).`);
  } else {
    improvements.push(`Missing important resume sections: ${missingSections.join(', ')}.`);
    suggestions.push(`Add clear section headers for ${missingSections.join(' and ')} to improve ATS parsing accuracy.`);
  }

  // B. Contact Info Checks (Total 15 pts)
  const emailMatch = resume.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = resume.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/);
  const linkedinMatch = /linkedin\.com\/in\/|github\.com\//i.test(resume);

  if (emailMatch) atsScore += 8;
  if (phoneMatch) atsScore += 7;

  if (emailMatch && phoneMatch) {
    strengths.push('Essential contact information (email and phone number) clearly found.');
  } else {
    if (!emailMatch) {
      improvements.push('No email address detected in the resume text.');
      suggestions.push('Include a prominent, professional email address at the top of your resume.');
    }
    if (!phoneMatch) {
      improvements.push('No phone number detected in the resume text.');
      suggestions.push('Add a valid contact phone number in standard international or regional format.');
    }
  }

  if (linkedinMatch) {
    strengths.push('Professional portfolio/profile link (LinkedIn or GitHub) included.');
  } else {
    suggestions.push('Add your LinkedIn profile or GitHub/portfolio URL to increase recruiter engagement.');
  }

  // C. Word Count & Length (Total 15 pts)
  const wordCount = (resume.match(/\b\w+\b/g) || []).length;
  if (wordCount >= 300 && wordCount <= 1000) {
    atsScore += 15;
    strengths.push(`Optimal resume length (${wordCount} words, ideal for 1-2 pages).`);
  } else if (wordCount >= 200 && wordCount < 300) {
    atsScore += 10;
    improvements.push(`Resume is slightly brief (${wordCount} words).`);
    suggestions.push('Expand on your responsibilities, technical challenges, and achievements to reach at least 350-500 words.');
  } else if (wordCount > 1000 && wordCount <= 1500) {
    atsScore += 10;
    improvements.push(`Resume is fairly long (${wordCount} words).`);
    suggestions.push('Trim wordy descriptions and focus on high-impact accomplishments to keep the resume concise.');
  } else if (wordCount > 1500) {
    atsScore += 5;
    improvements.push(`Resume is excessively long (${wordCount} words), which may exceed ATS ideal thresholds.`);
    suggestions.push('Condense content to 1-2 pages (under 1000 words) focusing on relevant experience.');
  } else {
    atsScore += 5;
    improvements.push(`Resume text is very short (${wordCount} words).`);
    suggestions.push('Add detailed project descriptions, technical skills, and role contributions.');
  }

  // D. Bullet Points & Structure (Total 15 pts)
  const bulletMatches = resume.match(/[\u2022\u2023\u25E6\u2043\u2219\*\-]\s|[0-9]+\.\s/g) || [];
  const lineCount = resume.split(/\r?\n/).filter(l => l.trim().length > 0).length;
  const hasGoodStructure = bulletMatches.length >= 6 || (lineCount >= 15 && lineCount <= 120);

  if (bulletMatches.length >= 6) {
    atsScore += 15;
    strengths.push(`Good use of bullet points and itemized descriptions (${bulletMatches.length}+ bullet entries).`);
  } else if (bulletMatches.length >= 2 || hasGoodStructure) {
    atsScore += 10;
    improvements.push('Limited bullet points detected; some paragraphs could be more concise.');
    suggestions.push('Format experience responsibilities and achievements into bullet points for easier scanning.');
  } else {
    atsScore += 4;
    improvements.push('Dense text blocks detected without clear bullet points.');
    suggestions.push('Break down large text blocks into concise bullet points starting with strong action verbs.');
  }

  // E. Action Verbs (Total 15 pts)
  const lowerResume = resume.toLowerCase();
  const detectedVerbs = new Set();
  for (const verb of ACTION_VERBS) {
    const vRegex = new RegExp(`\\b${verb}\\b`, 'i');
    if (vRegex.test(lowerResume)) {
      detectedVerbs.add(verb);
    }
  }

  if (detectedVerbs.size >= 6) {
    atsScore += 15;
    strengths.push(`Strong action verbs used across descriptions (${detectedVerbs.size} distinct power verbs found).`);
  } else if (detectedVerbs.size >= 3) {
    atsScore += 10;
    suggestions.push('Enhance bullet points with more impactful action verbs (e.g., spearheaded, architected, automated, scaled).');
  } else {
    atsScore += 5;
    improvements.push('Few strong action verbs identified in role descriptions.');
    suggestions.push('Begin every bullet point with a decisive action verb (e.g., "Engineered", "Optimized", "Delivered") instead of passive phrasing.');
  }

  // F. Quantifiable Achievements (Total 15 pts)
  const metricRegex = /\b\d+%\b|\$\d+[\d,]*|\b\d+x\b|\b\d+\+?\s*(?:users|clients|customers|projects|team|members|downloads|requests|ms|seconds|minutes|hours|revenue|sales|leads|features|services|pipelines|endpoints|deployments)\b/gi;
  const metricMatches = resume.match(metricRegex) || [];

  if (metricMatches.length >= 4) {
    atsScore += 15;
    strengths.push(`Great quantification of results (${metricMatches.length} metrics/percentages/numbers found).`);
  } else if (metricMatches.length >= 1) {
    atsScore += 10;
    improvements.push('Some quantifiable metrics found, but more numerical proof would boost impact.');
    suggestions.push('Add specific numbers (e.g., "reduced latency by 35%", "managed team of 6", "supported 10k+ active users") to demonstrate measurable value.');
  } else {
    atsScore += 3;
    improvements.push('No measurable metrics or quantifiable results identified.');
    suggestions.push('Quantify your accomplishments using the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z].');
  }

  atsScore = Math.min(100, Math.max(0, atsScore));

  // 3. Content Quality Score (max 100)
  let contentQualityScore = 70;
  if (detectedVerbs.size >= 5) contentQualityScore += 10;
  if (metricMatches.length >= 3) contentQualityScore += 10;
  if (wordCount >= 300 && wordCount <= 900) contentQualityScore += 10;
  if (missingSections.length > 2) contentQualityScore -= 15;
  if (wordCount < 200) contentQualityScore -= 20;
  contentQualityScore = Math.min(100, Math.max(10, contentQualityScore));

  // 4. Overall Score Calculation (50% Keyword Match + 30% ATS + 20% Content Quality)
  const overallScore = Math.min(100, Math.max(0, Math.round(
    (0.50 * keywordMatchScore) + (0.30 * atsScore) + (0.20 * contentQualityScore)
  )));

  // Missing Skills suggestions
  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 5).join(', ');
    suggestions.push(`Integrate key missing skills from the job description if you have relevant experience: ${topMissing}.`);
    improvements.push(`Missing ${missingSkills.length} target skills requested by the job description.`);
  } else if (matchedSkills.length > 0) {
    strengths.push(`Excellent keyword coverage matching all ${matchedSkills.length} identified job criteria.`);
  }

  // 5. Job Match Summary
  let summary = '';
  if (overallScore >= 80) {
    summary = `Strong match (${overallScore}/100)! Your resume demonstrates high alignment with the target job requirements with a ${keywordMatchScore}% keyword match. Your ATS compatibility is solid (${atsScore}/100). Fine-tuning the highlighted suggestions will help you stand out even further.`;
  } else if (overallScore >= 60) {
    summary = `Moderate match (${overallScore}/100). Your resume covers several key qualifications (${matchedSkills.length} matched skills), but there is room for improvement in ATS formatting and aligning with missing target skills (${missingSkills.length} missing). Follow the suggestions to increase interview chances.`;
  } else {
    summary = `Low match (${overallScore}/100). Your resume currently lacks many essential skills and keywords specified in the job description (${keywordMatchScore}% match). We recommend restructuring sections, tailoring your experience to match the role keywords, and quantifying past accomplishments.`;
  }

  return {
    overallScore,
    atsScore,
    keywordMatchScore,
    contentQualityScore,
    matchedSkills,
    missingSkills,
    detectedSkills: resumeSkills,
    strengths: strengths.slice(0, 6),
    improvements: improvements.slice(0, 6),
    suggestions: suggestions.slice(0, 6),
    summary,
    analysisType: 'Local Analysis'
  };
}

/**
 * Gemini AI Analysis via native fetch
 */
async function analyzeWithGemini(apiKey, resumeText, jobDescription) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  const prompt = `You are a professional ATS Resume Evaluator and Senior Technical Recruiter.
Analyze the following candidate resume against the target job description.

RESUME TEXT:
"""
${resumeText.slice(0, 8000)}
"""

TARGET JOB DESCRIPTION:
"""
${jobDescription.slice(0, 4000)}
"""

Evaluate the match thoroughly and return ONLY a valid JSON object matching the exact schema below. Do not wrap in markdown quotes if possible, or use standard raw JSON:
{
  "overallScore": <integer from 0 to 100 representing overall suitability (50% keyword match + 30% ATS formatting + 20% quality)>,
  "atsScore": <integer from 0 to 100 evaluating ATS parseability, sections, formatting, contact info, action verbs>,
  "keywordMatchScore": <integer from 0 to 100 percentage of required JD skills/keywords found in resume>,
  "contentQualityScore": <integer from 0 to 100 evaluating bullet quality, impact, quantifiable metrics, conciseness>,
  "matchedSkills": [<array of specific strings for skills/technologies found in both resume and JD>],
  "missingSkills": [<array of specific strings for important skills/technologies in JD not found in resume>],
  "detectedSkills": [<array of specific strings for all prominent technical and professional skills detected in resume>],
  "strengths": [<array of 3 to 6 specific, evidence-based positive points regarding alignment, format, or experience>],
  "improvements": [<array of 3 to 6 critical gaps, missing keywords, or structural weaknesses>],
  "suggestions": [<array of 3 to 6 highly actionable, concrete recommendations to improve the score>],
  "summary": "<a 2-4 sentence professional executive summary of the candidate's alignment with this specific role>"
}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini API returned an empty response');
  }

  // Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(rawText.trim());
  } catch (err) {
    // If enclosed in markdown code blocks
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error('Failed to parse Gemini response as JSON');
    }
  }

  // Validate and sanitize parsed output
  const overallScore = Math.min(100, Math.max(0, parseInt(parsed.overallScore, 10) || 50));
  const atsScore = Math.min(100, Math.max(0, parseInt(parsed.atsScore, 10) || 50));
  const keywordMatchScore = Math.min(100, Math.max(0, parseInt(parsed.keywordMatchScore, 10) || 50));
  const contentQualityScore = Math.min(100, Math.max(0, parseInt(parsed.contentQualityScore, 10) || 50));

  return {
    overallScore,
    atsScore,
    keywordMatchScore,
    contentQualityScore,
    matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
    detectedSkills: Array.isArray(parsed.detectedSkills) ? parsed.detectedSkills : [],
    strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : ['Resume submitted successfully.'],
    improvements: Array.isArray(parsed.improvements) && parsed.improvements.length > 0 ? parsed.improvements : ['Review job requirements for further keyword alignment.'],
    suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0 ? parsed.suggestions : ['Tailor experience descriptions to mirror target job keywords.'],
    summary: parsed.summary || 'Resume analyzed successfully.',
    analysisType: 'AI Analysis (Gemini)'
  };
}

module.exports = {
  extractSkills,
  analyzeLocal,
  analyzeWithGemini
};
