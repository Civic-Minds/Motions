import React from 'react';
import { CalendarDays, CheckCircle2, ExternalLink, MapPin, Mail, Vote } from 'lucide-react';
import { CivicCard, CivicSectionLabel } from '../ui/CivicCard';
import VotingGuideShell from '../VotingGuideShell';

const OFFICIAL = 'https://vancouver.ca/your-government/2026-election.aspx';
const VOTERS_GUIDE = 'https://vancouver.ca/your-government/2026-voters-guide.aspx';
const VOTING_PLACES = 'https://vancouver.ca/election/2026/list-of-all-voting-places.aspx';
const VOTE_BY_MAIL = 'https://vancouver.ca/your-government/2026-vote-by-mail.aspx';

function OfficialLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#004a99] hover:underline">
      {children} <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

function GuideCard({ icon: Icon, title, children }) {
  return (
    <CivicCard className="gap-3">
      <Icon className="h-5 w-5 text-[#004a99]" />
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="text-sm leading-relaxed text-slate-500">{children}</div>
    </CivicCard>
  );
}

export default function VancouverVotingGuide() {
  return (
    <VotingGuideShell
        title="How to vote | Motions Vancouver"
        description="A practical, non-partisan guide to voting in Vancouver’s 2026 municipal election."
        intro="The basic information you need to vote in Vancouver’s 2026 municipal election."
    >

      <section className="space-y-3">
        <CivicSectionLabel>1 · WHEN AND WHERE TO VOTE</CivicSectionLabel>
        <div className="grid gap-4 sm:grid-cols-3">
          <GuideCard icon={CalendarDays} title="Election day">
            <p>October 17, 2026</p>
            <p className="mt-1">Polls are open from 8 a.m. to 8 p.m.</p>
          </GuideCard>
          <GuideCard icon={CalendarDays} title="Advance voting">
            <p>October 3, 7, 10, and 13, 2026</p>
            <p className="mt-1">Polls are open from 8 a.m. to 8 p.m.</p>
          </GuideCard>
          <GuideCard icon={MapPin} title="Choose a voting place">
            <p>Vancouver does not assign you to one voting place. Choose a convenient location for advance voting or election day.</p>
            <OfficialLink href={VOTING_PLACES}>Find a voting place</OfficialLink>
          </GuideCard>
        </div>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>2 · WHAT YOU’LL VOTE ON</CivicSectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <GuideCard icon={Vote} title="City offices">
            <ul className="space-y-1">
              <li>1 mayor</li>
              <li>10 city councillors</li>
              <li>7 Park Board commissioners</li>
              <li>9 school trustees</li>
            </ul>
          </GuideCard>
          <GuideCard icon={CheckCircle2} title="Questions on the ballot">
            <p>Capital Plan and plebiscite questions may appear alongside the offices on your ballot. Check the official voter’s guide for the current details.</p>
            <OfficialLink href={VOTERS_GUIDE}>Read the voter’s guide</OfficialLink>
          </GuideCard>
        </div>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>3 · OTHER WAYS TO VOTE</CivicSectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <GuideCard icon={Mail} title="Vote by mail">
            <p>All eligible voters may request a vote-by-mail package. Applications open September 8 at 9 a.m.; check the official instructions for the return deadline.</p>
            <OfficialLink href={VOTE_BY_MAIL}>Vote by mail details</OfficialLink>
          </GuideCard>
          <GuideCard icon={CheckCircle2} title="Plan for accessibility">
            <p>The City provides accessible voting options, assistive ballot-marking devices, language support, and help from election officials.</p>
            <OfficialLink href={VOTERS_GUIDE}>See voter support</OfficialLink>
          </GuideCard>
        </div>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>4 · BEFORE YOU GO</CivicSectionLabel>
        <CivicCard className="gap-3">
          <p className="text-sm leading-relaxed text-slate-500">Confirm your eligibility, registration, identification, voting place, and current deadlines with the City before voting. Vancouver’s Mayor and councillors are elected at-large, so you vote for citywide Council candidates rather than a ward councillor.</p>
          <OfficialLink href={OFFICIAL}>Open the official election site</OfficialLink>
        </CivicCard>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>5 · OFFICIAL ELECTION RESOURCES</CivicSectionLabel>
        <CivicCard className="gap-4">
          <p className="text-sm leading-relaxed text-slate-500">Use the City’s election pages for the latest requirements, dates, voting places, candidate information, and accessibility support.</p>
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <OfficialLink href={OFFICIAL}>2026 Vancouver election</OfficialLink>
            <OfficialLink href={VOTERS_GUIDE}>Voter’s guide</OfficialLink>
            <OfficialLink href={VOTING_PLACES}>All voting places</OfficialLink>
            <OfficialLink href={VOTE_BY_MAIL}>Vote by mail</OfficialLink>
          </div>
        </CivicCard>
      </section>

      <p className="border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-400">Motions is an independent civic data project and is not affiliated with the City of Vancouver. Official election information takes precedence and may change.</p>
    </VotingGuideShell>
  );
}
