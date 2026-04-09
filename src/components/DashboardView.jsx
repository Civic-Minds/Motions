import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, FileText, ArrowRight, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

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
  const [expandedDate, setExpandedDate] = useState(null);

  const adoptedCount = motions.filter(m => m.status === 'Adopted').length;
  const substantiveCount = motions.filter(m => !m.trivial).length;
  const adoptionRate = motions.length > 0 ? Math.round((adoptedCount / motions.length) * 100) : 0;

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

  const filteredMotions = motions.filter(m => {
    if (selectedTopic !== 'All' && m.topic !== selectedTopic) return false;
    if (showNotableOnly && m.significance < 60) return false;
    return true;
  });

  const meetings = useMemo(() => {
    const grouped = filteredMotions.reduce((acc, m) => {
      if (!acc[m.date]) acc[m.date] = [];
      acc[m.date].push(m);
      return acc;
    }, {});
    return Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [filteredMotions]);

  return (
    <div className="space-y-8">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* Motions + topic bar */}
        <Card className="lg:col-span-2 rounded-3xl">
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Motions</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-slate-900 tracking-tighter leading-none">{motions.length}</span>
                <span className="text-sm text-slate-400 font-medium">total items</span>
              </div>
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
          <div className="space-y-2">
            {highlights.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <Link to={`/motions/${m.id}`}>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:border-[#004a99]/30 hover:shadow-md transition-all group shadow-sm">
                    <div className={cn("w-1 self-stretch rounded-full shrink-0", m.status === 'Adopted' ? 'bg-emerald-500' : 'bg-rose-500')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-1">{m.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{m.date}</span>
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", m.status === 'Adopted' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>{m.status}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>{m.topic}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#004a99] shrink-0 transition-colors" />
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

      {/* ── Meetings list ── */}
      <div className="space-y-3">
        {meetings.map(([date, dayMotions], i) => {
          const d = new Date(date);
          const label = d.toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          const adopted = dayMotions.filter(m => m.status === 'Adopted').length;
          const uniqueTopics = [...new Set(dayMotions.map(m => m.topic))].slice(0, 4);
          const isOpen = expandedDate === date;

          return (
            <motion.div key={date} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="overflow-hidden">
                {/* Header row */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 cursor-pointer hover:bg-slate-50/80 transition-colors"
                  onClick={() => setExpandedDate(isOpen ? null : date)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#004a99]/8 border border-[#004a99]/10 flex flex-col items-center justify-center shrink-0 text-[#004a99]">
                      <span className="text-[10px] font-bold uppercase">{d.toLocaleDateString('en-CA', { month: 'short' })}</span>
                      <span className="text-lg font-black leading-none">{d.getDate()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-base">{label}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{dayMotions.length} motions</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{adopted} adopted</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1.5">
                      {uniqueTopics.map(t => (
                        <div key={t} title={t} className={cn("w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white", TOPIC_COLORS[t] || 'bg-slate-400')}>
                          {t[0]}
                        </div>
                      ))}
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded motions */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-2">
                        {dayMotions.map(m => (
                          <Link key={m.id} to={`/motions/${m.id}`}>
                            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-start gap-3 hover:border-[#004a99]/30 hover:shadow-sm transition-all group/m">
                              <div className={cn("w-1 self-stretch rounded-full shrink-0 mt-0.5", m.status === 'Adopted' ? 'bg-emerald-400' : 'bg-rose-400')} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 group-hover/m:text-[#004a99] transition-colors line-clamp-2 leading-snug">{m.title}</p>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", m.status === 'Adopted' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>{m.status}</span>
                                  <span className={cn("text-xs px-2 py-0.5 rounded-full", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>{m.topic}</span>
                                  {m.significance >= 60 && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">Notable</span>}
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover/m:text-[#004a99] shrink-0 mt-1 transition-colors" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}

        {meetings.length === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-400 text-sm">No meetings match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
