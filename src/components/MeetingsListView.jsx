import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Lock, FileText, ChevronRight } from 'lucide-react';
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
  const committeeFilter = searchParams.get('committee'); // slug or null
  const [filter, setFilter] = useState('upcoming');
  const [typeFilter, setTypeFilter] = useState('all');

  const sorted = useMemo(() => {
    const base = committeeFilter
      ? meetings.filter(m => committeeToSlug(m.committee) === committeeFilter)
      : meetings;
    return [...base].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [meetings, committeeFilter]);

  const upcoming = useMemo(() => sorted.filter(m => m.date >= TODAY), [sorted]);
  const past     = useMemo(() => sorted.filter(m => m.date < TODAY).reverse(), [sorted]);

  const byTime = filter === 'upcoming' ? upcoming : past;

  // Derive available type chips from the current time-filtered set
  const typeOptions = useMemo(() => {
    const counts = { all: byTime.length };
    byTime.forEach(m => {
      const t = getTypeBadge(m).label;
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [byTime]);

  const displayed = useMemo(() => {
    if (typeFilter === 'all') return byTime;
    return byTime.filter(m => getTypeBadge(m).label === typeFilter);
  }, [byTime, typeFilter]);

  // Group by month
  const grouped = useMemo(() => {
    const groups = [];
    let current = null;
    displayed.forEach(m => {
      const month = m.date.slice(0, 7); // "2026-04"
      if (month !== current) {
        current = month;
        groups.push({ month, label: new Date(m.date + 'T12:00:00').toLocaleString('en-CA', { month: 'long', year: 'numeric' }), items: [] });
      }
      groups[groups.length - 1].items.push(m);
    });
    return groups;
  }, [displayed]);

  return (
    <div className="max-w-3xl mx-auto py-2 px-4 sm:px-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meetings</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {committeeFilter
              ? meetings.find(m => committeeToSlug(m.committee) === committeeFilter)?.committee ?? committeeFilter
              : 'Toronto City Council & committees'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {committeeFilter && (
            <button
              onClick={() => navigate('/meetings')}
              className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              Show all
            </button>
          )}
          <Calendar className="w-5 h-5 text-slate-300" />
        </div>
      </div>

      {/* Upcoming / Past toggle */}
      <div className="flex gap-1 mb-3 bg-slate-100 rounded-xl p-1 w-fit">
        {[
          { id: 'upcoming', label: `Upcoming · ${upcoming.length}` },
          { id: 'past',     label: `Past · ${past.length}` },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setTypeFilter('all'); }}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              filter === f.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Type filter chips */}
      {Object.keys(typeOptions).length > 2 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-6">
          {['all', ...Object.keys(typeOptions).filter(k => k !== 'all')].map(type => (
            typeOptions[type] ? (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors",
                  typeFilter === type
                    ? "bg-[#004a99] text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {type === 'all' ? 'All' : type}{type !== 'all' ? ` · ${typeOptions[type]}` : ''}
              </button>
            ) : null
          ))}
        </div>
      )}

      {/* Grouped list */}
      {grouped.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm">No meetings found.</div>
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
                      {/* Date block */}
                      <div className="shrink-0 w-10 text-center">
                        <p className="text-[11px] font-bold text-slate-400 uppercase leading-none">
                          {new Date(meeting.date + 'T12:00:00').toLocaleString('en-CA', { month: 'short' })}
                        </p>
                        <p className="text-xl font-black text-slate-700 leading-tight">
                          {new Date(meeting.date + 'T12:00:00').getDate()}
                        </p>
                      </div>

                      {/* Details */}
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
