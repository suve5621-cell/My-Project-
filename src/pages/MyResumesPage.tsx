import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Resume } from '../types';
import { 
  FileText, PlusCircle, Trash2, Eye, Sparkles, 
  Calendar, CheckCircle2, AlertCircle, Loader2, X 
} from 'lucide-react';

interface MyResumesPageProps {
  onAnalyzeResume: (resumeId: string) => void;
  onUploadNew: () => void;
}

export const MyResumesPage: React.FC<MyResumesPageProps> = ({
  onAnalyzeResume,
  onUploadNew
}) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreviewResume, setSelectedPreviewResume] = useState<(Resume & { extractedText: string }) | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadResumes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getResumes();
      setResumes(res.resumes);
    } catch (err: any) {
      setError(err.message || 'Failed to load resumes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleDelete = async (id: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}" and all related analysis reports?`)) {
      return;
    }
    try {
      await api.deleteResume(id);
      loadResumes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete resume.');
    }
  };

  const handleOpenPreview = async (id: string) => {
    setPreviewLoading(true);
    try {
      const res = await api.getResume(id);
      setSelectedPreviewResume(res.resume);
    } catch (err: any) {
      alert(err.message || 'Failed to load resume details.');
    } finally {
      setPreviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading your stored resumes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Resumes
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your uploaded resumes stored securely in PostgreSQL.
          </p>
        </div>

        <button
          onClick={onUploadNew}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload New Resume</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Resumes Saved Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Upload your resume in PDF or Word (.docx) to parse its text and run automated ATS scoring.
          </p>
          <button
            onClick={onUploadNew}
            className="px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Resume Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100 flex-shrink-0">
                    {resume.fileType}
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full">
                    {resume._count?.analyses || 0} analyses
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base break-words line-clamp-2">
                  {resume.fileName}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{resume.wordCount} words extracted</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onAnalyzeResume(resume.id)}
                  className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze</span>
                </button>

                <button
                  onClick={() => handleOpenPreview(resume.id)}
                  title="View Extracted Text"
                  className="p-2.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(resume.id, resume.fileName)}
                  title="Delete Resume"
                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Extracted Text Modal */}
      {selectedPreviewResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="min-w-0 pr-4">
                <h3 className="text-lg font-bold text-slate-900 truncate">
                  {selectedPreviewResume.fileName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedPreviewResume.wordCount} words &bull; Stored in database
                </p>
              </div>
              <button
                onClick={() => setSelectedPreviewResume(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
              {selectedPreviewResume.extractedText}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPreviewResume(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
