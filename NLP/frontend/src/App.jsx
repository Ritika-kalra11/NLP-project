import React, { useState, useEffect } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { PaperLibrary } from './pages/PaperLibrary';
import { ResearchChat } from './pages/ResearchChat';
import { ComparePapers } from './pages/ComparePapers';
import { ResearchGaps } from './pages/ResearchGaps';
import { SemanticSearch } from './pages/SemanticSearch';
import { KnowledgeGraph } from './pages/KnowledgeGraph';
import { Timeline } from './pages/Timeline';
import { CitationMap } from './pages/CitationMap';
import { Evaluation } from './pages/Evaluation';
import { Settings } from './pages/Settings';

import { PDFViewerModal } from './components/PDFViewerModal';
import { UploadModal } from './components/UploadModal';
import { SummaryModal } from './components/SummaryModal';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

export const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modals state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerState, setViewerState] = useState({
    isOpen: false,
    paperId: null,
    initialPage: 1,
    highlightText: '',
  });
  const [summaryState, setSummaryState] = useState({
    isOpen: false,
    paper: null,
  });

  // Cross-page navigation state
  const [chatInitialPaperId, setChatInitialPaperId] = useState(null);
  const [chatInitialPrompt, setChatInitialPrompt] = useState('');
  const [compareInitialIds, setCompareInitialIds] = useState([]);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Global Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Keyboard shortcut Ctrl+K to jump to search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveTab('search');
        showToast('Switched to Semantic Search (Ctrl+K)', 'info');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenViewer = (paperId, initialPage = 1, highlightText = '') => {
    setViewerState({
      isOpen: true,
      paperId,
      initialPage: initialPage || 1,
      highlightText: highlightText || '',
    });
  };

  const handleOpenSummary = (paper) => {
    setSummaryState({
      isOpen: true,
      paper,
    });
  };

  const handleStartChat = (paperId = null, prompt = '') => {
    setChatInitialPaperId(paperId);
    setChatInitialPrompt(prompt);
    setActiveTab('chat');
  };

  const handleSelectForCompare = (paperIds) => {
    const ids = Array.isArray(paperIds) ? paperIds : [paperIds];
    setCompareInitialIds(ids);
    setActiveTab('compare');
    showToast(`Loaded ${ids.length} paper${ids.length > 1 ? 's' : ''} into Comparative Analysis`, 'info');
  };

  const handleSearchTopic = (topicQuery) => {
    setSearchInitialQuery(topicQuery);
    setActiveTab('search');
  };

  const handleUploadComplete = (response) => {
    setRefreshTrigger((prev) => prev + 1);
    showToast('Papers successfully uploaded, analyzed & indexed!', 'success');
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            setActiveTab={setActiveTab}
            onOpenUpload={() => setUploadOpen(true)}
            onOpenViewer={handleOpenViewer}
            onOpenSummary={handleOpenSummary}
            onStartChat={handleStartChat}
            onSelectForCompare={handleSelectForCompare}
            onSearchTopic={handleSearchTopic}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'papers':
        return (
          <PaperLibrary
            onOpenViewer={handleOpenViewer}
            onOpenSummary={handleOpenSummary}
            onStartChatWithPaper={handleStartChat}
            onSelectForCompare={handleSelectForCompare}
            onOpenUpload={() => setUploadOpen(true)}
            refreshTrigger={refreshTrigger}
            showToast={showToast}
          />
        );
      case 'chat':
        return (
          <ResearchChat
            initialPaperId={chatInitialPaperId}
            initialPrompt={chatInitialPrompt}
            onOpenViewer={handleOpenViewer}
            onOpenSummary={handleOpenSummary}
            showToast={showToast}
          />
        );
      case 'compare':
        return (
          <ComparePapers
            onOpenViewer={handleOpenViewer}
            initialPaperIds={compareInitialIds}
            showToast={showToast}
          />
        );
      case 'gaps':
        return (
          <ResearchGaps
            onOpenViewer={handleOpenViewer}
            onStartChat={handleStartChat}
            showToast={showToast}
          />
        );
      case 'search':
        return (
          <SemanticSearch
            onOpenViewer={handleOpenViewer}
            onStartChat={handleStartChat}
            initialQuery={searchInitialQuery}
            showToast={showToast}
          />
        );
      case 'citations':
        return (
          <CitationMap
            onOpenViewer={handleOpenViewer}
            onOpenSummary={handleOpenSummary}
            onStartChat={handleStartChat}
            onSelectForCompare={handleSelectForCompare}
            showToast={showToast}
          />
        );
      case 'graph':
        return (
          <KnowledgeGraph
            onOpenViewer={handleOpenViewer}
            onOpenSummary={handleOpenSummary}
            onStartChat={handleStartChat}
            showToast={showToast}
          />
        );
      case 'timeline':
        return (
          <Timeline
            onOpenViewer={handleOpenViewer}
            onSelectForCompare={handleSelectForCompare}
            onStartChat={handleStartChat}
            showToast={showToast}
          />
        );
      case 'evaluation':
        return <Evaluation showToast={showToast} />;
      case 'settings':
        return <Settings showToast={showToast} />;
      default:
        return (
          <Dashboard
            setActiveTab={setActiveTab}
            onOpenUpload={() => setUploadOpen(true)}
            onOpenViewer={handleOpenViewer}
            onOpenSummary={handleOpenSummary}
            onStartChat={handleStartChat}
            onSelectForCompare={handleSelectForCompare}
            onSearchTopic={handleSearchTopic}
            refreshTrigger={refreshTrigger}
          />
        );
    }
  };

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onOpenUpload={() => setUploadOpen(true)}
    >
      {renderActivePage()}

      {/* Global Interactive Modals */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadSuccess={handleUploadComplete}
      />

      <PDFViewerModal
        isOpen={viewerState.isOpen}
        onClose={() => setViewerState((prev) => ({ ...prev, isOpen: false }))}
        paperId={viewerState.paperId}
        initialPage={viewerState.initialPage}
        highlightText={viewerState.highlightText}
        onOpenSummary={handleOpenSummary}
        onStartChat={handleStartChat}
      />

      <SummaryModal
        isOpen={summaryState.isOpen}
        onClose={() => setSummaryState((prev) => ({ ...prev, isOpen: false }))}
        paper={summaryState.paper}
        onOpenViewer={handleOpenViewer}
        onStartChat={handleStartChat}
      />

      {/* Global Floating Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold backdrop-blur-md border ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-800'
                : 'bg-slate-900/95 text-slate-100 border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-brand-400 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </MainLayout>
  );
};
