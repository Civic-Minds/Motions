import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { slugToName } from '../utils/slug';
import { COUNCILLOR_WARD } from '../utils/councillorWard';
import { getCommittee } from '../constants/data';
import { cn } from '../lib/utils';
import MotionCardItem from './MotionCardItem';
import { Filter, X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import FilterSidebar from './FilterSidebar';

function readSet(params, key) {
  return new Set((params.get(key) || '').split(',').filter(Boolean));
}

function voteYear(date) {
  return date?.match(/\b20\d{2}\b/)?.[0] ?? '';
}

function FilterButton({ active, children, onClick, tone = 'blue' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
        active && tone === 'blue' && 'bg-[#004a99] text-white',
        active && tone === 'green' && 'bg-emerald-600 text-white',
        active && tone === 'red' && 'bg-rose-500 text-white',
        !active && 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      )}
    >
      {children}
    </button>
  );
}

function FilterPanel({ topics, committees, years, topicFilter, outcomeFilter, committeeFilter, yearFilter, followingOnly, onToggleSet, onCommitteeChange, onFollowingToggle, onClear }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Topic</p>
        <div className="flex flex-wrap gap-1">
          {topics.map(topic => (
            <FilterButton key={topic} active={topicFilter.has(topic)} onClick={() => onToggleSet('topic', topic)}>{topic}</FilterButton>
          ))}
        </div>
      </div>

      <div className="pt-2.5 border-t border-slate-100">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Vote</p>
        <div className="flex flex-wrap gap-1">
          <FilterButton active={outcomeFilter.has('YES')} tone="green" onClick={() => onToggleSet('outcome', 'YES')}>Yes</FilterButton>
          <FilterButton active={outcomeFilter.has('NO')} tone="red" onClick={() => onToggleSet('outcome', 'NO')}>No</FilterButton>
        </div>
      </div>

      <div className="pt-2.5 border-t border-slate-100">
        <label htmlFor="vote-committee" className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">Committee</label>
        <select
          id="vote-committee"
          value={committeeFilter}
          onChange={e => onCommitteeChange(e.target.value)}
          className="w-full rounded-lg border-0 bg-slate-100 px-2 py-1.5 text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#004a99]/30"
        >
          <option value="">All committees</option>
          {committees.map(committee => <option key={committee} value={committee}>{committee}</option>)}
        </select>
      </div>

      <div className="pt-2.5 border-t border-slate-100">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Year</p>
        <div className="flex flex-wrap gap-1">
          {years.map(year => (
            <FilterButton key={year} active={yearFilter.has(year)} onClick={() => onToggleSet('year', year)}>{year}</FilterButton>
          ))}
        </div>
      </div>

      <div className="pt-2.5 border-t border-slate-100">
        <FilterButton active={followingOnly} onClick={onFollowingToggle}>
          Following
        </FilterButton>
      </div>

      {(topicFilter.size > 0 || outcomeFilter.size > 0 || committeeFilter || yearFilter.size > 0 || followingOnly) && (
        <button type="button" onClick={onClear} className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors">
          <X className="w-3 h-3" /> Clear filters
        </button>
      )}
    </div>
  );
}

export default function CouncillorVotes({ motions }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { followedCommittees } = useAppContext();

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

  const voteCommittees = useMemo(() =>
    [...new Set(allVotes.map(m => m.committee || getCommittee(m.id)).filter(Boolean))].sort(),
    [allVotes]);

  const voteYears = useMemo(() =>
    [...new Set(allVotes.map(m => voteYear(m.date)).filter(Boolean))].sort().reverse(),
    [allVotes]);

  const topicFilter = readSet(searchParams, 'topic');
  const outcomeFilter = readSet(searchParams, 'outcome');
  const yearFilter = readSet(searchParams, 'year');
  const committeeFilter = searchParams.get('committee') || '';
  const followingOnly = searchParams.get('following') === '1';

  const updateFilters = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value.size !== undefined) {
      if (value.size > 0) next.set(key, [...value].join(','));
      else next.delete(key);
    } else if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const toggleSet = (key, value) => {
    const current = readSet(searchParams, key);
    current.has(value) ? current.delete(value) : current.add(value);
    updateFilters(key, current);
  };

  const clearFilters = () => setSearchParams({}, { replace: true });

  const filtered = useMemo(() => allVotes
    .filter(m => topicFilter.size === 0 || topicFilter.has(m.topic))
    .filter(m => outcomeFilter.size === 0 || outcomeFilter.has(m.votes?.[selected]))
    .filter(m => !committeeFilter || (m.committee || getCommittee(m.id)) === committeeFilter)
    .filter(m => yearFilter.size === 0 || yearFilter.has(voteYear(m.date)))
    .filter(m => !followingOnly || (followedCommittees.length > 0 && followedCommittees.includes(m.committee || getCommittee(m.id)))),
    [allVotes, topicFilter, outcomeFilter, committeeFilter, yearFilter, followingOnly, followedCommittees, selected]);

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
          {ward ? `Ward ${ward.id} · ${ward.name}` : 'Toronto City Council'} · {allVotes.length.toLocaleString()} votes
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-6 lg:items-start">
        <FilterSidebar>
          <FilterPanel {...{ topics: voteTopics, committees: voteCommittees, years: voteYears, topicFilter, outcomeFilter, committeeFilter, yearFilter, followingOnly, followedCommittees }} onToggleSet={toggleSet} onCommitteeChange={value => updateFilters('committee', value)} onFollowingToggle={() => updateFilters('following', followingOnly ? '' : '1')} onClear={clearFilters} />
        </FilterSidebar>

        <div>
          <button type="button" onClick={() => setMobileFiltersOpen(open => !open)} className="lg:hidden w-full mb-3 flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600">
            <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</span>
            <span className="text-xs text-slate-400">{filtered.length.toLocaleString()} votes</span>
          </button>
          {mobileFiltersOpen && (
            <div className="lg:hidden mb-4 bg-white border border-slate-200 rounded-2xl p-4">
              <FilterPanel {...{ topics: voteTopics, committees: voteCommittees, years: voteYears, topicFilter, outcomeFilter, committeeFilter, yearFilter, followingOnly, followedCommittees }} onToggleSet={toggleSet} onCommitteeChange={value => updateFilters('committee', value)} onFollowingToggle={() => updateFilters('following', followingOnly ? '' : '1')} onClear={clearFilters} />
            </div>
          )}

          <p className="text-[10px] text-slate-400 mb-3">{filtered.length.toLocaleString()} votes</p>
          <div className="space-y-2">
            {filtered.map((m, i) => (
              <MotionCardItem key={m.id} motion={m} index={i} vote={m.votes[selected]} votePlacement="inline" showVoteBadge={outcomeFilter.size !== 1} showTopicBadge={topicFilter.size !== 1} showStatus={false} showCommittee={false} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
