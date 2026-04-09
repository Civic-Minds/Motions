import React, { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';
import { getCommittee } from '../constants/data';
import MotionPanel from './MotionPanel';

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

export default function DashboardView({ motions }) {
  const { motionId } = useParams();
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [showNotableOnly, setShowNotableOnly] = useState(false);
  const [showAll, setShowAll] = useState(false);

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

  // Top notable motions — highest significance from last 90 days
  const highlights = useMemo(() => {
    const dates = motions.map(m => new Date(m.date)).filter(d => !isNaN(d));
    const latest = dates.length ? new Date(Math.max(...dates)) : new Date();
    const cutoff = new Date(latest);
    cutoff.setDate(cutoff.getDate() - 90);
    return [...motions]
      .filter(m => !m.trivial && m.significance >= 60 && new Date(m.date) >= cutoff)
      .sort((a, b) => b.significance - a.significance)
      .slice(0, 5);
  }, [motions]);

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
    <div className="space-y-6">

      {/* ── Combined hero: stats + highlights ── */}
      <Card className="rounded-3xl overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-[220px_1fr]">

            {/* Stats column */}
            <div className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Last Meeting</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{lastMeeting.count}</span>
                  <span className="text-sm text-slate-400 font-medium">motions</span>
                </div>
                {lastMeeting.date && <p className="text-xs text-slate-400 mt-1">{lastMeeting.date}</p>}
                {lastMeetingTopics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {lastMeetingTopics.map(topic => (
                      <span key={topic} className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", TOPIC_LIGHT[topic] || 'bg-slate-100 text-slate-600')}>
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-5 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adopted</p>
                  <p className="text-2xl font-black text-emerald-600 mt-0.5">{adoptionRate}%</p>
                  <p className="text-[10px] text-slate-400">{adoptedCount} of {motions.length} all-time</p>
                </div>
                <div className="w-px bg-slate-100" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Substantive</p>
                  <p className="text-2xl font-black text-[#004a99] mt-0.5">{substantiveCount}</p>
                  <p className="text-[10px] text-slate-400">non-trivial, all-time</p>
                </div>
              </div>
            </div>

            {/* Highlights column */}
            <div className="p-6 sm:p-8">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Recent highlights</p>
              {highlights.length > 0 ? (
                <div className="space-y-1">
                  {highlights.slice(0, 5).map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => navigate(`/motions/${m.id}`)}
                      className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className={cn("w-1 self-stretch rounded-full shrink-0 mt-0.5", m.status === 'Adopted' ? 'bg-emerald-400' : 'bg-rose-400')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-2 leading-snug">
                          {m.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>
                            {m.topic}
                          </span>
                          <span className="text-[10px] text-slate-400">{m.date}</span>
                          {m.significance >= 90 && <span className="text-[10px] font-bold text-amber-600">High Impact</span>}
                          {m.significance >= 60 && m.significance < 90 && <span className="text-[10px] font-bold text-amber-600">Notable</span>}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#004a99] shrink-0 mt-1 transition-colors" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No recent notable motions.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
