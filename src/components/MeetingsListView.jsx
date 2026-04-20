import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Lock, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

const TODAY = new Date().toISOString().slice(0, 10);

function committeeToSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getTypeBadge(meeting) {
  if (meeting.isCouncil) return { label: 'Council', style: 'bg-blue-600 text-white' };
  const name = meeting.committee.toLowerCase();
  if (name.includes('budget') || name.includes('finance')) return { label: 'Finance', style: 'bg-amber-100 text-amber-700' };
  if (name.includes('housing') || name.includes('planning')) return { label: 'Planning', style: 'bg-violet-100 text-violet-700' };
  if (name.includes('transit') || name.includes('infrastructure')) return { label: 'Transit', style: 'bg-cyan-100 text-cyan-700' };
  if (name.includes('parks') || name.includes('environment')) return { label: 'Parks', style: 'bg-emerald-100 text-emerald-700' };
  return { label: 'Committee', style: 'bg-slate-100 text-slate-600' };
}

export default function MeetingsListView({ meetings = [] }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCommittee = searchParams.get('committee');

  const [timeFilter, setTimeFilter]           = useState('upcoming');
  const [typeFilter, setTypeFilter]           = useState('all');
  const [committeeSelect, setCommitteeSelect] = useState(urlCommittee ?? 'all');
  const [agendaFilter, setAgendaFilter]       = useState(false); // true = published only
  const [inCameraFilter, setInCameraFilter]   = useState(false); // true = has in-camera only

  const sorted = useMemo(() => {
    return [...meetings].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [meetings]);

  const upcoming = useMemo(() => sorted.filter(m => m.date >= TODAY), [sorted]);
  const past     = useMemo(() => sorted.filter(m => m.date <  TODAY).reverse(), [sorted]);
  const byTime   = timeFilter === 'upcoming' ? upcoming : past;

  // Unique committee names for dropdown
  const committeeNames = useMemo(() => {
    return [...new Set(sorted.map(m => m.committee))].sort();
  }, [sorted]);

  // Type counts from time-filtered set
  const typeOptions = useMemo(() => {
    const counts = { all: byTime.length };
    byTime.forEach(m => {
      const t = getTypeBadge(m).label;
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [byTime]);

  const displayed = useMemo(() => {
    let list = byTime;
    if (typeFilter !== 'all')     list = list.filter(m => getTypeBadge(m).label === typeFilter);
    if (committeeSelect !== 'all') list = list.filter(m => committeeToSlug(m.committee) === committeeSelect);
    if (agendaFilter)              list = list.filter(m => m.agendaItems?.length > 0);
    if (inCameraFilter)            list = list.filter(m => m.agendaItems?.some(a => a.inCamera));
    return list;
  }, [byTime, typeFilter, committeeSelect, agendaFilter, inCameraFilter]);

  const activeFilterCount = (typeFilter !== 'all' ? 1 : 0)
    + (committeeSelect !== 'all' ? 1 : 0)
    + (agendaFilter ? 1 : 0)
    + (inCameraFilter ? 1 : 0);

  // Group by month
  const grouped = useMemo(() => {
    const groups = [];
    let current = null;
    displayed.forEach(m => {
      const month = m.date.slice(0, 7);
      if (month !== current) {
        current = month;
        groups.push({ month, label: new Date(m.date + 'T12:00:00').toLocaleString('en-CA', { month: 'long', year: 'numeric' }), items: [] });
      }
      groups[groups.length - 1].items.push(m);
    });
    return groups;
  }, [displayed]);

  function clearAll() {
    setTypeFilter('all');
    setCommitteeSelect('all');
    setAgendaFilter(false);
    setInCameraFilter(false);
  }

  return (
    <div className="max-w-3xl mx-auto py-2 px-4 sm:px-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meetings</h1>
          <p className="text-xs text-slate-400 mt-0.5">Toronto City Council &amp; committees</p>
        </div>
        <Calendar className="w-5 h-5 text-slate-300" />
      </div>

      {/* Filter section */}
      <div className="space-y-2 mb-6">

        {/* Row 1: time + type chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'upcoming', label: 'Upcoming', count: upcoming.length },
            { id: 'past',     label: 'Past',     count: past.length },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => { setTimeFilter(f.id); setTypeFilter('all'); }}
              className={cn(
                "px-3 py-1 rounded-full text-[11px] font-semibold transition-colors",
                timeFilter === f.id ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
            >
              {f.label}{f.count > 0 ? ` · ${f.count}` : ''}
            </button>
          ))}

          {Object.keys(typeOptions).length > 2 && <span className="w-px h-4 bg-slate-200 mx-0.5" />}

          {Object.keys(typeOptions).length > 2 && ['all', ...Object.keys(typeOptions).filter(k => k !== 'all')].map(type =>
            typeOptions[type] ? (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-semibold transition-colors",
                  typeFilter === type ? "bg-[#004a99] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {type === 'all' ? 'All types' : type}{type !== 'all' && typeOptions[type] ? ` · ${typeOptions[type]}` : ''}
              </button>
            ) : null
          )}
        </div>

        {/* Row 2: committee + toggles */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Committee dropdown */}
          <div className="relative">
            <select
              value={committeeSelect}
              onChange={e => setCommitteeSelect(e.target.value)}
              className={cn(
                "appearance-none pl-3 pr-7 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer",
                committeeSelect !== 'all'
                  ? "bg-[#004a99] text-white border-[#004a99]"
                  : "bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200"
              )}
            >
              <option value="all">All committees</option>
              {committeeNames.map(name => (
                <option key={name} value={committeeToSlug(name)}>{name}</option>
              ))}
            </select>
            <ChevronDown className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none",
              committeeSelect !== 'all' ? "text-white" : "text-slate-400"
            )} />
          </div>

          {/* Agenda published toggle */}
          <button
            onClick={() => setAgendaFilter(v => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors",
              agendaFilter
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200"
            )}
          >
            <FileText className="w-3 h-3" />
            Agenda published
          </button>

          {/* Has in-camera toggle */}
          <button
            onClick={() => setInCameraFilter(v => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors",
              inCameraFilter
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200"
            )}
          >
            <Lock className="w-3 h-3" />
            Has in-camera
          </button>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors ml-1"
            >
              Clear · {activeFilterCount}
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-[11px] text-slate-400 mb-4">
        {displayed.length} meeting{displayed.length !== 1 ? 's' : ''}
        {activeFilterCount > 0 ? ' matching filters' : ''}
      </p>

      {/* Grouped list */}
      {grouped.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm">No meetings match these filters.</div>
      ) : (
        <div className="space-y-8">
          {grouped.map(group => (
            <div key={group.month}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
                {group.label}
              </p>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {group.items.map((meeting, i) => {
                  const badge = getTypeBadge(meeting);
                  const hasAgenda = meeting.agendaItems?.length > 0;
                  const inCameraCount = meeting.agendaItems?.filter(a => a.inCamera).length ?? 0;
                  const dest = meeting.meetingReference
                    ? `/meetings/${meeting.meetingReference}`
                    : `/committees/${committeeToSlug(meeting.committee)}`;

                  return (
                    <button
                      key={i}
                      onClick={() => navigate(dest)}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group text-left"
                    >
                      <div className="shrink-0 w-10 text-center">
                        <p className="text-[11px] font-bold text-slate-400 uppercase leading-none">
                          {new Date(meeting.date + 'T12:00:00').toLocaleString('en-CA', { month: 'short' })}
                        </p>
                        <p className="text-xl font-black text-slate-700 leading-tight">
                          {new Date(meeting.date + 'T12:00:00').getDate()}
                        </p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", badge.style)}>
                            {badge.label}
                          </span>
                          {!hasAgenda && (
                            <span className="text-[9px] text-slate-300 italic">Agenda pending</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors truncate">
                          {meeting.committee}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-[11px] text-slate-400">{meeting.startTime}</span>
                          {meeting.location && (
                            <span className="text-[11px] text-slate-400 truncate">{meeting.location}</span>
                          )}
                          {inCameraCount > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-amber-500">
                              <Lock className="w-2.5 h-2.5" />
                              {inCameraCount} in camera
                            </span>
                          )}
                          {hasAgenda && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <FileText className="w-2.5 h-2.5" />
                              {meeting.agendaItems.length} items
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-[#004a99] shrink-0 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
