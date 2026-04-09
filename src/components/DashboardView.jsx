import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle } from 'lucide-react';

const TOPIC_PREFS_KEY = 'motions_topic_prefs';
import { cn } from '../lib/utils';
import { getCommittee } from '../constants/data';
import MotionPanel from './MotionPanel';
import YourWardCard from './YourWardCard';

const TOPICS = ['Housing', 'Transit', 'Finance', 'Parks', 'Climate', 'General'];

const TOPIC_COLORS = {
  Housing: 'bg-blue-500',
  Transit: 'bg-amber-500',
  Finance: 'bg-emerald-500',
  Parks:   'bg-green-500',
  Climate: 'bg-teal-500',
  General: 'bg-slate-400',
};

const TOPIC_LIGHT = {
  Housing: 'bg-blue-50 text-blue-700',
  Transit: 'bg-amber-50 text-amber-700',
  Finance: 'bg-emerald-50 text-emerald-700',
  Parks:   'bg-green-50 text-green-700',
  Climate: 'bg-teal-50 text-teal-700',
  General: 'bg-slate-100 text-slate-600',
};

export default function DashboardView({ motions, councillors }) {
  const { motionId } = useParams();
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [showNotableOnly, setShowNotableOnly] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [topicPrefs, setTopicPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem(TOPIC_PREFS_KEY);
      return stored ? JSON.parse(stored) : TOPICS;
    } catch { return TOPICS; }
  });

  useEffect(() => {
    localStorage.setItem(TOPIC_PREFS_KEY, JSON.stringify(topicPrefs));
  }, [topicPrefs]);

  function toggleTopicPref(topic) {
    setTopicPrefs(prev =>
      prev.includes(topic)
        ? prev.length > 1 ? prev.filter(t => t !== topic) : prev
        : [...prev, topic]
    );
  }

  const selectedMotion = useMemo(
    () => (motionId ? motions.find(m => m.id === motionId) ?? null : null),
    [motions, motionId]
  );

  const adoptedCount = motions.filter(m => m.status === 'Adopted').length;
  const substantiveCount = motions.filter(m => !m.trivial).length;
  const adoptionRate = motions.length > 0 ? Math.round((adoptedCount / motions.length) * 100) : 0;

  const lastMeeting = useMemo(() => {
    const dates = [...new Set(motions.map(m => m.date))].sort((a, b) => new Date(b) - new Date(a));
    const date = dates[0] ?? null;
    const items = date ? motions.filter(m => m.date === date) : [];
    return { date, count: items.length, items };
  }, [motions]);

  // Topics from only the last meeting
  const lastMeetingTopics = useMemo(() => {
    return [...new Set(lastMeeting.items.map(m => m.topic).filter(Boolean))];
  }, [lastMeeting.items]);

  const adoptionRateLastMeeting = useMemo(() => {
    if (!lastMeeting.items.length) return null;
    const adopted = lastMeeting.items.filter(m => m.status === 'Adopted').length;
    return Math.round((adopted / lastMeeting.items.length) * 100);
  }, [lastMeeting.items]);

  // Most recent notable motions, filtered by topic prefs
  const highlights = useMemo(() => {
    return [...motions]
      .filter(m => !m.trivial && m.significance >= 60 && topicPrefs.includes(m.topic))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);
  }, [motions, topicPrefs]);

  const sortedMotions = useMemo(() => {
    return [...motions]
      .filter(m => {
        if (selectedTopic !== 'All' && m.topic !== selectedTopic) return false;
        if (showNotableOnly && m.significance < 60) return false;
        return true;
      })
      .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0));
  }, [motions, selectedTopic, showNotableOnly]);

  const visibleMotions = showAll ? sortedMotions : sortedMotions.slice(0, 20);

  return (
    <div className="space-y-4">

      {/* ── Top section: three cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_240px] gap-4 items-stretch">

        {/* Last Meeting card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Meeting</p>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">{lastMeeting.count}
              <span className="text-sm font-medium text-slate-400 ml-1.5">motion{lastMeeting.count !== 1 ? 's' : ''}</span>
            </p>
            {lastMeeting.date && <p className="text-xs text-slate-400 mt-1">{lastMeeting.date}</p>}
          </div>
          {adoptionRateLastMeeting !== null && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 font-medium">Adopted</span>
                <span className="font-bold text-emerald-600">{adoptionRateLastMeeting}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${adoptionRateLastMeeting}%` }} />
              </div>
            </div>
          )}
          {lastMeetingTopics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto pt-1">
              {lastMeetingTopics.map(topic => (
                <span key={topic} className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full", TOPIC_LIGHT[topic] || 'bg-slate-100 text-slate-600')}>
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Most Recent Notable card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Most Recent Notable</p>
            <div className="flex flex-wrap gap-1">
              {TOPICS.map(topic => (
                <button
                  key={topic}
                  onClick={() => toggleTopicPref(topic)}
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border transition-all",
                    topicPrefs.includes(topic)
                      ? cn("border-transparent text-white", {
                          Housing: 'bg-blue-500',
                          Transit: 'bg-amber-500',
                          Finance: 'bg-emerald-500',
                          Parks:   'bg-green-500',
                          Climate: 'bg-teal-500',
                          General: 'bg-slate-400',
                        }[topic] || 'bg-slate-500')
                      : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                  )}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {highlights.length > 0 ? (
            <div className="space-y-1.5 flex-1">
              {highlights.map((m, i) => {
                const yesCount = Object.values(m.votes ?? {}).filter(v => v === 'YES').length;
                const noCount  = Object.values(m.votes ?? {}).filter(v => v === 'NO').length;
                const total    = yesCount + noCount;
                return (
                  <motion.button
                    key={m.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/motions/${m.id}`)}
                    className="w-full text-left group flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 hover:border-[#004a99]/30 hover:bg-slate-50 transition-all"
                  >
                    <div className={cn("w-1 self-stretch rounded-full shrink-0 mt-0.5", m.status === 'Adopted' ? 'bg-emerald-400' : 'bg-rose-400')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-1 leading-snug">
                        {m.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn("text-[9px] font-medium px-1 py-0.5 rounded", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>
                          {m.topic}
                        </span>
                        {total > 0 && (
                          <span className="text-[9px] text-slate-400">
                            <span className="text-emerald-600 font-bold">{yesCount}</span>–<span className="text-rose-500 font-bold">{noCount}</span>
                          </span>
                        )}
                        <span className="text-[9px] text-slate-400">{m.date}</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No recent highlights for selected topics.</p>
          )}
        </div>

        {/* Your Ward */}
        <YourWardCard motions={motions} />
      </div>

      {/* ── Main: sidebar + list ── */}
      <div className="lg:grid lg:grid-cols-[180px_1fr] lg:gap-6 lg:items-start space-y-6 lg:space-y-0">

        {/* ── Topic sidebar (desktop) ── */}
        <div className="hidden lg:block sticky top-24">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-3">Filter</p>
          <div className="space-y-0.5">
            {['All', ...TOPICS].map(topic => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-left transition-all",
                  selectedTopic === topic
                    ? topic === 'All'
                      ? "bg-slate-900 text-white"
                      : "bg-[#004a99] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {topic !== 'All' && (
                  <span className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    selectedTopic === topic ? 'bg-white/60' : TOPIC_COLORS[topic]
                  )} />
                )}
                {topic === 'All' ? 'All Topics' : topic}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <button
              onClick={() => setShowNotableOnly(s => !s)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                showNotableOnly
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              Notable only
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 px-3">{sortedMotions.length} motions</p>
        </div>

        {/* ── Right: mobile filter pills + list ── */}
        <div className="space-y-4">

          {/* Mobile topic pills */}
          <div className="lg:hidden flex flex-wrap gap-2">
            {['All', ...TOPICS].map(topic => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                  selectedTopic === topic
                    ? topic === 'All' ? "bg-slate-900 text-white border-slate-900" : "bg-[#004a99] text-white border-[#004a99]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                )}
              >
                {topic !== 'All' && (
                  <span className={cn("w-1.5 h-1.5 rounded-full", selectedTopic === topic ? 'bg-white/60' : TOPIC_COLORS[topic])} />
                )}
                {topic === 'All' ? 'All Topics' : topic}
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

          {/* ── Motions list ── */}
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
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", m.status === 'Adopted' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>{m.status}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>{m.topic}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{getCommittee(m.id)}</span>
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
      </div>

      {/* ── Motion detail panel ── */}
      <MotionPanel motion={selectedMotion} onClose={() => navigate('/')} />
    </div>
  );
}
