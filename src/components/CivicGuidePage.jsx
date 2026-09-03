import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageMeta } from './PageMeta';
import { CivicCard, CivicSectionLabel } from './ui/CivicCard';
import PageColumn from './PageColumn';
import ShareButton from './ShareButton';

const GUIDE_CONTENT = {
  council: {
    lastUpdated: 'August 31, 2026',
    title: 'How City Council Works',
    description: city => `A plain-language guide to how ${city} City Council makes decisions and how residents can take part.`,
    intro: city => `City council is where local decisions become official. Here is the basic path an issue takes through ${city}’s municipal government.`,
    steps: {
      Vancouver: [
          ['1', 'An issue reaches the City', 'An item can begin as a staff report, a Council member’s motion, a committee matter, or a hearing. It’s placed on the agenda for the right meeting.'],
          ['2', 'The public and Council consider it', 'Council meetings make the decisions. Committees and hearings hear information, staff advice, and public input first, before a matter is decided or recommended.'],
          ['3', 'Council votes', 'The Mayor and 10 councillors vote together because Vancouver’s Council is elected at-large. The result becomes part of the public record.'],
          ['4', 'The decision moves forward', 'City staff carry out approved directions, prepare follow-up reports, or bring the item back for another decision.'],
      ],
      Toronto: [
          ['1', 'An issue becomes a report or motion', 'An item can begin with City staff, a councillor, or a public process. It’s placed on an agenda for a committee, Community Council, or City Council.'],
          ['2', 'A committee reviews it', 'Standing Committees and Community Councils hear staff advice and public input, then debate the item. They usually send a recommendation to City Council.'],
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
      Toronto: 'Toronto has a Mayor elected citywide and 25 ward councillors. Each member has one vote at Council. Most ordinary questions are decided by a majority, but Toronto’s Strong Mayor rules create a separate process for the budget and some provincial-priority by-laws.',
      Vancouver: 'Vancouver has a Mayor and 10 councillors, all elected at-large. Every member represents the whole city and has one vote at Council. Most motions pass with a majority of the members present, unless a law sets a different threshold.',
    },
    steps: {
      Toronto: [
        ['1', 'The item appears on an agenda', 'A staff report, councillor motion, or by-law is placed before a Standing Committee, Community Council, or City Council.'],
        ['2', 'The public and committee consider it', 'Residents can review the report. Where allowed, they can submit written comments or register to speak. The committee discusses the item and may recommend a decision to Council.'],
        ['3', 'Council debates the question', 'Council reviews the item and any committee recommendation. Members can ask questions, propose amendments, and vote on those amendments before the final question.'],
        ['4', 'Members cast their votes', 'Toronto’s Mayor and 25 ward councillors each have one vote. Most ordinary questions pass with a majority, but some matters have special legal thresholds. The recorded result shows who voted for, against, or did not vote.'],
        ['5', 'A Strong Mayor rule may change the path', 'For the budget, the Mayor proposes it and Council can amend it. The Mayor can veto Council’s changes, but Council can override that with two-thirds of the vote. The Mayor can also veto some by-laws tied to provincial priorities, which Council can also override with two-thirds.'],
        ['6', 'The decision is published and carried out', 'The minutes and voting record show whether the item passed, failed, was amended, referred, or deferred. City staff then carry out approved directions or prepare the next report.'],
      ],
      Vancouver: [
        ['1', 'The item appears on an agenda', 'A staff report, Council member motion, by-law, or hearing matter is placed on the agenda for the appropriate Council, committee, or hearing.'],
        ['2', 'The item is considered', 'Depending on the meeting, the public can review the agenda, attend, watch, submit comments, or ask to speak. Committees may discuss a matter before Council considers it.'],
        ['3', 'The question is put to Council', 'The Chair brings the motion or recommendation forward. Members can ask questions and propose amendments. Any amendment is decided before the main question.'],
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
    intro: city => `You do not have to wait for an election to take part in ${city}’s civic decisions. Start with the type of issue you care about, then follow the public process around it.`,
    resourcesInline: true,
    steps: {
      Vancouver: [
        ['1', 'Find an open conversation', 'Shape Your City lists consultations where residents can learn about proposals and share feedback before decisions are made.', 'Shape Your City', 'https://www.shapeyourcity.ca/'],
        ['2', 'Watch for formal notices', 'The City’s public notices page lists public hearings and other notices, including when and how residents can share their views.', 'Public notices', 'https://vancouver.ca/your-government/public-notices.aspx'],
        ['3', 'Speak up on development proposals', 'For a rezoning or other development application, review the proposal and follow the listed opportunities to comment or participate in a public hearing.', 'Rezoning applications', 'https://vancouver.ca/home-property-development/rezoning-applications.aspx'],
        ['4', 'Take part in a Council decision', 'Read the agenda, attend or watch the meeting, submit comments, request to speak when that option is available, or contact any councillor or the Mayor.', 'Sign up to speak', 'https://vancouver.ca/your-government/speak-at-city-council-meetings.aspx'],
        ['5', 'Follow the result', 'Check the minutes, voting record, and later reports to see what Council decided and what happens next.'],
      ],
      Toronto: [
        ['1', 'Find an open conversation', 'Have Your Say Toronto lists surveys and consultations on the budget, planning, parks, transit, and housing.', 'Have Your Say Toronto', 'https://haveyoursay.toronto.ca/'],
        ['2', 'Watch for formal notices', 'The City’s public notices page lists hearings and other notices, including how residents can share their views.', 'Public Notices & Bylaws', 'https://www.toronto.ca/city-government/public-notices-bylaws/'],
        ['3', 'Speak up on development proposals', 'For a rezoning or other development application, check the Application Information Centre for the proposal, meeting dates, and how to comment.', 'Application Information Centre', 'https://app.toronto.ca/DevelopmentApplications/mapSearchSetup.do?action=init'],
        ['4', 'Take part in a Council decision', 'Read the agenda, then register to speak at the committee or Community Council handling it. City Council itself does not take public speakers — only committees do. You can also contact your ward councillor.', 'Register to speak at a meeting', 'https://www.toronto.ca/city-government/council/council-committee-meetings/have-your-say/'],
        ['5', 'Follow the result', 'Check the minutes, voting record, and later reports to see what Council decided and what happens next.'],
      ],
    },
    action: city => `Explore ${city} councillors`,
  },
  depute: {
    lastUpdated: 'August 31, 2026',
    title: 'How to Depute',
    description: city => `How to register, prepare, and speak to your ${city} council or committee about an item on the agenda.`,
    intro: city => `Anyone can speak about an item on the agenda — you don’t need to be an expert or represent an organization. Here’s exactly how to register and what to expect in ${city}.`,
    steps: {
      Toronto: [
        ['1', 'Find your item on a committee agenda', 'Deputations happen at committees and Community Councils, not at full City Council. Find your item’s report number on the relevant agenda.'],
        ['2', 'Register by the deadline', 'Register by 4:30 p.m. the day before the meeting, using the “Request to Speak” link on the agenda item or by emailing the committee clerk listed on the committee’s page.', 'Register to speak at a meeting', 'https://www.toronto.ca/city-government/council/council-committee-meetings/have-your-say/'],
        ['3', 'Choose in person or by video', 'Say which you prefer when you register. Either way, you speak directly to the committee.'],
        ['4', 'Know your time limit', 'Public presentations are limited to five minutes, unless the committee decides otherwise. Committee members can then ask you questions.'],
        ['5', 'Or submit written comments instead', 'Send them to the Clerk’s office, naming the specific agenda item and committee. Comments received after the deadline won’t be distributed to members, so submit early.'],
      ],
      Vancouver: [
        ['1', 'Find your item on the agenda', 'Council and committee agendas list every item up for a decision.'],
        ['2', 'Register to speak', 'Email speaker.request@vancouver.ca or call 604-829-4272, or sign up online. For a Public Hearing, registration opens 10 days before the meeting and closes at 5 p.m. the day before — a limited number of in-person spots also open at City Hall from 5:30–6 p.m. the day of.', 'Sign up to speak', 'https://vancouver.ca/your-government/speak-at-city-council-meetings.aspx'],
        ['3', 'Get your speaker number', 'Speakers are assigned a number in the order requests are received. You’ll get a confirmation email with what to expect.'],
        ['4', 'Know your time limit', 'Speakers get three minutes.'],
        ['5', 'Or submit written comments or slides instead', 'Same deadline as registering to speak — 5 p.m. the day before. Late submissions, including for reconvened meetings, aren’t accepted.'],
      ],
    },
    resources: {
      Toronto: [
        ['Have Your Say at Council & Committee Meetings', 'https://www.toronto.ca/city-government/council/council-committee-meetings/have-your-say/'],
        ['Council and committee meetings', 'https://www.toronto.ca/city-government/council/council-committee-meetings/'],
      ],
      Vancouver: [
        ['Sign up to speak', 'https://vancouver.ca/your-government/speak-at-city-council-meetings.aspx'],
        ['Prepare to speak', 'https://vancouver.ca/your-government/prepare-to-speak-at-a-meeting-or-hearing.aspx'],
      ],
    },
    action: city => `Explore ${city} councillors`,
  },
  strongMayor: {
    lastUpdated: 'August 31, 2026',
    title: 'How Toronto’s Strong Mayor Powers Work',
    description: () => 'A plain-language guide to Toronto’s Mayor’s additional powers, budget process, and public decisions.',
    intro: () => 'Toronto’s Mayor has specific powers and duties under the City of Toronto Act. This guide explains what they change, what still requires Council, and where to follow the public record.',
    steps: [
      ['1', 'The Mayor has additional legal powers', 'Ontario law gives Toronto’s Mayor extra powers as head of council. These sit alongside the regular powers shared by the Mayor and Council. The Mayor is not the only decision-maker.'],
      ['2', 'The Mayor shapes the City’s administration', 'The Mayor can appoint the City Manager, hire or fire senior City officials, and set the City’s organizational structure. Mayor Chow handed those hiring, firing, and structure powers to Council and the City Manager back in 2023. The public register below shows no sign she has used them directly since.'],
      ['3', 'The Mayor shapes committees and meetings', 'The Mayor can create committees, decide what they do, and appoint their chairs and vice-chairs. The Mayor can also bring certain matters straight to Council. Council still debates and votes on what the City actually does.'],
      ['4', 'The Mayor proposes the budget', 'The Mayor presents a proposed City budget, and Council can amend it. The Mayor may veto Council’s changes. Council can override that veto with 18 votes — two-thirds of the 26 Council members.'],
      ['5', 'Some powers relate to provincial priorities', 'On a short list of priorities the province has singled out, like building more housing, the Mayor gets extra sway. The Mayor can veto related by-laws, and Council can override that with 18 votes. If the Mayor proposes a by-law on one of those priorities, it only needs 9 votes to pass — just over one-third of Council — instead of the usual majority.'],
      ['6', 'The paper trail is public', 'Strong Mayor powers have to be used in writing, and the record is public. The City’s register covers approvals, appointments, budget actions, and committee changes, not just vetoes.'],
    ],
    resources: {
      Toronto: [
        ['Toronto Strong Mayor register', 'https://www.toronto.ca/city-government/council/council-committee-meetings/mayoral-decisions/'],
        ['Strong Mayor Powers factsheet', 'https://www.toronto.ca/wp-content/uploads/2022/11/9011-Strong-Mayor-Powers-Factsheet-FINAL-for-External-Web-Nov25.pdf'],
        ['City of Toronto Act, 2006', 'https://www.ontario.ca/laws/statute/06c11'],
      ],
    },
    registerIntro: 'The register is the City’s public log of every Strong Mayor decision — a plain webpage listing each one by date, with a short written notice. Below is what each type of entry means.',
    registerCategories: [
      ['Budget', 'Budget proposals and notices about the period for the Mayor to veto Council amendments.'],
      ['By-law approvals', 'Written approvals of by-laws passed by Council, Community Councils, committees, or other bodies.'],
      ['Veto-related actions', 'A notice or veto connected to a provincial-priority by-law or the budget process. An entry is a veto only when its title says so.'],
      ['Committees', 'Creating, dissolving, assigning functions to, or changing the chairs and vice-chairs of Council committees.'],
      ['Appointments and staffing', 'Appointments of the City Manager, senior officials, and other actions affecting City administration.'],
      ['Organizational changes', 'Changes to the City’s organizational structure or formal delegation of Strong Mayor powers.'],
    ],
    action: () => 'View the Strong Mayor register',
    actionPath: 'https://www.toronto.ca/city-government/council/council-committee-meetings/mayoral-decisions/',
    external: true,
  },
};

export default function CivicGuidePage({ type, jurisdiction = { id: 'toronto', name: 'Toronto' } }) {
  const content = GUIDE_CONTENT[type];
  const isCouncilGuide = type === 'council';
  const isInvolvementGuide = type === 'involvement';
  const isDeputeGuide = type === 'depute';
  const steps = type === 'council' || type === 'voting' ? content.steps[jurisdiction.name] : content.steps;
  const citySteps = (isInvolvementGuide || isDeputeGuide) ? content.steps[jurisdiction.name] : steps;
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
  const reportUrl = `/contact?subject=${encodeURIComponent('Report an issue')}&about=other&page=${encodeURIComponent(window.location.href)}`;

  return (
    <PageColumn className="space-y-8 pb-20">
      <PageMeta title={`${content.title} | Motions ${jurisdiction.name}`} description={content.description(jurisdiction.name)} />

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <h1 className="min-w-0 flex-1 text-3xl font-bold tracking-tight text-slate-900">{content.title}</h1>
          <div className="flex shrink-0 items-center gap-2">
            <a href={reportUrl} className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-[#004a99]/40 hover:text-[#004a99]">Report</a>
            <ShareButton title={`${content.title} | Motions ${jurisdiction.name}`} />
          </div>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-500">{content.intro(jurisdiction.name)}</p>
        {content.context?.[jurisdiction.name] && <p className="max-w-2xl text-sm leading-relaxed text-slate-500">{content.context[jurisdiction.name]}</p>}
        <p className="text-xs text-slate-400">Last updated: {content.lastUpdated}</p>
      </div>

      <div className="space-y-3">
        <CivicSectionLabel>{isCouncilGuide ? 'THE PATH OF A DECISION' : isInvolvementGuide ? 'WAYS TO TAKE PART' : isDeputeGuide ? 'HOW TO REGISTER' : 'FROM AGENDA TO DECISION'}</CivicSectionLabel>
        {citySteps.length === 0 ? (
          <CivicCard className="gap-2">
            <h2 className="font-semibold text-slate-900">Coming soon</h2>
            <p className="text-sm leading-relaxed text-slate-500">We’re preparing a city-specific guide to ways Toronto residents can take part in local decisions.</p>
          </CivicCard>
        ) : citySteps.map(([number, title, body, resourceLabel, resourceHref]) => (
          <CivicCard key={number} className="flex-row gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#004a99]">{number}</span>
            <div className="space-y-1">
              <h2 className="font-semibold text-slate-900">{title}</h2>
              <p className="text-sm leading-relaxed text-slate-500">{body}</p>
              {resourceHref && (
                <a href={resourceHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#004a99] hover:underline">
                  {resourceLabel} <ArrowRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </CivicCard>
        ))}
      </div>

      {resources.length > 0 && !content.resourcesInline && (
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

      {content.registerCategories && (
        <div className="space-y-3">
          <CivicSectionLabel>HOW TO READ THE REGISTER</CivicSectionLabel>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-500">{content.registerIntro}</p>
          <a href={content.actionPath} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#004a99] hover:underline">
            Open the register <ArrowRight className="h-4 w-4" />
          </a>
          <div className="grid gap-3 sm:grid-cols-2">
            {content.registerCategories.map(([title, description]) => (
              <CivicCard key={title} className="gap-1.5">
                <h2 className="font-semibold text-slate-900">{title}</h2>
                <p className="text-sm leading-relaxed text-slate-500">{description}</p>
              </CivicCard>
            ))}
          </div>
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
