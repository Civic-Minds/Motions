import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, X, Search, Star, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { getCommittee, TOPIC_LIGHT, TOPIC_DOT, WARD_COUNCILLORS } from '../constants/data';
import { getWardId } from '../utils/storage';
import YourWardCard from './YourWardCard';

const TorontoMiniMap = lazy(() => import('./TorontoMiniMap'));

const TOPICS = ['Housing', 'Transit', 'Finance', 'Parks', 'Climate', 'General'];

export default function DashboardView({ motions, councillors, meetings = [], followedCommittees = [] }) {
  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedCommittees, setSelectedCommittees] = useState([]);
  const [selectedVoteTypes, setSelectedVoteTypes] = useState([]);
  const [showNotableOnly, setShowNotableOnly] = useState(false);
  const [showMyWard, setShowMyWard] = useState(false);
  const [showLastMeeting, setShowLastMeeting] = useState(false);
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedYears, setSelectedYears] = useState([]);
  const [committeeSearch, setCommitteeSearch] = useState('');
  const [committeeOpen, setCommitteeOpen] = useState(false);

  const savedWardId = useMemo(() => getWardId(), []);
  const savedCouncillor = savedWardId ? WARD_COUNCILLORS[savedWardId] : null;

  const VOTE_TYPES = [
    { label: 'All', value: 'All' },
    { label: 'Close vote', value: 'close-vote' },
    { label: 'Unanimous', value: 'unanimous' },
    { label: 'Defeated', value: 'defeated' },
    { label: 'Landslide loss', value: 'landslide-defeat' },
  ];

  // Only primary entries (no parentId) for display and stats
  const primaryMotions = useMemo(() => motions.filter(m => !m.parentId), [motions]);

  const adoptedCount = primaryMotions.filter(m => m.status === 'Adopted').length;
  const adoptionRate = primaryMotions.length > 0 ? Math.round((adoptedCount / primaryMotions.length) * 100) : 0;

  // 1. Calculate the Last Meeting first
  const lastMeeting = useMemo(() => {
    const motionsToConsider = followedCommittees.length > 0
      ? primaryMotions.filter(m => followedCommittees.includes(m.committee || getCommittee(m.id)))
      : primaryMotions;
    
    const dates = [...new Set(motionsToConsider.map(m => m.date))].sort((a, b) => new Date(b) - new Date(a));
    const date = dates[0] ?? null;
    const items = date ? motionsToConsider.filter(m => m.date === date) : [];
    
    const committees = [...new Set(items.map(m => m.committee || getCommittee(m.id)))];
    const committee = committees[0] || null;

    return { date, count: items.length, items, isFollowed: followedCommittees.length > 0, committee };
  }, [primaryMotions, followedCommittees]);

  // 2. Derive topics and rates from the last meeting
  const lastMeetingTopics = useMemo(() => {
    return [...new Set(lastMeeting.items.map(m => m.topic).filter(Boolean))];
  }, [lastMeeting.items]);

  const adoptionRateLastMeeting = useMemo(() => {
    if (!lastMeeting.items.length) return null;
    const adopted = lastMeeting.items.filter(m => m.status === 'Adopted').length;
    return Math.round((adopted / lastMeeting.items.length) * 100);
  }, [lastMeeting.items]);

  // 1. Personal Feed (Followed Committees) — picks first
  const followedHighlights = useMemo(() => {
    if (followedCommittees.length === 0) return [];
    return [...primaryMotions]
      .filter(m => followedCommittees.includes(m.committee || getCommittee(m.id)))
      .sort((a,b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);
  }, [primaryMotions, followedCommittees]);

  // 2. Most notable (Global) — prefers last 45 days, falls back to older if needed
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

  // 3. Ward motions — excludes anything in Following or Notable
  const wardHighlights = useMemo(() => {
    if (!savedCouncillor) return [];
    const usedIds = new Set([
      ...followedHighlights.map(m => m.id),
      ...highlights.map(m => m.id),
    ]);
    return [...primaryMotions]
      .filter(m => m.votes && m.votes[savedCouncillor] && !usedIds.has(m.id))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 2);
  }, [primaryMotions, savedCouncillor, followedHighlights, highlights]);

  // Available committees derived from motions
  const committees = useMemo(() => {
    const seen = new Set();
    primaryMotions.forEach(m => seen.add(m.committee || getCommittee(m.id)));
    return [...seen].sort();
  }, [primaryMotions]);

  // Available years derived from motions
  const years = useMemo(() => {
    const seen = new Set();
    primaryMotions.forEach(m => { const y = m.date?.match(/\d{4}/)?.[0]; if (y) seen.add(y); });
    return [...seen].sort((a, b) => b - a);
  }, [primaryMotions]);

  const sortedMotions = useMemo(() => {
    return [...primaryMotions]
      .filter(m => {
        if (selectedTopics.length > 0 && !selectedTopics.includes(m.topic)) return false;
        if (selectedCommittees.length > 0 && !selectedCommittees.includes(m.committee || getCommittee(m.id))) return false;
        if (selectedVoteTypes.length > 0 && !selectedVoteTypes.some(vt => m.flags?.includes(vt))) return false;
        if (showNotableOnly && m.significance < 60) return false;
        if (showMyWard && savedWardId && m.ward !== savedWardId) return false;
        if (showFollowingOnly && !followedCommittees.includes(m.committee || getCommittee(m.id))) return false;
        if (selectedYears.length > 0 && !selectedYears.includes(m.date?.match(/\d{4}/)?.[0])) return false;
        return true;
      })
      .sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        return (b.significance ?? 0) - (a.significance ?? 0);
      });
  }, [primaryMotions, selectedTopics, selectedCommittees, selectedVoteTypes, showNotableOnly, showMyWard, savedWardId, showLastMeeting, lastMeeting.date, selectedYears]);

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(20); }, [selectedTopics, selectedCommittees, selectedVoteTypes, selectedYears, showNotableOnly, showMyWard, showLastMeeting, showFollowingOnly]);

  const visibleMotions = sortedMotions.slice(0, visibleCount);

  return (
    <div className="space-y-4">

      {/* ── Bento row: Last Meeting | Notable | Your Ward ── */}
      <div className={cn(
        "grid grid-cols-1 gap-3 items-stretch overflow-hidden",
        followedHighlights.length > 0 ? "lg:grid-cols-[200px_1fr_220px]" : "lg:grid-cols-[1fr_220px]"
      )}>

        {/* 1. Left Col: Your Following (ONE Card) — hidden when nothing followed */}
        {followedHighlights.length > 0 && (() => {
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
        })()}

        {/* 2. Middle: Notable + Your Ward (4-card Grid) */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide col-span-2">Most Notable</p>
            {wardHighlights.length > 0 && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide col-span-2">Your Ward</p>
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
              const isWard   = i >= highlights.length;
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
                  <p 
                    className="text-xs font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-3 leading-snug flex-1"
                    title={m.title}
                  >
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
            <Link to="/meetings" className="text-[10px] font-semibold text-[#004a99]/60 hover:text-[#004a99] transition-colors">
              See more
            </Link>
          </div>
          {(() => {
            const meeting = meetings[0];
            const topic = meeting ? (meeting.isCouncil ? 'Council' : (() => {
              const name = meeting.committee.toLowerCase();
              if (name.includes('housing')) return 'Housing';
              if (name.includes('transit')) return 'Transit';
              if (name.includes('budget') || name.includes('finance')) return 'Finance';
              if (name.includes('parks') || name.includes('environment')) return 'Parks';
              if (name.includes('climate')) return 'Climate';
              return 'Committee';
            })()) : null;
            const slug = meeting ? meeting.committee.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '';
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
                        topic === 'Council' ? "bg-blue-600 text-white" : (TOPIC_LIGHT[topic] || 'bg-slate-100 text-slate-600')
                      )}>
                        {topic}
                      </span>
                    </div>
                    <p 
                      className="text-xs font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-2 leading-snug"
                      title={meeting.committee}
                    >
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

        {/* Filter sidebar (desktop) */}
        <div className="hidden lg:flex flex-col sticky top-24 bg-white border border-slate-200 rounded-2xl p-3 gap-3 h-[480px] overflow-y-auto">

          {/* Topic */}
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Topic</p>
            <div className="flex flex-wrap gap-1">
              {['All', ...TOPICS].map(topic => (
                <button
                  key={topic}
                  onClick={() => {
                    if (topic === 'All') setSelectedTopics([]);
                    else setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
                    (topic === 'All' && selectedTopics.length === 0) || selectedTopics.includes(topic)
                      ? "bg-[#004a99] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {topic !== 'All' && (
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", selectedTopics.includes(topic) ? 'bg-white/60' : TOPIC_DOT[topic])} />
                  )}
                  {topic === 'All' ? 'All' : topic}
                </button>
              ))}
            </div>
          </div>

          {/* Committee */}
          <div className="pt-2.5 border-t border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Committee</p>
            {selectedCommittees.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {selectedCommittees.map(c => (
                  <span key={c} className="flex items-center gap-1 bg-[#004a99] text-white px-2 py-0.5 rounded-full text-[10px] font-medium leading-tight">
                    <span className="truncate max-w-[130px]">{c}</span>
                    <X className="w-3 h-3 cursor-pointer shrink-0 hover:opacity-75" onClick={() => setSelectedCommittees(prev => prev.filter(item => item !== c))} />
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={committeeSearch}
                onChange={e => setCommitteeSearch(e.target.value)}
                onFocus={() => setCommitteeOpen(true)}
                onBlur={() => setTimeout(() => setCommitteeOpen(false), 150)}
                placeholder={selectedCommittees.length > 0 ? 'Add another…' : 'Search…'}
                className="w-full pl-6 pr-2 py-1 text-[11px] bg-slate-100 rounded-lg outline-none placeholder:text-slate-400 text-slate-700 focus:ring-1 focus:ring-[#004a99]/30"
              />
              {committeeSearch && (
                <button
                  onClick={() => setCommitteeSearch('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {committeeOpen && (
              <div className="mt-1 space-y-0.5">
                {committees
                  .filter(c => !committeeSearch || c.toLowerCase().includes(committeeSearch.toLowerCase()))
                  .filter(c => !selectedCommittees.includes(c))
                  .map(c => (
                    <button
                      key={c}
                      onClick={() => { setSelectedCommittees(prev => [...prev, c]); setCommitteeSearch(''); }}
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
                  onClick={() => {
                    if (value === 'All') setSelectedVoteTypes([]);
                    else setSelectedVoteTypes(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
                  }}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
                    (value === 'All' && selectedVoteTypes.length === 0) || selectedVoteTypes.includes(value)
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
                  onClick={() => {
                    if (y === 'All') setSelectedYears([]);
                    else setSelectedYears(prev => prev.includes(y) ? prev.filter(v => v !== y) : [...prev, y]);
                  }}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
                    (y === 'All' && selectedYears.length === 0) || selectedYears.includes(y)
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
              onClick={() => {
                setShowFollowingOnly(!showFollowingOnly);
                setShowNotableOnly(false);
                setShowMyWard(false);
              }}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all text-left",
                showFollowingOnly
                  ? "bg-[#004a99] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <Star className={cn("w-3 h-3 shrink-0", showFollowingOnly ? "fill-current" : "")} /> Following
            </button>
            <button
              onClick={() => {
                setShowNotableOnly(s => !s);
                setShowFollowingOnly(false);
              }}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
                showNotableOnly
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <AlertCircle className="w-3 h-3 shrink-0" /> Notable
            </button>
            {savedCouncillor && (
              <button
                onClick={() => setShowMyWard(s => !s)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
                  showMyWard
                    ? "bg-[#004a99] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                My Ward
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] text-slate-400">{sortedMotions.length.toLocaleString()} motions</p>
            {(selectedTopics.length > 0 || selectedCommittees.length > 0 || selectedVoteTypes.length > 0 || selectedYears.length > 0 || showNotableOnly || showMyWard || showLastMeeting || showFollowingOnly) && (
              <button
                onClick={() => {
                  setSelectedTopics([]);
                  setSelectedCommittees([]);
                  setSelectedVoteTypes([]);
                  setSelectedYears([]);
                  setShowNotableOnly(false);
                  setShowMyWard(false);
                  setShowLastMeeting(false);
                  setShowFollowingOnly(false);
                }}
                className="flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Motion list */}
        <div className="space-y-4 min-w-0">

          {/* Mobile filters */}
          <div className="lg:hidden flex flex-wrap gap-2">
            {['All', ...TOPICS].map(topic => (
              <button
                key={topic}
                onClick={() => {
                  if (topic === 'All') setSelectedTopics([]);
                  else setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                  (topic === 'All' && selectedTopics.length === 0) || selectedTopics.includes(topic)
                    ? "bg-[#004a99] text-white border-[#004a99]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                )}
              >
                {topic !== 'All' && (
                  <span className={cn("w-1.5 h-1.5 rounded-full", selectedTopics.includes(topic) ? 'bg-white/60' : TOPIC_DOT[topic])} />
                )}
                {topic === 'All' ? 'All Topics' : topic}
              </button>
            ))}
            {VOTE_TYPES.filter(t => t.value !== 'All').map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setSelectedVoteTypes(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                  selectedVoteTypes.includes(value)
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
                onClick={() => setSelectedCommittees(prev => prev.includes(c) ? prev.filter(item => item !== c) : [...prev, c])}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                  selectedCommittees.includes(c)
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
                onClick={() => setSelectedYears(prev => prev.includes(y) ? prev.filter(v => v !== y) : [...prev, y])}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                  selectedYears.includes(y)
                    ? "bg-[#004a99] text-white border-[#004a99]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                )}
              >
                {y}
              </button>
            ))}
            <button
              onClick={() => setShowNotableOnly(s => !s)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                showNotableOnly
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
              <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}>
                <div
                  onClick={() => navigate(`/motions/${m.id}`)}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-3 hover:border-[#004a99]/40 hover:shadow-sm transition-all group cursor-pointer"
                >
                  <div className={cn("w-1 self-stretch rounded-full shrink-0", m.status === 'Adopted' ? 'bg-emerald-400' : 'bg-rose-400')} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-2 leading-snug">{m.title}</p>
                    {m.summary && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-snug">{m.summary}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", m.status === 'Adopted' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>{m.status}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>{m.topic}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{m.committee || getCommittee(m.id)}</span>
                      {m.significance >= 90 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">High Impact</span>}
                      {m.significance >= 60 && m.significance < 90 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Notable</span>}
                      <span className="text-xs text-slate-400 ml-auto">{m.date}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#004a99] shrink-0 mt-0.5 transition-colors" />
                </div>
              </motion.div>
            ))}

            {sortedMotions.length === 0 && (
              <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 text-sm">No motions match the current filters.</p>
              </div>
            )}

            {visibleCount < sortedMotions.length && (
              <button
                onClick={() => setVisibleCount(c => c + 20)}
                className="w-full py-3 text-sm font-medium text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
              >
                Show 20 more ({sortedMotions.length - visibleCount} remaining)
              </button>
            )}
          </div>
        </div>

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
