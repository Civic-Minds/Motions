import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { slugToName } from '../utils/slug';
import { COUNCILLOR_WARD } from '../utils/councillorWard';
import { cn } from '../lib/utils';
import MotionCardItem from './MotionCardItem';

export default function CouncillorVotes({ motions }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [topicFilter, setTopicFilter] = useState(new Set());
  const [outcomeFilter, setOutcomeFilter] = useState(new Set());

  const allNames = useMemo(() => {
    const s = new Set();
    motions.forEach(m => { if (m.votes) Object.keys(m.votes).forEach(n => s.add(n)); });
    return [...s].sort();
  }, [motions]);

  const selected = useMemo(() => slugToName(slug, allNames), [slug, allNames]);
  const ward = selected ? COUNCILLOR_WARD[selected] : null;

  const allVotes = useMemo(() => {
    if (!selected) return [];
    return motions
      .filter(m => !m.parentId && m.votes?.[selected])
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selected, motions]);

  const voteTopics = useMemo(() =>
    [...new Set(allVotes.map(m => m.topic).filter(Boolean))],
    [allVotes]);

  const filtered = useMemo(() => allVotes
    .filter(m => topicFilter.size === 0 || topicFilter.has(m.topic))
    .filter(m => outcomeFilter.size === 0 || outcomeFilter.has(m.votes?.[selected])),
    [allVotes, topicFilter, outcomeFilter, selected]);

  if (!selected) return null;

  return (
    <div className="pb-20">

      {/* Back to profile */}
      <button
        onClick={() => navigate(`/councillors/${slug}`)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        {selected}
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Voting record</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {ward ? `Ward ${ward.id} · ${ward.name}` : 'Toronto City Council'} · {allVotes.length} votes
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1">Category</span>
        {voteTopics.map(topic => (
          <button
            key={topic}
            onClick={() => setTopicFilter(prev => {
              const next = new Set(prev);
              next.has(topic) ? next.delete(topic) : next.add(topic);
              return next;
            })}
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors",
              topicFilter.has(topic)
                ? 'bg-[#004a99] text-white border-[#004a99]'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            )}
          >
            {topic}
          </button>
        ))}
        <div className="w-px h-4 bg-slate-200 mx-1" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1">Vote</span>
        {[['YES', 'Yes'], ['NO', 'No']].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setOutcomeFilter(prev => {
              const next = new Set(prev);
              next.has(value) ? next.delete(value) : next.add(value);
              return next;
            })}
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors",
              outcomeFilter.has(value)
                ? value === 'YES' ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-rose-500 text-white border-rose-500'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-slate-400 mb-3">{filtered.length} votes</p>

      <div className="space-y-2">
        {filtered.map((m, i) => (
          <MotionCardItem
            key={m.id}
            motion={m}
            index={i}
            vote={m.votes[selected]}
            votePlacement="inline"
            showVoteBadge={outcomeFilter.size !== 1}
            showTopicBadge={topicFilter.size !== 1}
            showStatus={false}
            showCommittee={false}
          />
        ))}
      </div>
    </div>
  );
}
