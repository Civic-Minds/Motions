import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, GitCompare, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMemberAlignmentScore, getAttendance } from '../utils/analytics';
import { nameToSlug, slugToName } from '../utils/slug';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { cn } from '../lib/utils';
import ProfilePanel from './ProfilePanel';
import VersusOverlay from './VersusOverlay';

const COUNCILLOR_WARD = {};
Object.entries(WARD_COUNCILLORS).forEach(([wardId, name]) => {
  const ward = TORONTO_WARDS.find(w => w.id === wardId);
  if (ward) COUNCILLOR_WARD[name] = { id: wardId, name: ward.name };
});

const attendanceColor = (pct) =>
  pct >= 90 ? 'text-emerald-600' : pct >= 75 ? 'text-amber-500' : 'text-rose-500';

const attendanceBg = (pct) =>
  pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-amber-400' : 'bg-rose-500';

export default function CouncillorList({ motions }) {
  const [search, setSearch] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [compareSlots, setCompareSlots] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [versusSelection, setVersusSelection] = useState([]);
  const { slug, slug2 } = useParams();
  const navigate = useNavigate();

  const councillors = useMemo(() => {
    const voteCounts = {};
    motions.forEach(m => {
      if (!m.votes) return;
      Object.keys(m.votes).forEach(name => {
        voteCounts[name] = (voteCounts[name] || 0) + 1;
      });
    });

    return Object.entries(voteCounts)
      .filter(([, count]) => count >= 5)
      .map(([name]) => {
        const alignment = getMemberAlignmentScore(motions, name);
        const attendance = getAttendance(motions, name);
        const topicCounts = {};
        motions.forEach(m => {
          if (m.votes?.[name] && m.topic && !m.trivial) {
            topicCounts[m.topic] = (topicCounts[m.topic] || 0) + 1;
          }
        });
        const topTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        return { name, alignment, attendance, topTopic, voteCount: voteCounts[name] };
      })
      .sort((a, b) => a.name.split(' ').at(-1).localeCompare(b.name.split(' ').at(-1)));
  }, [motions]);

  const allNames = useMemo(() => councillors.map(c => c.name), [councillors]);

  // Handle URL-driven panels
  useEffect(() => {
    if (!allNames.length) return;
    if (slug2) {
      const n1 = slugToName(slug, allNames);
      const n2 = slugToName(slug2, allNames);
      if (n1 && n2) { setVersusSelection([n1, n2]); setSelectedProfile(null); }
      else navigate('/councillors', { replace: true });
    } else if (slug) {
      const name = slugToName(slug, allNames);
      if (name) { setSelectedProfile(name); setVersusSelection([]); }
      else navigate('/councillors', { replace: true });
    } else {
      setSelectedProfile(null);
      setVersusSelection([]);
    }
  }, [slug, slug2, allNames]);

  const openProfile = (name) => {
    setSelectedProfile(name);
    setVersusSelection([]);
    navigate(`/councillors/${nameToSlug(name)}`);
  };

  const closeProfile = () => {
    setSelectedProfile(null);
    navigate('/councillors');
  };

  const openVersus = (n1, n2) => {
    setVersusSelection([n1, n2]);
    setSelectedProfile(null);
    navigate(`/councillors/${nameToSlug(n1)}/vs/${nameToSlug(n2)}`);
  };

  const closeVersus = () => {
    setVersusSelection([]);
    navigate('/councillors');
  };

  const handleCompareClick = (name) => {
    setCompareSlots(prev => {
      if (prev.includes(name)) return prev.filter(n => n !== name);
      if (prev.length < 2) return [...prev, name];
      return [prev[1], name];
    });
  };

  const launchCompare = () => {
    if (compareSlots.length === 2) {
      openVersus(compareSlots[0], compareSlots[1]);
      setCompareMode(false);
      setCompareSlots([]);
    }
  };

  const filtered = councillors.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.topTopic && c.topTopic.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Councillors</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} members · 2022–2026 term</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setCompareMode(m => !m); setCompareSlots([]); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all",
              compareMode
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            )}
          >
            <GitCompare className="w-4 h-4" />
            {compareMode ? 'Cancel' : 'Compare'}
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full focus-within:border-[#004a99] transition-colors">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search members..."
              className="bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none w-40"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Compare banner */}
      <AnimatePresence>
        {compareMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between bg-[#004a99] text-white rounded-2xl px-6 py-4"
          >
            <div className="flex items-center gap-3">
              <GitCompare className="w-5 h-5 text-white/70" />
              <span className="text-sm font-medium">
                {compareSlots.length === 0 && 'Select two councillors to compare'}
                {compareSlots.length === 1 && `${compareSlots[0]} — pick one more`}
                {compareSlots.length === 2 && `${compareSlots[0]} vs ${compareSlots[1]}`}
              </span>
            </div>
            {compareSlots.length === 2 && (
              <button
                onClick={launchCompare}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#004a99] text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Compare <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
      >
        {filtered.map(({ name, alignment, attendance, topTopic, voteCount }) => {
          const ward = COUNCILLOR_WARD[name];
          const isSelected = compareSlots.includes(name);
          const isFaded = compareMode && compareSlots.length === 2 && !isSelected;
          const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('');

          return (
            <motion.div
              key={name}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 28 } } }}
              onClick={() => compareMode ? handleCompareClick(name) : openProfile(name)}
              className={cn(
                "group bg-white border rounded-2xl p-5 cursor-pointer transition-all duration-200",
                isSelected
                  ? 'border-[#004a99] shadow-lg shadow-blue-900/10 scale-[1.02]'
                  : isFaded
                  ? 'border-slate-100 opacity-50'
                  : 'border-slate-200 hover:border-[#004a99]/40 hover:shadow-md hover:-translate-y-0.5'
              )}
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold transition-colors",
                  isSelected ? 'bg-[#004a99] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-[#004a99] group-hover:text-white'
                )}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#004a99] transition-colors">{name}</p>
                  {ward && (
                    <p className="text-[10px] text-slate-400 font-medium">W{ward.id} · {ward.name}</p>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">Alignment</p>
                  <p className="text-lg font-bold text-[#004a99] leading-none">{alignment !== null ? `${alignment}%` : '—'}</p>
                  <div className="mt-1.5 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#004a99] rounded-full" style={{ width: `${alignment ?? 0}%` }} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">Attendance</p>
                  <p className={cn("text-lg font-bold leading-none", attendanceColor(attendance.pct))}>{attendance.pct}%</p>
                  <div className="mt-1.5 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", attendanceBg(attendance.pct))} style={{ width: `${attendance.pct}%` }} />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <div className="text-[10px] text-slate-400">
                  <span className="font-medium">{voteCount}</span> votes
                  {topTopic && <span className="ml-2 text-slate-400">· {topTopic}</span>}
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#004a99] transition-colors" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No councillors match "{search}"</p>
        </div>
      )}

      {/* Side panels */}
      <ProfilePanel
        selected={selectedProfile}
        onClose={closeProfile}
        onCompare={(name) => {
          setCompareMode(true);
          setCompareSlots([name]);
          closeProfile();
        }}
        motions={motions}
      />
      <VersusOverlay
        selection={versusSelection}
        onClose={closeVersus}
        motions={motions}
      />
    </div>
  );
}
