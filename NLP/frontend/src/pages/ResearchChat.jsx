import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  MessageSquare,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  RefreshCw,
  BookOpen,
  Filter,
  Bot,
  User,
  ShieldCheck,
  Clock,
  ArrowRight,
  Download,
  Share2,
  X,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import { CitationCard } from '../components/CitationCard';
import { WhyThisAnswerModal } from '../components/WhyThisAnswerModal';

export const ResearchChat = ({
  initialPaperId,
  initialPrompt,
  onOpenViewer,
  onOpenSummary,
  showToast,
}) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [papers, setPapers] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState(initialPaperId || null);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeWhyData, setActiveWhyData] = useState(null);
  const [activeWhyQuery, setActiveWhyQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (initialPaperId) {
      setSelectedPaperId(initialPaperId);
    }
  }, [initialPaperId]);

  useEffect(() => {
    if (initialPrompt) {
      setInputQuery(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId);
    }
  }, [currentConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const fetchInitialData = async () => {
    try {
      const [convs, paperList] = await Promise.all([
        api.getConversations(),
        api.getPapers(),
      ]);
      setConversations(convs);
      setPapers(paperList);

      if (convs.length > 0 && !currentConversationId) {
        setCurrentConversationId(convs[0].id);
      }
    } catch (err) {
      console.error('Failed to load initial chat data:', err);
    }
  };

  const loadConversation = async (id) => {
    try {
      const data = await api.getConversation(id);
      setMessages(data.messages || []);
      setSelectedPaperId(data.paper_id);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const startNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setInputQuery('');
    if (showToast) showToast('Started new research conversation thread', 'info');
  };

  const handleDeleteConversation = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConversationId === id) {
        startNewChat();
      }
      if (showToast) showToast('Conversation thread removed', 'info');
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (queryToSend = null) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || loading) return;

    setInputQuery('');
    setLoading(true);

    // Optimistic user message
    const tempUserMsg = {
      id: Date.now(),
      sender: 'user',
      content: q,
      citations: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await api.sendChat({
        query: q,
        conversation_id: currentConversationId,
        paper_id: selectedPaperId ? parseInt(selectedPaperId) : null,
        top_k: 5,
        similarity_threshold: 0.15,
        use_hybrid_search: true,
        use_reranking: true,
      });

      if (!currentConversationId && response.conversation_id) {
        setCurrentConversationId(response.conversation_id);
        const convs = await api.getConversations();
        setConversations(convs);
      }

      setMessages((prev) => [...prev, response]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        content: `Error: ${err.message || 'Unable to retrieve answer from papers.'}`,
        citations: [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyAnswer = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    if (showToast) showToast('Answer copied to clipboard!', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const lines = [
      '# ResearchAI Conversation Export',
      `Date: ${new Date().toLocaleString()}`,
      `Scope: ${selectedPaperObj ? selectedPaperObj.title : 'All Uploaded Papers'}`,
      '---',
      '',
    ];

    messages.forEach((m) => {
      if (m.sender === 'user') {
        lines.push(`### User:\n${m.content}\n`);
      } else {
        lines.push(`### ResearchAI Assistant:\n${m.content}\n`);
        if (m.citations && m.citations.length > 0) {
          lines.push('**Sources Referenced:**');
          m.citations.forEach((c) => {
            lines.push(`- [${c.citation_index}] "${c.paper_title}", Page ${c.page_number} (${c.section_name})`);
            lines.push(`  > "${c.snippet}"`);
          });
          lines.push('');
        }
      }
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research_chat_${Date.now()}.md`;
    a.click();
    if (showToast) showToast('Conversation exported as Markdown!', 'success');
  };

  const selectedPaperObj = papers.find((p) => p.id === parseInt(selectedPaperId));

  // Render assistant content with clickable [1], [2] citation badges
  const renderInteractiveContent = (text, citations = []) => {
    if (!text) return null;
    const regex = /\[(\d+(?:,\s*\d+)*)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const indices = match[1].split(',').map((s) => parseInt(s.trim()));
      indices.forEach((idx, i) => {
        const cit = citations.find((c) => c.citation_index === idx);
        parts.push(
          <button
            key={`${match.index}-${i}`}
            onClick={() => {
              if (cit) {
                onOpenViewer(cit.paper_id, cit.page_number, cit.snippet);
              }
            }}
            title={
              cit
                ? `Jump to ${cit.paper_title}, Page ${cit.page_number} (${cit.section_name})`
                : `Citation [${idx}]`
            }
            className="inline-flex items-center justify-center mx-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold bg-brand-100 hover:bg-brand-600 text-brand-800 hover:text-white dark:bg-brand-950 dark:text-brand-300 dark:hover:bg-brand-500 dark:hover:text-white transition-all transform hover:scale-105 shadow-xs border border-brand-300/60 dark:border-brand-700/60 cursor-pointer align-baseline"
          >
            [{idx}]
          </button>
        );
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50/50 dark:bg-slate-950 animate-in fade-in duration-150">
      {/* Conversations History Sidebar */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col justify-between">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Research Chat</span>
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleExportChat}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-brand-500" />
              <span>Export Conversation</span>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <span className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Recent Threads
          </span>
          {conversations.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-400 italic">
              No previous threads.
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setCurrentConversationId(c.id)}
                className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                  currentConversationId === c.id
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                  <span className="truncate">{c.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(c.id, e)}
                  title="Delete Thread"
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 rounded transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Strict Citation Grounding (Zero Hallucination)</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50/30 dark:bg-slate-950">
        {/* Chat Header Filters */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Scope:
            </span>
            <select
              value={selectedPaperId || ''}
              onChange={(e) => setSelectedPaperId(e.target.value ? parseInt(e.target.value) : null)}
              className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Uploaded Papers (Multi-Document Synthesis)</option>
              {papers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.publication_year || 2024})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {selectedPaperObj && (
              <>
                <button
                  onClick={() => onOpenViewer(selectedPaperObj.id, 1)}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View PDF</span>
                </button>
                <button
                  onClick={() => onOpenSummary(selectedPaperObj)}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Summary</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-brand-500/20 animate-pulse">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Ask ResearchAI Companion
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Ask any question across your uploaded papers. Every factual statement includes
                  interactive citation pills <span className="font-bold text-brand-600">[1]</span> that jump straight to the source page in the PDF.
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="w-full space-y-2 pt-2 text-left">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Click to Ask Instant Benchmark Query:
                </span>
                {[
                  "What methodology does the paper propose for sparse self-attention?",
                  "How does the system mitigate hallucinations in retrieval-augmented generation?",
                  "What benchmark datasets are evaluated for cross-domain generalization?",
                  "What are the common limitations reported across these studies?",
                ].map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sample)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500 text-xs text-slate-700 dark:text-slate-300 transition-all flex items-center justify-between group shadow-xs active:scale-[0.99]"
                  >
                    <span className="group-hover:text-brand-600 dark:group-hover:text-brand-400 font-medium">{sample}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={m.id || idx}
                className={`flex gap-3 max-w-3xl ${m.sender === 'user' ? 'ml-auto justify-end' : ''}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`space-y-3 ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-brand-600 to-teal-600 text-white p-3.5 rounded-2xl rounded-tr-sm text-sm max-w-xl shadow-md'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl rounded-tl-sm text-sm shadow-sm w-full'
                  }`}
                >
                  {/* Message Content with Interactive Clickable Citations */}
                  <div
                    className={`leading-relaxed text-[13.5px] whitespace-pre-wrap ${
                      m.sender === 'user'
                        ? 'text-white font-medium'
                        : 'text-slate-800 dark:text-slate-200 font-sans'
                    }`}
                  >
                    {m.sender === 'assistant'
                      ? renderInteractiveContent(m.content, m.citations)
                      : m.content}
                  </div>

                  {/* Sources & Citations Tray */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                          Grounded Sources ({m.citations.length}) • Click pill to jump to page
                        </span>
                        {m.latency_ms && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {m.latency_ms} ms
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {m.citations.map((c, cIdx) => (
                          <CitationCard
                            key={cIdx}
                            citation={c}
                            onJumpToPage={(pId, pageNum) =>
                              onOpenViewer(pId, pageNum, c.snippet)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assistant Footer Actions (Why This Answer, Copy, Follow-ups) */}
                  {m.sender === 'assistant' && (
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center gap-2">
                        {m.why_this_answer && (
                          <button
                            onClick={() => {
                              setActiveWhyData(m.why_this_answer);
                              setActiveWhyQuery(messages[idx - 1]?.content || 'Research Query');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950 hover:bg-brand-100 transition-colors shadow-xs"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Why this answer?</span>
                          </button>
                        )}

                        <button
                          onClick={() => copyAnswer(m.content, idx)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {/* Suggested Follow-Ups */}
                      {m.suggested_follow_ups && m.suggested_follow_ups.length > 0 && (
                        <div className="w-full pt-2 flex flex-wrap gap-1.5">
                          {m.suggested_follow_ups.map((fUp, fIdx) => (
                            <button
                              key={fIdx}
                              onClick={() => handleSend(fUp)}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-slate-700 dark:text-slate-300 hover:text-brand-700 font-medium transition-colors text-left"
                            >
                              ↳ {fUp}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 shadow-sm">
                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium">
                  Executing hybrid retrieval, reranking passages, and verifying citations...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about the uploaded papers (e.g. 'What are the reported limitations?')..."
              className="flex-1 px-4 py-3 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white shadow-md transition-all disabled:opacity-40 flex items-center gap-1.5 active:scale-95 font-semibold text-xs"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Explainability Modal */}
      <WhyThisAnswerModal
        isOpen={Boolean(activeWhyData)}
        onClose={() => setActiveWhyData(null)}
        data={activeWhyData}
        query={activeWhyQuery}
      />
    </div>
  );
};
