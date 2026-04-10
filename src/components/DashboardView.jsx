import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TorontoMiniMap = lazy(() => import('./TorontoMiniMap'));
import { ArrowRight, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { getCommittee, TOPIC_LIGHT, TOPIC_DOT, WARD_COUNCILLORS } from '../constants/data';
import YourWardCard from './YourWardCard';

const TOPICS = ['Housing', 'Transit', 'Finance', 'Parks', 'Climate', 'General'];

export default function DashboardView({ motions, councillors }) {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedCommittee, setSelectedCommittee] = useState('All');
  const [voteType, setVoteType] = useState('All');
  const [showNotableOnly, setShowNotableOnly] = useState(false);
  const [showMyWard, setShowMyWard] = useState(false);
  const [showLastMeeting, setShowLastMeeting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedYear, setSelectedYear] = useState('All');

  const savedWardId = useMemo(() => {
    try {
      const raw = localStorage.getItem('motions_ward_id');
      return raw ? String(parseInt(raw, 10)) : null;
    } catch { return null; }
  }, []);
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
  const substantiveCount = primaryMotions.filter(m => !m.trivial).length;
  const adoptionRate = primaryMotions.length > 0 ? Math.round((adoptedCount / primaryMotions.length) * 100) : 0;

  const lastMeeting = useMemo(() => {
    const dates = [...new Set(primaryMotions.map(m => m.date))].sort((a, b) => new Date(b) - new Date(a));
    const date = dates[0] ?? null;
    const items = date ? primaryMotions.filter(m => m.date === date) : [];
    return { date, count: items.length, items };
  }, [primaryMotions]);

  // Topics from only the last meeting
  const lastMeetingTopics = useMemo(() => {
    return [...new Set(lastMeeting.items.map(m => m.topic).filter(Boolean))];
  }, [lastMeeting.items]);

  const adoptionRateLastMeeting = useMemo(() => {
    if (!lastMeeting.items.length) return null;
    const adopted = lastMeeting.items.filter(m => m.status === 'Adopted').length;
    return Math.round((adopted / lastMeeting.items.length) * 100);
  }, [lastMeeting.items]);

  // Most recent notable motions
  const highlights = useMemo(() => {
    return [...primaryMotions]
      .filter(m => !m.trivial && m.significance >= 60)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);
  }, [primaryMotions]);

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
        if (selectedTopic !== 'All' && m.topic !== selectedTopic) return false;
        if (selectedCommittee !== 'All' && (m.committee || getCommittee(m.id)) !== selectedCommittee) return false;
        if (voteType !== 'All' && !m.flags?.includes(voteType)) return false;
        if (showNotableOnly && m.significance < 60) return false;
        if (showMyWard && savedWardId && m.ward !== savedWardId) return false;
        if (showLastMeeting && lastMeeting.date && m.date !== lastMeeting.date) return false;
        if (selectedYear !== 'All' && m.date?.match(/\d{4}/)?.[0] !== selectedYear) return false;
        return true;
      })
      .sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        return (b.significance ?? 0) - (a.significance ?? 0);
      });
  }, [primaryMotions, selectedTopic, selectedCommittee, voteType, showNotableOnly, showMyWard, savedWardId, showLastMeeting, lastMeeting.date, selectedYear]);

  const visibleMotions = showAll ? sortedMotions : sortedMotions.slice(0, 20);

  return (
    <div className="space-y-4">

      {/* ── Bento row: Last Meeting | Notable | Your Ward ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_220px] gap-3 items-stretch overflow-hidden">

        {/* Last Meeting */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1">Last Meeting</p>
          <button
            onClick={() => setShowLastMeeting(s => !s)}
            className={cn("bg-white rounded-2xl p-4 flex flex-col gap-2 flex-1 text-left transition-all border", showLastMeeting ? "border-[#004a99] shadow-sm" : "border-slate-200 hover:border-[#004a99]/40 hover:shadow-sm")}
          >
            {lastMeetingTopics.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {lastMeetingTopics.map(topic => (
                  <span key={topic} className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full", TOPIC_LIGHT[topic] || 'bg-slate-100 text-slate-600')}>
                    {topic}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs font-semibold text-slate-800">{lastMeeting.count} motion{lastMeeting.count !== 1 ? 's' : ''}</p>
            {adoptionRateLastMeeting !== null && (
              <div className="mt-auto">
                <div className="flex justify-between text-[9px] mb-1">
                  <span className="text-slate-500 font-medium">Adopted</span>
                  <span className="font-bold text-emerald-600">{adoptionRateLastMeeting}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${adoptionRateLastMeeting}%` }} />
                </div>
              </div>
            )}
            {lastMeeting.date && <p className="text-[9px] text-slate-400">{lastMeeting.date}</p>}
          </button>
        </div>

        {/* Most Recent Notable */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1">Most Recent Notable</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-stretch flex-1 min-w-0">
            {highlights.length === 0 && (
              <div className="col-span-2 lg:col-span-4 flex items-center justify-center py-10 bg-white border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-400">No notable motions yet.</p>
              </div>
            )}
            {highlights.map((m, i) => {
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
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-3 leading-snug flex-1">
                    {m.title}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[9px] text-slate-400">{m.date}</span>
                    <span className="text-[9px] font-semibold text-[#004a99] group-hover:underline">See more</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Your Ward */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1">Your Ward</p>
          <div className="flex-1 min-h-0 flex flex-col">
            <YourWardCard motions={motions} />
          </div>
        </div>

      </div>

      {/* ── Main: Filter sidebar + motion list (same column widths as bento) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_220px] lg:gap-x-3 lg:items-start gap-y-4">

        {/* Filter sidebar (desktop) */}
        <div className="hidden lg:block sticky top-24 bg-white border border-slate-200 rounded-2xl p-3 space-y-3">

          {/* Topic */}
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Topic</p>
            <div className="flex flex-wrap gap-1">
              {['All', ...TOPICS].map(topic => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
                    selectedTopic === topic
                      ? "bg-[#004a99] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {topic !== 'All' && (
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", selectedTopic === topic ? 'bg-white/60' : TOPIC_DOT[topic])} />
                  )}
                  {topic === 'All' ? 'All' : topic}
                </button>
              ))}
            </div>
          </div>

          {/* Committee */}
          <div className="pt-2.5 border-t border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Committee</p>
            <div className="flex flex-wrap gap-1">
              {['All', ...committees].map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCommittee(c)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
                    selectedCommittee === c
                      ? "bg-[#004a99] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {c === 'All' ? 'All' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Vote Type */}
          <div className="pt-2.5 border-t border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Vote Type</p>
            <div className="flex flex-wrap gap-1">
              {VOTE_TYPES.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setVoteType(value)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
                    voteType === value
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
                  onClick={() => setSelectedYear(y)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[11px] font-medium transition-all",
                    selectedYear === y
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
              onClick={() => setShowNotableOnly(s => !s)}
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
            <p className="text-[10px] text-slate-400">{sortedMotions.length} motions</p>
            {(selectedTopic !== 'All' || selectedCommittee !== 'All' || voteType !== 'All' || selectedYear !== 'All' || showNotableOnly || showMyWard || showLastMeeting) && (
              <button
                onClick={() => {
                  setSelectedTopic('All');
                  setSelectedCommittee('All');
                  setVoteType('All');
                  setSelectedYear('All');
                  setShowNotableOnly(false);
                  setShowMyWard(false);
                  setShowLastMeeting(false);
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
                onClick={() => setSelectedTopic(topic)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                  selectedTopic === topic
                    ? "bg-[#004a99] text-white border-[#004a99]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                )}
              >
                {topic !== 'All' && (
                  <span className={cn("w-1.5 h-1.5 rounded-full", selectedTopic === topic ? 'bg-white/60' : TOPIC_DOT[topic])} />
                )}
                {topic === 'All' ? 'All Topics' : topic}
              </button>
            ))}
            {VOTE_TYPES.filter(t => t.value !== 'All').map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setVoteType(v => v === value ? 'All' : value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                  voteType === value
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
                onClick={() => setSelectedCommittee(v => v === c ? 'All' : c)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                  selectedCommittee === c
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
                onClick={() => setSelectedYear(v => v === y ? 'All' : y)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                  selectedYear === y
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

            {sortedMotions.length > 20 && (
              <button
                onClick={() => setShowAll(s => !s)}
                className="w-full py-3 text-sm font-medium text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
              >
                {showAll ? 'Show less' : `Show all ${sortedMotions.length} motions`}
              </button>
            )}
          </div>
        </div>

        {/* Toronto mini-map — click navigates to /wards */}
        <div className="hidden lg:flex flex-col sticky top-24">
          <Suspense fallback={<div className="rounded-2xl bg-slate-100 animate-pulse flex-1 min-h-[420px]" />}>
            <TorontoMiniMap motions={motions} />
          </Suspense>
        </div>

      </div>

    </div>
  );
}
