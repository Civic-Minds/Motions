import React from 'react';
import { Calendar, CheckCircle2, MapPin, ShieldCheck } from 'lucide-react';
import { CivicSectionLabel, GuideCard, OfficialLink } from './ui/CivicCard';
import VotingGuideShell from './VotingGuideShell';

const inlineLink = 'text-[#004a99] underline underline-offset-2 hover:text-[#003875]';

export default function VotingGuide() {
  return (
    <VotingGuideShell
        title="How Voting Works | Motions Toronto"
        description="A practical, non-partisan guide to voting in Toronto’s 2026 municipal election."
        intro="The basic information you need to vote in Toronto’s 2026 municipal election."
    >

      <section className="space-y-3">
        <CivicSectionLabel>WHEN AND WHERE TO VOTE</CivicSectionLabel>
        <div className="grid gap-4 sm:grid-cols-3">
          <GuideCard icon={Calendar} title="Election day">
            <p>October 26, 2026</p>
            <p className="mt-1">Polls are open from 10 a.m. to 8 p.m.</p>
          </GuideCard>
          <GuideCard icon={Calendar} title="Advance voting">
            <p>October 6–11, 2026</p>
            <p className="mt-1">Polls are open from 10 a.m. to 7 p.m.</p>
          </GuideCard>
          <GuideCard icon={MapPin} title="Find your polling place">
            <p>Use MyVote to see where and when you can vote. Check again before you go because voting places may change.</p>
            <OfficialLink href="https://www.toronto.ca/city-government/elections/voter-information/myvote/">Open MyVote</OfficialLink>
          </GuideCard>
        </div>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>BEFORE YOU GO</CivicSectionLabel>
        <div className="grid gap-4 sm:grid-cols-3">
          <GuideCard icon={CheckCircle2} title="Check your registration">
            <p>Use MyVote to confirm or update your information on the voters’ list. You can also check your voting place and access a digital voter information card.</p>
            <p className="mt-2">You do not need a voter information card to vote.</p>
          </GuideCard>
          <GuideCard icon={ShieldCheck} title="Bring identification">
            <p>Bring one piece of identification showing your name and qualifying Toronto address. Your voter information card is not identification.</p>
            <OfficialLink href="https://www.toronto.ca/city-government/elections/voter-information/identification/">See accepted ID</OfficialLink>
          </GuideCard>
          <GuideCard icon={MapPin} title="Plan for accessibility">
            <p>If you experience a barrier, contact Toronto Elections for assistance. You can also ask an election official for help.</p>
            <p className="mt-2">General help: 311.</p>
          </GuideCard>
        </div>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>OTHER WAYS TO VOTE</CivicSectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <GuideCard icon={Calendar} title="Vote by mail">
            <p>Request to vote by mail starting September 1. Use MyVote or contact Toronto Elections for the current deadline and instructions.</p>
            <OfficialLink href="https://www.toronto.ca/city-government/elections/voter-information/myvote/">Request vote-by-mail information</OfficialLink>
          </GuideCard>
          <GuideCard icon={CheckCircle2} title="Vote by proxy">
            <p>If you cannot vote on any available day, you can appoint one eligible Toronto voter to vote on your behalf.</p>
            <p className="mt-2">The appointment form must be completed, signed, and certified by the City Clerk. Contact 416-338-1111 or voterregistration@toronto.ca.</p>
          </GuideCard>
        </div>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>AT THE VOTING PLACE</CivicSectionLabel>
        <CivicCard className="gap-3">
          <div className="grid gap-4 text-sm leading-relaxed text-slate-500 sm:grid-cols-3">
            <p><strong className="font-semibold text-slate-700">Check in.</strong> Election officials will confirm your information and explain what you need to do.</p>
            <p><strong className="font-semibold text-slate-700">Ask for help.</strong> You can ask an election official for help or bring a friend to assist you.</p>
            <p><strong className="font-semibold text-slate-700">Request an accommodation.</strong> You can request curbside voting or a ballot transfer if you anticipate a barrier.</p>
          </div>
        </CivicCard>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>YOUR RIGHTS AND HELP</CivicSectionLabel>
        <CivicCard className="gap-3">
          <div className="grid gap-4 text-sm leading-relaxed text-slate-500 sm:grid-cols-2">
            <ul className="space-y-3">
              <li>Your work schedule must give you three consecutive hours free to vote on election day. This does not mean three extra hours off work—for example, if you work 10 a.m.–6 p.m., your employer could let you leave at 5 p.m. to vote until 8 p.m.</li>
              <li>If you experience a barrier, contact Toronto Elections for assistance.</li>
              <li>Voter Assist Terminals are available at all advance voting places and two voting places per ward on election day.</li>
            </ul>
            <ul className="space-y-3">
              <li>Translation and interpretation support is available through Toronto Elections and 311.</li>
              <li>Eligible voters without a permanent address can vote using a shelter, drop-in centre, or MyVote information.</li>
              <li>Eligible voters on remand can ask detention-centre staff about proxy or mail-in voting.</li>
            </ul>
          </div>
          <p className="border-t border-slate-100 pt-3 text-sm text-slate-500">
            Accessibility support: <a className={inlineLink} href="mailto:accessibleelections@toronto.ca">accessibleelections@toronto.ca</a> or 416-338-1111, press 6. For general help, call 311.
          </p>
        </CivicCard>
      </section>

      <section className="border-t border-slate-200 pt-6 text-sm text-slate-500">
        <p>
          This guide is practical and non-partisan. Confirm current dates, requirements, voting places, and accessibility information with <a className={inlineLink} href="https://www.toronto.ca/city-government/elections/" target="_blank" rel="noopener noreferrer">Toronto Elections</a> before voting.
        </p>
      </section>
    </VotingGuideShell>
  );
}
