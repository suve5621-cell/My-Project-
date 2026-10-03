import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Resume, AnalysisSummaryItem } from '../types';
import { 
  FileText, PlusCircle, BarChart3, Clock, Sparkles, 
  ArrowRight, Trash2, CheckCircle2, TrendingUp, AlertCircle, Loader2 
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (view: string, id?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resumesRes, analysesRes] = await Promise.all([
        api.getResumes(),
        api.getAnalyses()
      ]);
      setResumes(resumesRes.resumes);
      setAnalyses(analysesRes.analyses);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume and its analysis history?')) return;
    try {
      await api.deleteResume(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete resume.');
    }
  };

  const avgScore = analyses.length > 0
    ? Math.round(analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length)
    : 0;

  const totalMatchedSkills = analyses.reduce((sum, a) => sum + (a.matchedCount || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Resume Optimization Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Job Seeker'}!
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            You have analyzed {analyses.length} job matching scenarios across {resumes.length} stored resumes.
          </p>
        </div>

        <button
          onClick={() => onNavigate('new-analysis')}
          className="px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm rounded-2xl shadow-md transition-all hover:scale-105 flex items-center gap-2 flex-shrink-0"
        >
          <PlusCircle className="w-5 h-5 text-blue-600" />
          <span>New Analysis</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Resumes</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {resumes.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Saved in database</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Analyses Run</span>
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {analyses.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Job role evaluations</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Overall Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {avgScore > 0 ? `${avgScore}/100` : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all past reports</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Matched Skills</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {totalMatchedSkills}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Verified competencies</div>
        </div>
      </div>

      {/* Main Content Grid: Resumes & Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Uploaded Resumes */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-lg">My Resumes</h3>
              </div>
              <button
                onClick={() => onNavigate('resumes')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {resumes.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No resumes uploaded yet</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Upload your first resume in PDF or DOCX to start analyzing.
                </p>
                <button
                  onClick={() => onNavigate('new-analysis')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  Upload Resume
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200 rounded-2xl flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {r.fileType}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">
                          {r.fileName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{r.wordCount} words</span>
                          <span>&bull;</span>
                          <span>{r._count?.analyses || 0} analyses</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('new-analysis', r.id)}
                        className="px-3 py-1.5 bg-white hover:bg-blue-600 hover:text-white text-blue-600 text-xs font-bold rounded-lg border border-slate-200 hover:border-blue-600 transition-all shadow-sm"
                      >
                        Analyze
                      </button>
                      <button
                        onClick={(e) => handleDeleteResume(r.id, e)}
                        title="Delete resume"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-lg">Recent Analyses</h3>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {analyses.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No analyses generated yet</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Match your resume with any job posting to see ATS scores.
                </p>
                <button
                  onClick={() => onNavigate('new-analysis')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  Analyze a Job
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {analyses.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    onClick={() => onNavigate('result', a.id)}
                    className="p-3.5 bg-slate-50/70 hover:bg-blue-50/50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="font-bold text-slate-900 text-sm truncate">
                        {a.resumeName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5 max-w-xs">
                        {a.jobSnippet}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-blue-600">
                          {a.overallScore}/100
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ATS: {a.atsScore}%
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
