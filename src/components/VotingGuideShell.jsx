import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ArrowRight } from 'lucide-react';
import { PageMeta } from './PageMeta';
import PageColumn from './PageColumn';
import { CivicCard } from './ui/CivicCard';
import ShareButton from './ShareButton';

const LAST_UPDATED = 'August 31, 2026';

export default function VotingGuideShell({ title, description, intro, jurisdiction, children }) {
  const electionDate = jurisdiction?.election?.date
    ? new Date(`${jurisdiction.election.date}T00:00:00`).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;
  const reportUrl = `/contact?subject=${encodeURIComponent('Report an issue')}&about=other&page=${encodeURIComponent(window.location.href)}`;

  return (
    <PageColumn className="space-y-8 pb-20">
      <PageMeta title={title} description={description} />

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <h1 className="min-w-0 flex-1 text-3xl font-bold tracking-tight text-slate-900">How Voting Works</h1>
          <div className="flex shrink-0 items-center gap-2">
            <a href={reportUrl} className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-[#004a99]/40 hover:text-[#004a99]">Report</a>
            <ShareButton title={title} />
          </div>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-500">{intro}</p>
        <p className="text-xs text-slate-400">Last updated: {LAST_UPDATED}</p>
      </div>

      {electionDate && (
        <Link to="/election">
          <CivicCard className="flex-row items-center justify-between gap-4 bg-blue-50/60 hover:border-[#004a99]/40">
            <div className="flex items-center gap-3">
              <CalendarClock className="h-5 w-5 shrink-0 text-[#004a99]" />
              <p className="text-sm font-semibold text-slate-900">{jurisdiction.name}’s next election is {electionDate}.</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#004a99]">
              See key dates <ArrowRight className="h-4 w-4" />
            </span>
          </CivicCard>
        </Link>
      )}

      <div className={electionDate ? 'pt-4' : undefined}>{children}</div>
    </PageColumn>
  );
}
