import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, FileText, ArrowRight, AlertCircle, ChevronDown, ChevronUp, Search, MapPin } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { nameToSlug } from '../utils/slug';

const TOPICS = ['Housing', 'Transit', 'Finance', 'Parks', 'Climate', 'General'];

const TOPIC_COLORS = {
  Housing: 'bg-blue-500',
  Transit: 'bg-amber-500',
  Finance: 'bg-emerald-500',
  Parks:   'bg-green-500',
  Climate: 'bg-teal-500',
  General: 'bg-slate-400',
};

// ── Hero Search ──────────────────────────────────────────────────────────────

function HeroSearch() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const hits = [];

    // Search ward numbers, ward names, and councillor names
    TORONTO_WARDS.forEach(ward => {
      const councillor = WARD_COUNCILLORS[ward.id];
      const wardLabel = `Ward ${ward.id}`;
      const matchesWard = wardLabel.toLowerCase().includes(q) || ward.name.toLowerCase().includes(q);
      const matchesCouncillor = councillor && councillor.toLowerCase().includes(q);

      if (matchesWard || matchesCouncillor) {
        hits.push({
          wardId: ward.id,
          wardName: ward.name,
          councillor: councillor || 'Unknown',
          matchType: matchesCouncillor ? 'councillor' : 'ward',
        });
      }
    });

    return hits.slice(0, 6);
  }, [query]);

  const handleSelect = (hit) => {
    const slug = nameToSlug(hit.councillor);
    navigate(`/councillors/${slug}`);
    setQuery('');
  };

  const showDropdown = focused && query.length >= 2 && results.length > 0;

  return (
    <div className="relative w-full max-w-2xl mx-auto px-4 sm:px-0">
      <div className={cn(
        "flex items-center gap-4 px-6 py-5 bg-white border-2 rounded-[24px] transition-all duration-500 shadow-sm",
        focused ? "border-[#004a99] shadow-2xl shadow-[#004a99]/10 scale-[1.02]" : "border-slate-100 hover:border-slate-200"
      )}>
        <Search className={cn("w-6 h-6 shrink-0 transition-colors duration-500", focused ? "text-[#004a99]" : "text-slate-300")} />
        <input
          type="text"
          placeholder="Search for your councillor, ward, or neighbourhood..."
          className="flex-1 bg-transparent border-none outline-none text-base font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
        />
        <Link
          to="/wards"
          className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#004a99] transition-all shrink-0 hover:bg-blue-50 px-3 py-2 rounded-xl"
          title="Use your location to find your ward"
        >
          <MapPin className="w-4 h-4" />
          <span className="hidden sm:inline uppercase tracking-widest">Find Ward</span>
        </Link>
      </div>

      {/* Dropdown results */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute z-50 w-full mt-3 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[28px] shadow-2xl overflow-hidden p-2"
          >
            {results.map((hit, i) => (
              <button
                key={hit.wardId}
                onMouseDown={() => handleSelect(hit)}
                className="w-full flex items-center gap-5 px-5 py-4 text-left hover:bg-[#004a99]/5 rounded-[20px] transition-all group"
              >
                <div className="w-12 h-12 rounded-[16px] bg-[#004a99] flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/10 group-hover:scale-110 transition-transform">
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter">W{hit.wardId}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-black text-slate-900 truncate group-hover:text-[#004a99] transition-colors">{hit.councillor}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ward {hit.wardId} · {hit.wardName}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-[#004a99] group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardView({ motions }) {
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [showNotableOnly, setShowNotableOnly] = useState(false);
  const [expandedDate, setExpandedDate] = useState(null);

  const filteredMotions = motions.filter(m => {
    if (selectedTopic !== 'All' && m.topic !== selectedTopic) return false;
    if (showNotableOnly && m.significance < 60) return false;
    return true;
  });

  const adoptedCount = motions.filter(m => m.status === 'Adopted').length;
  const substantiveCount = motions.filter(m => !m.trivial).length;
  const adoptionRate = motions.length > 0 ? Math.round((adoptedCount / motions.length) * 100) : 0;

  const topicCounts = motions.reduce((acc, m) => {
    acc[m.topic] = (acc[m.topic] || 0) + 1;
    return acc;
  }, {});
  const topTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const meetings = useMemo(() => {
    const grouped = filteredMotions.reduce((acc, m) => {
      if (!acc[m.date]) acc[m.date] = [];
      acc[m.date].push(m);
      return acc;
    }, {});
    return Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [filteredMotions]);

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

  return (
    <div className="space-y-16 pb-20">

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <div className="text-center space-y-10 pt-12 pb-6">
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#004a99]/5 rounded-full border border-[#004a99]/10 mb-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black text-[#004a99] uppercase tracking-[0.2em]">Council 2022-2026 Term Live</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-display font-black text-slate-900 tracking-tight leading-[1.05]"
          >
            Track <span className="text-[#004a99]">City Council</span> <br className="hidden sm:block" /> with clarity.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Find your representative, audit their voting record, and stay informed on the motions shaping Toronto's future.
          </motion.p>
        </div>
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.3 }}
        >
          <HeroSearch />
        </motion.div>
      </div>

      {/* ── Stat Widgets ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-2">

        {/* Total Motions Card */}
        <Card className="lg:col-span-2 overflow-hidden group">
          <CardContent className="p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-12 h-full relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/40 rounded-full blur-3xl -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-125" />
            
            <div className="relative z-10 w-full lg:w-auto">
              <h3 className="text-[11px] font-black text-[#004a99] uppercase tracking-[0.25em] mb-4 opacity-70">Term Records</h3>
              <div className="flex items-baseline gap-5">
                <span className="text-8xl lg:text-9xl font-display font-black text-slate-900 tracking-tighter leading-none">{motions.length}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Total</span>
                  <span className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Motions</span>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-xl w-fit shadow-sm">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Public Record Sync</span>
              </div>
            </div>

            <div className="flex-1 w-full max-w-[300px] relative z-10">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Top Categories</span>
                <Badge variant="outline" className="bg-[#004a99]/5 text-[#004a99] border-[#004a99]/10 font-black text-[9px] uppercase tracking-widest px-2.5 py-1">Split View</Badge>
              </div>
              <div className="flex h-5 rounded-full overflow-hidden gap-1.5 mb-8 bg-slate-100/50 p-1 border border-slate-100">
                {topTopics.map(([topic, count], i) => (
                  <motion.div
                    key={topic}
                    className={cn("h-full rounded-full transition-all duration-500 hover:scale-x-110", TOPIC_COLORS[topic] || 'bg-slate-400')}
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / motions.length) * 100}%` }}
                    transition={{ duration: 1.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                    title={topic}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {topTopics.map(([topic, count]) => (
                  <div key={topic} className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-md border-2 border-white shadow-sm ring-1 ring-slate-100", TOPIC_COLORS[topic] || 'bg-slate-400')} />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-700 truncate">{topic}</span>
                      <span className="text-[10px] font-bold text-slate-400">{Math.round((count/motions.length)*100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Impact Card */}
        <Card className="rounded-[40px] overflow-hidden group">
          <CardContent className="p-10 flex flex-col justify-between h-full bg-gradient-to-br from-white to-slate-50/50 relative">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-10 transition-all duration-700 group-hover:scale-125 group-hover:-rotate-12">
              <FileText className="w-32 h-32 text-slate-900" strokeWidth={1} />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-[11px] font-black text-amber-600 uppercase tracking-[0.25em] mb-5">Policy Impact</h3>
              <div className="flex items-baseline gap-4">
                <span className="text-7xl font-display font-black text-slate-900 tracking-tighter leading-none">{substantiveCount}</span>
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-black text-[10px] px-3 py-1 rounded-lg">NOTABLE</Badge>
              </div>
            </div>
            
            <p className="text-sm font-bold text-slate-400 leading-relaxed mt-10 uppercase tracking-widest relative z-10">
              High-significance <br /> policy decisions
            </p>
          </CardContent>
        </Card>

        {/* Success Rate Card */}
        <Card className="rounded-[40px] relative overflow-hidden group border-[#10b981]/10 bg-[#10b981]/5 shadow-sm shadow-[#10b981]/5">
          <CardContent className="p-10 flex flex-col justify-between h-full relative z-10">
            <div>
              <h3 className="text-[11px] font-black text-[#059669] uppercase tracking-[0.25em] mb-5">Adoption Rate</h3>
              <motion.div
                className="text-7xl font-display font-black text-[#059669] tracking-tighter leading-none"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {adoptionRate}%
              </motion.div>
            </div>

            <div className="flex items-end justify-between mt-10">
              <p className="text-[10px] font-black text-[#059669]/60 uppercase tracking-widest leading-loose max-w-[120px]">
                Motions successfully <br /> adopted by council
              </p>
              <div className="relative w-24 h-24 transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
                <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                  <path className="text-[#10b981]/10" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <motion.path
                    className="text-[#10b981]"
                    initial={{ strokeDasharray: '0, 100' }}
                    animate={{ strokeDasharray: `${adoptionRate}, 100` }}
                    transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
                    strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-2.5 h-2.5 bg-[#10b981] rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Highlights ────────────────────────────────────────────── */}
      {highlights.length > 0 && (
        <div className="space-y-8 px-2">
          <div className="flex items-center gap-6">
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] whitespace-nowrap">Significant Motions</h2>
            <div className="h-px bg-slate-200/60 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {highlights.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
              >
                <Link to={`/motions/${m.id}`} className="block h-full group">
                  <div className="bg-white rounded-[32px] border border-slate-200/60 p-8 flex flex-col justify-between h-full hover:border-[#004a99]/40 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#004a99]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-colors", m.topic === 'Housing' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-slate-50 text-slate-500 group-hover:bg-slate-900 group-hover:text-white')}>
                          {m.topic}
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#004a99] transition-all duration-500">
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                      <p className="text-[16px] font-black text-slate-900 leading-[1.4] group-hover:text-[#004a99] transition-colors line-clamp-3 tracking-tight">
                        {m.title}
                      </p>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Decision date</p>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">{m.date}</p>
                      </div>
                      <span className={cn("text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-lg shadow-sm border border-white", m.status === 'Adopted' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Filters & Feed ──────────────────────────────────────────────── */}
      <div className="space-y-10 px-2">
        <div className="sticky top-24 z-30 bg-[#f8fafc]/90 backdrop-blur-xl py-6 flex flex-col sm:flex-row items-center justify-between gap-8 border-b border-slate-100 px-4 -mx-4">
          <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
            <button
              onClick={() => setSelectedTopic('All')}
              className={cn(
                "px-7 py-3 rounded-2xl text-[13px] font-black transition-all border-2",
                selectedTopic === 'All'
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20 active:scale-95"
                  : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-900"
              )}
            >
              All Topics
            </button>
            {TOPICS.map(topic => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={cn(
                  "px-7 py-3 rounded-2xl text-[13px] font-black transition-all border-2",
                  selectedTopic === topic
                    ? "bg-[#004a99] text-white border-[#004a99] shadow-xl shadow-blue-900/20 active:scale-95"
                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-900"
                )}
              >
                {topic}
              </button>
            ))}
          </div>
          <Button
            variant={showNotableOnly ? 'default' : 'outline'}
            onClick={() => setShowNotableOnly(s => !s)}
            className={cn("gap-3 h-14 px-8 rounded-[20px] font-black text-xs uppercase tracking-[0.15em] transition-all shadow-lg active:scale-95", showNotableOnly ? "bg-amber-500 hover:bg-amber-600 border-amber-500 shadow-amber-500/20" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400")}
          >
            <div className={cn("w-2.5 h-2.5 rounded-full ring-4 shadow-sm transition-all", showNotableOnly ? "bg-white ring-amber-400 animate-pulse" : "bg-amber-500 ring-amber-100")} />
            {showNotableOnly ? 'Notable Only' : 'Show Significant'}
          </Button>
        </div>

        {/* ── Meetings List ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-8">
          <AnimatePresence mode="popLayout">
            {meetings.map(([date, dayMotions], i) => {
              const d = new Date(date);
              const formatted = d.toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              const adopted = dayMotions.filter(m => m.status === 'Adopted').length;
              const topicsInMeeting = [...new Set(dayMotions.map(m => m.topic))].slice(0, 4);

              return (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  layout
                >
                  <Card className="overflow-hidden border-slate-200/70 hover:border-[#004a99]/30 transition-all duration-700 shadow-md hover:shadow-2xl">
                    <div
                      className="p-8 sm:p-10 bg-white hover:bg-slate-50/50 transition-all duration-500 flex flex-col lg:flex-row lg:items-center justify-between gap-8 cursor-pointer group"
                      onClick={() => setExpandedDate(expandedDate === date ? null : date)}
                    >
                      <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-[28px] bg-blue-50 text-[#004a99] flex flex-col items-center justify-center shrink-0 border-2 border-white shadow-sm transition-all duration-700 group-hover:bg-[#004a99] group-hover:text-white group-hover:shadow-2xl group-hover:shadow-blue-900/30 group-hover:-translate-y-1">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 opacity-80">
                            {d.toLocaleDateString('en-CA', { month: 'short' })}
                          </span>
                          <span className="text-3xl font-display font-black leading-none">{d.getDate()}</span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl sm:text-3xl font-display font-black text-slate-900 group-hover:text-[#004a99] transition-colors tracking-tight">{formatted}</h3>
                          <div className="flex items-center gap-6 text-[12px] font-black uppercase tracking-[0.1em]">
                            <span className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100/60 rounded-xl text-slate-500 transition-colors group-hover:bg-slate-100">
                              <FileText className="w-4 h-4" />
                              {dayMotions.length} <span className="opacity-60">Motions</span>
                            </span>
                            <span className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl transition-colors group-hover:bg-emerald-100">
                              <CheckCircle2 className="w-4 h-4" />
                              {adopted} <span className="opacity-70">Adopted</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-8 border-t border-slate-50 lg:border-0 pt-8 lg:pt-0">
                        <div className="flex -space-x-4">
                          {topicsInMeeting.map(topic => (
                            <div
                              key={topic}
                              className={cn("w-11 h-11 rounded-2xl border-[4px] border-white flex items-center justify-center text-[11px] font-black text-white shadow-xl ring-1 ring-slate-100 transition-transform hover:scale-125 hover:z-10", TOPIC_COLORS[topic] || 'bg-slate-400')}
                              title={topic}
                            >
                              {topic.charAt(0)}
                            </div>
                          ))}
                        </div>
                        <div className={cn("w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-700 shadow-sm", expandedDate === date ? "bg-slate-900 text-white shadow-2xl scale-110" : "bg-slate-50 text-slate-400 group-hover:bg-[#004a99] group-hover:text-white group-hover:scale-105")}>
                          {expandedDate === date ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedDate === date && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden bg-[#f8fafc]/50"
                        >
                          <div className="p-6 sm:p-12 space-y-4">
                            {dayMotions.map(m => (
                              <Link key={m.id} to={`/motions/${m.id}`} className="block">
                                <Card className="p-8 border-slate-200/50 hover:border-[#004a99]/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col sm:flex-row sm:items-center gap-8 group/motion relative overflow-hidden bg-white/80">
                                  <div className="absolute top-0 left-0 h-full w-2 transition-all duration-500 group-hover/motion:w-3" style={{backgroundColor: m.status === 'Adopted' ? '#10b981' : '#ef4444'}} />
                                  
                                  <div className="flex-1 min-w-0 flex flex-col gap-4">
                                    <p className="text-[17px] font-black text-slate-900 group-hover/motion:text-[#004a99] transition-colors leading-[1.4] tracking-tight">{m.title}</p>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-2", m.status === 'Adopted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100')}>
                                        <div className={cn("w-1.5 h-1.5 rounded-full", m.status === 'Adopted' ? "bg-emerald-500" : "bg-rose-500")} />
                                        {m.status}
                                      </span>
                                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 border border-slate-200/60">
                                        {m.topic}
                                      </span>
                                      {m.significance >= 60 && (
                                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-2 shadow-sm">
                                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                          Impactful
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="w-14 h-14 rounded-2xl bg-[#004a99] flex items-center justify-center opacity-0 sm:group-hover/motion:opacity-100 transition-all duration-500 shadow-xl shadow-blue-900/20 translate-x-4 group-hover/motion:translate-x-0 group-hover/motion:rotate-12 translate-y-0">
                                    <ArrowRight className="w-6 h-6 text-white" />
                                  </div>
                                </Card>
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
          </AnimatePresence>
        </div>

        {meetings.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white/50 backdrop-blur-md rounded-[48px] border-4 border-dashed border-slate-200/60"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-3xl font-display font-black text-slate-900 mb-4 tracking-tight">No records found</h3>
            <p className="text-slate-500 font-bold text-lg max-w-md mx-auto leading-relaxed">Adjust your topic or significance filters to explore the council archive.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
