import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Resume } from '../types';
import { ResumeUploader } from '../components/ResumeUploader';
import { 
  Sparkles, FileText, Upload, PlusCircle, CheckCircle2, 
  AlertCircle, Loader2, ArrowRight, Zap, Target, BookOpen 
} from 'lucide-react';

interface NewAnalysisPageProps {
  initialResumeId?: string;
  onAnalysisComplete: (analysisId: string) => void;
}

const SAMPLE_ROLES = [
  {
    id: 'frontend',
    title: 'Senior Frontend Engineer (React / TypeScript)',
    text: `Senior Frontend Engineer (React / TypeScript)
We are seeking a talented Senior Frontend Engineer to build responsive, high-performance web applications.
Key Requirements:
- 4+ years of professional experience with JavaScript (ES6+), TypeScript, React, and Next.js.
- Deep expertise in HTML5, CSS3, Tailwind CSS, SASS, and responsive design principles.
- Experience with state management (Redux Toolkit, Zustand) and REST API / GraphQL integration.
- Proficiency in automated testing using Jest, Cypress, or Playwright.
- Strong knowledge of Git, Webpack, Vite, CI/CD pipelines, and performance optimization.
- Excellent communication, collaboration, problem solving, and agile methodology experience.`
  },
  {
    id: 'fullstack',
    title: 'Full Stack Developer (Node.js + React + Cloud)',
    text: `Full Stack Developer (Node.js + React + Cloud)
Looking for a Full Stack Software Engineer to build scalable microservices and intuitive user interfaces.
Responsibilities & Skills:
- Proficiency in JavaScript, TypeScript, Node.js, Express.js, and React.
- Solid experience with databases: PostgreSQL, MySQL, MongoDB, and Redis caching.
- Hands-on experience with Docker containerization, Kubernetes, and AWS (EC2, S3, RDS, Lambda).
- Experience designing and consuming RESTful APIs, WebSockets, and OAuth/JWT authentication.
- Familiarity with Git, Linux environments, Unit Testing, and Agile/Scrum practices.
- Strong analytical skills, teamwork, attention to detail, and problem solving.`
  },
  {
    id: 'backend',
    title: 'Backend & Cloud Infrastructure Engineer (Python / AWS)',
    text: `Backend & Cloud Infrastructure Engineer (Python / Go / AWS)
We are looking for a Backend Engineer to scale our distributed systems and data pipelines.
Required Qualifications:
- 3+ years experience with Python (Django, FastAPI), Go, or Java (Spring Boot).
- Deep knowledge of relational and NoSQL databases (PostgreSQL, MongoDB, DynamoDB, Redis).
- Strong background in Cloud computing (AWS or GCP), Docker, Kubernetes, Terraform, and CI/CD.
- Experience building high-throughput microservices, gRPC, Apache Kafka, and message queues.
- Solid grasp of Data Structures, Algorithms, System Design, and Clean Code principles.
- Excellent critical thinking, mentorship, and documentation skills.`
  },
  {
    id: 'data',
    title: 'Data Scientist & AI Engineer (Python / RAG / ML)',
    text: `Data Scientist & Machine Learning Engineer (Python / AI / RAG)
Join our AI team to research, build, and deploy production-grade machine learning models and LLM solutions.
Requirements:
- Strong programming skills in Python, SQL, and data analysis libraries (Pandas, NumPy, Scikit-Learn).
- Hands-on experience with Deep Learning frameworks: PyTorch, TensorFlow, Keras.
- Expertise in Generative AI, Large Language Models (LLMs), LangChain, RAG pipelines, and vector databases.
- Experience deploying ML models to AWS/GCP using Docker, FastAPI, and MLflow.
- Proficient in data visualization with Tableau or Power BI.
- Strong mathematical background, analytical problem solving, and effective communication skills.`
  }
];

