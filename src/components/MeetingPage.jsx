import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Lock, FileText, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { committeeToSlug } from '../utils/slug';
import { PageMeta } from './PageMeta';

const PROCEDURAL_TITLES = /^(call to order|confirmation of minutes|declarations of interest|petitions|review of the order paper|introduction of committee reports|presentations, introductions|adjournment|questions of privilege|other business)/i;

function classifyItem(item) {
  if (item.reference.includes('.RM') || PROCEDURAL_TITLES.test(item.title)) return 'procedural';
  if (item.inCamera) return 'inCamera';
  return 'substantive';
}

export default function MeetingPage({ meetings, jurisdiction = { name: 'Toronto' } }) {
  const { meetingRef } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const meeting = meetings?.find(m => m.meetingReference === meetingRef);
  const committeeSlug = committeeToSlug(meeting?.committee ?? '');
  const agendaItems = useMemo(() => meeting?.agendaItems ?? [], [meeting?.agendaItems]);
  const hasAgenda = agendaItems.length > 0;

  const counts = useMemo(() => {
    const c = { all: agendaItems.length, substantive: 0, inCamera: 0, procedural: 0 };
    agendaItems.forEach(item => { c[classifyItem(item)]++; });
    return c;
  }, [agendaItems]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return agendaItems;
    return agendaItems.filter(item => classifyItem(item) === filter);
  }, [agendaItems, filter]);

  const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'substantive', label: 'Substantive' },
    { id: 'inCamera', label: 'In Camera' },
    { id: 'procedural', label: 'Procedural' },
  ];

  if (!meeting) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Meeting not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-2 px-4 sm:px-6 lg:px-8 relative">
      <PageMeta title={`${meeting.committee} | Motions ${jurisdiction.name}`} description={`${meeting.committee} meeting records and agenda items for ${jurisdiction.name}.`} />

      {/* Back — desktop floating left */}
      <button
        onClick={() => navigate(`/committees/${committeeSlug}`)}
        className="hidden xl:flex absolute -left-12 top-1 items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-slate-300" />
        Back
      </button>

      {/* Back — mobile/tablet stacked */}
      <div className="mb-6 xl:hidden">
        <button
          onClick={() => navigate(`/committees/${committeeSlug}`)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Header */}
      <div className="space-y-3 mb-8">
        <h1 className="text-xl font-bold text-slate-900">{meeting.committee}</h1>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <span className="font-mono">{meeting.meetingReference}</span>
          <span>·</span>
          <span>{meeting.displayDate}</span>
          <span>·</span>
          <span>{meeting.startTime}</span>
          {meeting.location && <><span>·</span><span>{meeting.location}</span></>}
        </div>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* LEFT: Agenda */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {hasAgenda ? `Agenda · ${meeting.agendaItems.length.toLocaleString()} items` : 'Agenda'}
              </p>
              {hasAgenda && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {FILTERS.map(f => (
                    counts[f.id] > 0 || f.id === 'all' ? (
                      <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors",
                          filter === f.id
                            ? "bg-[#004a99] text-white"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        )}
                      >
                        {f.label}{f.id !== 'all' && counts[f.id] ? ` · ${counts[f.id]}` : ''}
                      </button>
                    ) : null
                  ))}
                </div>
              )}
            </div>

            {!hasAgenda ? (
              <div className="px-5 py-10 text-center">
                <FileText className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Agenda not yet published.</p>
                <p className="text-xs text-slate-300 mt-1">Check back closer to the meeting date.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredItems.map((item, i) => (
                  <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
                  >
                    {/* Item number */}
                    <span className="shrink-0 text-[11px] font-mono font-bold text-slate-300 mt-0.5 w-12 pt-px">
                      {item.reference.split('.').slice(1).join('.')}
                    </span>

                    {/* Title + badges */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 leading-snug group-hover:text-[#004a99] transition-colors">
                        {item.title}
                      </p>
                      {(item.wards || item.inCamera) && (
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {item.wards && item.wards !== 'null' && (
                            <span className="text-[11px] text-slate-500">
                              {item.wards === 'All' ? 'City-wide' : `Ward${item.wards.includes(',') ? 's' : ''} ${item.wards}`}
                            </span>
                          )}
                          {item.inCamera && (
                            <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                              <Lock className="w-2.5 h-2.5" />
                              In camera
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <ExternalLink className="w-3.5 h-3.5 text-slate-200 group-hover:text-[#004a99] shrink-0 mt-0.5 transition-colors" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-8">

          {/* Agenda status */}
          <div className={cn(
            "rounded-xl px-4 py-3 border text-sm font-medium flex items-center gap-2",
            hasAgenda
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-slate-50 border-slate-200 text-slate-500"
          )}>
            <span className={cn("w-2 h-2 rounded-full shrink-0", hasAgenda ? "bg-emerald-400" : "bg-slate-300")} />
            {hasAgenda ? 'Agenda published' : 'Agenda pending'}
          </div>

          {/* Committee link */}
          <button
            onClick={() => navigate(`/committees/${committeeSlug}`)}
            className="w-full text-left px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 hover:border-[#004a99]/40 hover:text-[#004a99] transition-colors flex items-center justify-between"
          >
            <span>View committee page</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          {/* Official meeting record */}
          {meeting.meetingReference && (
            <div className="space-y-2">
              {meeting.agendaUrl && <a
                href={meeting.agendaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-left px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 hover:border-[#004a99]/40 hover:text-[#004a99] transition-colors flex items-center justify-between"
              >
                <span>View official council agenda</span>
                <ExternalLink className="w-3 h-3" />
              </a>}
              <a
                href={meeting.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-left px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 hover:border-[#004a99]/40 hover:text-[#004a99] transition-colors flex items-center justify-between"
              >
                <span>View on {jurisdiction.name} source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
