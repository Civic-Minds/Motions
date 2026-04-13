import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { TOPIC_LIGHT } from '../constants/data';

const TOPICS = ['Housing', 'Transit', 'Finance', 'Parks', 'Climate', 'General'];

export default function VersusOverlay({ selection, onClose, motions }) {
  if (!selection || selection.length < 2) return null;
  const [c1, c2] = selection;

  const { alignmentScore, totalShared, c1Yes, c2Yes, c1Total, c2Total } = useMemo(() => {
    const shared = motions.filter(m => m.votes?.[c1] && m.votes?.[c2]);
    const same   = shared.filter(m => m.votes[c1] === m.votes[c2]).length;
    const allC1  = motions.filter(m => m.votes?.[c1]);
    const allC2  = motions.filter(m => m.votes?.[c2]);
    return {
      totalShared:    shared.length,
      alignmentScore: shared.length > 0 ? Math.floor((same / shared.length) * 100) : null,
      c1Yes:   allC1.length > 0 ? Math.round((allC1.filter(m => m.votes[c1] === 'YES').length / allC1.length) * 100) : 0,
      c2Yes:   allC2.length > 0 ? Math.round((allC2.filter(m => m.votes[c2] === 'YES').length / allC2.length) * 100) : 0,
      c1Total: allC1.length,
      c2Total: allC2.length,
    };
  }, [c1, c2, motions]);

  const topicBreakdown = useMemo(() => {
    return TOPICS.map(topic => {
      const relevant = motions.filter(m => m.topic === topic && !m.trivial);
      const c1Votes  = relevant.filter(m => m.votes?.[c1] === 'YES' || m.votes?.[c1] === 'NO');
      const c2Votes  = relevant.filter(m => m.votes?.[c2] === 'YES' || m.votes?.[c2] === 'NO');
      const shared   = relevant.filter(m => (m.votes?.[c1] === 'YES' || m.votes?.[c1] === 'NO') && (m.votes?.[c2] === 'YES' || m.votes?.[c2] === 'NO'));
      const agreed   = shared.filter(m => m.votes[c1] === m.votes[c2]).length;
      const c1YesPct = c1Votes.length > 0 ? Math.round((c1Votes.filter(m => m.votes[c1] === 'YES').length / c1Votes.length) * 100) : null;
      const c2YesPct = c2Votes.length > 0 ? Math.round((c2Votes.filter(m => m.votes[c2] === 'YES').length / c2Votes.length) * 100) : null;
      return {
        topic,
        c1Yes: c1YesPct,
        c2Yes: c2YesPct,
        agreement: shared.length >= 5 ? Math.round((agreed / shared.length) * 100) : null,
        shared: shared.length,
        hasData: c1Votes.length >= 3 && c2Votes.length >= 3,
      };
    }).filter(t => t.hasData);
  }, [c1, c2, motions]);

  const topDivergences = useMemo(() => motions
    .filter(m => m.votes?.[c1] && m.votes?.[c2] && m.votes[c1] !== m.votes[c2] && !m.trivial)
    .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0))
    .slice(0, 6),
  [c1, c2, motions]);

  const c1Last = c1.split(' ').at(-1);
  const c2Last = c2.split(' ').at(-1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-5 pb-20"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {c1} <span className="text-slate-300 font-light mx-1.5">vs</span> {c2}
          </h1>
        </div>
        <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-700 transition-colors shrink-0">
          ← Back
        </button>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2 truncate">{c1Last}</p>
          <p className="text-2xl font-black text-slate-900">{c1Yes}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">yes rate · {c1Total} votes</p>
          <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c1Yes}%` }} />
            <div className="h-full bg-rose-400 rounded-full" style={{ width: `${100 - c1Yes}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center flex flex-col items-center justify-center">
          {alignmentScore !== null ? (
            <>
              <p className="text-3xl font-black text-slate-900">{alignmentScore}%</p>
              <p className="text-[10px] text-slate-400 mt-1">agree · {totalShared} shared</p>
              <div className="mt-2 h-1.5 w-full bg-rose-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${alignmentScore}%` }} />
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400">No shared votes</p>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2 truncate text-right">{c2Last}</p>
          <p className="text-2xl font-black text-slate-900 text-right">{c2Yes}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5 text-right">yes rate · {c2Total} votes</p>
          <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c2Yes}%` }} />
            <div className="h-full bg-rose-400 rounded-full" style={{ width: `${100 - c2Yes}%` }} />
          </div>
        </div>
      </div>

      {/* Topics + Divergences side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Topic table */}
        {topicBreakdown.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
            <div className="grid grid-cols-[1fr_64px_64px_60px] px-4 py-2 border-b border-slate-100 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Topic</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide text-right">{c1Last}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide text-right">{c2Last}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide text-right">Agree</span>
            </div>
            {topicBreakdown.map((t, i) => (
              <div
                key={t.topic}
                className={cn("grid grid-cols-[1fr_64px_64px_60px] px-4 py-2 items-center flex-1", i % 2 === 1 ? "bg-slate-50/50" : "", i < topicBreakdown.length - 1 && "border-b border-slate-100")}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", TOPIC_LIGHT[t.topic] || 'bg-slate-100 text-slate-500')}>
                    {t.topic}
                  </span>
                  <span className="text-[10px] text-slate-300">{t.shared}</span>
                </div>
                <span className={cn("text-xs font-bold text-right", t.c1Yes >= 50 ? 'text-emerald-600' : 'text-rose-500')}>
                  {t.c1Yes != null ? `${t.c1Yes}%` : '—'}
                </span>
                <span className={cn("text-xs font-bold text-right", t.c2Yes >= 50 ? 'text-emerald-600' : 'text-rose-500')}>
                  {t.c2Yes != null ? `${t.c2Yes}%` : '—'}
                </span>
                <span className={cn(
                  "text-xs font-bold text-right",
                  t.agreement == null ? 'text-slate-300' :
                  t.agreement >= 70 ? 'text-emerald-600' :
                  t.agreement >= 50 ? 'text-amber-500' : 'text-rose-500'
                )}>
                  {t.agreement != null ? `${t.agreement}%` : '—'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Divergences */}
        {topDivergences.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
            <div className="grid grid-cols-[1fr_56px_64px_20px] px-4 py-2 border-b border-slate-100 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Where they split</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide text-right">{c1Last}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide text-right">{c2Last}</span>
              <span />
            </div>
            {topDivergences.map((m, i) => (
              <Link key={m.id} to={`/motions/${m.id}`}
                className={cn("grid grid-cols-[1fr_56px_64px_20px] items-center px-4 py-2 flex-1 hover:bg-slate-50 transition-colors group", i % 2 === 1 ? "bg-slate-50/50" : "", i < topDivergences.length - 1 && "border-b border-slate-100")}
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-1">{m.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{m.date} · {m.id}</p>
                </div>
                <span className={cn("text-xs font-bold text-right", m.votes[c1] === 'YES' ? 'text-emerald-600' : 'text-rose-500')}>{m.votes[c1]}</span>
                <span className={cn("text-xs font-bold text-right", m.votes[c2] === 'YES' ? 'text-emerald-600' : 'text-rose-500')}>{m.votes[c2]}</span>
                {m.url ? (
                  <a href={m.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-slate-300 hover:text-[#004a99] transition-colors justify-self-end">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : <span />}
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
