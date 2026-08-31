import React from 'react';
import { CheckCircle2, Mail, MapPin, ShieldCheck, Vote } from 'lucide-react';
import { CivicCard, CivicSectionLabel, GuideCard, OfficialLink } from './ui/CivicCard';
import VotingGuideShell from './VotingGuideShell';

const inlineLink = 'text-[#004a99] underline underline-offset-2 hover:text-[#003875]';

export default function VotingGuide({ jurisdiction }) {
  return (
    <VotingGuideShell
        title="How Voting Works | Motions Toronto"
        description="A practical, non-partisan guide to how voting works in a Toronto municipal election."
        intro="The basic process for voting in a Toronto municipal election — where you go, what you get, and what to expect."
        jurisdiction={jurisdiction}
    >

      <section className="space-y-3">
        <CivicSectionLabel>WHERE YOU VOTE</CivicSectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <GuideCard icon={MapPin} title="Find your voting place">
            <p>You can vote at a voting place during the advance voting period, or on election day. Use MyVote, the City's online tool for finding your voting place — check again close to the date, since voting places can change.</p>
            <OfficialLink href="https://www.toronto.ca/city-government/elections/voter-information/myvote/">Open MyVote</OfficialLink>
          </GuideCard>
          <GuideCard icon={CheckCircle2} title="Check your registration">
            <p>Use MyVote to confirm or update your information on the voters’ list. It also gives you a digital voter information card — a card the City mails you before the election, confirming you're registered.</p>
            <p className="mt-2">You don’t actually need that card with you to vote, though.</p>
          </GuideCard>
        </div>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>WHAT’S ON YOUR BALLOT</CivicSectionLabel>
        <GuideCard icon={Vote} title="Three races, one vote each">
          <ul className="space-y-1">
            <li>Mayor — one citywide race</li>
            <li>City Councillor — for your ward</li>
            <li>School Board Trustee — for your ward</li>
          </ul>
          <p className="mt-2">You mark one candidate in each race.</p>
        </GuideCard>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>AT THE VOTING PLACE</CivicSectionLabel>
        <CivicCard className="gap-3">
          <div className="grid gap-4 text-sm leading-relaxed text-slate-500 sm:grid-cols-3">
            <p><strong className="font-semibold text-slate-700">Check in.</strong> Bring identification. An election official will confirm your information and hand you your ballots.</p>
            <p><strong className="font-semibold text-slate-700">Mark your ballot.</strong> Mark it in private, then place it in the ballot box or feed it into the scanner yourself.</p>
            <p><strong className="font-semibold text-slate-700">Ask for help.</strong> You can ask an election official for help, bring a friend to assist you, or ask for curbside voting (voting from your car) or a transfer to a more accessible voting place.</p>
          </div>
        </CivicCard>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>YOUR RIGHTS AND HELP</CivicSectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <GuideCard icon={ShieldCheck} title="Bring identification">
            <p>Bring one piece of identification showing your name and an address in Toronto. Your voter information card doesn’t count as ID.</p>
            <OfficialLink href="https://www.toronto.ca/city-government/elections/voter-information/identification/">See accepted ID</OfficialLink>
          </GuideCard>
          <GuideCard icon={CheckCircle2} title="Time off to vote">
            <p>Your work schedule must give you three consecutive hours free to vote on election day. That doesn’t mean three extra hours off — for example, if you work 10 a.m.–6 p.m., your employer could let you leave at 5 p.m. to vote until polls close at 8 p.m.</p>
          </GuideCard>
        </div>
        <CivicCard className="gap-3">
          <div className="grid gap-4 text-sm leading-relaxed text-slate-500 sm:grid-cols-2">
            <ul className="space-y-3">
              <li>Voter Assist Terminals — devices that let you mark your ballot independently — are available at all advance voting places and two voting places per ward on election day.</li>
              <li>Translation and interpretation support is available through Toronto Elections and 311.</li>
            </ul>
            <ul className="space-y-3">
              <li>Eligible voters without a permanent address can vote using a shelter, drop-in centre, or MyVote information.</li>
              <li>Eligible voters being held in custody awaiting trial can ask detention-centre staff about proxy or mail-in voting.</li>
            </ul>
          </div>
          <p className="border-t border-slate-100 pt-3 text-sm text-slate-500">
            Accessibility support: <a className={inlineLink} href="mailto:accessibleelections@toronto.ca">accessibleelections@toronto.ca</a> or 416-338-1111, press 6. For general help, call 311.
          </p>
        </CivicCard>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>OTHER WAYS TO VOTE</CivicSectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <GuideCard icon={Mail} title="Vote by mail">
            <p>Eligible voters can request to vote by mail. Use MyVote or contact Toronto Elections for the current application window and deadline.</p>
            <OfficialLink href="https://www.toronto.ca/city-government/elections/voter-information/myvote/">Request vote-by-mail information</OfficialLink>
          </GuideCard>
          <GuideCard icon={CheckCircle2} title="Vote by proxy">
            <p>If you cannot vote on any available day, you can appoint one eligible Toronto voter to vote on your behalf.</p>
            <p className="mt-2">The appointment form must be completed, signed, and certified by the City Clerk. Contact 416-338-1111 or voterregistration@toronto.ca.</p>
          </GuideCard>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-6 text-sm text-slate-500">
        <p>
          This guide is practical and non-partisan. Confirm this election’s dates, requirements, voting places, and accessibility information with <a className={inlineLink} href="https://www.toronto.ca/city-government/elections/" target="_blank" rel="noopener noreferrer">Toronto Elections</a> before voting.
        </p>
      </section>
    </VotingGuideShell>
  );
}
