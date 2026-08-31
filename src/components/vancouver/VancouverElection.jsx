import React from 'react';
import { ExternalLink, CalendarDays, Vote, MapPin, Mail, Accessibility } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../PageMeta';
import { CivicCard, CivicSectionLabel } from '../ui/CivicCard';

const OFFICIAL = 'https://vancouver.ca/your-government/2026-election.aspx';
const VOTERS_GUIDE = 'https://vancouver.ca/your-government/2026-voters-guide.aspx';
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

export default function VancouverElection() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      <PageMeta
        title="2026 Vancouver Election | Motions"
        description="Vancouver election dates, voting options, ballot information, and council voting records for the 2026 municipal election."
      />

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <CivicSectionLabel>2026 VANCOUVER ELECTION</CivicSectionLabel>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-[#004a99]">Election day · Oct 17</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Know the council record before you vote.</h1>
        <p className="mt-3 max-w-2xl text-slate-500">
          Vancouver elects its mayor and councillors citywide. Use the official dates and voting details below, then review how the current council has voted.
        </p>
      </div>

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

      <div className="grid gap-4 sm:grid-cols-3">
        <CivicCard className="gap-3">
          <MapPin className="h-5 w-5 text-[#004a99]" />
          <CivicSectionLabel>VOTE IN PERSON</CivicSectionLabel>
          <h2 className="text-lg font-semibold text-slate-900">Vote anywhere in Vancouver</h2>
          <p className="flex-1 text-sm leading-relaxed text-slate-500">You do not have an assigned voting place. Choose a convenient location: there are 59 advance voting places and 85 election-day places.</p>
          <OfficialLink href={VOTING_PLACES}>Find a voting place</OfficialLink>
        </CivicCard>

        <CivicCard className="gap-3">
          <Mail className="h-5 w-5 text-[#004a99]" />
          <CivicSectionLabel>VOTE BY MAIL</CivicSectionLabel>
          <h2 className="text-lg font-semibold text-slate-900">Request a package</h2>
          <p className="flex-1 text-sm leading-relaxed text-slate-500">All eligible voters may request a vote-by-mail package. Applications open September 8 at 9 a.m.; completed ballots must arrive by October 17 at 8 p.m.</p>
          <OfficialLink href={VOTE_BY_MAIL}>Vote by mail details</OfficialLink>
        </CivicCard>

        <CivicCard className="gap-3">
          <Accessibility className="h-5 w-5 text-[#004a99]" />
          <CivicSectionLabel>VOTING SUPPORT</CivicSectionLabel>
          <h2 className="text-lg font-semibold text-slate-900">Plan for what you need</h2>
          <p className="flex-1 text-sm leading-relaxed text-slate-500">The City provides accessible voting, assistive ballot-marking devices, language support, and help from election officials.</p>
          <OfficialLink href={VOTERS_GUIDE}>Read the voter’s guide</OfficialLink>
        </CivicCard>
      </div>

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
