import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { getCommittee } from '../constants/data';
import { nameToSlug } from '../utils/slug';

export default function MotionPanel({ motion: m, onClose }) {
  const yesVotes = m ? Object.values(m.votes ?? {}).filter(v => v === 'YES').length : 0;
  const noVotes  = m ? Object.values(m.votes ?? {}).filter(v => v === 'NO').length  : 0;

  useEffect(() => {
    if (!m) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [m, onClose]);

  return (
    <AnimatePresence>
      {m && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[88vh] flex flex-col overflow-hidden pointer-events-auto">

              {/* Header */}
              <div className="p-6 border-b border-slate-100 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        m.status === 'Adopted'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                          : (m.status === 'Lost' || m.status === 'Defeated')
                          ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                          : 'bg-slate-100 text-slate-700'
                      )}>
                        {m.status}
                      </span>
                      {m.significance >= 90 && (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">High Impact</span>
                      )}
                      {m.significance >= 60 && m.significance < 90 && (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">Notable</span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-slate-900 leading-snug">{m.title}</h2>
                    <div className="flex flex-wrap gap-1.5 mt-2 text-xs text-slate-400">
                      <span>{m.id}</span>
                      <span>·</span>
                      <span>{m.date}</span>
                      {m.topic && <><span>·</span><span>{m.topic}</span></>}
                      <span>·</span>
                      <span>{m.committee || getCommittee(m.id)}</span>
                    </div>
                    {m.url && (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#004a99] hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View on toronto.ca
                      </a>
                    )}
                  </div>
                  <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors shrink-0 mt-0.5">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Vote summary bar */}
                {(yesVotes > 0 || noVotes > 0) && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-emerald-600">{yesVotes} YES</span>
                    <div className="flex-1 h-2 bg-rose-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.round((yesVotes / (yesVotes + noVotes)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-rose-500">{noVotes} NO</span>
                  </div>
                )}

                {/* Vote breakdown */}
                {m.votes && Object.keys(m.votes).length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">All Votes</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.entries(m.votes)
                        .sort(([, a], [, b]) => {
                          const order = { YES: 0, NO: 1, ABSENT: 2 };
                          return (order[a] ?? 3) - (order[b] ?? 3);
                        })
                        .map(([name, vote]) => (
                          <Link
                            key={name}
                            to={`/councillors/${nameToSlug(name)}`}
                            onClick={onClose}
                            className="flex items-center justify-between rounded-lg bg-slate-50 hover:bg-blue-50 px-3 py-2 text-xs transition-colors group"
                          >
                            <span className="text-slate-700 font-medium truncate group-hover:text-[#004a99] transition-colors">
                              {name}
                            </span>
                            <span className={cn(
                              "ml-2 font-bold shrink-0",
                              vote === 'YES' ? 'text-emerald-600'
                              : vote === 'NO' ? 'text-red-500'
                              : 'text-slate-400'
                            )}>
                              {vote}
                            </span>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
