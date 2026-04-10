import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { TOPIC_LIGHT, TOPIC_DOT } from '../constants/data';

const TOPICS = ['Housing', 'Transit', 'Finance', 'Parks', 'Climate', 'General'];

function VoteBar({ pct, color }) {
  return (
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        className={cn('h-full rounded-full', color)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

export default function VersusOverlay({ selection, onClose, motions }) {
  if (!selection || selection.length < 2) return null;
  const [c1, c2] = selection;

  const { alignmentScore, totalShared, c1Yes, c2Yes } = useMemo(() => {
    const shared = motions.filter(m => m.votes?.[c1] && m.votes?.[c2]);
    const same   = shared.filter(m => m.votes[c1] === m.votes[c2]).length;
    const allC1  = motions.filter(m => m.votes?.[c1]);
    const allC2  = motions.filter(m => m.votes?.[c2]);
    return {
      totalShared:    shared.length,
      alignmentScore: shared.length > 0 ? Math.floor((same / shared.length) * 100) : null,
      c1Yes: allC1.length > 0 ? Math.round((allC1.filter(m => m.votes[c1] === 'YES').length / allC1.length) * 100) : 0,
      c2Yes: allC2.length > 0 ? Math.round((allC2.filter(m => m.votes[c2] === 'YES').length / allC2.length) * 100) : 0,
    };
  }, [c1, c2, motions]);

  const topicBreakdown = useMemo(() => {
    return TOPICS.map(topic => {
      const relevant = motions.filter(m => m.topic === topic && !m.trivial);
      const c1Votes  = relevant.filter(m => m.votes?.[c1] === 'YES' || m.votes?.[c1] === 'NO');
      const c2Votes  = relevant.filter(m => m.votes?.[c2] === 'YES' || m.votes?.[c2] === 'NO');
      const shared   = relevant.filter(m => (m.votes?.[c1] === 'YES' || m.votes?.[c1] === 'NO') && (m.votes?.[c2] === 'YES' || m.votes?.[c2] === 'NO'));
      const agreed   = shared.filter(m => m.votes[c1] === m.votes[c2]).length;
      return {
        topic,
        c1Yes:     c1Votes.length > 0 ? Math.round((c1Votes.filter(m => m.votes[c1] === 'YES').length / c1Votes.length) * 100) : null,
        c2Yes:     c2Votes.length > 0 ? Math.round((c2Votes.filter(m => m.votes[c2] === 'YES').length / c2Votes.length) * 100) : null,
        agreement: shared.length >= 5 ? Math.round((agreed / shared.length) * 100) : null,
        shared:    shared.length,
        hasData:   c1Votes.length >= 3 && c2Votes.length >= 3,
      };
    }).filter(t => t.hasData);
  }, [c1, c2, motions]);

  const topDivergences = useMemo(() => {
    return motions
      .filter(m => m.votes?.[c1] && m.votes?.[c2] && m.votes[c1] !== m.votes[c2] && !m.trivial)
      .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0))
      .slice(0, 5);
  }, [c1, c2, motions]);

  const c1Last = c1.split(' ').at(-1);
  const c2Last = c2.split(' ').at(-1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {c1Last} <span className="text-slate-300 font-light mx-2">vs</span> {c2Last}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {c1} · {c2}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* ── Overall alignment ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">

          {/* C1 DNA */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide truncate">{c1}</p>
            <div className="flex h-3 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${c1Yes}%` }} />
              <div className="bg-rose-400 h-full" style={{ width: `${100 - c1Yes}%` }} />
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-emerald-600">YES {c1Yes}%</span>
              <span className="text-rose-500">NO {100 - c1Yes}%</span>
            </div>
          </div>

          {/* Alignment score */}
          <div className="text-center">
            {alignmentScore !== null ? (
              <>
                <p className="text-5xl font-black text-slate-900">{alignmentScore}%</p>
                <p className="text-xs text-slate-400 mt-1">agreement on {totalShared} shared votes</p>
                <div className="mt-3 h-2 w-full bg-rose-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${alignmentScore}%` }} />
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400 font-medium">No shared vote history</p>
            )}
          </div>

          {/* C2 DNA */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide truncate text-right">{c2}</p>
            <div className="flex h-3 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${c2Yes}%` }} />
              <div className="bg-rose-400 h-full" style={{ width: `${100 - c2Yes}%` }} />
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-emerald-600">YES {c2Yes}%</span>
              <span className="text-rose-500">NO {100 - c2Yes}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Topic breakdown ── */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">By topic</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topicBreakdown.map((t, i) => {
            const barColor = TOPIC_DOT[t.topic] ?? TOPIC_DOT.General;
            const lightColor = TOPIC_LIGHT[t.topic] ?? TOPIC_LIGHT.General;
            return (
              <motion.div
                key={t.topic}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", lightColor)}>
                    {t.topic}
                  </span>
                  {t.agreement !== null && (
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      t.agreement >= 70 ? "bg-emerald-50 text-emerald-600" :
                      t.agreement >= 50 ? "bg-amber-50 text-amber-600" :
                                          "bg-rose-50 text-rose-600"
                    )}>
                      {t.agreement}% agree
                    </span>
                  )}
                </div>

                {/* C1 bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span className="font-medium truncate max-w-[120px]">{c1Last}</span>
                    <span>{t.c1Yes != null ? `YES ${t.c1Yes}%` : '—'}</span>
                  </div>
                  {t.c1Yes != null && <VoteBar pct={t.c1Yes} color={barColor} />}
                </div>

                {/* C2 bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span className="font-medium truncate max-w-[120px]">{c2Last}</span>
                    <span>{t.c2Yes != null ? `YES ${t.c2Yes}%` : '—'}</span>
                  </div>
                  {t.c2Yes != null && <VoteBar pct={t.c2Yes} color="bg-slate-400" />}
                </div>

                {t.shared > 0 && (
                  <p className="text-[10px] text-slate-400">{t.shared} shared votes</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Top divergences ── */}
      {topDivergences.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Where they split — top {topDivergences.length} notable
          </h2>
          <div className="space-y-2">
            {topDivergences.map(m => (
              <Link key={m.id} to={`/motions/${m.id}`}>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-[#004a99]/40 hover:shadow-sm transition-all group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-1">{m.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{m.date} · {m.topic}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-center">
                      <p className="text-[9px] text-slate-400 mb-0.5">{c1Last}</p>
                      <span className={cn("text-xs font-bold",
                        m.votes[c1] === 'YES' ? 'text-emerald-600' : m.votes[c1] === 'NO' ? 'text-rose-500' : 'text-amber-500')}>
                        {m.votes[c1]}
                      </span>
                    </div>
                    <div className="w-px h-5 bg-slate-200" />
                    <div className="text-center">
                      <p className="text-[9px] text-slate-400 mb-0.5">{c2Last}</p>
                      <span className={cn("text-xs font-bold",
                        m.votes[c2] === 'YES' ? 'text-emerald-600' : m.votes[c2] === 'NO' ? 'text-rose-500' : 'text-amber-500')}>
                        {m.votes[c2]}
                      </span>
                    </div>
                    {m.url && (
                      <a href={m.url} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-slate-300 hover:text-[#004a99] transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#004a99] transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
