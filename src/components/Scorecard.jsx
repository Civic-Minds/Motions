import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { getAttendance, getMemberAlignmentScore } from '../utils/analytics';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';

const COUNCILLOR_WARD = {};
Object.entries(WARD_COUNCILLORS).forEach(([wardId, name]) => {
  const ward = TORONTO_WARDS.find(w => w.id === wardId);
  if (ward) COUNCILLOR_WARD[name] = ward.name;
});

const SORTS = [
  { key: 'attendance', label: 'Attendance' },
  { key: 'alignment',  label: 'Alignment'  },
  { key: 'yesRate',    label: 'Yes Rate'   },
  { key: 'votes',      label: 'Votes Cast' },
  { key: 'name',       label: 'Name'       },
];

export default function Scorecard({ motions }) {
  const [sortKey, setSortKey] = useState('attendance');
  const [sortDir, setSortDir] = useState('desc');

  const councillors = useMemo(() => {
    const nameSet = new Set();
    motions.forEach(m => { if (m.votes) Object.keys(m.votes).forEach(n => nameSet.add(n)); });

    return [...nameSet].map(name => {
      const castVotes = motions.filter(m => {
        const v = m.votes?.[name];
        return v === 'YES' || v === 'NO';
      });
      const yesVotes = castVotes.filter(m => m.votes[name] === 'YES').length;
      const attendance = getAttendance(motions, name);
      const alignment = getMemberAlignmentScore(motions, name);

      return {
        name,
        ward: COUNCILLOR_WARD[name] ?? null,
        votes: castVotes.length,
        yesRate: castVotes.length > 0 ? Math.round((yesVotes / castVotes.length) * 100) : null,
        attendance: attendance.pct,
        attendanceFrac: `${attendance.daysPresent}/${attendance.totalDays} days`,
        alignment,
      };
    });
  }, [motions]);

  const sorted = useMemo(() => {
    return [...councillors].sort((a, b) => {
      if (sortKey === 'name') {
        const la = a.name.split(' ').at(-1);
        const lb = b.name.split(' ').at(-1);
        return sortDir === 'asc' ? la.localeCompare(lb) : lb.localeCompare(la);
      }
      const va = a[sortKey] ?? -1;
      const vb = b[sortKey] ?? -1;
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [councillors, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  // Only show podium if the top values are distinct (no ties at the top)
  // Dense ranking: same value = same rank
  const ranks = useMemo(() => {
    if (sortKey === 'name') return sorted.map((_, i) => i + 1);
    let rank = 1;
    return sorted.map((c, i) => {
      if (i > 0 && c[sortKey] !== sorted[i - 1][sortKey]) rank = i + 1;
      return rank;
    });
  }, [sorted, sortKey]);

  const top3 = useMemo(() => {
    if (sortKey === 'name') return [];
    const top = sorted.slice(0, 3);
    const topVal = top[0]?.[sortKey];
    const hasTie = topVal != null && sorted.filter(c => c[sortKey] === topVal).length > 1;
    return hasTie ? [] : top;
  }, [sorted, sortKey]);
  const activeSort = SORTS.find(s => s.key === sortKey);

  function activeStat(c) {
    if (sortKey === 'attendance') return `${c.attendance}%`;
    if (sortKey === 'alignment')  return c.alignment != null ? `${c.alignment}%` : '—';
    if (sortKey === 'yesRate')    return c.yesRate != null   ? `${c.yesRate}%`   : '—';
    if (sortKey === 'votes')      return `${c.votes}`;
    return `${c.attendance}%`;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Council Scorecard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Performance metrics across {motions.length} motions for all {sorted.length} members of council
        </p>
      </div>

      {/* Sort controls */}
      <div className="flex flex-wrap gap-2">
        {SORTS.map(s => (
          <button
            key={s.key}
            onClick={() => toggleSort(s.key)}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
              sortKey === s.key
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            )}
          >
            {s.label}
            {sortKey === s.key && <span className="opacity-70">{sortDir === 'desc' ? '↓' : '↑'}</span>}
          </button>
        ))}
      </div>

      {/* Podium — top 3 for current sort */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {top3.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "bg-white border rounded-2xl p-4 text-center shadow-sm",
                i === 0 ? "border-amber-200 bg-gradient-to-b from-amber-50/60 to-white" :
                i === 1 ? "border-slate-200" :
                          "border-orange-100 bg-gradient-to-b from-orange-50/40 to-white"
              )}
            >
              <div className="text-xl mb-1">{['🥇', '🥈', '🥉'][i]}</div>
              <p className="text-xs font-medium text-slate-500 truncate leading-tight">{c.name}</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{activeStat(c)}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{activeSort?.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Ranked list */}
      <div className="space-y-2">
        {sorted.map((c, i) => { const rank = ranks[i]; return ( // eslint-disable-line no-unused-vars
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.025, 0.4) }}
            className="bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-4">

              {/* Rank */}
              <span className={cn(
                "w-7 text-center text-sm font-black shrink-0 tabular-nums",
                rank === 1 ? "text-amber-500" :
                rank === 2 ? "text-slate-400" :
                rank === 3 ? "text-orange-400" :
                             "text-slate-300"
              )}>
                {rank}
              </span>

              {/* Name + ward */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm leading-tight">{c.name}</p>
                {c.ward && <p className="text-xs text-slate-400 truncate mt-0.5">{c.ward}</p>}
              </div>

              {/* Desktop stats */}
              <div className="hidden sm:flex items-end gap-5">
                <StatBar
                  label="Attendance"
                  value={`${c.attendance}%`}
                  sub={c.attendanceFrac}
                  pct={c.attendance}
                  color="bg-[#004a99]"
                  active={sortKey === 'attendance'}
                />
                <StatBar
                  label="Alignment"
                  value={c.alignment != null ? `${c.alignment}%` : '—'}
                  pct={c.alignment}
                  color="bg-emerald-500"
                  active={sortKey === 'alignment'}
                />
                <StatBar
                  label="Yes Rate"
                  value={c.yesRate != null ? `${c.yesRate}%` : '—'}
                  pct={c.yesRate}
                  color="bg-amber-400"
                  active={sortKey === 'yesRate'}
                />
                <div className={cn("text-right w-12 transition-opacity", sortKey === 'votes' ? "opacity-100" : "opacity-50")}>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Votes</p>
                  <p className="text-base font-bold text-slate-800">{c.votes}</p>
                </div>
              </div>

              {/* Mobile: active stat */}
              <div className="sm:hidden text-right shrink-0">
                <p className="text-sm font-bold text-slate-900">{activeStat(c)}</p>
                <p className="text-[10px] text-slate-400">{activeSort?.label}</p>
              </div>
            </div>
          </motion.div>
        ); })}
      </div>
    </div>
  );
}

function StatBar({ label, value, sub, pct, color, active }) {
  return (
    <div className={cn("text-right w-24 transition-opacity", active ? "opacity-100" : "opacity-50")}>
      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
      {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
      <div className="mt-1 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
        {pct != null && (
          <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
        )}
      </div>
    </div>
  );
}
