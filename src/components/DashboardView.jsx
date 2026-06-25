import React, { useState, useMemo, useEffect, useReducer, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, X, Search, Star, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { getCommittee, TOPIC_LIGHT, TOPIC_DOT, WARD_COUNCILLORS } from '../constants/data';
import { getWardId } from '../utils/storage';
import { committeeToSlug } from '../utils/slug';
import { useAppContext } from '../contexts/AppContext';
import YourWardCard from './YourWardCard';
import MotionCardItem from './MotionCardItem';

const TorontoMiniMap = lazy(() => import('./TorontoMiniMap'));

const TOPICS = ['Housing', 'Transit', 'Finance', 'Parks', 'Climate', 'General'];

const VOTE_TYPES = [
  { label: 'All', value: 'All' },
  { label: 'Close vote', value: 'close-vote' },
  { label: 'Unanimous', value: 'unanimous' },
  { label: 'Defeated', value: 'defeated' },
  { label: 'Landslide loss', value: 'landslide-defeat' },
];

const initialFilters = {
  topics: [],
  committees: [],
  voteTypes: [],
  years: [],
  showNotableOnly: false,
  showMyWard: false,
  showLastMeeting: false,
  showFollowingOnly: false,
  committeeSearch: '',
  committeeOpen: false,
};

function filtersReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_TOPIC':
      return { ...state, topics: state.topics.includes(action.topic) ? state.topics.filter(t => t !== action.topic) : [...state.topics, action.topic] };
    case 'CLEAR_TOPICS':
      return { ...state, topics: [] };
    case 'ADD_COMMITTEE':
      return { ...state, committees: [...state.committees, action.committee], committeeSearch: '', committeeOpen: false };
    case 'REMOVE_COMMITTEE':
      return { ...state, committees: state.committees.filter(c => c !== action.committee) };
    case 'TOGGLE_VOTE_TYPE':
      return { ...state, voteTypes: state.voteTypes.includes(action.voteType) ? state.voteTypes.filter(v => v !== action.voteType) : [...state.voteTypes, action.voteType] };
    case 'CLEAR_VOTE_TYPES':
      return { ...state, voteTypes: [] };
    case 'TOGGLE_YEAR':
      return { ...state, years: state.years.includes(action.year) ? state.years.filter(y => y !== action.year) : [...state.years, action.year] };
    case 'CLEAR_YEARS':
      return { ...state, years: [] };
    case 'TOGGLE_NOTABLE':
      return { ...state, showNotableOnly: !state.showNotableOnly, showFollowingOnly: false };
    case 'TOGGLE_MY_WARD':
      return { ...state, showMyWard: !state.showMyWard };
    case 'TOGGLE_LAST_MEETING':
      return { ...state, showLastMeeting: !state.showLastMeeting };
    case 'TOGGLE_FOLLOWING':
      return { ...state, showFollowingOnly: !state.showFollowingOnly, showNotableOnly: false, showMyWard: false };
    case 'SET_COMMITTEE_SEARCH':
      return { ...state, committeeSearch: action.value };
    case 'SET_COMMITTEE_OPEN':
      return { ...state, committeeOpen: action.value };
    case 'CLEAR':
      return initialFilters;
    default:
      return state;
  }
}

function hasActiveFilters(f) {
  return f.topics.length > 0 || f.committees.length > 0 || f.voteTypes.length > 0 || f.years.length > 0
    || f.showNotableOnly || f.showMyWard || f.showLastMeeting || f.showFollowingOnly;
}

