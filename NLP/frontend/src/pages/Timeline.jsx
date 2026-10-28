import React, { useState, useEffect } from 'react';
import {
  Calendar,
  BookOpen,
  Layers,
  Sparkles,
  Filter,
  ChevronRight,
  Scale,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api';

export const Timeline = ({ onOpenViewer, onSelectForCompare, onStartChat, showToast }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topicFilter, setTopicFilter] = useState('');

  const quickTopics = ['All', 'Transformers', 'RAG & Hallucination', 'Generalization', 'Evaluation'];

  useEffect(() => {
    fetchTimeline();
  }, [topicFilter]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const data = await api.getTimeline({
        topic: topicFilter === 'All' ? '' : topicFilter,
      });
      setTimelineData(data);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareYearPapers = (papers) => {
    if (!papers || papers.length < 2) {
      if (showToast) showToast('At least 2 papers needed in this year to compare.', 'info');
      return;
    }
    const ids = papers.map((p) => p.id);
    onSelectForCompare(ids);
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>Chronological Research Progression Timeline</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evolution of scientific methodologies and publications across time
          </p>
        </div>

        {/* Topic Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {quickTopics.map((t) => (
            <button
              key={t}
              onClick={() => setTopicFilter(t === 'All' ? '' : t)}
              className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                (topicFilter === '' && t === 'All') || topicFilter === t
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs">Assembling chronological milestones from corpus...</p>
        </div>
      ) : timelineData.length === 0 ? (
        <div className="text-center py-20 text-slate-400 text-xs">
          No research milestones found matching current filter.
        </div>
      ) : (
        /* Timeline Feed */
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 sm:pl-8 space-y-10">
          {timelineData.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Year Marker Pin */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-brand-500/20 ring-4 ring-white dark:ring-slate-950">
                {String(item.year).slice(-2)}
              </div>

              {/* Milestone Box */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Year {item.year} Academic Benchmark
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {item.papers_count} Publication{item.papers_count > 1 ? 's' : ''}
                    </span>
                    {item.papers_count >= 2 && (
                      <button
                        onClick={() => handleCompareYearPapers(item.papers)}
                        className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1 transition-colors"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Compare All ({item.papers_count})</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic font-serif">
                  {item.summary}
                </p>

                {/* Key Methods */}
                {item.key_methods && item.key_methods.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {item.key_methods.map((method, mIdx) => (
                      <span
                        key={mIdx}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5"
                      >
                        <Layers className="w-3 h-3 text-brand-500" />
                        <span>{method}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Papers Published in this Year */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Indexed Publications in Year {item.year}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {item.papers.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs flex flex-col justify-between"
                      >
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                            {p.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {p.authors} • {p.page_count} Pages
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => onOpenViewer(p.id, 1)}
                            className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Read Document</span>
                          </button>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <button
                            onClick={() => onStartChat(p.id, `Explain the historical context and impact of "${p.title}"`)}
                            className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Ask Chat</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
