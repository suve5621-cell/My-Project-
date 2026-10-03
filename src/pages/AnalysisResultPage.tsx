import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Analysis } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';
import jsPDF from 'jspdf';
import { 
  Sparkles, FileText, CheckCircle2, AlertTriangle, Lightbulb, 
  Download, ArrowLeft, PlusCircle, Target, Briefcase, 
  GraduationCap, FolderGit2, Loader2, Check, X, Printer 
} from 'lucide-react';

interface AnalysisResultPageProps {
  analysisId: string;
  onBack: () => void;
  onAnalyzeAnother: (resumeId?: string) => void;
}

export const AnalysisResultPage: React.FC<AnalysisResultPageProps> = ({
  analysisId,
  onBack,
  onAnalyzeAnother
}) => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const res = await api.getAnalysis(analysisId);
        setAnalysis(res.analysis);
      } catch (err: any) {
        setError(err.message || 'Failed to load analysis record.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [analysisId]);

  // Export clean PDF report
  const handleDownloadPDF = () => {
    if (!analysis) return;

    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text('AI Resume & ATS Analysis Report', margin, y);

    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date(analysis.createdAt).toLocaleString()} | Engine: ${analysis.analysisType}`, margin, y);

    y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, 190, y);
    y += 10;

    // Scores Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text('1. Evaluation Scores', margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`• Overall Match Score: ${analysis.overallScore}/100`, margin + 5, y);
    y += 6;
    doc.text(`• ATS Parseability Score: ${analysis.atsScore}/100`, margin + 5, y);
    y += 6;
    doc.text(`• Job Match Percentage: ${analysis.jobMatchPercentage}%`, margin + 5, y);
    y += 10;

    // Matched & Missing Skills
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text('2. Skills Breakdown', margin, y);
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(22, 101, 52);
    doc.text('Matched Skills:', margin + 5, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const matchedStr = analysis.matchedSkills.length > 0 ? analysis.matchedSkills.join(', ') : 'None identified';
    const splitMatched = doc.splitTextToSize(matchedStr, 160);
    doc.text(splitMatched, margin + 5, y + 5);
    y += 7 + splitMatched.length * 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(185, 28, 28);
    doc.text('Missing Skills from Job Posting:', margin + 5, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const missingStr = analysis.missingSkills.length > 0 ? analysis.missingSkills.join(', ') : 'None identified';
    const splitMissing = doc.splitTextToSize(missingStr, 160);
    doc.text(splitMissing, margin + 5, y + 5);
    y += 7 + splitMissing.length * 4 + 4;

    // Relevance Summary
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text('3. Relevance Assessment', margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const expText = doc.splitTextToSize(`• Experience: ${analysis.experienceRelevance}`, 165);
    doc.text(expText, margin + 5, y);
    y += expText.length * 4 + 2;

    const eduText = doc.splitTextToSize(`• Education: ${analysis.educationRelevance}`, 165);
    doc.text(eduText, margin + 5, y);
    y += eduText.length * 4 + 2;

    const projText = doc.splitTextToSize(`• Projects: ${analysis.projectRelevance}`, 165);
    doc.text(projText, margin + 5, y);
    y += projText.length * 4 + 8;

    // Key Suggestions
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text('4. Actionable Next Steps', margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    analysis.suggestions.slice(0, 5).forEach((sug) => {
      const splitSug = doc.splitTextToSize(`• ${sug}`, 165);
      doc.text(splitSug, margin + 5, y);
      y += splitSug.length * 4 + 2;
    });

    // Save
    doc.save(`Resume-Analysis-Report-${analysis.id.slice(0, 8)}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading analysis report...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Analysis Not Found</h2>
        <p className="text-slate-500 text-sm">{error || 'This analysis record could not be loaded.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isAi = analysis.analysisType.includes('AI');

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isAi
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{analysis.analysisType}</span>
            </span>

            <span className="text-xs text-slate-400">
              {new Date(analysis.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Match Report for {analysis.resume?.fileName || 'Resume'}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download PDF Report</span>
          </button>

          <button
            onClick={() => onAnalyzeAnother(analysis.resumeId)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Analyze Another Role</span>
          </button>
        </div>
      </div>

      {/* Scores KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Overall Score */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Overall Score
          </span>
          <ScoreGauge score={analysis.overallScore} size={130} />
          <p className="text-[11px] text-slate-400 mt-2">
            Weighted: 35% skills, 20% ATS, 20% exp, 25% format
          </p>
        </div>

        {/* ATS Parseability */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                ATS Compatibility
              </span>
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {analysis.atsScore}<span className="text-sm font-semibold text-slate-400">/100</span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${analysis.atsScore}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Evaluates standard sections, contact details, and ATS layout.
            </p>
          </div>
        </div>

        {/* Job Match Percentage */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Job Match Rate
              </span>
              <Briefcase className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {analysis.jobMatchPercentage}%
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${analysis.jobMatchPercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {analysis.matchedSkills.length} matched vs {analysis.missingSkills.length} missing skills.
            </p>
          </div>
        </div>

        {/* Detected Skills Total */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Resume Skills Found
              </span>
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {analysis.detectedSkills.length}
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="text-xs text-slate-500">
              Total technical and professional skills recognized from resume text.
            </div>
          </div>
        </div>
      </div>

      {/* Skills Breakdown Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Skills & Keyword Match Analysis</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed comparison between requirements extracted from the job description and your resume text.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Matched Skills */}
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Matched Skills ({analysis.matchedSkills.length})
              </h4>
            </div>
            <p className="text-xs text-slate-600">Skills present in both your resume and the job posting.</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {analysis.matchedSkills.length > 0 ? (
                analysis.matchedSkills.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-full shadow-2xs"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No skills matched directly.</span>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Missing Skills ({analysis.missingSkills.length})
              </h4>
            </div>
            <p className="text-xs text-slate-600">Important job requirements not found in your resume.</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {analysis.missingSkills.length > 0 ? (
                analysis.missingSkills.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-rose-300 text-rose-800 text-xs font-semibold rounded-full shadow-2xs"
                  >
                    <X className="w-3 h-3 text-rose-600" />
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-600 font-semibold">
                  ✓ All major job requirements matched!
                </span>
              )}
            </div>
          </div>

          {/* All Detected Skills */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                All Detected Skills ({analysis.detectedSkills.length})
              </h4>
            </div>
            <p className="text-xs text-slate-600">Total skills extracted from your resume content.</p>
            <div className="flex flex-wrap gap-1.5 pt-1 max-h-40 overflow-y-auto">
              {analysis.detectedSkills.map((s, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Relevance Assessments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Experience Alignment</h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {analysis.experienceRelevance}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Education Alignment</h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {analysis.educationRelevance}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Project Impact</h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {analysis.projectRelevance}
          </p>
        </div>
      </div>

      {/* Deep Feedback Cards: Strengths, Improvements, Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Resume Strengths</h3>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
            {analysis.strengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to Improve */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Areas for Improvement</h3>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
            {analysis.areasToImprove.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable Suggestions */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Actionable Next Steps</h3>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
            {analysis.suggestions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-blue-600 font-bold mt-0.5">&rarr;</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