// ── Sub-component: desktop filter sidebar ─────────────────────────────────
function FilterSidebar({ filters, dispatch, committees, years, sortedCount, savedCouncillor, lastMeeting }) {
  return (
    <div className="hidden lg:flex flex-col sticky top-24 bg-white border border-slate-200 rounded-2xl p-3 gap-3 h-[480px] overflow-y-auto">

      {/* Topic */}
      <div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Topic</p>
        <div className="flex flex-wrap gap-1">
          {['All', ...TOPICS].map(topic => (
            <button
              key={topic}
              onClick={() => topic === 'All' ? dispatch({ type: 'CLEAR_TOPICS' }) : dispatch({ type: 'TOGGLE_TOPIC', topic })}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
                (topic === 'All' && filters.topics.length === 0) || filters.topics.includes(topic)
                  ? "bg-[#004a99] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {topic !== 'All' && (
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", filters.topics.includes(topic) ? 'bg-white/60' : TOPIC_DOT[topic])} />
              )}
              {topic === 'All' ? 'All' : topic}
            </button>
          ))}
        </div>
      </div>

      {/* Committee */}
      <div className="pt-2.5 border-t border-slate-100">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Committee</p>
        {filters.committees.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {filters.committees.map(c => (
              <span key={c} className="flex items-center gap-1 bg-[#004a99] text-white px-2 py-0.5 rounded-full text-[10px] font-medium leading-tight">
                <span className="truncate max-w-[130px]">{c}</span>
                <X className="w-3 h-3 cursor-pointer shrink-0 hover:opacity-75" onClick={() => dispatch({ type: 'REMOVE_COMMITTEE', committee: c })} />
              </span>
            ))}
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={filters.committeeSearch}
            onChange={e => dispatch({ type: 'SET_COMMITTEE_SEARCH', value: e.target.value })}
            onFocus={() => dispatch({ type: 'SET_COMMITTEE_OPEN', value: true })}
            onBlur={() => setTimeout(() => dispatch({ type: 'SET_COMMITTEE_OPEN', value: false }), 150)}
            placeholder={filters.committees.length > 0 ? 'Add another…' : 'Search…'}
            className="w-full pl-6 pr-2 py-1 text-[11px] bg-slate-100 rounded-lg outline-none placeholder:text-slate-400 text-slate-700 focus:ring-1 focus:ring-[#004a99]/30"
          />
          {filters.committeeSearch && (
            <button
              onClick={() => dispatch({ type: 'SET_COMMITTEE_SEARCH', value: '' })}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        {filters.committeeOpen && (
          <div className="mt-1 space-y-0.5">
            {committees
              .filter(c => !filters.committeeSearch || c.toLowerCase().includes(filters.committeeSearch.toLowerCase()))
              .filter(c => !filters.committees.includes(c))
              .map(c => (
                <button
                  key={c}
                  onClick={() => dispatch({ type: 'ADD_COMMITTEE', committee: c })}
                  className="w-full text-left px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all text-slate-600 hover:bg-slate-100"
                >
                  {c}
                </button>
              ))
            }
          </div>
        )}
      </div>

      {/* Vote Type */}
      <div className="pt-2.5 border-t border-slate-100">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Vote Type</p>
        <div className="flex flex-wrap gap-1">
          {VOTE_TYPES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => value === 'All' ? dispatch({ type: 'CLEAR_VOTE_TYPES' }) : dispatch({ type: 'TOGGLE_VOTE_TYPE', voteType: value })}
              className={cn(
                "px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
                (value === 'All' && filters.voteTypes.length === 0) || filters.voteTypes.includes(value)
                  ? "bg-[#004a99] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Year */}
      <div className="pt-2.5 border-t border-slate-100">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Year</p>
        <div className="flex flex-wrap gap-1">
          {['All', ...years].map(y => (
            <button
              key={y}
              onClick={() => y === 'All' ? dispatch({ type: 'CLEAR_YEARS' }) : dispatch({ type: 'TOGGLE_YEAR', year: y })}
              className={cn(
                "px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
                (y === 'All' && filters.years.length === 0) || filters.years.includes(y)
                  ? "bg-[#004a99] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {y === 'All' ? 'All' : y}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="pt-2.5 border-t border-slate-100 flex flex-wrap gap-1">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_FOLLOWING' })}
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all text-left",
            filters.showFollowingOnly ? "bg-[#004a99] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <Star className={cn("w-3 h-3 shrink-0", filters.showFollowingOnly ? "fill-current" : "")} /> Following
        </button>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_NOTABLE' })}
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
            filters.showNotableOnly ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <AlertCircle className="w-3 h-3 shrink-0" /> Notable
        </button>
        {savedCouncillor && (
          <button
            onClick={() => dispatch({ type: 'TOGGLE_MY_WARD' })}
            className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
              filters.showMyWard ? "bg-[#004a99] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            My Ward
          </button>
        )}
        {lastMeeting.date && (
          <button
            onClick={() => dispatch({ type: 'TOGGLE_LAST_MEETING' })}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
              filters.showLastMeeting ? "bg-[#004a99] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            <Calendar className="w-3 h-3 shrink-0" /> Last meeting
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[10px] text-slate-400">{sortedCount.toLocaleString()} motions</p>
        {hasActiveFilters(filters) && (
          <button
            onClick={() => dispatch({ type: 'CLEAR' })}
            className="flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ── Sub-component: motion list + load more ─────────────────────────────────
function MotionList({ visibleMotions, sortedCount, visibleCount, onLoadMore, filters, dispatch, committees, years }) {
  return (
    <div className="space-y-4 min-w-0">

      {/* Mobile filters */}
      <div className="lg:hidden flex flex-wrap gap-2">
        {['All', ...TOPICS].map(topic => (
          <button
            key={topic}
            onClick={() => topic === 'All' ? dispatch({ type: 'CLEAR_TOPICS' }) : dispatch({ type: 'TOGGLE_TOPIC', topic })}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
              (topic === 'All' && filters.topics.length === 0) || filters.topics.includes(topic)
                ? "bg-[#004a99] text-white border-[#004a99]"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            )}
          >
            {topic !== 'All' && (
              <span className={cn("w-1.5 h-1.5 rounded-full", filters.topics.includes(topic) ? 'bg-white/60' : TOPIC_DOT[topic])} />
            )}
            {topic === 'All' ? 'All Topics' : topic}
          </button>
        ))}
        {VOTE_TYPES.filter(t => t.value !== 'All').map(({ label, value }) => (
          <button
            key={value}
            onClick={() => dispatch({ type: 'TOGGLE_VOTE_TYPE', voteType: value })}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
              filters.voteTypes.includes(value)
                ? "bg-[#004a99] text-white border-[#004a99]"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            )}
          >
            {label}
          </button>
        ))}
        {committees.map(c => (
          <button
            key={c}
            onClick={() => filters.committees.includes(c) ? dispatch({ type: 'REMOVE_COMMITTEE', committee: c }) : dispatch({ type: 'ADD_COMMITTEE', committee: c })}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
              filters.committees.includes(c)
                ? "bg-[#004a99] text-white border-[#004a99]"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            )}
          >
            {c}
          </button>
        ))}
        {years.map(y => (
          <button
            key={y}
            onClick={() => dispatch({ type: 'TOGGLE_YEAR', year: y })}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
              filters.years.includes(y)
                ? "bg-[#004a99] text-white border-[#004a99]"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            )}
          >
            {y}
          </button>
        ))}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_NOTABLE' })}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
            filters.showNotableOnly
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          )}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Notable
        </button>
      </div>

      <div className="space-y-2">
        {visibleMotions.map((m, i) => (
          <MotionCardItem key={m.id} motion={m} index={i} />
        ))}

        {sortedCount === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-400 text-sm">No motions match the current filters.</p>
          </div>
        )}

        {visibleCount < sortedCount && (
          <button
            onClick={onLoadMore}
            className="w-full py-3 text-sm font-medium text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
          >
            Show 20 more ({sortedCount - visibleCount} remaining)
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function DashboardView({ motions, meetings = [] }) {
  const { followedCommittees = [] } = useAppContext();
  const navigate = useNavigate();
  const [filters, dispatch] = useReducer(filtersReducer, initialFilters);
  const [visibleCount, setVisibleCount] = useState(20);

  const savedWardId = useMemo(() => getWardId(), []);
  const savedCouncillor = savedWardId ? WARD_COUNCILLORS[savedWardId] : null;

  // Only primary entries (no parentId) for display and stats
  const primaryMotions = useMemo(() => motions.filter(m => !m.parentId), [motions]);

  // Last Meeting
  const lastMeeting = useMemo(() => {
    const motionsToConsider = followedCommittees.length > 0
      ? primaryMotions.filter(m => followedCommittees.includes(m.committee || getCommittee(m.id)))
      : primaryMotions;
    const dates = [...new Set(motionsToConsider.map(m => m.date))].sort((a, b) => new Date(b) - new Date(a));
    const date = dates[0] ?? null;
    const items = date ? motionsToConsider.filter(m => m.date === date) : [];
    const committeeList = [...new Set(items.map(m => m.committee || getCommittee(m.id)))];
    return { date, count: items.length, items, isFollowed: followedCommittees.length > 0, committee: committeeList[0] || null };
  }, [primaryMotions, followedCommittees]);

  // Personal Feed (Followed Committees)
  const followedHighlights = useMemo(() => {
    if (followedCommittees.length === 0) return [];
    return [...primaryMotions]
      .filter(m => followedCommittees.includes(m.committee || getCommittee(m.id)))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);
  }, [primaryMotions, followedCommittees]);

  // Most notable (Global)
  const highlights = useMemo(() => {
    const usedIds = new Set(followedHighlights.map(m => m.id));
    const count = savedWardId ? 2 : 4;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 45);
    const pool = [...primaryMotions]
      .filter(m => !m.trivial && m.significance >= 60 && !usedIds.has(m.id))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = pool.filter(m => new Date(m.date) >= cutoff);
    return (recent.length >= count ? recent : pool).slice(0, count);
  }, [primaryMotions, savedWardId, followedHighlights]);

  // Ward motions
  const wardHighlights = useMemo(() => {
    if (!savedCouncillor) return [];
    const usedIds = new Set([...followedHighlights.map(m => m.id), ...highlights.map(m => m.id)]);
    return [...primaryMotions]
      .filter(m => m.votes && m.votes[savedCouncillor] && !usedIds.has(m.id))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 2);
  }, [primaryMotions, savedCouncillor, followedHighlights, highlights]);

  // Available committees and years
  const committees = useMemo(() => {
    const seen = new Set();
    primaryMotions.forEach(m => seen.add(m.committee || getCommittee(m.id)));
    return [...seen].sort();
  }, [primaryMotions]);

  const years = useMemo(() => {
    const seen = new Set();
    primaryMotions.forEach(m => { const y = m.date?.match(/\d{4}/)?.[0]; if (y) seen.add(y); });
    return [...seen].sort((a, b) => b - a);
  }, [primaryMotions]);

  const sortedMotions = useMemo(() => {
    return [...primaryMotions]
      .filter(m => {
        if (filters.topics.length > 0 && !filters.topics.includes(m.topic)) return false;
        if (filters.committees.length > 0 && !filters.committees.includes(m.committee || getCommittee(m.id))) return false;
        if (filters.voteTypes.length > 0 && !filters.voteTypes.some(vt => m.flags?.includes(vt))) return false;
        if (filters.showNotableOnly && m.significance < 60) return false;
        if (filters.showMyWard && savedWardId && m.ward !== savedWardId) return false;
        if (filters.showFollowingOnly && !followedCommittees.includes(m.committee || getCommittee(m.id))) return false;
        if (filters.years.length > 0 && !filters.years.includes(m.date?.match(/\d{4}/)?.[0])) return false;
        if (filters.showLastMeeting && lastMeeting.date && m.date !== lastMeeting.date) return false;
        return true;
      })
      .sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        return (b.significance ?? 0) - (a.significance ?? 0);
      });
  }, [primaryMotions, filters, savedWardId, followedCommittees, lastMeeting]);

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(20); }, [filters]);

  const visibleMotions = sortedMotions.slice(0, visibleCount);

  return (
    <div className="space-y-4">

      {/* ── Bento row: Last Meeting | Notable | Your Ward ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_220px] gap-3 items-stretch overflow-hidden">

        {/* 1. Left Col: Your Following or Your Ward (ONE Card) */}
        {followedHighlights.length > 0 ? (() => {
          const m = followedHighlights[0];
          return (
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Your Following</p>
                <Star className="w-3 h-3 text-amber-500 fill-current shrink-0" />
              </div>
              <motion.button
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => navigate(`/motions/${m.id}`)}
                className="bg-white border border-slate-200 rounded-2xl p-4 text-left group flex flex-col gap-2 hover:border-[#004a99]/40 hover:shadow-sm transition-all flex-1"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>
                    {m.topic}
                  </span>
                  <span className="text-[8px] font-bold text-[#004a99] uppercase truncate ml-1">{m.committee || getCommittee(m.id)}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-3 leading-snug flex-1">
                  {m.title}
                </p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                  <span className="text-[9px] text-slate-400">{m.date.split(',')[0]}</span>
                  <span className="text-[9px] font-semibold text-[#004a99]">See more</span>
                </div>
              </motion.button>
            </div>
          );
        })() : (
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">My Ward</p>
            </div>
            <YourWardCard />
          </div>
        )}

        {/* 2. Middle: Notable + Your Ward (4-card Grid) */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide col-span-2">Most Notable</p>
            {wardHighlights.length > 0 && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide col-span-2">Ward Motions</p>
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-stretch flex-1 min-w-0">
            {highlights.length === 0 && wardHighlights.length === 0 && (
              <div className="col-span-2 lg:col-span-4 flex items-center justify-center py-10 bg-white border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-400">No notable motions yet.</p>
              </div>
            )}
            {[...highlights, ...wardHighlights].map((m, i) => {
              const yesCount = Object.values(m.votes ?? {}).filter(v => v === 'YES').length;
              const noCount  = Object.values(m.votes ?? {}).filter(v => v === 'NO').length;
              const total    = yesCount + noCount;
              return (
                <motion.button
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/motions/${m.id}`)}
                  className="bg-white border border-slate-200 rounded-2xl p-4 text-left group flex flex-col gap-2 hover:border-[#004a99]/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>
                      {m.topic}
                    </span>
                    {total > 0 && (
                      <span className="text-[9px] font-medium shrink-0">
                        <span className="text-emerald-600 font-bold">{yesCount}</span>
                        <span className="text-slate-300 mx-0.5">–</span>
                        <span className="text-rose-500 font-bold">{noCount}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-3 leading-snug flex-1" title={m.title}>
                    {m.title}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                    <span className="text-[9px] text-slate-400">{m.date.split(',')[0]}</span>
                    <span className="text-[9px] font-semibold text-[#004a99] group-hover:underline">See more</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 3. Right: Coming Up (ONE Card) */}
        <div className="flex flex-col gap-1.5 overflow-hidden">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Coming Up</p>
            <div className="flex items-center gap-2">
              <Link to="/meetings" className="text-[10px] font-semibold text-[#004a99]/60 hover:text-[#004a99] transition-colors">
                See more
              </Link>
              <Calendar className="w-3 h-3 text-slate-300" />
            </div>
          </div>
          {(() => {
            const TODAY = new Date().toISOString().slice(0, 10);
            const meeting = meetings.find(m => m.date >= TODAY);
            const topic = meeting ? (meeting.isCouncil ? 'Council' : (() => {
              const name = meeting.committee.toLowerCase();
              if (name.includes('housing')) return 'Housing';
              if (name.includes('transit')) return 'Transit';
              if (name.includes('budget') || name.includes('finance')) return 'Finance';
              if (name.includes('parks') || name.includes('environment')) return 'Parks';
              if (name.includes('climate')) return 'Climate';
              return 'Committee';
            })()) : null;
            const slug = meeting ? committeeToSlug(meeting.committee) : '';
            const meetingDest = meeting?.meetingReference
              ? `/meetings/${meeting.meetingReference}`
              : meeting ? `/committees/${slug}` : null;

            return (
              <button
                onClick={() => meetingDest && navigate(meetingDest)}
                className={cn(
                  "rounded-2xl p-4 flex flex-col gap-2 transition-all border text-left flex-1",
                  meeting
                    ? "bg-white border-slate-200 hover:border-[#004a99]/40 hover:shadow-sm cursor-pointer group"
                    : "bg-white border-dashed border-slate-200 text-slate-400 cursor-default"
                )}
              >
                {meeting ? (
                  <>
                    <div className="flex items-center justify-between gap-1">
                      <span className={cn(
                        "text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                        TOPIC_LIGHT[topic] || (topic === 'Council' ? "bg-blue-100 text-blue-700" : 'bg-slate-100 text-slate-600')
                      )}>
                        {topic}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-2 leading-snug" title={meeting.committee}>
                      {meeting.committee}
                    </p>
                    {meeting.location && (
                      <p className="text-[9px] text-slate-400 leading-tight line-clamp-1" title={meeting.location}>
                        {meeting.location}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                      <span className="text-[9px] text-slate-400 whitespace-nowrap">{meeting.displayDate}</span>
                      <span className="text-[9px] font-semibold text-[#004a99] shrink-0 ml-1">{meeting.startTime}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-[10px] font-medium my-auto text-center italic opacity-60">
                    No further meetings
                  </p>
                )}
              </button>
            );
          })()}
        </div>
      </div>

      {/* ── Main: Filter sidebar + motion list (same column widths as bento) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_220px] lg:gap-x-3 lg:items-start gap-y-4">

        <FilterSidebar
          filters={filters}
          dispatch={dispatch}
          committees={committees}
          years={years}
          sortedCount={sortedMotions.length}
          savedCouncillor={savedCouncillor}
          lastMeeting={lastMeeting}
        />

        <MotionList
          visibleMotions={visibleMotions}
          sortedCount={sortedMotions.length}
          visibleCount={visibleCount}
          onLoadMore={() => setVisibleCount(c => c + 20)}
          filters={filters}
          dispatch={dispatch}
          committees={committees}
          years={years}
        />

        {/* Toronto mini-map — click navigates to /wards */}
        <div className="hidden lg:flex flex-col sticky top-24">
          <Suspense fallback={<div className="rounded-2xl bg-slate-100 animate-pulse h-[480px] border border-slate-200" />}>
            <TorontoMiniMap motions={motions} />
          </Suspense>
        </div>

      </div>

    </div>
  );
}
