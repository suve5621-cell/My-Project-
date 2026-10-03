import React, { useState, useRef } from 'react';
import { api } from '../api';
import { Resume } from '../types';
import { Upload, FileText, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface ResumeUploaderProps {
  onUploadSuccess: (resume: Resume) => void;
  selectedResume?: Resume | null;
  onClearResume?: () => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onUploadSuccess,
  selectedResume,
  onClearResume
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExtractedPreview, setShowExtractedPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = async (file: File) => {
    setError(null);
    const validExtensions = ['.pdf', '.docx'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setError('Invalid file format. Please upload a PDF (.pdf) or Word document (.docx).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.`);
      return;
    }

    setUploading(true);
    try {
      const res = await api.uploadResume(file);
      onUploadSuccess(res.resume);
    } catch (err: any) {
      setError(err.message || 'Failed to upload and parse resume file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!selectedResume ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <div className="text-sm font-semibold text-slate-800">
                Extracting text and saving to database...
              </div>
              <div className="text-xs text-slate-500">
                Parsing PDF/DOCX structure & text streams
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <span className="font-semibold text-slate-900 text-base hover:underline">
                  Click to upload resume
                </span>{' '}
                <span className="text-slate-600 text-sm">or drag and drop</span>
              </div>
              <p className="text-xs text-slate-500">
                Supports PDF or Word (.docx) &bull; Max 5MB
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-sm sm:text-base truncate">
                  {selectedResume.fileName}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="font-medium text-blue-600">{selectedResume.fileType}</span>
                  <span>&bull;</span>
                  <span>{(selectedResume.fileSize / 1024).toFixed(1)} KB</span>
                  <span>&bull;</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedResume.wordCount} words extracted
                  </span>
                </div>
              </div>
            </div>

            {onClearResume && (
              <button
                onClick={onClearResume}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
              >
                Change File
              </button>
            )}
          </div>

          {/* Extracted Text Collapsible Preview */}
          {selectedResume.extractedText && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              <button
                type="button"
                onClick={() => setShowExtractedPreview(!showExtractedPreview)}
                className="w-full px-4 py-2.5 bg-slate-100/80 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>Extracted Resume Text Preview</span>
                {showExtractedPreview ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {showExtractedPreview && (
                <div className="p-3 bg-white max-h-48 overflow-y-auto text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap border-t border-slate-200">
                  {selectedResume.extractedText}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
