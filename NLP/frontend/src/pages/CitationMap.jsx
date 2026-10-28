import React, { useState, useEffect, useRef } from 'react';
import {
  GitFork,
  Search,
  User,
  BookOpen,
  Calendar,
  Award,
  Users,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Scale,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  Share2,
  TrendingUp,
  Layers,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  Hash,
  History,
  FastForward,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';

export const CitationMap = ({
  onOpenViewer,
  onOpenSummary,
  onStartChat,
  onSelectForCompare,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [authorsList, setAuthorsList] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  // Graph canvas controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [filterType, setFilterType] = useState('all'); // all, seed, earlier, future

  const svgRef = useRef(null);

  // Initial load: get author suggestions and run default search for top author/paper
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const authors = await api.getAuthors();
      const combined = [...(authors || [])];
      if (!combined.some((a) => a.name.toLowerCase().includes('bhat') || a.name.toLowerCase().includes('ashaq'))) {
        combined.unshift({ name: 'Ashaq Hussain Bhat', papers_count: 3 });
      }
      setAuthorsList(combined);
      // Default search for Ashaq Hussain Bhat
      const initialQuery = 'Ashaq Hussain Bhat';
      setSearchQuery(initialQuery);
      executeSearch(initialQuery);
    } catch (err) {
      console.error('Failed to load initial authors:', err);
      executeSearch('Ashaq Hussain Bhat');
    }
  };

  const executeSearch = async (queryToSearch) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;

    setLoading(true);
    try {
      const data = await api.searchCitations(q);
      setSearchResult(data);
      if (data.found && data.seed_paper) {
        // Select seed node by default
        const seedNode = data.nodes?.find((n) => n.node_type === 'seed') || data.nodes?.[0];
        setSelectedNode(seedNode || null);
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
      }
    } catch (err) {
      console.error('Citation search failed:', err);
      showToast?.('Error searching citations: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleSelectAuthorChip = (authorName) => {
    setSearchQuery(authorName);
    executeSearch(authorName);
  };

  const handleFocusOnPaper = async (node) => {
    if (node.paper_id) {
      setLoading(true);
      try {
        const mapData = await api.getPaperCitationMap(node.paper_id);
        setSearchResult((prev) => ({
          ...prev,
          found: true,
          seed_paper: {
            id: node.paper_id,
            title: node.title,
            authors: node.authors,
            year: node.year,
            abstract: node.abstract,
            citations_count: node.citations_count,
          },
          nodes: mapData.nodes,
          links: mapData.links,
          earlier_work: mapData.earlier_work || mapData.references,
          future_work: mapData.future_work || mapData.citing_papers,
          references: mapData.references,
          citing_papers: mapData.citing_papers,
          related_works: mapData.related_works,
        }));
        const newSeed = mapData.nodes.find((n) => n.node_type === 'seed') || mapData.nodes[0];
        setSelectedNode(newSeed);
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
        showToast?.(`Centered Citation Map on "${node.title.slice(0, 42)}..."`, 'success');
      } catch (err) {
        showToast?.('Failed to center citation map: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    } else {
      // Re-search by title
      setSearchQuery(node.title);
      executeSearch(node.title);
    }
  };

  // Pan and Zoom handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const getNodeColor = (type) => {
    switch (type) {
      case 'seed':
        return {
          fill: '#3b82f6',
          stroke: '#1d4ed8',
          text: '#bfdbfe',
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
          label: 'Focus Paper',
        };
      case 'reference':
        return {
          fill: '#0d9488',
          stroke: '#0f766e',
          text: '#99f6e4',
          badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200',
          label: 'Earlier Work',
        };
      case 'citing':
        return {
          fill: '#8b5cf6',
          stroke: '#6d28d9',
          text: '#ddd6fe',
          badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200',
          label: 'Future Work',
        };
      case 'related':
        return {
          fill: '#10b981',
          stroke: '#047857',
          text: '#a7f3d0',
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
          label: 'Related Literature',
        };
      default:
        return {
          fill: '#64748b',
          stroke: '#475569',
          text: '#cbd5e1',
          badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
          label: 'Academic Paper',
        };
    }
  };

  const nodes = searchResult?.nodes || [];
  const links = searchResult?.links || [];
  const earlierWorkList = searchResult?.earlier_work || searchResult?.references || [];
  const futureWorkList = searchResult?.future_work || searchResult?.citing_papers || [];

  const filteredNodes = nodes.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'seed') return n.node_type === 'seed';
    if (filterType === 'earlier') return n.node_type === 'reference';
    if (filterType === 'future') return n.node_type === 'citing';
    return true;
  });

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Find min and max year to render timeline scale
  const years = nodes.map((n) => n.year).filter(Boolean);
  const minYear = years.length ? Math.min(...years) : 2017;
  const maxYear = years.length ? Math.max(...years) : 2025;

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <GitFork className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Citation Map
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Explore <strong>Earlier Work</strong> (prior foundations & cited references), <strong>Future Work</strong> (subsequent citing papers & advancements), and comprehensive citation information across academic literature.
          </p>
        </div>

        {/* Quick Author Selection Chips */}
        {authorsList.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
              <User className="w-3 h-3" /> Authors:
            </span>
            {authorsList.slice(0, 4).map((a) => (
              <button
                key={a.name}
                onClick={() => handleSelectAuthorChip(a.name)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                  searchQuery.toLowerCase().includes(a.name.toLowerCase())
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400'
                }`}
              >
                {a.name} ({a.papers_count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                executeSearch(searchQuery);
              }
            }}
            placeholder="Search author name (e.g. Ashaq Hussain Bhat, Ashish Vaswani, Patrick Lewis) or paper title..."
            className="w-full pl-12 pr-36 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-36 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1 rounded transition-colors"
              title="Clear input"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 px-5 py-2 bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Explore Citations</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Author Profile & Academic Influence Card */}
      {searchResult?.found && searchResult.author_profile && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 via-white to-brand-50/20 dark:from-slate-900 dark:via-slate-900/90 dark:to-brand-950/20 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-brand-600/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-lg border border-brand-500/20">
                {searchResult.author_profile.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {searchResult.author_profile.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-300">
                    {searchResult.author_profile.affiliation || 'Academic AI Researcher'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{searchResult.author_profile.papers_count}</strong> publication{searchResult.author_profile.papers_count !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
                    <strong>~{searchResult.author_profile.estimated_citations?.toLocaleString()}</strong> total citations
                  </span>
                  {searchResult.author_profile.h_index && (
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      h-index: <strong>{searchResult.author_profile.h_index}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Collaborators & Topics */}
            <div className="flex flex-col md:items-end gap-1.5 text-xs">
              {searchResult.author_profile.collaborators?.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap md:justify-end">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Frequent Co-authors:
                  </span>
                  {searchResult.author_profile.collaborators.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleSelectAuthorChip(c)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-medium transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              {searchResult.author_profile.topics?.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap md:justify-end">
                  {searchResult.author_profile.topics.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Published Papers by this Author */}
          {searchResult.author_profile.papers?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Papers Published by {searchResult.author_profile.name} ({searchResult.author_profile.papers.length})
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Click any paper or button to explore its citation timeline
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {searchResult.author_profile.papers.map((paper, idx) => {
                  const isCurrentSeed =
                    searchResult.seed_paper?.title?.toLowerCase() === paper.title?.toLowerCase() ||
                    selectedNode?.title?.toLowerCase() === paper.title?.toLowerCase();

                  return (
                    <div
                      key={paper.id || idx}
                      onClick={() => {
                        const matchNode = nodes.find(
                          (n) => n.title?.toLowerCase() === paper.title?.toLowerCase()
                        );
                        if (matchNode) {
                          setSelectedNode(matchNode);
                        } else {
                          handleFocusOnPaper(paper);
                        }
                      }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer text-left flex flex-col justify-between ${
                        isCurrentSeed
                          ? 'bg-brand-50/70 dark:bg-brand-950/50 border-brand-300 dark:border-brand-700 shadow-sm ring-1 ring-brand-400/30'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                            {paper.title}
                          </p>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 flex-shrink-0">
                            {paper.year || 'N/A'}
                          </span>
                        </div>
                        {paper.authors && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                            {paper.authors}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                        <span className="font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {paper.citations != null ? `${paper.citations.toLocaleString()} citations` : '0 citations'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFocusOnPaper(paper);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/40 dark:hover:bg-brand-900/70 text-brand-700 dark:text-brand-300 transition-colors flex items-center gap-1"
                        >
                          <GitFork className="w-3 h-3" />
                          <span>Map Citations</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Citation Map Layout: Canvas + Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Center Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm relative overflow-hidden">
            {/* Graph Controls Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-2 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-500" />
                  Citation Timeline & Evolution
                </span>
                <span className="text-[11px] text-slate-400">
                  ({filteredNodes.length} papers, {links.length} citation links)
                </span>
              </div>

              {/* Filter Pills for Earlier vs Future Work */}
              <div className="flex items-center gap-1">
                {[
                  { id: 'all', label: 'All Works' },
                  { id: 'seed', label: 'Focus Paper' },
                  { id: 'earlier', label: 'Earlier Work' },
                  { id: 'future', label: 'Future Work' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={`text-[10px] px-2.5 py-1 rounded-md font-medium transition-all ${
                      filterType === f.id
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Zoom Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 2.2))}
                  title="Zoom In"
                  className="p-1.5 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.5))}
                  title="Zoom Out"
                  className="p-1.5 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={resetView}
                  title="Reset View"
                  className="p-1.5 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive SVG Canvas */}
            <div
              className="w-full h-[520px] bg-slate-50/50 dark:bg-slate-950/40 rounded-lg relative overflow-hidden border border-slate-100 dark:border-slate-800/60 cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <svg
                ref={svgRef}
                viewBox="0 0 840 500"
                className="w-full h-full"
              >
                <defs>
                  {/* Arrow markers for citation flow */}
                  <marker
                    id="cite-arrow"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" opacity="0.8" />
                  </marker>
                  <marker
                    id="cite-arrow-seed"
                    viewBox="0 0 10 10"
                    refX="26"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                  </marker>
                  <filter id="glow-seed" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#3b82f6" floodOpacity="0.4" />
                  </filter>
                </defs>

                <g
                  transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
                  style={{ transformOrigin: 'center center' }}
                >
                  {/* Background Earlier & Future Timeline Axis */}
                  <line x1="80" y1="460" x2="760" y2="460" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                  <text x="80" y="480" fill="#0d9488" fontSize="10" fontWeight="700">← Earlier Work ({minYear})</text>
                  <text x="420" y="480" fill="#3b82f6" fontSize="10" textAnchor="middle" fontWeight="700">★ Focus Paper</text>
                  <text x="760" y="480" fill="#8b5cf6" fontSize="10" textAnchor="end" fontWeight="700">Future Work ({maxYear}) →</text>

                  {/* Links / Citation Arrows */}
                  {links.map((link, idx) => {
                    const sourceNode = nodeMap.get(link.source);
                    const targetNode = nodeMap.get(link.target);
                    if (!sourceNode || !targetNode) return null;

                    const isSeedLink = sourceNode.node_type === 'seed' || targetNode.node_type === 'seed';
                    const isSelectedLink = selectedNode && (sourceNode.id === selectedNode.id || targetNode.id === selectedNode.id);

                    // Bezier curve connecting source and target
                    const dx = targetNode.x - sourceNode.x;
                    const dy = targetNode.y - sourceNode.y;
                    const cx1 = sourceNode.x + dx * 0.4;
                    const cy1 = sourceNode.y;
                    const cx2 = sourceNode.x + dx * 0.6;
                    const cy2 = targetNode.y;
                    const pathData = `M ${sourceNode.x} ${sourceNode.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${targetNode.x} ${targetNode.y}`;

                    return (
                      <g key={idx}>
                        <path
                          d={pathData}
                          fill="none"
                          stroke={isSelectedLink ? '#3b82f6' : isSeedLink ? '#94a3b8' : '#cbd5e1'}
                          strokeWidth={isSelectedLink ? 2.5 : isSeedLink ? 1.5 : 1}
                          strokeOpacity={isSelectedLink ? 0.9 : 0.4}
                          strokeDasharray={link.relationship === 'relates' ? '4 4' : 'none'}
                          markerEnd={isSeedLink ? 'url(#cite-arrow-seed)' : 'url(#cite-arrow)'}
                        />
                      </g>
                    );
                  })}

                  {/* Interactive Nodes */}
                  {filteredNodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const isSeed = node.node_type === 'seed';
                    const colors = getNodeColor(node.node_type);

                    // Radius based on citation count (log scale)
                    const baseRadius = isSeed ? 26 : Math.min(22, Math.max(12, Math.log10(Math.max(10, node.citations_count || 10)) * 5));

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode(node);
                        }}
                        className="cursor-pointer group"
                      >
                        {/* Outer Selection / Orbit Ring */}
                        {isSeed && (
                          <circle
                            r={baseRadius + 8}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray="4 3"
                            className="animate-spin-slow"
                            opacity="0.8"
                          />
                        )}

                        {isSelected && !isSeed && (
                          <circle
                            r={baseRadius + 6}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="2"
                            opacity="0.9"
                          />
                        )}

                        {/* Node Circle */}
                        <circle
                          r={baseRadius}
                          fill={colors.fill}
                          stroke={colors.stroke}
                          strokeWidth={isSelected ? 3 : 1.5}
                          filter={isSeed ? 'url(#glow-seed)' : undefined}
                          className="transition-all duration-150 group-hover:scale-110"
                        />

                        {/* Center Metric Text */}
                        <text
                          y="4"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize={isSeed ? '12' : '9'}
                          fontWeight="700"
                          pointerEvents="none"
                        >
                          {isSeed ? '★' : (node.citations_count > 999 ? `${Math.round(node.citations_count / 1000)}k` : node.citations_count || '1')}
                        </text>

                        {/* Paper Title Label */}
                        <text
                          y={baseRadius + 14}
                          textAnchor="middle"
                          fill="currentColor"
                          className="text-[10px] font-medium fill-slate-700 dark:fill-slate-300 pointer-events-none"
                        >
                          {node.title.length > 22 ? `${node.title.slice(0, 20)}...` : node.title}
                        </text>
                        {/* Year Badge */}
                        <text
                          y={baseRadius + 26}
                          textAnchor="middle"
                          fill="currentColor"
                          className="text-[9px] fill-slate-400 dark:fill-slate-500 pointer-events-none"
                        >
                          ({node.year})
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Canvas Legend */}
              <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-[11px] shadow-sm flex items-center gap-3 flex-wrap">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Legend:</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                  <span className="text-slate-600 dark:text-slate-400">Focus Paper</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
                  <span className="text-slate-600 dark:text-slate-400">Earlier Work (Cited)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
                  <span className="text-slate-600 dark:text-slate-400">Future Work (Citing)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-slate-600 dark:text-slate-400">Related</span>
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Cards: Earlier Work vs Future Work */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Earlier Work Card */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <History className="w-4 h-4 text-teal-600" />
                  Earlier Work ({earlierWorkList.length})
                </h4>
                <span className="text-[10px] text-teal-600 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded">
                  Prior Foundations
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Foundational papers published earlier that this research references and builds upon:
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {earlierWorkList.map((ref) => (
                  <div
                    key={ref.id}
                    onClick={() => {
                      const matchNode = nodeMap.get(ref.id);
                      if (matchNode) setSelectedNode(matchNode);
                    }}
                    className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 hover:border-teal-400 dark:hover:border-teal-600 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {ref.title}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400 flex-shrink-0">{ref.year}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {ref.authors}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-teal-600 dark:text-teal-400 mt-1.5 font-medium">
                      <span>{ref.relationship}</span>
                      <span>{ref.citations?.toLocaleString()} citations</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Future Work Card */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FastForward className="w-4 h-4 text-purple-600" />
                  Future Work ({futureWorkList.length})
                </h4>
                <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                  Subsequent Advancements
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Subsequent papers published later that cite, adopt, or expand upon this work:
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {futureWorkList.map((cite) => (
                  <div
                    key={cite.id}
                    onClick={() => {
                      const matchNode = nodeMap.get(cite.id);
                      if (matchNode) setSelectedNode(matchNode);
                    }}
                    className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 hover:border-purple-400 dark:hover:border-purple-600 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {cite.title}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400 flex-shrink-0">{cite.year}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {cite.authors}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-purple-600 dark:text-purple-400 mt-1.5 font-medium">
                      <span>{cite.relationship}</span>
                      <span>{cite.citations?.toLocaleString()} citations</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Citation Details Inspector Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedNode ? (
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sticky top-20">
              {/* Header Badges: Earlier / Future Work Status */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${getNodeColor(selectedNode.node_type).badge}`}>
                  {selectedNode.node_type === 'seed'
                    ? '★ Focus Paper'
                    : selectedNode.node_type === 'reference'
                    ? '⏪ Earlier Work'
                    : '⏩ Future Work'}
                </span>
                {selectedNode.in_library && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> In Your Library
                  </span>
                )}
              </div>

              {/* Title & Authors */}
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                  {selectedNode.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {selectedNode.authors}
                </p>
              </div>

              {/* Citation Metrics */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Publication Year</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {selectedNode.year || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Citation Count</span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {selectedNode.citations_count?.toLocaleString() || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Relationship Label & Citation Context Quote */}
              {selectedNode.context && (
                <div className="p-3 rounded-lg bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800/60">
                  <span className="text-[10px] uppercase font-bold text-brand-700 dark:text-brand-300 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Citation Context & Connection
                  </span>
                  <p className="text-xs text-brand-900 dark:text-brand-200 mt-1 leading-relaxed italic">
                    "{selectedNode.context}"
                  </p>
                </div>
              )}

              {/* Abstract */}
              {selectedNode.abstract && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Abstract Excerpt
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-4 leading-relaxed">
                    {selectedNode.abstract}
                  </p>
                </div>
              )}

              {/* Topics */}
              {selectedNode.topics?.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {selectedNode.topics.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {/* Re-center / Map Citations for this paper */}
                <button
                  onClick={() => handleFocusOnPaper(selectedNode)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Map Citations for this Paper</span>
                </button>

                {/* Local Corpus Actions (if in library) */}
                {selectedNode.paper_id ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onOpenViewer?.(selectedNode.paper_id, 1)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Read PDF</span>
                    </button>
                    <button
                      onClick={() => onStartChat?.(selectedNode.paper_id, `Explain how "${selectedNode.title}" connects to earlier and future literature.`)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-brand-500" />
                      <span>Chat QA</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>External benchmark citation (not in local library).</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <GitFork className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select a Paper in the Citation Map
              </p>
              <p className="text-[11px] text-slate-400">
                Click any paper node on the timeline canvas to inspect its earlier foundational work, future citing works, and context quotes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
