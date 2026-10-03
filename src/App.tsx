import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './pages/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewAnalysisPage } from './pages/NewAnalysisPage';
import { AnalysisResultPage } from './pages/AnalysisResultPage';
import { MyResumesPage } from './pages/MyResumesPage';
import { HistoryPage } from './pages/HistoryPage';

export const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<string>('landing');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | undefined>(undefined);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // If user logs in, transition from landing to dashboard
  React.useEffect(() => {
    if (!loading && user && activeView === 'landing') {
      setActiveView('dashboard');
    }
  }, [user, loading, activeView]);

  const handleNavigate = (view: string, id?: string) => {
    if (!user && view !== 'landing') {
      setIsAuthModalOpen(true);
      return;
    }

    if (view === 'result' && id) {
      setSelectedAnalysisId(id);
      setActiveView('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'new-analysis') {
      setSelectedResumeId(id);
      setActiveView('new-analysis');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeView === 'landing' && (
          <LandingPage
            onStart={() => {
              if (user) {
                setActiveView('dashboard');
              } else {
                handleOpenAuth('register');
              }
            }}
          />
        )}

        {activeView === 'dashboard' && (
          <DashboardPage onNavigate={handleNavigate} />
        )}

        {activeView === 'new-analysis' && (
          <NewAnalysisPage
            initialResumeId={selectedResumeId}
            onAnalysisComplete={(analysisId) => {
              setSelectedAnalysisId(analysisId);
              setActiveView('result');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeView === 'result' && selectedAnalysisId && (
          <AnalysisResultPage
            analysisId={selectedAnalysisId}
            onBack={() => setActiveView('dashboard')}
            onAnalyzeAnother={(resumeId) => {
              setSelectedResumeId(resumeId);
              setActiveView('new-analysis');
            }}
          />
        )}

        {activeView === 'resumes' && (
          <MyResumesPage
            onAnalyzeResume={(resumeId) => {
              setSelectedResumeId(resumeId);
              setActiveView('new-analysis');
            }}
            onUploadNew={() => {
              setSelectedResumeId(undefined);
              setActiveView('new-analysis');
            }}
          />
        )}

        {activeView === 'history' && (
          <HistoryPage
            onViewAnalysis={(analysisId) => {
              setSelectedAnalysisId(analysisId);
              setActiveView('result');
            }}
            onNewAnalysis={() => {
              setSelectedResumeId(undefined);
              setActiveView('new-analysis');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            AI Resume Scorer &bull; Full-Stack Resume Analysis & Job Matching System
          </p>
          <p className="text-slate-400">
            Automated estimates for guidance & optimization purposes &bull; Built with React, TypeScript, Express, PostgreSQL & Prisma
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setActiveView('dashboard');
        }}
      />
    </div>
  );
};
