import React from 'react';
import { CheckCircle2, Mail, MapPin, Vote } from 'lucide-react';
import { CivicCard, CivicMiniTile, CivicSectionLabel, GuideCard, OfficialLink } from '../ui/CivicCard';
import VotingGuideShell from '../VotingGuideShell';

const OFFICIAL = 'https://vancouver.ca/your-government/2026-election.aspx';
const VOTERS_GUIDE = 'https://vancouver.ca/your-government/2026-voters-guide.aspx';
const VOTING_PLACES = 'https://vancouver.ca/election/2026/list-of-all-voting-places.aspx';
const VOTE_BY_MAIL = 'https://vancouver.ca/your-government/2026-vote-by-mail.aspx';

const OFFICES = [
  ['Mayor', 'Elect 1'],
  ['City Councillors', 'Elect 10'],
  ['Park Board', 'Elect 7'],
  ['School Trustees', 'Elect 9'],
];

export default function VancouverVotingGuide({ jurisdiction }) {
  return (
    <VotingGuideShell
        title="How Voting Works | Motions Vancouver"
        description="A practical, non-partisan guide to how voting works in a Vancouver municipal election."
        intro="The basic process for voting in a Vancouver municipal election — where you go, what you get, and what to expect."
        jurisdiction={jurisdiction}
    >

      <section className="space-y-3">
        <CivicSectionLabel>WHERE YOU VOTE</CivicSectionLabel>
        <GuideCard icon={MapPin} title="Choose a voting place">
          <p>Vancouver doesn’t assign you a voting place — vote at any location open during advance voting or on election day, whichever works best.</p>
          <OfficialLink href={VOTING_PLACES}>Find a voting place</OfficialLink>
        </GuideCard>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>WHAT’S ON YOUR BALLOT</CivicSectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <GuideCard icon={Vote} title="City offices — vote for more than one">
            <p>Vancouver doesn’t have wards — every seat is voted on citywide, so you select up to:</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {OFFICES.map(([title, caption]) => <CivicMiniTile key={title} title={title} caption={caption} />)}
            </div>
          </GuideCard>
          <GuideCard icon={CheckCircle2} title="Questions on the ballot">
            <p>This year’s ballot also has 5 questions: 3 Capital Plan questions on about $790 million in City borrowing for 2027–2030, and 2 plebiscite questions on public safety.</p>
            <OfficialLink href={VOTERS_GUIDE}>Read the voter’s guide</OfficialLink>
          </GuideCard>
        </div>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>AT THE VOTING PLACE</CivicSectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <CivicCard className="gap-3">
            <p className="text-sm leading-relaxed text-slate-500">An election official checks you in and hands you your ballot. Mark it in private, then cast it. You can ask an official for help or bring someone to assist you.</p>
          </CivicCard>
          <GuideCard icon={CheckCircle2} title="Accessibility support">
            <p>The City offers accessible voting options, assistive ballot-marking devices, language support, and help from election officials.</p>
            <OfficialLink href={VOTERS_GUIDE}>See voter support</OfficialLink>
          </GuideCard>
        </div>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>OTHER WAYS TO VOTE</CivicSectionLabel>
        <GuideCard icon={Mail} title="Vote by mail">
          <p>Any eligible voter can request a vote-by-mail package. Check the official page for this year’s deadlines.</p>
          <OfficialLink href={VOTE_BY_MAIL}>Vote by mail details</OfficialLink>
        </GuideCard>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>OFFICIAL ELECTION RESOURCES</CivicSectionLabel>
        <CivicCard className="gap-4">
          <p className="text-sm leading-relaxed text-slate-500">Use the City’s election pages for the latest dates, requirements, voting places, and accessibility support.</p>
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <OfficialLink href={OFFICIAL}>Vancouver election</OfficialLink>
            <OfficialLink href={VOTERS_GUIDE}>Voter’s guide</OfficialLink>
            <OfficialLink href={VOTING_PLACES}>All voting places</OfficialLink>
            <OfficialLink href={VOTE_BY_MAIL}>Vote by mail</OfficialLink>
          </div>
        </CivicCard>
      </section>

      <p className="border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-400">Motions is an independent civic data project, not affiliated with the City of Vancouver. Confirm dates, requirements, and accessibility details with the City before voting.</p>
    </VotingGuideShell>
  );
}
