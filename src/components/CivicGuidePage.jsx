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
    steps: {
      Vancouver: [
          ['1', 'An issue reaches the City', 'An item can begin as a staff report, a Council member’s motion, a committee matter, or a hearing. The item is placed on the agenda for the appropriate meeting.'],
          ['2', 'The public and Council consider it', 'Council meetings make decisions, while committees and hearings hear information, staff advice, and public input before a matter is decided or recommended.'],
          ['3', 'Council votes', 'The Mayor and 10 councillors vote together because Vancouver’s Council is elected at-large. The result becomes part of the public record.'],
          ['4', 'The decision moves forward', 'City staff carry out approved directions, prepare follow-up reports, or bring the item back for another decision.'],
      ],
      Toronto: [
          ['1', 'An issue becomes a report or motion', 'An item can begin with City staff, a councillor, or a public process and is placed on an agenda for a committee, Community Council, or City Council.'],
          ['2', 'A committee reviews it', 'Standing Committees and Community Councils hear staff advice, consider public input, debate the item, and usually make a recommendation to City Council.'],
          ['3', 'City Council votes', 'Toronto’s Mayor and 25 ward councillors each have one vote. Council considers the recommendation and decides whether to adopt, amend, refer, or defer the item.'],
          ['4', 'The decision moves forward', 'City staff carry out approved directions, prepare follow-up reports, or bring the item back for another decision.'],
      ],
    },
    action: city => `Browse ${city} motions`,
  },
  voting: {
    title: 'How a Council Vote Works',
    description: city => `How recorded votes work in ${city}, what the results mean, and where to read the official record.`,
    intro: city => `A council vote is a recorded decision, not a poll of public opinion. This is how to read what happened and decide what to do next in ${city}.`,
    steps: {
      Toronto: [
        ['1', 'Find the question', 'Every vote is attached to a specific motion, recommendation, amendment, or by-law. Start with the wording of the item.'],
        ['2', 'See how Council voted', 'Toronto’s Mayor and ward councillors each have one vote. The record shows which members voted for, against, or did not vote.'],
        ['3', 'Read the result', 'Most matters are decided by a majority of votes. The outcome tells you whether the item passed, failed, was amended, or was deferred.'],
        ['4', 'Follow up', 'Open the agenda and meeting record, contact your ward councillor or the Mayor, attend a meeting, or follow the next report.'],
      ],
      Vancouver: [
        ['1', 'Find the question', 'Every vote is attached to a motion, recommendation, amendment, or by-law. Start with the wording of the item and the meeting where it was considered.'],
        ['2', 'See how Council voted', 'Vancouver’s Mayor and councillors are elected at-large, so every member represents the whole city and has one vote on Council.'],
        ['3', 'Read the result', 'The record shows the individual votes and whether the item passed, failed, was amended, or was referred for more work.'],
        ['4', 'Follow up', 'Open the official agenda and minutes, contact any councillor, attend a Council meeting, or follow the next report or by-law.'],
      ],
    },
    action: city => `Explore ${city} councillors`,
  },
  strongMayor: {
    title: 'How Toronto’s Strong Mayor Powers Work',
    description: 'A plain-language guide to the additional powers and duties of Toronto’s Mayor.',
    intro: 'Toronto’s Mayor has responsibilities that go beyond chairing Council. This guide explains what those powers change, what still requires Council, and where to follow the paper trail.',
    steps: [
      ['1', 'The Mayor has additional legal powers', 'Ontario law gives Toronto’s Mayor specific powers and duties as head of council. They apply alongside the regular powers shared by the Mayor and Council.'],
      ['2', 'The Mayor shapes administration and committees', 'The Mayor can appoint the City Manager, hire or dismiss certain division heads, set the organizational structure, and create or assign functions to committees.'],
      ['3', 'The Mayor proposes the budget', 'The Mayor is responsible for presenting a proposed City budget. Council can amend the budget, subject to the rules in the City of Toronto Act.'],
      ['4', 'Some powers relate to provincial priorities', 'The Mayor can bring forward matters and propose certain by-laws connected to prescribed provincial priorities, including housing and related infrastructure. Some by-laws may also be subject to a mayoral veto.'],
      ['5', 'Council still has a role', 'Council continues to debate and vote on municipal decisions. Certain mayoral actions must be exercised in writing and made public, so residents can follow the official decision record.'],
    ],
    action: () => 'View Toronto mayoral decisions',
    actionPath: 'https://www.toronto.ca/city-government/council/council-committee-meetings/mayoral-decisions/',
    external: true,
  },
};

export default function CivicGuidePage({ type, jurisdiction = { id: 'toronto', name: 'Toronto' } }) {
  const content = GUIDE_CONTENT[type];
  const isCouncilGuide = type === 'council';
  const steps = type === 'council' ? content.steps[jurisdiction.name] : content.steps;
  const actionPath = content.actionPath ?? (isCouncilGuide ? '/' : '/councillors');
  const participationPrompt = isCouncilGuide
    ? jurisdiction.name === 'Vancouver'
      ? {
          title: 'Have an idea for Vancouver?',
          description: 'Vancouver councillors are elected at-large, so you can reach out to any councillor or the Mayor about a citywide idea.',
          action: 'Explore Vancouver councillors',
        }
      : {
          title: 'Have an idea for your neighbourhood?',
          description: 'Start with your ward councillor, who represents your neighbourhood on Toronto City Council.',
          action: 'Find your councillor',
        }
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-20">
      <PageMeta title={`${content.title} | Motions ${jurisdiction.name}`} description={content.description(jurisdiction.name)} />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{content.title}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-500">{content.intro(jurisdiction.name)}</p>
      </div>

      <div className="space-y-3">
        <CivicSectionLabel>{isCouncilGuide ? 'THE PATH OF A DECISION' : 'READING THE RECORD'}</CivicSectionLabel>
        {steps.map(([number, title, body]) => (
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
        <h2 className="text-lg font-semibold text-slate-900">{participationPrompt?.title ?? 'Start with the public record'}</h2>
        <p className="text-sm leading-relaxed text-slate-600">{participationPrompt?.description ?? (isCouncilGuide ? 'Browse recent decisions to see what your council is working on.' : 'Use the official agenda and meeting record when you need the authoritative details.')}</p>
        {content.external ? (
          <a href={actionPath} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#004a99] hover:underline">
            {content.action(jurisdiction.name)} <ArrowRight className="h-4 w-4" />
          </a>
        ) : (
          <Link to={actionPath} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#004a99] hover:underline">
            {participationPrompt?.action ?? content.action(jurisdiction.name)} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </CivicCard>
    </div>
  );
}
