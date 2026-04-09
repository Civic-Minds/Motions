import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { getCommittee } from '../constants/data';

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
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [showNotableOnly, setShowNotableOnly] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const adoptedCount = motions.filter(m => m.status === 'Adopted').length;
  const substantiveCount = motions.filter(m => !m.trivial).length;
  const adoptionRate = motions.length > 0 ? Math.round((adoptedCount / motions.length) * 100) : 0;

  const lastMeeting = useMemo(() => {
    const dates = [...new Set(motions.map(m => m.date))].sort((a, b) => new Date(b) - new Date(a));
    const date = dates[0] ?? null;
    const items = date ? motions.filter(m => m.date === date) : [];
    return { date, count: items.length };
  }, [motions]);

  const topicCounts = motions.reduce((acc, m) => {
    acc[m.topic] = (acc[m.topic] || 0) + 1;
    return acc;
  }, {});
  const topTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

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
    <div className="space-y-8">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* Motions + topic bar */}
        <Card className="lg:col-span-2 rounded-3xl">
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Last Meeting</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-slate-900 tracking-tighter leading-none">{lastMeeting.count}</span>
                <span className="text-sm text-slate-400 font-medium">motions</span>
              </div>
              {lastMeeting.date && (
                <p className="text-xs text-slate-400 mt-1">{lastMeeting.date}</p>
              )}
            </div>
            <div className="flex-1 w-full max-w-xs">
              <p className="text-xs text-slate-400 font-medium text-right mb-2">By topic</p>
              <div className="flex h-3 rounded-full overflow-hidden gap-px bg-slate-100">
                {topTopics.map(([topic, count], i) => (
                  <motion.div
                    key={topic}
                    className={cn("h-full", TOPIC_COLORS[topic] || 'bg-slate-400')}
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / motions.length) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-end">
                {topTopics.slice(0, 3).map(([topic]) => (
                  <div key={topic} className="flex items-center gap-1 text-xs text-slate-500">
                    <div className={cn("w-2 h-2 rounded-full", TOPIC_COLORS[topic] || 'bg-slate-400')} />
                    {topic}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Substantive */}
        <Card className="rounded-3xl">
          <CardContent className="p-6 sm:p-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Substantive</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-6xl font-black text-[#004a99] tracking-tighter leading-none">{substantiveCount}</span>
              <span className="text-sm text-slate-400 font-medium">real decisions</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#004a99] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(substantiveCount / motions.length) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">{Math.round((substantiveCount / motions.length) * 100)}% of all items</p>
          </CardContent>
        </Card>

        {/* Adoption rate */}
        <Card className="rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 to-transparent pointer-events-none" />
          <CardContent className="p-6 sm:p-8 flex items-center justify-between relative">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Adopted</p>
              <motion.span
                className="text-6xl font-black text-emerald-600 tracking-tighter leading-none block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {adoptionRate}%
              </motion.span>
              <p className="text-xs text-slate-400 mt-1">{adoptedCount} passed</p>
            </div>
            <svg className="w-16 h-16 -rotate-90 shrink-0" viewBox="0 0 36 36">
              <path className="text-emerald-100" strokeWidth="3.5" stroke="currentColor" fill="none"
                d="M18 3 a 15 15 0 0 1 0 30 a 15 15 0 0 1 0 -30" />
              <motion.path
                className="text-emerald-500"
                strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none"
                d="M18 3 a 15 15 0 0 1 0 30 a 15 15 0 0 1 0 -30"
                initial={{ strokeDasharray: '0 100' }}
                animate={{ strokeDasharray: `${adoptionRate * 0.942} 100` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent highlights ── */}
      {highlights.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">What's been happening</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {highlights.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link to={`/motions/${m.id}`} className="block h-full">
                  <div className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#004a99]/40 hover:shadow-md transition-all shadow-sm h-full flex flex-col gap-3">
                    {/* Top: topic + status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>
                        {m.topic}
                      </span>
                      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full shrink-0",
                        m.status === 'Adopted' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>
                        {m.status}
                      </span>
                    </div>
                    {/* Title */}
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors leading-snug line-clamp-3 flex-1">
                      {m.title}
                    </p>
                    {/* Bottom: date + significance + arrow */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-400">{m.date}</span>
                      <div className="flex items-center gap-2">
                        {m.significance >= 90 && (
                          <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">High Impact</span>
                        )}
                        {m.significance >= 60 && m.significance < 90 && (
                          <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Notable</span>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#004a99] transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {['All', ...TOPICS].map(topic => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                selectedTopic === topic
                  ? topic === 'All' ? "bg-slate-900 text-white border-slate-900" : "bg-[#004a99] text-white border-[#004a99]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              )}
            >
              {topic === 'All' ? 'All Topics' : topic}
            </button>
          ))}
        </div>
        <Button variant={showNotableOnly ? 'default' : 'outline'} onClick={() => setShowNotableOnly(s => !s)} className="gap-2 shrink-0">
          <AlertCircle className="w-4 h-4" />
          {showNotableOnly ? 'Notable Only' : 'Show Notable'}
        </Button>
      </div>

      {/* ── Motions list ── */}
      <div className="space-y-2">
        {visibleMotions.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}>
            <Link to={`/motions/${m.id}`}>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-3 hover:border-[#004a99]/40 hover:shadow-sm transition-all group">
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
            </Link>
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
  );
}