export const NewAnalysisPage: React.FC<NewAnalysisPageProps> = ({
  initialResumeId,
  onAnalysisComplete
}) => {
  const [existingResumes, setExistingResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'select'>('upload');

  const steps = [
    'Parsing technical ontology & skill aliases...',
    'Evaluating ATS section architecture & readability...',
    'Synthesizing keyword relevance & experience alignment...',
    'Generating structured recommendations & score gauge...'
  ];

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.getResumes();
        setExistingResumes(res.resumes);
        if (initialResumeId) {
          const matched = res.resumes.find(r => r.id === initialResumeId);
          if (matched) {
            setSelectedResume(matched);
            setMode('select');
          }
        } else if (res.resumes.length > 0) {
          // If resumes exist, default can still be upload or select
        }
      } catch (err) {
        console.error('Failed to load existing resumes:', err);
      } finally {
        setLoadingResumes(false);
      }
    };
    fetchResumes();
  }, [initialResumeId]);

  useEffect(() => {
    let interval: any;
    if (analyzing) {
      interval = setInterval(() => {
        setAnalysisStep(prev => (prev + 1) % steps.length);
      }, 900);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  const handleAnalyze = async () => {
    if (!selectedResume) {
      setError('Please upload or select a resume first.');
      return;
    }
    if (jobDescription.trim().length < 50) {
      setError('Job description must be at least 50 characters long.');
      return;
    }

    setError(null);
    setAnalyzing(true);

    try {
      const res = await api.createAnalysis(selectedResume.id, jobDescription.trim());
      onAnalysisComplete(res.analysis.id);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
      setAnalyzing(false);
    }
  };

  const isFormValid = selectedResume !== null && jobDescription.trim().length >= 50;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Resume Evaluation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Analyze Resume Against Job Description
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload or pick a saved resume, provide the job description, and let our ATS engine evaluate the fit.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {/* Analysis Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
        {/* Step 1: Resume Source */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-slate-900 text-base">Select or Upload Resume</h3>
            </div>

            {existingResumes.length > 0 && (
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode('upload')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mode === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload New File
                </button>
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mode === 'select' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pick from Stored ({existingResumes.length})
                </button>
              </div>
            )}
          </div>

          {mode === 'upload' ? (
            <ResumeUploader
              selectedResume={selectedResume}
              onUploadSuccess={(resume) => {
                setSelectedResume(resume);
                setExistingResumes(prev => [resume, ...prev]);
              }}
              onClearResume={() => setSelectedResume(null)}
            />
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                {existingResumes.map((r) => {
                  const isSelected = selectedResume?.id === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedResume(r)}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-slate-900 text-sm truncate">
                          {r.fileName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-blue-600">{r.fileType}</span>
                          <span>&bull;</span>
                          <span>{r.wordCount} words</span>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Job Description */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-base">Target Job Description</h3>
            </div>

            {/* Quick Sample Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Presets:
              </span>
              {SAMPLE_ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setJobDescription(role.text)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
                >
                  {role.id === 'frontend' ? 'Frontend' : role.id === 'fullstack' ? 'Full Stack' : role.id === 'backend' ? 'Backend' : 'AI / Data'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description, responsibilities, and required qualifications here (minimum 50 characters)..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-y"
            />
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
              <span>{jobDescription.trim().length} / 50 minimum characters</span>
              <span className={jobDescription.trim().length >= 50 ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
                {jobDescription.trim().length >= 50 ? '✓ Ready' : 'Minimum 50 chars required'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button & Loading Overlay */}
        <div className="pt-4 border-t border-slate-100 flex flex-col items-center">
          {analyzing ? (
            <div className="w-full py-8 text-center bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4 animate-fade-in">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-blue-200 animate-pulse-ring" />
                <div className="relative w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Analyzing Content Match</h4>
                <p className="text-xs font-semibold text-blue-700 mt-1">{steps[analysisStep]}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAnalyze}
              disabled={!isFormValid}
              className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Analyze Resume Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
