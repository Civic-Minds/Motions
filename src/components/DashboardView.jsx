import React, { useState, useMemo, useEffect, useReducer, lazy, Suspense } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, X, Search, Star, Calendar, Vote } from 'lucide-react';
import { cn } from '../lib/utils';
import { getCommittee, TOPIC_LIGHT, TOPIC_DOT, WARD_COUNCILLORS } from '../constants/data';
import { getWardId } from '../utils/storage';
import { committeeToSlug } from '../utils/slug';
import { fetchWardBoundaries, motionBelongsToWard } from '../utils/ward';
import { formatMotionDate } from '../utils/date';
import { isOnOrAfter } from '../utils/electionDate';
import { useAppContext } from '../contexts/AppContext';
import YourWardCard from './YourWardCard';
import MotionCardItem from './MotionCardItem';
import FilterSidebar from './FilterSidebar';
import { PageMeta } from './PageMeta';
import { CivicCard, CivicCardFooter, CivicPill } from './ui/CivicCard';

const TorontoMiniMap = lazy(() => import('./TorontoMiniMap'));
const VancouverMiniMap = lazy(() => import('./VancouverMiniMap'));

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

const isMobileViewport = () => (
  typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches
);

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
function DashboardFilterContent({ filters, dispatch, committees, years, sortedCount, savedCouncillor, lastMeeting }) {
  return (
    <>

      {/* Topic */}
      <div>
        <p className="text-[10px] lg:text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Topic</p>
        <div className="flex flex-wrap gap-1">
          {['All', ...TOPICS].map(topic => (
            <button
              key={topic}
              onClick={() => topic === 'All' ? dispatch({ type: 'CLEAR_TOPICS' }) : dispatch({ type: 'TOGGLE_TOPIC', topic })}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs lg:text-[11px] font-medium transition-all",
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
        <p className="text-[10px] lg:text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Committee</p>
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
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={filters.committeeSearch}
            onChange={e => dispatch({ type: 'SET_COMMITTEE_SEARCH', value: e.target.value })}
            onFocus={() => dispatch({ type: 'SET_COMMITTEE_OPEN', value: true })}
            onBlur={() => setTimeout(() => dispatch({ type: 'SET_COMMITTEE_OPEN', value: false }), 150)}
            placeholder={filters.committees.length > 0 ? 'Add another…' : 'Search…'}
            className="w-full pl-6 pr-2 py-1 text-xs lg:text-[11px] bg-slate-100 rounded-lg outline-none placeholder:text-slate-500 text-slate-700 focus:ring-1 focus:ring-[#004a99]/30"
          />
          {filters.committeeSearch && (
            <button
              onClick={() => dispatch({ type: 'SET_COMMITTEE_SEARCH', value: '' })}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600"
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
        <p className="text-[10px] lg:text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Vote Type</p>
        <div className="flex flex-wrap gap-1">
          {VOTE_TYPES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => value === 'All' ? dispatch({ type: 'CLEAR_VOTE_TYPES' }) : dispatch({ type: 'TOGGLE_VOTE_TYPE', voteType: value })}
              className={cn(
                "px-2 py-0.5 rounded-full text-xs lg:text-[11px] font-medium transition-all",
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
        <p className="text-[10px] lg:text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Year</p>
        <div className="flex flex-wrap gap-1">
          {['All', ...years].map(y => (
            <button
              key={y}
              onClick={() => y === 'All' ? dispatch({ type: 'CLEAR_YEARS' }) : dispatch({ type: 'TOGGLE_YEAR', year: y })}
              className={cn(
                "px-2 py-0.5 rounded-full text-xs lg:text-[11px] font-medium transition-all",
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
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs lg:text-[11px] font-medium transition-all text-left",
            filters.showFollowingOnly ? "bg-[#004a99] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <Star className={cn("w-3 h-3 shrink-0", filters.showFollowingOnly ? "fill-current" : "")} /> Following
        </button>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_NOTABLE' })}
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs lg:text-[11px] font-medium transition-all",
            filters.showNotableOnly ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <AlertCircle className="w-3 h-3 shrink-0" /> Notable
        </button>
        {savedCouncillor && (
          <button
            onClick={() => dispatch({ type: 'TOGGLE_MY_WARD' })}
            className={cn(
              "px-2 py-0.5 rounded-full text-xs lg:text-[11px] font-medium transition-all",
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
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs lg:text-[11px] font-medium transition-all",
              filters.showLastMeeting ? "bg-[#004a99] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            <Calendar className="w-3 h-3 shrink-0" /> Last meeting
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[11px] lg:text-[10px] text-slate-500">{sortedCount.toLocaleString()} motions</p>
        {hasActiveFilters(filters) && (
          <button
            onClick={() => dispatch({ type: 'CLEAR' })}
            className="flex items-center gap-1 text-[11px] lg:text-[10px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
    </>
  );
}

// ── Sub-component: motion list + load more ─────────────────────────────────
function MotionList({ visibleMotions, sortedCount, visibleCount, onLoadMore, filters, dispatch, committees, years, savedCouncillor, lastMeeting }) {
  const activeFilterCount = filters.topics.length + filters.committees.length + filters.voteTypes.length + filters.years.length
    + Number(filters.showNotableOnly) + Number(filters.showMyWard) + Number(filters.showLastMeeting) + Number(filters.showFollowingOnly);

  return (
    <div className="space-y-4 min-w-0">

      {/* Mobile filters */}
      <details className="lg:hidden bg-white border border-slate-200 rounded-2xl overflow-hidden group">
        <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none text-sm font-semibold text-slate-700">
          <span>Filter motions</span>
          <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
            {activeFilterCount > 0 && `${activeFilterCount} applied`}
            <span className="text-slate-400 transition-transform group-open:rotate-180">⌄</span>
          </span>
        </summary>
        <div className="border-t border-slate-100 p-3 space-y-3">
          <DashboardFilterContent
            filters={filters}
            dispatch={dispatch}
            committees={committees}
            years={years}
            sortedCount={sortedCount}
            savedCouncillor={savedCouncillor}
            lastMeeting={lastMeeting}
          />
        </div>
      </details>

      <div className="space-y-2">
        {visibleMotions.map((m, i) => (
          <MotionCardItem key={m.id} motion={m} index={i} />
        ))}

        {sortedCount === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-500 text-sm">No motions match the current filters.</p>
          </div>
        )}

        {visibleCount < sortedCount && (
          <button
            onClick={onLoadMore}
            className="w-full py-3 text-sm font-medium text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
          >
            Show 20 more ({(sortedCount - visibleCount).toLocaleString()} remaining)
          </button>
        )}
      </div>
    </div>
  );
}

function UpcomingMeeting({ meetings, navigate, className = '' }) {
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
    <div className={cn('flex flex-col gap-1.5 overflow-hidden', className)}>
      <div className="flex items-center justify-between px-1">
        <p className="text-xs lg:text-[10px] font-bold text-slate-500 uppercase tracking-wide">Coming Up</p>
        <div className="flex items-center gap-2">
          <Link to="/meetings" className="text-xs lg:text-[10px] font-semibold text-[#004a99]/60 hover:text-[#004a99] transition-colors">
            See more
          </Link>
          <Calendar className="w-3 h-3 text-slate-300" />
        </div>
      </div>
      <button
        onClick={() => meetingDest && navigate(meetingDest)}
        className={cn(
          "rounded-2xl p-4 flex flex-col gap-2 transition-all border text-left flex-1",
          meeting
            ? "bg-white border-slate-200 hover:border-[#004a99]/40 hover:shadow-sm cursor-pointer group"
            : "bg-white border-dashed border-slate-200 text-slate-500 cursor-default"
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
              <p className="text-[9px] text-slate-500 leading-tight line-clamp-1" title={meeting.location}>
                {meeting.location}
              </p>
            )}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
              <span className="text-[9px] text-slate-500 whitespace-nowrap">{meeting.displayDate}</span>
              <span className="text-[9px] font-semibold text-[#004a99] shrink-0 ml-1">{meeting.startTime}</span>
            </div>
          </>
        ) : (
          <p className="text-[10px] font-medium my-auto text-center italic opacity-60">No further meetings</p>
        )}
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function DashboardView({ motions, meetings = [], jurisdiction = { id: 'toronto' } }) {
  const { followedCommittees = [] } = useAppContext();
  const isVancouver = jurisdiction.id === 'vancouver';
  const isToronto = jurisdiction.id === 'toronto';
  const hasElectionPromo = isToronto || isVancouver;
  const electionOver = isOnOrAfter(jurisdiction.election?.date);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filters, dispatch] = useReducer(filtersReducer, initialFilters, initial => {
    const topicParam = searchParams.get('topic');
    const committeeParam = searchParams.get('committee');
    return {
      ...initial,
      ...(topicParam && TOPICS.includes(topicParam) ? { topics: [topicParam] } : {}),
      ...(committeeParam ? { committees: [committeeParam] } : {}),
    };
  });
  const [visibleCount, setVisibleCount] = useState(() => isMobileViewport() ? 10 : 20);
  const [wardGeoData, setWardGeoData] = useState(null);

  const savedWardId = useMemo(() => isToronto ? getWardId() : null, [isToronto]);
  const wardFilter = searchParams.get('ward');
  const savedCouncillor = savedWardId ? WARD_COUNCILLORS[savedWardId] : null;
  const savedWardFeature = useMemo(() => wardGeoData?.features?.find(feature =>
    String(feature.properties.AREA_SHORT_CODE).replace(/^0+/, '') === String(savedWardId)
  ) ?? null, [wardGeoData, savedWardId]);

  useEffect(() => {
    fetchWardBoundaries().then(setWardGeoData).catch(() => {});
  }, []);

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
    const count = 4;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 45);
    const pool = [...primaryMotions]
      .filter(m => !m.trivial && m.significance >= 60 && !usedIds.has(m.id))
      .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0) || new Date(b.date) - new Date(a.date));
    const recent = pool.filter(m => new Date(m.date) >= cutoff);
    return recent.slice(0, count);
  }, [primaryMotions, savedWardId, followedHighlights]);

  // Ward motions
  const wardHighlights = useMemo(() => {
    if (!savedWardId) return [];
    const usedIds = new Set([...followedHighlights.map(m => m.id), ...highlights.map(m => m.id)]);
    return [...primaryMotions]
      .filter(m => (
        motionBelongsToWard(m, savedWardId, savedWardFeature)
      ) && !usedIds.has(m.id))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);
  }, [primaryMotions, savedWardId, savedWardFeature, followedHighlights, highlights]);

  const recentFallback = useMemo(() => {
    const usedIds = new Set([...followedHighlights.map(m => m.id), ...highlights.map(m => m.id), ...wardHighlights.map(m => m.id)]);
    return [...primaryMotions]
      // The homepage always has room for three motion cards. If fewer than
      // three recent notable/ward motions qualify, fill the remaining slots
      // with the next newest motions instead of leaving an empty slot.
      .filter(m => !usedIds.has(m.id))
      .sort((a, b) => new Date(b.date) - new Date(a.date) || (b.significance ?? 0) - (a.significance ?? 0))
      .slice(0, 3);
  }, [primaryMotions, followedHighlights, highlights, wardHighlights]);

  const homeMotionCards = useMemo(() => {
    const preferred = highlights.length > 0
      ? [...highlights.slice(0, 1), ...wardHighlights.slice(0, 2), ...highlights.slice(1)]
      : [...wardHighlights, ...recentFallback];
    const usedIds = new Set(preferred.map(m => m.id));
    const fillers = [...recentFallback, ...wardHighlights].filter(m => !usedIds.has(m.id));
    return [...preferred, ...fillers].slice(0, 3);
  }, [highlights, wardHighlights, recentFallback]);

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
        if (wardFilter && String(m.ward) !== wardFilter) return false;
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
  }, [primaryMotions, filters, savedWardId, followedCommittees, lastMeeting, wardFilter]);

  // Reset visible count when filters or the responsive layout changes.
  useEffect(() => { setVisibleCount(isMobileViewport() ? 10 : 20); }, [filters]);

  const visibleMotions = sortedMotions.slice(0, visibleCount);

  const renderHomeMotionCard = (m, i) => {
    const yesCount = Object.values(m.votes ?? {}).filter(v => v === 'YES').length;
    const noCount  = Object.values(m.votes ?? {}).filter(v => v === 'NO').length;
    const total    = yesCount + noCount;
    return (
      <CivicCard
        as="button"
        className="h-full animate-fade-in-scale"
        key={m.id}
        style={{ animationDelay: `${i * 0.04}s` }}
        onClick={() => navigate(`/motions/${m.id}`)}
      >
        <div className="flex items-center justify-between gap-1">
          <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>
            {m.topic}
          </span>
          {total > 0 && (
            <span className="ml-auto shrink-0 text-right text-[9px] font-medium">
              <span className="text-emerald-600 font-bold">{yesCount.toLocaleString()}</span>
              <span className="text-slate-300 mx-0.5">–</span>
              <span className="text-rose-500 font-bold">{noCount.toLocaleString()}</span>
            </span>
          )}
        </div>
        <p className="text-xs font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-3 leading-snug flex-1" title={m.title}>
          {m.title}
        </p>
        <CivicCardFooter>
          <span className="text-[10px] lg:text-[9px] text-slate-500">{formatMotionDate(m.date)}</span>
          <span className="ml-auto text-[10px] lg:text-[9px] font-semibold text-[#004a99] group-hover:underline">See more</span>
        </CivicCardFooter>
      </CivicCard>
    );
  };

  return (
    <div className="space-y-4">
      <PageMeta
        title={`Motions | ${jurisdiction.name} Council Voting Tracker`}
        description={`See what ${jurisdiction.name} City Council voted on and how each member voted.`}
      />

      {/* ── Bento row: Last Meeting | Notable | Your Ward ── */}
      <div className="grid grid-cols-2 lg:grid-cols-[200px_1fr_220px] gap-3 items-stretch overflow-hidden">

        {/* 1. Left Col: Your Following or Your Ward (ONE Card) */}
        {followedHighlights.length > 0 ? (() => {
          const m = followedHighlights[0];
          return (
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs lg:text-[10px] font-bold text-slate-500 uppercase tracking-wide">Your Following</p>
                <Star className="w-3 h-3 text-amber-500 fill-current shrink-0" />
              </div>
              <CivicCard
                as="button"
                onClick={() => navigate(`/motions/${m.id}`)}
                className="flex-1 animate-fade-in-scale"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>
                    {m.topic}
                  </span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 truncate ml-1">{m.committee || getCommittee(m.id)}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-3 leading-snug flex-1">
                  {m.title}
                </p>
                <CivicCardFooter>
                  <span className="text-[9px] text-slate-500">{formatMotionDate(m.date)}</span>
                  <span className="text-[9px] font-semibold text-[#004a99]">See more</span>
                </CivicCardFooter>
              </CivicCard>
            </div>
          );
        })() : isVancouver ? (
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs lg:text-[10px] font-bold text-slate-500 uppercase tracking-wide">Citywide council</p>
            </div>
            <CivicCard className="flex-1">
              <Vote className="w-4 h-4 text-[#004a99]" />
              <p className="text-xs font-semibold text-slate-800 line-clamp-3 leading-snug">Every Vancouver resident shares the same at-large council.</p>
              <CivicCardFooter>
                <span className="text-[9px] text-slate-500">Mayor + 10 councillors</span>
                <Link to="/councillors" className="text-[9px] font-semibold text-[#004a99]">See council</Link>
              </CivicCardFooter>
            </CivicCard>
          </div>
        ) : !isToronto ? (
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs lg:text-[10px] font-bold text-slate-500 uppercase tracking-wide">Council</p>
            </div>
            <CivicCard className="flex-1">
              <Vote className="w-4 h-4 text-[#004a99]" />
              <p className="text-xs font-semibold text-slate-800 line-clamp-3 leading-snug">Ward-level browsing isn’t available for {jurisdiction.name} yet — browse the full council instead.</p>
              <CivicCardFooter>
                <span className="text-[9px] text-slate-500">{jurisdiction.currentCouncillors?.length ?? 0} members</span>
                <Link to="/councillors" className="text-[9px] font-semibold text-[#004a99]">See council</Link>
              </CivicCardFooter>
            </CivicCard>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs lg:text-[10px] font-bold text-slate-500 uppercase tracking-wide">My Ward</p>
            </div>
            <YourWardCard />
          </div>
        )}

        {/* 2. Middle: Notable + Your Ward (4-card Grid) */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-1">
            <p className="text-xs lg:text-[10px] font-bold text-slate-500 uppercase tracking-wide col-span-2">
              <span className="lg:hidden">Election</span>
              <span className="hidden lg:inline">Most Notable</span>
            </p>
            {wardHighlights.length > 0 && (
              <p className="hidden lg:block text-[10px] font-bold text-slate-500 uppercase tracking-wide col-span-2">Ward Motions</p>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-stretch flex-1 min-w-0">
            <CivicCard
              {...(hasElectionPromo
                ? { as: Link, to: '/election' }
                : { as: 'a', href: jurisdiction.election?.officialUrl, target: '_blank', rel: 'noopener noreferrer' })}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 hover:border-blue-300"
            >
              <CivicPill className="bg-blue-100 text-blue-700">{electionOver ? 'Election result' : 'Election'}</CivicPill>
              <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-3 leading-snug">
                {!hasElectionPromo
                  ? `${jurisdiction.name}’s municipal election is coming up.`
                  : electionOver
                    ? (isVancouver ? 'See Vancouver’s new council.' : 'See your ward’s new council.')
                    : (isVancouver ? 'Register to run before September 11.' : 'See your ward’s candidates before election day.')}
              </p>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-blue-100">
                <span className="text-[9px] text-slate-500">{formatMotionDate(jurisdiction.election?.date)}</span>
                <span className="text-[9px] font-semibold text-blue-700">{!hasElectionPromo ? 'Official info' : electionOver ? 'See council' : (isVancouver ? 'See details' : 'Get ready')}</span>
              </div>
            </CivicCard>
            {homeMotionCards.map((m, i) => (
              <div key={m.id} className="hidden lg:block h-full">
                {renderHomeMotionCard(m, i)}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Right: Coming Up (ONE Card) */}
        <UpcomingMeeting meetings={meetings} navigate={navigate} className="hidden lg:flex lg:col-span-1" />
      </div>

      {/* Mobile notable motions — the election card stays beside My Ward above. */}
      {homeMotionCards.length > 0 && (
        <div className="lg:hidden space-y-1.5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide px-1">Most Notable</p>
          <div className="grid grid-cols-2 gap-3 items-stretch">
            {homeMotionCards.slice(0, 2).map(renderHomeMotionCard)}
          </div>
        </div>
      )}

      {/* ── Main: Filter sidebar + motion list (same column widths as bento) ── */}
      <div className={cn(
        'grid grid-cols-1 lg:gap-x-3 lg:items-start gap-y-4',
        (isToronto || isVancouver) ? 'lg:grid-cols-[200px_1fr_220px]' : 'lg:grid-cols-[200px_1fr]'
      )}>

        <FilterSidebar>
          <DashboardFilterContent
            filters={filters}
            dispatch={dispatch}
            committees={committees}
            years={years}
            sortedCount={sortedMotions.length}
            savedCouncillor={savedCouncillor}
            lastMeeting={lastMeeting}
          />
        </FilterSidebar>

        <MotionList
          visibleMotions={visibleMotions}
          sortedCount={sortedMotions.length}
          visibleCount={visibleCount}
          onLoadMore={() => setVisibleCount(c => c + 20)}
          filters={filters}
          dispatch={dispatch}
          committees={committees}
          years={years}
          savedCouncillor={savedCouncillor}
          lastMeeting={lastMeeting}
        />

        <UpcomingMeeting meetings={meetings} navigate={navigate} className="lg:hidden" />

        {/* City mini-map — Toronto/Vancouver only for now; each mini-map is
            its own hand-built component with a hardcoded city center, and
            neither has real geocoded locations to plot for other cities. */}
        {(isToronto || isVancouver) && (
          <div className="hidden lg:flex flex-col sticky top-24">
            <Suspense fallback={<div className="rounded-2xl bg-slate-100 animate-pulse h-[calc(100vh-7rem)] min-h-[480px] border border-slate-200" />}>
              {isVancouver ? <VancouverMiniMap motions={motions} /> : <TorontoMiniMap motions={motions} />}
            </Suspense>
          </div>
        )}

      </div>

    </div>
  );
}
