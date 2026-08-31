import React from 'react';
import { ExternalLink, CalendarDays, Vote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../PageMeta';
import { CivicCard, CivicCardFooter, CivicPill, CivicSectionLabel } from '../ui/CivicCard';
import { useAppContext } from '../../contexts/AppContext';
import { isOnOrAfter, formatElectionDateFull } from '../../utils/electionDate';

const OFFICIAL = 'https://vancouver.ca/your-government/2026-election.aspx';
const VOTING_PLACES = 'https://vancouver.ca/election/2026/list-of-all-voting-places.aspx';
const VOTE_BY_MAIL = 'https://vancouver.ca/your-government/2026-vote-by-mail.aspx';
const CANDIDATE_INFO = 'https://vancouver.ca/your-government/run-for-office-in-vancouver.aspx';

const keyDates = [
  ['September 1–11', 'Nomination period'],
  ['September 8', 'Vote-by-mail applications open'],
  ['October 3, 7, 10, 13', 'Advance voting · 8 a.m.–8 p.m.'],
  ['October 17', 'Election day · 8 a.m.–8 p.m.'],
];

const ballot = [
  '1 mayor',
  '10 city councillors',
  '7 Park Board commissioners',
  '9 school trustees',
  '3 Capital Plan questions',
  '2 plebiscite questions',
];

function OfficialLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#004a99] hover:underline">
      {children} <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

function Row({ date, label }) {
  return (
    <div className="flex gap-3 text-sm text-slate-600">
      <span className="min-w-[124px] font-semibold text-slate-900">{date}</span>
      <span>{label}</span>
    </div>
  );
}

function SummaryCard({ pill, pillClass = 'bg-slate-100 text-slate-600', children, footer }) {
  return (
    <CivicCard className="h-[140px] gap-2">
      <CivicPill className={pillClass}>{pill}</CivicPill>
      {children}
      {footer && <CivicCardFooter align="end">{footer}</CivicCardFooter>}
    </CivicCard>
  );
}

const NOMINATION_END = '2026-09-11';
const ADVANCE_VOTING_START = '2026-10-03';

export default function VancouverElection() {
  const { jurisdiction } = useAppContext();
  const electionDate = jurisdiction?.election?.date;
  const electionOver = isOnOrAfter(electionDate);
  const infoPhase = electionOver
    ? 'closed'
    : !isOnOrAfter(NOMINATION_END)
      ? 'nomination'
      : !isOnOrAfter(ADVANCE_VOTING_START)
        ? 'vote-by-mail'
        : 'voting-places';

  return (
    <div className="flex flex-col space-y-4 pb-20">
      <PageMeta
        title="2026 Vancouver Election | Motions"
        description="Vancouver election dates, voting options, ballot information, and council voting records for the 2026 municipal election."
      />

      <section className="grid grid-cols-2 gap-3 items-stretch lg:grid-cols-6">
        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <CivicSectionLabel>My city</CivicSectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard pill="My city" pillClass="bg-slate-100 text-slate-600" footer={<Link to="/councillors" className="text-[9px] font-semibold text-[#004a99]">See council</Link>}>
              <p className="flex-1 text-xs font-semibold leading-snug text-slate-800">Follow Vancouver’s citywide council.</p>
              <span className="text-[9px] text-slate-500">Mayor + 10 councillors</span>
            </SummaryCard>
            <SummaryCard pill="Candidates" pillClass="bg-blue-50 text-[#004a99]" footer={<a href={CANDIDATE_INFO} target="_blank" rel="noopener noreferrer" className="text-[9px] font-semibold text-[#004a99]">Candidate info ↗</a>}>
              <div className="grid grid-cols-2 gap-2 items-end flex-1">
                <div><p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Mayor</p><p className="text-xl font-black text-[#004a99]">1</p></div>
                <div><p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Councillors</p><p className="text-xl font-black text-[#004a99]">10</p></div>
              </div>
            </SummaryCard>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <CivicSectionLabel>Election information</CivicSectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {infoPhase === 'closed' ? (
              <SummaryCard pill="Voting closed" pillClass="bg-slate-100 text-slate-600" footer={<Link to="/councillors" className="text-[9px] font-semibold text-[#004a99]">See council</Link>}>
                <p className="flex-1 text-xs font-semibold leading-snug text-slate-800">Voting closed {formatElectionDateFull(electionDate)}. See who’s on council now.</p>
              </SummaryCard>
            ) : infoPhase === 'nomination' ? (
              <SummaryCard pill="Nomination period" pillClass="bg-blue-50 text-[#004a99]" footer={<a href={CANDIDATE_INFO} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-[9px] font-semibold text-[#004a99]">See who’s running ↗</a>}>
                <p className="flex-1 text-xs font-semibold leading-snug text-slate-800">Candidate nominations are open through September 11.</p>
              </SummaryCard>
            ) : infoPhase === 'vote-by-mail' ? (
              <SummaryCard pill="Vote by mail" pillClass="bg-blue-50 text-[#004a99]" footer={<a href={VOTE_BY_MAIL} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-[9px] font-semibold text-[#004a99]">Apply ↗</a>}>
                <p className="flex-1 text-xs font-semibold leading-snug text-slate-800">Vote-by-mail applications are open.</p>
              </SummaryCard>
            ) : (
              <SummaryCard pill="Where to vote" pillClass="bg-blue-50 text-[#004a99]" footer={<a href={VOTING_PLACES} target="_blank" rel="noopener noreferrer" className="text-[9px] font-semibold text-[#004a99]">Find a place ↗</a>}>
                <p className="flex-1 text-xs font-semibold leading-snug text-slate-800">Vote anywhere in Vancouver.</p>
              </SummaryCard>
            )}
            <SummaryCard pill="How to vote" footer={<Link to="/learn/how-voting-works" className="whitespace-nowrap text-[9px] font-semibold text-[#004a99]">Our guide ↗</Link>}>
              <p className="flex-1 text-xs font-semibold leading-snug text-slate-800">What to bring, how to get help, and your voting rights.</p>
            </SummaryCard>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <CivicSectionLabel>{electionOver ? 'Election result' : 'Voting days'}</CivicSectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {electionOver ? (
              <>
                <SummaryCard pill="Result" pillClass="bg-blue-50 text-[#004a99]" footer={<Link to="/councillors" className="text-[9px] font-semibold text-[#004a99] whitespace-nowrap">See council →</Link>}>
                  <p className="flex-1 text-xs font-semibold leading-snug text-slate-800">Voting closed {formatElectionDateFull(electionDate)}.</p>
                </SummaryCard>
                <SummaryCard pill="What’s next" footer={<Link to="/" className="text-[9px] font-semibold text-[#004a99] whitespace-nowrap">Browse motions →</Link>}>
                  <p className="flex-1 text-xs font-semibold leading-snug text-slate-800">Follow how the new council votes on Motions.</p>
                </SummaryCard>
              </>
            ) : (
              <>
                <SummaryCard pill="Election day" pillClass="bg-blue-50 text-[#004a99]" footer={<a href={OFFICIAL} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-[9px] font-semibold text-[#004a99]">Official details ↗</a>}>
                  <p className="flex-1 text-xs font-semibold leading-snug text-slate-800">October 17, 2026, from 8 a.m. to 8 p.m.</p>
                </SummaryCard>
                <SummaryCard pill="Advance voting" footer={<a href={VOTING_PLACES} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-[9px] font-semibold text-[#004a99]">See locations ↗</a>}>
                  <p className="flex-1 text-xs font-semibold leading-snug text-slate-800">October 3, 7, 10, and 13, from 8 a.m. to 8 p.m.</p>
                </SummaryCard>
              </>
            )}
          </div>
        </div>
      </section>

      <div>
        <CivicSectionLabel>2026 VANCOUVER ELECTION</CivicSectionLabel>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{electionOver ? 'Know how your new council is voting.' : 'Know the council record before you vote.'}</h1>
        <p className="mt-3 max-w-2xl text-slate-500">
          {electionOver
            ? 'Vancouver elects its mayor and councillors citywide. See who’s on council now, then review how they’ve voted.'
            : 'Vancouver elects its mayor and councillors citywide. Use the official dates and voting details below, then review how the current council has voted.'}
        </p>
      </div>

      <CivicCard
        as={Link}
        to="/learn/how-voting-works"
        className="!min-h-[112px] !p-5 bg-blue-50 border-blue-100 hover:border-blue-300"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CivicPill className="bg-blue-100 text-blue-700">Our guide</CivicPill>
            <p className="text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-700">Non-partisan guide to voting</p>
            <p className="text-sm leading-snug text-slate-500">Where to vote, what's on your ballot, and your rights.</p>
          </div>
          <ExternalLink className="h-5 w-5 shrink-0 text-blue-600 transition-colors" />
        </div>
        <CivicCardFooter align="end">
          <span className="text-sm font-semibold text-blue-700">Read the guide ↗</span>
        </CivicCardFooter>
      </CivicCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <CivicCard className="gap-3">
          <CalendarDays className="h-5 w-5 text-[#004a99]" />
          <CivicSectionLabel>KEY DATES</CivicSectionLabel>
          <div className="space-y-3">
            {keyDates.map(([date, label]) => <Row key={label} date={date} label={label} />)}
          </div>
        </CivicCard>

        <CivicCard className="gap-3">
          <Vote className="h-5 w-5 text-[#004a99]" />
          <CivicSectionLabel>WHAT’S ON THE BALLOT</CivicSectionLabel>
          <ul className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            {ballot.map(item => <li key={item}>{item}</li>)}
          </ul>
          <p className="text-sm leading-relaxed text-slate-500">The City says voters will receive one ballot for offices and Capital Plan questions, plus a separate plebiscite ballot.</p>
        </CivicCard>
      </div>

      <CivicCard className="gap-3">
        <CivicSectionLabel>WAYS TO VOTE</CivicSectionLabel>
        <p className="text-sm leading-relaxed text-slate-500">
          Vote in person at any voting place in the city — no assigned location — or request a vote-by-mail package (see Key Dates above for both windows). The full guide above covers what to bring and accessibility support.
        </p>
        <div className="flex flex-wrap gap-4">
          <OfficialLink href={VOTING_PLACES}>Find a voting place</OfficialLink>
          <OfficialLink href={VOTE_BY_MAIL}>Vote by mail details</OfficialLink>
        </div>
      </CivicCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <CivicCard className="gap-3">
          <CivicSectionLabel>WHO CAN VOTE</CivicSectionLabel>
          <h2 className="text-lg font-semibold text-slate-900">Check the basic requirements</h2>
          <ul className="space-y-2 text-sm leading-relaxed text-slate-600">
            <li>Be 18 or older on election day</li>
            <li>Be a Canadian citizen</li>
            <li>Have lived in British Columbia for at least six months before registering</li>
            <li>Live in or own property in Vancouver</li>
          </ul>
          <p className="text-xs leading-relaxed text-slate-500">Confirm eligibility, registration, and identification requirements with the City before voting.</p>
        </CivicCard>

        <CivicCard className="gap-3">
          <CivicSectionLabel>CANDIDATES</CivicSectionLabel>
          <h2 className="text-lg font-semibold text-slate-900">Candidate information is coming</h2>
          <p className="flex-1 text-sm leading-relaxed text-slate-500">The certified candidate list is published after nominations close. Until then, use the City’s candidate and nomination information, and explore the current council’s voting record here.</p>
          <div className="flex flex-wrap gap-4">
            <OfficialLink href={CANDIDATE_INFO}>Candidate information</OfficialLink>
            <Link to="/councillors" className="text-sm font-semibold text-[#004a99] hover:underline">Review council records</Link>
          </div>
        </CivicCard>
      </div>

      <div className="flex flex-wrap gap-3">
        <a href={OFFICIAL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
          Official election site <ExternalLink className="h-4 w-4" />
        </a>
        <Link to="/councillors" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400">Review council records</Link>
      </div>

      <p className="text-xs leading-relaxed text-slate-400">Motions is an independent civic data project and is not affiliated with the City of Vancouver. Official election information takes precedence and may change.</p>
    </div>
  );
}
