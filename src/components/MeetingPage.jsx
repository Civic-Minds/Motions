import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, ExternalLink, Lock, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

function committeeToSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function MeetingPage({ meetings }) {
  const { meetingRef } = useParams();
  const navigate = useNavigate();

  const meeting = meetings?.find(m => m.meetingReference === meetingRef);

  if (!meeting) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Meeting not found.
      </div>
    );
  }

  const committeeSlug = committeeToSlug(meeting.committee);
  const hasAgenda = meeting.agendaItems?.length > 0;

  return (
    <div className="max-w-5xl mx-auto py-2 px-4 sm:px-6 lg:px-8">

      {/* Back */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/committees/${committeeSlug}`)}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {meeting.committee}
        </button>
      </div>

      {/* Header */}
      <div className="space-y-2 mb-8">
        <p className="text-xs font-mono text-slate-400">{meeting.meetingReference}</p>
        <h1 className="text-xl font-bold text-slate-900">{meeting.committee}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {meeting.displayDate}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {meeting.startTime}
          </span>
          {meeting.location && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {meeting.location}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* LEFT: Agenda */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                {hasAgenda ? `Agenda · ${meeting.agendaItems.length} items` : 'Agenda'}
              </p>
            </div>

            {!hasAgenda ? (
              <div className="px-5 py-10 text-center">
                <FileText className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Agenda not yet published.</p>
                <p className="text-xs text-slate-300 mt-1">Check back closer to the meeting date.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {meeting.agendaItems.map((item, i) => (
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
                            <span className="text-[11px] text-slate-400">
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

          {/* Meeting details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
              <p className="text-sm font-semibold text-slate-800">{meeting.displayDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time</p>
              <p className="text-sm font-semibold text-slate-800">{meeting.startTime}</p>
            </div>
            {meeting.location && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                <p className="text-sm font-semibold text-slate-800">{meeting.location}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Meeting</p>
              <p className="text-sm font-semibold text-slate-800">#{meeting.meetingNumber} · {meeting.meetingReference}</p>
            </div>
          </div>

          {/* Agenda status */}
          <div className={cn(
            "rounded-xl px-4 py-3 border text-sm font-medium flex items-center gap-2",
            hasAgenda
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-slate-50 border-slate-200 text-slate-400"
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
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
