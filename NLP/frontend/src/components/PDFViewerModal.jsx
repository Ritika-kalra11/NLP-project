import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  Download,
  Bookmark,
  Sparkles,
  MessageSquare,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';

export const PDFViewerModal = ({
  isOpen,
  onClose,
  paperId,
  initialPage = 1,
  highlightText = '',
  onOpenSummary,
  onStartChat,
}) => {
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState('');
  const [fontSizeLevel, setFontSizeLevel] = useState(1); // 0 (sm), 1 (base), 2 (lg), 3 (xl)
  const [copiedPage, setCopiedPage] = useState(false);
  const [pageInput, setPageInput] = useState('');

  useEffect(() => {
    if (isOpen && paperId) {
      setCurrentPage(initialPage || 1);
      setPageInput(String(initialPage || 1));
      setSearchTerm(highlightText || '');
      fetchPaperText(paperId);
    }
  }, [isOpen, paperId, initialPage, highlightText]);

  const fetchPaperText = async (id) => {
    setLoading(true);
    try {
      const data = await api.getPaperText(id);
      setExtractedData(data);
    } catch (err) {
      console.error('Failed to load paper text:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalPages = extractedData?.page_count || 1;
  const currentPageData = extractedData?.pages?.find((p) => p.page_number === currentPage);

  const handlePageJump = (e) => {
    e.preventDefault();
    const p = parseInt(pageInput);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const next = currentPage - 1;
      setCurrentPage(next);
      setPageInput(String(next));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      setPageInput(String(next));
    }
  };

  const copyPageContent = () => {
    if (!currentPageData?.text) return;
    navigator.clipboard.writeText(currentPageData.text);
    setCopiedPage(true);
    setTimeout(() => setCopiedPage(false), 2000);
  };

  // Render text with highlighted search or citation terms
  const renderHighlightedContent = (text, term) => {
    if (!term || !text) return text;
    try {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 50);
      const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
      return parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark
            key={i}
            className="bg-amber-300 dark:bg-amber-400 text-slate-900 px-1 py-0.5 rounded font-bold"
          >
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  const fontSizes = ['text-xs', 'text-[13.5px]', 'text-base', 'text-lg'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-5xl h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header Toolbar */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm">
          {/* Paper Title & Page Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {extractedData?.title || 'Academic Paper Document Viewer'}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-brand-600 dark:text-brand-400">
                  Page {currentPage} of {totalPages}
                </span>
                {currentPageData?.sections?.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">
                      {currentPageData.sections.join(', ')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2">
            {/* Find in Paper */}
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find in document..."
                className="w-36 lg:w-48 pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>

            {/* Direct Page Jump Form */}
            <form onSubmit={handlePageJump} className="flex items-center gap-1">
              <span className="text-xs text-slate-400 hidden sm:inline">Go to:</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                className="w-12 px-1.5 py-1 text-center rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </form>

            {/* Page Step Buttons */}
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-xs">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Font Size Adjusters */}
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-xs">
              <button
                onClick={() => setFontSizeLevel((l) => Math.max(0, l - 1))}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Decrease Font Size"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFontSizeLevel((l) => Math.min(3, l + 1))}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Increase Font Size"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Copy Page */}
            <button
              onClick={copyPageContent}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
              title="Copy Page Text"
            >
              {copiedPage ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Download / Open Original PDF in New Tab */}
            {extractedData?.file_name && (
              <a
                href={`/uploads/${extractedData.file_name}`}
                target="_blank"
                rel="noreferrer"
                download
                className="p-2 rounded-xl text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 border border-brand-200 dark:border-brand-800"
                title="Open Original PDF file in browser tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Page Display */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70 dark:bg-slate-950 flex justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-24 text-slate-400">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs">Extracting page typography & formatting...</p>
            </div>
          ) : currentPageData ? (
            <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl p-8 sm:p-14 font-serif leading-relaxed text-slate-800 dark:text-slate-200 space-y-6">
              {/* Header inside paper page */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 text-xs font-sans text-slate-400">
                <span className="uppercase tracking-wider font-bold">
                  Page {currentPage} of {totalPages}
                </span>
                {currentPageData.sections && currentPageData.sections.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold">
                    {currentPageData.sections[0]}
                  </span>
                )}
              </div>

              {/* Page Content with dynamic font size */}
              <div className={`whitespace-pre-wrap ${fontSizes[fontSizeLevel]}`}>
                {renderHighlightedContent(currentPageData.text, searchTerm)}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              No content extracted for page {currentPage}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
