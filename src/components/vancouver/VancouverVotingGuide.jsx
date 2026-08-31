import React from 'react';
import { CheckCircle2, Mail, MapPin, Vote } from 'lucide-react';
import { CivicCard, CivicSectionLabel, GuideCard, OfficialLink } from '../ui/CivicCard';
import VotingGuideShell from '../VotingGuideShell';

const OFFICIAL = 'https://vancouver.ca/your-government/2026-election.aspx';
const VOTERS_GUIDE = 'https://vancouver.ca/your-government/2026-voters-guide.aspx';
const VOTING_PLACES = 'https://vancouver.ca/election/2026/list-of-all-voting-places.aspx';
const VOTE_BY_MAIL = 'https://vancouver.ca/your-government/2026-vote-by-mail.aspx';

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
          <p>Vancouver does not assign you to one voting place. You can vote at any voting place open during advance voting or on election day, whichever is most convenient.</p>
          <OfficialLink href={VOTING_PLACES}>Find a voting place</OfficialLink>
        </GuideCard>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>WHAT’S ON YOUR BALLOT</CivicSectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <GuideCard icon={Vote} title="City offices — vote for more than one">
            <p>Vancouver doesn’t have wards or districts — every seat is voted on citywide. So instead of picking one candidate per race, you select up to:</p>
            <ul className="mt-2 space-y-1">
              <li>1 mayor</li>
              <li>10 city councillors</li>
              <li>7 Park Board commissioners</li>
              <li>9 school trustees</li>
            </ul>
          </GuideCard>
          <GuideCard icon={CheckCircle2} title="Questions on the ballot">
            <p>You may also see Capital Plan questions (about the City’s borrowing plans) and plebiscite questions (separate yes/no votes on specific issues) on your ballot. Check the official voter’s guide for the current details.</p>
            <OfficialLink href={VOTERS_GUIDE}>Read the voter’s guide</OfficialLink>
          </GuideCard>
        </div>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>AT THE VOTING PLACE</CivicSectionLabel>
        <CivicCard className="gap-3">
          <p className="text-sm leading-relaxed text-slate-500">Check in with an election official, who will confirm your information and hand you your ballot. Mark it in private, then cast it. You can ask an official for help, or bring someone to assist you.</p>
        </CivicCard>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>OTHER WAYS TO VOTE</CivicSectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <GuideCard icon={Mail} title="Vote by mail">
            <p>All eligible voters may request a vote-by-mail package. Check the official instructions for the current application window and return deadline.</p>
            <OfficialLink href={VOTE_BY_MAIL}>Vote by mail details</OfficialLink>
          </GuideCard>
          <GuideCard icon={CheckCircle2} title="Plan for accessibility">
            <p>The City provides accessible voting options, assistive ballot-marking devices, language support, and help from election officials.</p>
            <OfficialLink href={VOTERS_GUIDE}>See voter support</OfficialLink>
          </GuideCard>
        </div>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>OFFICIAL ELECTION RESOURCES</CivicSectionLabel>
        <CivicCard className="gap-4">
          <p className="text-sm leading-relaxed text-slate-500">Use the City’s election pages for the latest requirements, dates, voting places, candidate information, and accessibility support.</p>
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <OfficialLink href={OFFICIAL}>Vancouver election</OfficialLink>
            <OfficialLink href={VOTERS_GUIDE}>Voter’s guide</OfficialLink>
            <OfficialLink href={VOTING_PLACES}>All voting places</OfficialLink>
            <OfficialLink href={VOTE_BY_MAIL}>Vote by mail</OfficialLink>
          </div>
        </CivicCard>
      </section>

      <p className="border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-400">Motions is an independent civic data project and is not affiliated with the City of Vancouver. Confirm this election’s dates, requirements, and accessibility information with the City before voting.</p>
    </VotingGuideShell>
  );
}
