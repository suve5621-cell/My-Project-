import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, FileText, CheckCircle2, ShieldCheck, Zap, BarChart2, ArrowRight, Target, Brain, Download } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="pt-8 sm:pt-14 text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Powered by Gemini 2.0 Flash & Deterministic ATS Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
          Score & Optimize Your Resume for{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Any Job Description
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Upload your PDF or Word resume, paste the target job requirements, and get instant ATS compatibility scores, matched skills, keyword gaps, and tailored recommendations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <span>{user ? 'Go to Dashboard' : 'Start Free Analysis'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>PDF & DOCX Support</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>200+ Skills Ontology</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Exportable PDF Reports</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>PostgreSQL & Prisma Storage</span>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Engineered for Job Seekers & High-Volume Applicants
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Real text extraction and deterministic ATS heuristics eliminate guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Precise Keyword Matching
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Detects tech stack, frameworks, soft skills, and domain tools with alias mapping (e.g. JS &rarr; JavaScript, K8s &rarr; Kubernetes).
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              ATS Compatibility Audit
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Scores formatting structure, standard headings (Experience, Education, Projects), contact info, action verbs, and quantifiable metrics.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Dual-Engine Intelligence
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Leverages server-side Gemini 2.0 Flash AI with seamless fallback to our deterministic rule analyzer if offline.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-900 text-white py-16 px-4 rounded-3xl max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Instant end-to-end processing with persistent history in your private dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              1
            </div>
            <h4 className="font-bold text-base">Upload Your Resume</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload PDF or DOCX. Text is parsed securely and saved to your database history.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              2
            </div>
            <h4 className="font-bold text-base">Paste Target Job</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste the job posting description or pick from sample roles with 1 click.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              3
            </div>
            <h4 className="font-bold text-base">Get Comprehensive Report</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive score gauges, skill breakdown chips, relevance analysis, and downloadable PDF reports.
            </p>
          </div>
        </div>
      </section>

      {/* Accuracy & Disclaimer Notice */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-xs text-slate-400 leading-relaxed">
          * Notice: Resume scoring is an automated assistive tool providing data-driven estimations and heuristic recommendations. It does not guarantee employment or hiring outcomes.
        </p>
      </section>
    </div>
  );
};
