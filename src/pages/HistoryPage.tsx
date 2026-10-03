import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { AnalysisSummaryItem } from '../types';
import { 
  Clock, Search, Trash2, ArrowRight, Sparkles, 
  FileText, AlertCircle, Loader2, PlusCircle 
} from 'lucide-react';

interface HistoryPageProps {
  onViewAnalysis: (analysisId: string) => void;
  onNewAnalysis: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onViewAnalysis,
  onNewAnalysis
}) => {
  const [analyses, setAnalyses] = useState<AnalysisSummaryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalyses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAnalyses();
      setAnalyses(res.analyses);
    } catch (err: any) {
      setError(err.message || 'Failed to load analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this analysis report?')) return;
    try {
      await api.deleteAnalysis(id);
      loadAnalyses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete analysis record.');
    }
  };

  const filteredAnalyses = analyses.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      a.resumeName.toLowerCase().includes(q) ||
      a.jobSnippet.toLowerCase().includes(q) ||
      a.analysisType.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading analysis history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analysis History
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review past resume evaluations and compare scores across job postings.
          </p>
        </div>

        <button
          onClick={onNewAnalysis}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Analysis</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Filter */}
      {analyses.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by resume name or job role..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
          />
        </div>
      )}

      {analyses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No History Found</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Run your first job matching analysis to view your reports and score breakdown here.
          </p>
          <button
            onClick={onNewAnalysis}
            className="px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create First Analysis</span>
          </button>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          No analyses matched your search term "{searchTerm}".
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnalyses.map((a) => {
            const isAi = a.analysisType.includes('AI');
            return (
              <div
                key={a.id}
                onClick={() => onViewAnalysis(a.id)}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
              >
                {/* Left Side: Resume & Job Snippet */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        isAi
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{a.analysisType}</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(a.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors truncate">
                      {a.resumeName}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl">
                    {a.jobSnippet}
                  </p>
                </div>

                {/* Right Side: Scores & Actions */}
                <div className="flex items-center gap-4 sm:gap-6 self-end md:self-auto flex-shrink-0">
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-blue-600 leading-none">
                      {a.overallScore}<span className="text-xs font-semibold text-slate-400">/100</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      ATS: {a.atsScore}% &bull; Match: {a.jobMatchPercentage}%
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewAnalysis(a.id)}
                      className="px-4 py-2 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                    >
                      <span>Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(a.id, e)}
                      title="Delete Analysis"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
