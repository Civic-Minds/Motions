import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitCompare, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMemberAlignmentScore, getAttendance } from '../utils/analytics';
import { nameToSlug, slugToName } from '../utils/slug';
import { WARD_COUNCILLORS, FORMER_MEMBERS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { cn } from '../lib/utils';
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

const MAYOR = 'Olivia Chow';

export default function CouncillorList({ motions, councillors: contactData = [] }) {
  const [compareMode, setCompareMode] = useState(false);
  const [compareSlots, setCompareSlots] = useState([]);
  const [versusSelection, setVersusSelection] = useState([]);
  const { slug, slug2 } = useParams();
  const navigate = useNavigate();

  const myWardId = (() => { try { return (() => { const r = localStorage.getItem('motions_ward_id'); return r ? String(parseInt(r, 10)) : null; })(); } catch { return null; } })();
  const myCouncillor = myWardId ? WARD_COUNCILLORS[myWardId] : null;

  const councillors = useMemo(() => {
    const voteCounts = {};
    motions.forEach(m => {
      if (!m.votes) return;
      Object.keys(m.votes).forEach(name => {
        voteCounts[name] = (voteCounts[name] || 0) + 1;
      });
    });

    return Object.entries(voteCounts)
      .filter(([name, count]) => count >= 5 && !(name in FORMER_MEMBERS))
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
      .sort((a, b) => {
        // Mayor always first
        if (a.name === MAYOR) return -1;
        if (b.name === MAYOR) return 1;
        return a.name.split(' ').at(-1).localeCompare(b.name.split(' ').at(-1));
      });
  }, [motions]);

  const allNames = useMemo(() => councillors.map(c => c.name), [councillors]);

  // Handle VS URL
  useEffect(() => {
    if (!allNames.length) return;
    if (slug2) {
      const n1 = slugToName(slug, allNames);
      const n2 = slugToName(slug2, allNames);
      if (n1 && n2) setVersusSelection([n1, n2]);
      else navigate('/councillors', { replace: true });
    } else {
      setVersusSelection([]);
    }
  }, [slug, slug2, allNames]);

  const openProfile = (name) => navigate(`/councillors/${nameToSlug(name)}`);

  const openVersus = (n1, n2) => {
    setVersusSelection([n1, n2]);
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

  const filtered = councillors;

  // Full-page versus view
  if (versusSelection.length >= 2) {
    return (
      <VersusOverlay
        selection={versusSelection}
        onClose={closeVersus}
        motions={motions}
      />
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Councillors</h1>
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
          const isMyCouncillor = name === myCouncillor;
          const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('');
          const lastName = name.split(' ').at(-1);
          const photoUrl = `/images/councillors/${lastName}.jpg`;
          const isMayor = name === MAYOR;

          return (
            <motion.div
              key={name}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 28 } } }}
              onClick={() => compareMode ? handleCompareClick(name) : openProfile(name)}
              className={cn(
                "group relative bg-white border rounded-2xl p-5 cursor-pointer transition-all duration-200",
                isSelected
                  ? 'border-[#004a99] shadow-lg shadow-blue-900/10 scale-[1.02]'
                  : isMyCouncillor
                  ? 'border-[#004a99] shadow-lg shadow-blue-900/10 scale-[1.02]'
                  : isFaded
                  ? 'border-slate-100 opacity-50'
                  : 'border-slate-200 hover:border-[#004a99]/40 hover:shadow-md hover:-translate-y-0.5'
              )}
            >
              {isMyCouncillor && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-[#004a99] text-white px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  Your Councillor
                </span>
              )}
              {/* Avatar + name */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold transition-colors relative overflow-hidden",
                  isMayor
                    ? isSelected ? 'bg-[#004a99] text-white' : 'bg-amber-100 text-amber-700 group-hover:bg-[#004a99] group-hover:text-white'
                    : isSelected ? 'bg-[#004a99] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-[#004a99] group-hover:text-white'
                )}>
                  <span>{initials}</span>
                  <img
                    src={photoUrl}
                    alt={name}
                    className="w-full h-full object-cover absolute inset-0 z-10"
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#004a99] transition-colors">{name}</p>
                    {isMayor && (
                      <span className="shrink-0 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Mayor</span>
                    )}
                  </div>
                  {ward && (
                    <p className="text-[10px] text-slate-400 font-medium">W{ward.id} · {ward.name}</p>
                  )}
                  {isMayor && !ward && (
                    <p className="text-[10px] text-slate-400 font-medium">Toronto City Hall</p>
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

    </div>
  );
}
