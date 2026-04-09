import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TOPIC_BADGE } from '../constants/data';
import { cn } from '../lib/utils';

export default function VersusOverlay({ selection, onClose, motions }) {
  if (!selection || selection.length < 2) return null;
  const [c1, c2] = selection;

  const divergence = motions
    .filter(m => m.votes && m.votes[c1] !== m.votes[c2] && !m.trivial)
    .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0));

  const totalShared = motions.filter(m => m.votes && m.votes[c1] && m.votes[c2]).length;
  const sharedSame = motions.filter(m => m.votes && m.votes[c1] === m.votes[c2]).length;
  const alignmentScore = totalShared > 0 ? Math.floor((sharedSame / totalShared) * 100) : null;

  const dna = (name) => {
    const all = motions.filter(m => m.votes?.[name]);
    const yes = all.filter(m => m.votes[name] === 'YES').length;
    return all.length > 0 ? Math.round((yes / all.length) * 100) : 0;
  };
  const c1Yes = dna(c1);
  const c2Yes = dna(c2);

  return (
    <AnimatePresence>
      {selection.length >= 2 && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 z-40 md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-16 right-0 bottom-0 w-full sm:w-[480px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {c1.split(' ').at(-1)} vs {c2.split(' ').at(-1)}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {alignmentScore !== null
                      ? `${alignmentScore}% agreement on ${totalShared} shared votes`
                      : 'No shared vote history'}
                  </p>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Alignment bar */}
              {alignmentScore !== null && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-emerald-600">{alignmentScore}% agree</span>
                    <span className="text-rose-500">{100 - alignmentScore}% differ</span>
                  </div>
                  <div className="h-2 w-full bg-rose-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${alignmentScore}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* DNA cards */}
            <div className="px-6 pt-4 pb-4 border-b border-slate-100 grid grid-cols-2 gap-3 shrink-0">
              {[[c1, c1Yes], [c2, c2Yes]].map(([name, yesPct]) => (
                <div key={name} className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 truncate">{name}</p>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: `${yesPct}%` }} />
                    <div className="h-full bg-rose-400" style={{ width: `${100 - yesPct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] font-medium">
                    <span className="text-emerald-600">YES {yesPct}%</span>
                    <span className="text-rose-500">NO {100 - yesPct}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Divergence list */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Where they split</p>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{divergence.length} motions</span>
              </div>
              <div className="space-y-3">
                {divergence.length > 0 ? divergence.map((m, i) => (
                  <div key={i} className="p-4 border border-slate-100 rounded-xl bg-white hover:border-[#004a99]/30 transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {m.topic && (
                          <span className={cn("inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border mb-1.5", TOPIC_BADGE[m.topic] || TOPIC_BADGE.General)}>
                            {m.topic}
                          </span>
                        )}
                        <p className="text-xs font-medium text-slate-700 leading-snug group-hover:text-[#004a99] transition-colors">{m.title}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 pl-2">
                        <div className="text-center">
                          <p className="text-[8px] text-slate-400 font-medium mb-0.5">{c1.split(' ').at(-1)}</p>
                          <span className={cn("text-xs font-bold",
                            m.votes[c1] === 'YES' ? 'text-emerald-600' :
                            m.votes[c1] === 'NO'  ? 'text-rose-500' : 'text-amber-500')}>
                            {m.votes[c1] || '—'}
                          </span>
                        </div>
                        <div className="w-px h-6 bg-slate-200" />
                        <div className="text-center">
                          <p className="text-[8px] text-slate-400 font-medium mb-0.5">{c2.split(' ').at(-1)}</p>
                          <span className={cn("text-xs font-bold",
                            m.votes[c2] === 'YES' ? 'text-emerald-600' :
                            m.votes[c2] === 'NO'  ? 'text-rose-500' : 'text-amber-500')}>
                            {m.votes[c2] || '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-400 font-medium">
                      {totalShared === 0 ? 'No shared vote history.' : 'Voted identically on all shared motions.'}
                    </p>
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
