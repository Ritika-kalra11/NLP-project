import React, { useState, useEffect, useRef } from 'react';
import {
  Network,
  Info,
  Maximize2,
  RotateCcw,
  BookOpen,
  User,
  Cpu,
  Database,
  Target,
  Globe,
  Filter,
  ZoomIn,
  ZoomOut,
  Search,
  MessageSquare,
  Sparkles,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';

export const KnowledgeGraph = ({ onOpenViewer, onOpenSummary, onStartChat, showToast }) => {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [nodeSearch, setNodeSearch] = useState('');
  const [nodePositions, setNodePositions] = useState([]);

  useEffect(() => {
    fetchGraph();
  }, []);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const data = await api.getKnowledgeGraph();
      setGraphData(data);
      if (data.nodes.length > 0) {
        setSelectedNode(data.nodes[0]);
        setNodePositions(computeNodePositions(data.nodes));
      }
    } catch (err) {
      console.error('Failed to load knowledge graph:', err);
    } finally {
      setLoading(false);
    }
  };

  const TYPE_COLORS = {
    paper: '#0d9488', // teal
    author: '#6366f1', // indigo
    model: '#ec4899', // pink
    dataset: '#0284c7', // sky
    task: '#f59e0b', // amber
    domain: '#8b5cf6', // purple
  };

  const computeNodePositions = (nodes) => {
    const width = 800;
    const height = 520;
    const centerX = width / 2;
    const centerY = height / 2;

    return nodes.map((node, index) => {
      let x = centerX;
      let y = centerY;
      const angle = (index / nodes.length) * 2 * Math.PI;

      if (node.type === 'domain') {
        const radius = 80;
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      } else if (node.type === 'paper') {
        const radius = 180;
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      } else {
        const radius = 270;
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      }

      return { ...node, x, y };
    });
  };

  const nodeMap = new Map(nodePositions.map((n) => [n.id, n]));

  const filteredNodes = nodePositions.filter(
    (n) =>
      (typeFilter === 'all' || n.type === typeFilter) &&
      (!nodeSearch || n.label.toLowerCase().includes(nodeSearch.toLowerCase()))
  );

  // Zoom and Pan controls
  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.5, z + 0.2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.6, z - 0.2));
  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.tagName === 'g') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>Interactive Scientific Knowledge Graph</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Explore interconnected entities across papers, authors, models, datasets, and tasks
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={nodeSearch}
              onChange={(e) => setNodeSearch(e.target.value)}
              placeholder="Find node..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 w-36"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
          >
            <option value="all">All Entities ({graphData?.nodes?.length || 0})</option>
            <option value="paper">Papers</option>
            <option value="author">Authors</option>
            <option value="model">Models</option>
            <option value="dataset">Datasets</option>
            <option value="task">Tasks</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-2">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs">Extracting entities & relations from corpus...</p>
        </div>
      ) : graphData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph Canvas */}
          <div
            className="lg:col-span-2 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[520px] cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Zoom / Pan Floating Control Box */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetView}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* SVG Visualizer */}
            <svg
              viewBox="0 0 800 520"
              className="w-full h-full max-h-[520px]"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              {/* Edges / Links */}
              <g stroke="#94a3b8" strokeOpacity="0.3" strokeWidth="1.5">
                {graphData.links.map((link, idx) => {
                  const sourceNode = nodeMap.get(link.source);
                  const targetNode = nodeMap.get(link.target);
                  if (!sourceNode || !targetNode) return null;
                  return (
                    <line
                      key={idx}
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      strokeDasharray={link.label === 'cites' ? '4 2' : 'none'}
                    />
                  );
                })}
              </g>

              {/* Edge Labels */}
              <g fill="#94a3b8" fontSize="9" textAnchor="middle">
                {graphData.links.map((link, idx) => {
                  const s = nodeMap.get(link.source);
                  const t = nodeMap.get(link.target);
                  if (!s || !t) return null;
                  const mx = (s.x + t.x) / 2;
                  const my = (s.y + t.y) / 2;
                  return (
                    <text key={idx} x={mx} y={my} dy="-3" opacity="0.6">
                      {link.label}
                    </text>
                  );
                })}
              </g>

              {/* Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const nodeColor = TYPE_COLORS[node.type] || '#64748b';
                const nodeRadius = node.type === 'paper' ? 17 : node.type === 'domain' ? 19 : 13;

                return (
                  <g
                    key={node.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                    }}
                    className="cursor-pointer transition-transform hover:scale-115"
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={nodeRadius}
                      fill={nodeColor}
                      stroke={isSelected ? '#ffffff' : '#000000'}
                      strokeWidth={isSelected ? 3.5 : 1}
                      strokeOpacity={isSelected ? 1 : 0.25}
                      className="shadow-md"
                    />
                    <text
                      x={node.x}
                      y={node.y + nodeRadius + 13}
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize="9.5"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="text-slate-800 dark:text-slate-200 pointer-events-none"
                    >
                      {node.label.length > 22 ? node.label.slice(0, 22) + '...' : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Type Color Legend */}
            <div className="absolute bottom-3 left-4 flex flex-wrap gap-2 text-[10px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5 capitalize font-semibold text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Node Inspector Panel */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span
                    className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: TYPE_COLORS[selectedNode.type] || '#64748b' }}
                  >
                    {selectedNode.type}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {selectedNode.id}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                    {selectedNode.label}
                  </h3>
                  {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
                    <div className="mt-3 space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                      {Object.entries(selectedNode.metadata).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 capitalize">{key}:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct Action Triggers for Selected Node */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                    Interactive Actions
                  </span>
                  {selectedNode.type === 'paper' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const paperId = parseInt(selectedNode.id.replace('paper_', ''));
                          onOpenViewer(paperId, 1);
                        }}
                        className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center gap-1.5 hover:bg-brand-100 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read PDF</span>
                      </button>
                      <button
                        onClick={() => {
                          const paperId = parseInt(selectedNode.id.replace('paper_', ''));
                          onStartChat(paperId, `Explain the core contributions of "${selectedNode.label}"`);
                        }}
                        className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center gap-1.5 hover:bg-sky-100 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask Chat</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onStartChat(null, `What role does "${selectedNode.label}" (${selectedNode.type}) play in the uploaded scientific literature?`)}
                      className="w-full p-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Investigate in ResearchAI Chat</span>
                    </button>
                  )}
                </div>

                {/* Connected Relationships */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                    Connected Relationships
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {graphData.links
                      .filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
                      .map((l, i) => {
                        const isSource = l.source === selectedNode.id;
                        const otherId = isSource ? l.target : l.source;
                        const otherNode = nodeMap.get(otherId);
                        return (
                          <div
                            key={i}
                            onClick={() => otherNode && setSelectedNode(otherNode)}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between text-[11px] cursor-pointer hover:border-brand-500/50 transition-colors"
                          >
                            <span className="text-slate-400 font-medium">{l.label}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                              {otherNode?.label || otherId}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs">
                Click any graph node to inspect metadata and relationships.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
