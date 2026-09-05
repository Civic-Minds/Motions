import React, { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, ChevronRight, Lock, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { committeeToSlug } from '../utils/slug';
import { PageMeta } from './PageMeta';
import BackButton from './ui/BackButton';
import InfoBar from './ui/InfoBar';
import SourcesCard from './ui/SourcesCard';
import CommitteeLink from './ui/CommitteeLink';
import ShareButton from './ShareButton';
import { trackGoogleEvent } from '../utils/googleAnalytics';
import { formatFullDate } from '../utils/date';

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
  const sourceUrl = meeting?.sourceUrl || (jurisdiction.name === 'Toronto' ? 'https://secure.toronto.ca/council/' : null);
  const reportUrl = `/contact?subject=${encodeURIComponent('Report an issue')}&about=meeting&title=${encodeURIComponent(`${meeting.committee} — ${meeting.displayDate}`)}&motion=${encodeURIComponent(window.location.href)}`;
  // Some cities' own body names already end in "Meeting" (e.g. Yellowknife's
  // "Special Council Meeting") — avoid rendering "... Meeting meeting".
  const meetingPhrase = /meeting$/i.test(meeting.committee) ? meeting.committee : `${meeting.committee} meeting`;
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

  // Only worth showing filter chips when items actually fall into more than
  // one bucket — e.g. Vancouver/Victoria/Yellowknife only import items with a
  // recorded vote, so every item there is "substantive" and a filter row
  // would just duplicate the "All" count.
  const hasMultipleCategories = [counts.substantive, counts.inCamera, counts.procedural].filter(c => c > 0).length > 1;

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
    <div className="max-w-5xl mx-auto py-2 pr-4 pl-4 sm:pr-6 sm:pl-24 lg:pr-8 lg:pl-28 relative">
      <PageMeta title={`${meeting.committee} | Motions ${jurisdiction.name}`} description={`${meetingPhrase} records and agenda items for ${jurisdiction.name}.`} />

      <div className="mb-3 sm:hidden">
        <BackButton onClick={() => navigate(`/committees/${committeeSlug}`)} />
      </div>

      {/* Header */}
      <div className="mb-8 space-y-3">
        <div>
          {/* Floated (not flexed) so the title text wraps around it — only
              the first line is narrowed by the buttons' width. */}
          <div className="float-right ml-3 flex shrink-0 items-center gap-2">
            <a
              href={reportUrl}
              onClick={() => trackGoogleEvent('report_issue_click', { meeting_id: meetingRef, city: jurisdiction.id })}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-[#004a99]/40 hover:text-[#004a99]"
            >
              Report
            </a>
            <ShareButton title={meetingPhrase} />
          </div>
          <div className="relative">
            <BackButton onClick={() => navigate(`/committees/${committeeSlug}`)} floating className="-left-20 top-0.5 lg:-left-24" />
            <h1 className="text-xl font-bold text-slate-900 lg:max-w-[calc(66.6667%-0.667rem)]">{meeting.committee}</h1>
          </div>
        </div>
        <InfoBar>
          <span className="font-mono">{meeting.meetingReference}</span>
          <span>{formatFullDate(meeting.date)}</span>
          {meeting.startTime && <span>{meeting.startTime}</span>}
          {meeting.location && <span>{meeting.location}</span>}
          <CommitteeLink committee={meeting.committee} slug={committeeSlug} />
        </InfoBar>
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
              {hasAgenda && hasMultipleCategories && (
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
                {filteredItems.map((item, i) => {
                  const itemNumber = item.reference.split('.').slice(1).join('.');
                  const rowClassName = "flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group";
                  const rowIconClassName = "w-3.5 h-3.5 text-slate-200 group-hover:text-[#004a99] shrink-0 mt-0.5 transition-colors";
                  const rowContent = (
                    <>
                      {/* Item number */}
                      {itemNumber && (
                        <span className="shrink-0 text-[11px] font-mono font-bold text-slate-300 mt-0.5 w-12 pt-px">
                          {itemNumber}
                        </span>
                      )}

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

                      {item.motionId
                        ? <ChevronRight className={rowIconClassName} />
                        : <ExternalLink className={rowIconClassName} />}
                    </>
                  );

                  // Vancouver/Victoria/Yellowknife agenda items are built directly
                  // from tracked motions, so they have their own vote-detail page
                  // in this app — link there instead of out to the raw source.
                  return item.motionId ? (
                    <Link key={i} to={`/motions/${item.motionId}`} className={rowClassName}>
                      {rowContent}
                    </Link>
                  ) : (
                    <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className={rowClassName}>
                      {rowContent}
                    </a>
                  );
                })}
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

          {/* Sources */}
          <SourcesCard
            links={[
              meeting.agendaUrl && { label: 'Council agenda', href: meeting.agendaUrl },
              sourceUrl && { label: 'Official record', href: sourceUrl },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
