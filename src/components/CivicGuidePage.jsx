import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageMeta } from './PageMeta';
import { CivicCard, CivicSectionLabel } from './ui/CivicCard';

const GUIDE_CONTENT = {
  council: {
    title: 'How City Council Works',
    description: city => `A plain-language guide to how ${city} City Council makes decisions and how residents can take part.`,
    intro: city => `City council is where local decisions become official. Here is the basic path an issue takes through ${city}’s municipal government.`,
    steps: city === 'Vancouver'
      ? [
          ['1', 'An issue reaches council', 'A proposal can come from a councillor, City staff, a committee, a public hearing, or a member of the public.'],
          ['2', 'Council studies and discusses it', 'Council may hear from staff, ask questions, refer the item, or debate it in a regular or special meeting.'],
          ['3', 'Council votes', 'The mayor and councillors vote together because Vancouver’s council is elected at-large. The result becomes part of the public record.'],
          ['4', 'The decision moves forward', 'City staff carry out approved directions, prepare follow-up reports, or bring the item back for another decision.'],
        ]
      : [
          ['1', 'An issue reaches council', 'A proposal can come from a councillor, City staff, a committee, a public hearing, or a member of the public.'],
          ['2', 'Council studies and discusses it', 'Council may hear from staff, ask questions, refer the item, or debate it in a regular or special meeting.'],
          ['3', 'Council votes', 'The mayor and ward councillors vote on the item. The result becomes part of the public record.'],
          ['4', 'The decision moves forward', 'City staff carry out approved directions, prepare follow-up reports, or bring the item back for another decision.'],
        ],
    action: city => `Browse ${city} motions`,
  },
  voting: {
    title: 'How Council Voting Works',
    description: city => `How recorded votes work in ${city}, what the results mean, and where to read the official record.`,
    intro: city => `A council vote is a recorded decision, not a poll of public opinion. This is how to read what happened and decide what to do next in ${city}.`,
    steps: [
      ['1', 'Find the question', 'Every vote is attached to a specific motion, recommendation, amendment, or by-law. Start with the wording of the item.'],
      ['2', 'See how each member voted', 'The record shows the available vote choices and which councillors selected them. A missing vote can mean a member was absent or did not vote.'],
      ['3', 'Read the result', 'The outcome tells you whether the item passed, failed, was amended, or was deferred. The numbers explain the decision; they do not explain every reason behind it.'],
      ['4', 'Follow up', 'Open the agenda and meeting record, contact your councillor, attend a meeting, or follow the next report when the decision still has work ahead.'],
    ],
    action: city => `Explore ${city} councillors`,
  },
};

export default function CivicGuidePage({ type, jurisdiction = { id: 'toronto', name: 'Toronto' } }) {
  const content = GUIDE_CONTENT[type];
  const isCouncilGuide = type === 'council';
  const actionPath = isCouncilGuide ? '/' : '/councillors';

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-20">
      <PageMeta title={`${content.title} | Motions ${jurisdiction.name}`} description={content.description(jurisdiction.name)} />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{content.title}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-500">{content.intro(jurisdiction.name)}</p>
      </div>

      <div className="space-y-3">
        <CivicSectionLabel>{isCouncilGuide ? 'THE PATH OF A DECISION' : 'READING THE RECORD'}</CivicSectionLabel>
        {content.steps.map(([number, title, body]) => (
          <CivicCard key={number} className="flex-row gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#004a99]">{number}</span>
            <div className="space-y-1">
              <h2 className="font-semibold text-slate-900">{title}</h2>
              <p className="text-sm leading-relaxed text-slate-500">{body}</p>
            </div>
          </CivicCard>
        ))}
      </div>

      <CivicCard className="gap-3 bg-blue-50/60">
        <h2 className="text-lg font-semibold text-slate-900">Start with the public record</h2>
        <p className="text-sm leading-relaxed text-slate-600">{isCouncilGuide ? 'Browse recent decisions to see what your council is working on.' : 'Use the official agenda and meeting record when you need the authoritative details.'}</p>
        <Link to={actionPath} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#004a99] hover:underline">
          {content.action(jurisdiction.name)} <ArrowRight className="h-4 w-4" />
        </Link>
      </CivicCard>
    </div>
  );
}
