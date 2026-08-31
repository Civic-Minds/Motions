import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageMeta } from './PageMeta';
import { CivicCard, CivicSectionLabel } from './ui/CivicCard';
import PageColumn from './PageColumn';

const GUIDE_CONTENT = {
  council: {
    lastUpdated: 'August 31, 2026',
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
    lastUpdated: 'August 31, 2026',
    title: 'How a Council Vote Works',
    description: city => `How recorded votes work in ${city}, what the results mean, and where to read the official record.`,
    intro: city => `A council vote is a recorded decision, not a poll of public opinion. This is how to read what happened and decide what to do next in ${city}.`,
    context: {
      Toronto: 'Toronto has a Mayor elected citywide and 25 ward councillors. Each member has one vote at Council, and most ordinary questions are decided by a majority. Toronto’s Strong Mayor rules create a separate process for the budget and some provincial-priority by-laws.',
      Vancouver: 'Vancouver has a Mayor and 10 councillors elected at-large. Every member represents the whole city and has one vote at Council; unless a law or by-law sets another threshold, a motion passes with a majority of the members present.',
    },
    steps: {
      Toronto: [
        ['1', 'The item appears on an agenda', 'A staff report, councillor motion, or by-law is placed before a Standing Committee, Community Council, or City Council.'],
        ['2', 'The public and committee consider it', 'Residents can review the report and, where permitted, submit written comments or register to speak. The committee discusses the item and may recommend a decision to Council.'],
        ['3', 'Council debates the question', 'Council reviews the item and any committee recommendation. Members can ask questions, propose amendments, and vote on those amendments before the final question.'],
        ['4', 'Members cast their votes', 'Toronto’s Mayor and 25 ward councillors each have one vote. Most ordinary questions pass with a majority, but some matters have special legal thresholds. The recorded result shows who voted for, against, or did not vote.'],
        ['5', 'A Strong Mayor rule may change the path', 'For the budget, the Mayor proposes a budget and Council can amend it; the Mayor can veto Council’s budget amendments, subject to a two-thirds Council override. The Mayor can also veto some by-laws connected to provincial priorities, which Council can override with a two-thirds vote.'],
        ['6', 'The decision is published and carried out', 'The minutes and voting record show whether the item passed, failed, was amended, referred, or deferred. City staff then carry out approved directions or prepare the next report.'],
      ],
      Vancouver: [
        ['1', 'The item appears on an agenda', 'A staff report, Council member motion, by-law, or hearing matter is placed on the agenda for the appropriate Council, committee, or hearing.'],
        ['2', 'The item is considered', 'The public may review the agenda and, depending on the meeting and item, attend, watch, submit comments, or request to speak. Committees may discuss a matter before Council considers it.'],
        ['3', 'The question is put to Council', 'The Chair brings the motion or recommendation forward. Members can ask questions and propose amendments; an amendment is decided before the main question.'],
        ['4', 'Members cast their votes', 'Vancouver’s Mayor and 10 councillors are elected at-large, so every member represents the whole city and has one vote. Unless a law or by-law requires something else, a motion passes with a majority of the Council members present.'],
        ['5', 'The decision is published and carried out', 'The minutes and voting record show whether the item passed, failed, was amended, or was referred. City staff then carry out approved directions or prepare the next report.'],
      ],
    },
    action: city => `Explore ${city} councillors`,
  },
  involvement: {
    lastUpdated: 'August 31, 2026',
    title: 'How to Get Involved',
    description: city => `Find practical ways to take part in ${city}’s local decisions.`,
    intro: city => city === 'Vancouver'
      ? 'You do not have to wait for an election to take part in Vancouver’s civic decisions. Start with the type of issue you care about, then follow the public process around it.'
      : 'City-specific ways to take part in local decisions are coming soon.',
    steps: {
      Vancouver: [
        ['1', 'Find an open conversation', 'Shape Your City lists consultations where residents can learn about proposals and share feedback before decisions are made.'],
        ['2', 'Watch for formal notices', 'The City’s public notices page lists public hearings and other notices, including when and how residents can share their views.'],
        ['3', 'Speak up on development proposals', 'For a rezoning or other development application, review the proposal and follow the listed opportunities to comment or participate in a public hearing.'],
        ['4', 'Take part in a Council decision', 'Read the agenda, attend or watch the meeting, submit comments, request to speak when that option is available, or contact any councillor or the Mayor.'],
        ['5', 'Follow the result', 'Check the minutes, voting record, and later reports to see what Council decided and what happens next.'],
      ],
      Toronto: [],
    },
    resources: {
      Vancouver: [
        ['Shape Your City', 'https://www.shapeyourcity.ca/'],
        ['Public notices', 'https://vancouver.ca/your-government/public-notices.aspx'],
        ['Rezoning applications', 'https://vancouver.ca/home-property-development/rezoning-applications.aspx'],
      ],
    },
    action: city => `Explore ${city} councillors`,
  },
  strongMayor: {
    lastUpdated: 'August 31, 2026',
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
  const isInvolvementGuide = type === 'involvement';
  const steps = type === 'council' || type === 'voting' ? content.steps[jurisdiction.name] : content.steps;
  const citySteps = type === 'involvement' ? content.steps[jurisdiction.name] : steps;
  const resources = content.resources?.[jurisdiction.name] ?? [];
  const actionPath = content.actionPath ?? (isCouncilGuide ? '/' : '/councillors');
  const participationPrompt = type === 'council' || type === 'voting'
    ? jurisdiction.name === 'Vancouver'
      ? {
          title: isCouncilGuide ? 'Have an idea for Vancouver?' : 'Have a view on a vote?',
          description: isCouncilGuide ? 'Vancouver councillors are elected at-large, so you can reach out to any councillor or the Mayor about a citywide idea.' : 'Vancouver councillors are elected at-large, so you can reach out to any councillor or the Mayor about a council decision.',
          action: 'Explore Vancouver councillors',
        }
      : {
          title: isCouncilGuide ? 'Have an idea for your neighbourhood?' : 'Have a view on a vote?',
          description: isCouncilGuide ? 'Start with your ward councillor, who represents your neighbourhood on Toronto City Council.' : 'Start with your ward councillor, who represents your neighbourhood on Toronto City Council, if you have a view on a decision.',
          action: 'Find your councillor',
        }
    : null;

  return (
    <PageColumn className="space-y-8 pb-20">
      <PageMeta title={`${content.title} | Motions ${jurisdiction.name}`} description={content.description(jurisdiction.name)} />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{content.title}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-500">{content.intro(jurisdiction.name)}</p>
        {content.context?.[jurisdiction.name] && <p className="max-w-2xl text-sm leading-relaxed text-slate-500">{content.context[jurisdiction.name]}</p>}
        <p className="text-xs text-slate-400">Last updated: {content.lastUpdated}</p>
      </div>

      <div className="space-y-3">
        <CivicSectionLabel>{isCouncilGuide ? 'THE PATH OF A DECISION' : isInvolvementGuide ? 'WAYS TO TAKE PART' : 'FROM AGENDA TO DECISION'}</CivicSectionLabel>
        {citySteps.length === 0 ? (
          <CivicCard className="gap-2">
            <h2 className="font-semibold text-slate-900">Coming soon</h2>
            <p className="text-sm leading-relaxed text-slate-500">We’re preparing a city-specific guide to ways Toronto residents can take part in local decisions.</p>
          </CivicCard>
        ) : citySteps.map(([number, title, body]) => (
          <CivicCard key={number} className="flex-row gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#004a99]">{number}</span>
            <div className="space-y-1">
              <h2 className="font-semibold text-slate-900">{title}</h2>
              <p className="text-sm leading-relaxed text-slate-500">{body}</p>
            </div>
          </CivicCard>
        ))}
      </div>

      {resources.length > 0 && (
        <div className="space-y-3">
          <CivicSectionLabel>OFFICIAL RESOURCES</CivicSectionLabel>
          <CivicCard className="gap-2">
            {resources.map(([label, href]) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#004a99] hover:underline">
                {label} <ArrowRight className="inline h-4 w-4" />
              </a>
            ))}
          </CivicCard>
        </div>
      )}

      {(!isInvolvementGuide || citySteps.length > 0) && <CivicCard className="gap-3 bg-blue-50/60">
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
      </CivicCard>}
    </PageColumn>
  );
}
