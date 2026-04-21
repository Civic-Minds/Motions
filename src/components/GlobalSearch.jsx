import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, User, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { cn } from '../lib/utils';
import { nameToSlug } from '../utils/slug';
import { TOPIC_LIGHT } from '../constants/data';

function committeeToSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function highlight(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-100 text-amber-900 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function GlobalSearch({ motions, councillorNames, open, onClose }) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Build Fuse indexes once
  const primaryMotions = useMemo(() => motions.filter(m => !m.parentId), [motions]);

  const motionFuse = useMemo(() => new Fuse(primaryMotions, {
    keys: [
      { name: 'title',     weight: 0.5 },
      { name: 'summary',   weight: 0.3 },
      { name: 'committee', weight: 0.1 },
      { name: 'topic',     weight: 0.1 },
    ],
    threshold: 0.35,
    minMatchCharLength: 2,
    includeScore: true,
  }), [primaryMotions]);

  const councillorFuse = useMemo(() => new Fuse(councillorNames, {
    threshold: 0.3,
    minMatchCharLength: 2,
  }), [councillorNames]);

  const committees = useMemo(() => {
    const seen = new Set();
    return primaryMotions
      .filter(m => m.committee && !seen.has(m.committee) && seen.add(m.committee))
      .map(m => m.committee);
  }, [primaryMotions]);

  const committeeFuse = useMemo(() => new Fuse(committees, {
    threshold: 0.3,
    minMatchCharLength: 2,
  }), [committees]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Cmd+K / ESC
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); }
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q || q.length < 2) return { motions: [], councillors: [], committees: [] };

    return {
      motions:     motionFuse.search(q, { limit: 6 }).map(r => r.item),
      councillors: councillorFuse.search(q, { limit: 3 }).map(r => r.item),
      committees:  committeeFuse.search(q, { limit: 2 }).map(r => r.item),
    };
  }, [query, motionFuse, councillorFuse, committeeFuse]);

  const flat = [
    ...results.councillors.map(n => ({ type: 'councillor', name: n })),
    ...results.committees.map(c => ({ type: 'committee', name: c })),
    ...results.motions.map(m => ({ type: 'motion', motion: m })),
  ];
  const total = flat.length;

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (!open) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, total - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
      if (e.key === 'Enter' && flat[cursor]) { e.preventDefault(); selectItem(flat[cursor]); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, cursor, flat]);

  // Scroll cursor into view
  useEffect(() => {
    const el = listRef.current?.children[cursor];
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  function selectItem(item) {
    if (item.type === 'councillor') navigate(`/councillors/${nameToSlug(item.name)}`);
    else if (item.type === 'committee') navigate(`/committees/${committeeToSlug(item.name)}`);
    else navigate(`/motions/${item.motion.id}`);
    onClose();
  }

  const showEmpty = query.trim().length >= 2 && total === 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-xl z-[70] px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-200 overflow-hidden">

              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setCursor(0); }}
                  placeholder="Search motions, councillors…"
                  className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="p-0.5 hover:bg-slate-100 rounded transition-colors">
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
                <kbd className="hidden sm:block text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">ESC</kbd>
              </div>

              {/* Results */}
              {(total > 0 || showEmpty) && (
                <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">

                  {showEmpty && (
                    <p className="text-sm text-slate-400 text-center py-8">No results for "{query}"</p>
                  )}

                  {results.councillors.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-4 pt-2 pb-1">Councillors</p>
                      {results.councillors.map((name, i) => {
                        const idx = i;
                        const isActive = cursor === idx;
                        return (
                          <button
                            key={name}
                            onClick={() => selectItem({ type: 'councillor', name })}
                            onMouseEnter={() => setCursor(idx)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                              isActive ? "bg-slate-50" : "hover:bg-slate-50"
                            )}
                          >
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <span className="text-sm font-medium text-slate-800">
                              {highlight(name, query)}
                            </span>
                            {isActive && <span className="ml-auto text-[10px] text-slate-400">↵</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {results.committees.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-4 pt-2 pb-1">Committees</p>
                      {results.committees.map((name, i) => {
                        const idx = results.councillors.length + i;
                        const isActive = cursor === idx;
                        return (
                          <button
                            key={name}
                            onClick={() => selectItem({ type: 'committee', name })}
                            onMouseEnter={() => setCursor(idx)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                              isActive ? "bg-slate-50" : "hover:bg-slate-50"
                            )}
                          >
                            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                              <Building2 className="w-3.5 h-3.5 text-violet-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-800">
                              {highlight(name, query)}
                            </span>
                            {isActive && <span className="ml-auto text-[10px] text-slate-400">↵</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {results.motions.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-4 pt-2 pb-1">Motions</p>
                      {results.motions.map((m, i) => {
                        const idx = results.councillors.length + results.committees.length + i;
                        const isActive = cursor === idx;
                        return (
                          <button
                            key={m.id}
                            onClick={() => selectItem({ type: 'motion', motion: m })}
                            onMouseEnter={() => setCursor(idx)}
                            className={cn(
                              "w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors",
                              isActive ? "bg-slate-50" : "hover:bg-slate-50"
                            )}
                          >
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                              <FileText className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">
                                {highlight(m.title, query)}
                              </p>
                              {m.summary && !m.title?.toLowerCase().includes(query.trim().toLowerCase()) && (
                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 leading-snug">
                                  {highlight(m.summary, query)}
                                </p>
                              )}
                              <div className="flex items-center gap-1.5 mt-1">
                                {m.topic && (
                                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>
                                    {m.topic}
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400">{m.date}</span>
                                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                                  m.status === 'Adopted' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-600 bg-rose-50')}>
                                  {m.status}
                                </span>
                              </div>
                            </div>
                            {isActive && <span className="text-[10px] text-slate-400 shrink-0 mt-1">↵</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {total > 0 && (
                    <p className="text-[10px] text-slate-300 text-center py-2">
                      {total} result{total !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}

              {/* Suggestions when empty query */}
              {query.trim().length < 2 && (
                <div className="px-4 py-5 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Topics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Housing', 'Transit', 'Finance', 'Parks', 'Climate'].map(t => (
                        <button
                          key={t}
                          onClick={() => { setQuery(t); setCursor(0); }}
                          className={cn("text-xs font-medium px-2.5 py-1 rounded-full transition-colors", TOPIC_LIGHT[t])}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Common searches</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['bike lane', 'budget', 'shelter', 'zoning', 'TTC', 'rent', 'development', 'police'].map(term => (
                        <button
                          key={term}
                          onClick={() => { setQuery(term); setCursor(0); }}
                          className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
