import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle2, ExternalLink, MapPin, ShieldCheck } from 'lucide-react';
import { CivicCard, CivicSectionLabel } from './ui/CivicCard';
import { PageMeta } from './PageMeta';

const officialLink = 'text-[#004a99] underline underline-offset-2 hover:text-[#003875]';

function GuideCard({ icon: Icon, title, children }) {
  return (
    <CivicCard className="gap-3">
      <Icon className="h-5 w-5 text-[#004a99]" />
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="text-sm leading-relaxed text-slate-500">{children}</div>
    </CivicCard>
  );
}

export default function VotingGuide() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <PageMeta
        title="How to vote | Motions Toronto"
        description="A practical, non-partisan guide to voting in Toronto’s 2026 municipal election."
      />

      <div className="space-y-3">
        <Link to="/election" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to election
        </Link>
        <CivicSectionLabel>NON-PARTISAN GUIDE</CivicSectionLabel>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">How to vote</h1>
        <p className="max-w-2xl text-base text-slate-500 sm:text-lg">
          The basic information you need to vote in Toronto’s 2026 municipal election.
        </p>
      </div>

      <section className="space-y-3">
        <CivicSectionLabel>WHEN AND WHERE</CivicSectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <GuideCard icon={Calendar} title="Voting days">
            <p><strong className="font-semibold text-slate-700">Election day:</strong> October 26, 2026, from 10 a.m. to 8 p.m.</p>
            <p className="mt-2"><strong className="font-semibold text-slate-700">Advance voting:</strong> October 6–11, 2026, from 10 a.m. to 7 p.m.</p>
          </GuideCard>
          <GuideCard icon={MapPin} title="Find your polling place">
            <p>Use MyVote to see where and when you can vote. Check again before you go because voting places may change.</p>
            <a className="mt-3 inline-flex items-center gap-1.5 font-semibold text-[#004a99]" href="https://www.toronto.ca/city-government/elections/voter-information/myvote/" target="_blank" rel="noopener noreferrer">
              Open MyVote <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </GuideCard>
        </div>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>BEFORE YOU GO</CivicSectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <GuideCard icon={CheckCircle2} title="Check your registration">
            <p>Use MyVote to confirm or update your information on the voters’ list. You can also check your voting place and access a digital voter information card.</p>
            <p className="mt-2">You do not need a voter information card to vote.</p>
          </GuideCard>
          <GuideCard icon={ShieldCheck} title="Bring identification">
            <p>Bring one piece of identification showing your name and qualifying Toronto address. Your voter information card is not identification.</p>
            <a className={`mt-3 inline-flex items-center gap-1.5 font-semibold ${officialLink}`} href="https://www.toronto.ca/city-government/elections/voter-information/acceptable-identification/" target="_blank" rel="noopener noreferrer">
              See accepted ID <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </GuideCard>
        </div>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>YOUR RIGHTS</CivicSectionLabel>
        <CivicCard className="gap-3">
          <ul className="space-y-3 text-sm leading-relaxed text-slate-500">
            <li>You can ask an election official for help or bring a friend to assist you.</li>
            <li>If you cannot enter the voting place, you can request curbside voting.</li>
            <li>You are entitled to three hours in which to vote on election day.</li>
            <li>If you experience a barrier, contact Toronto Elections for assistance.</li>
          </ul>
          <p className="border-t border-slate-100 pt-3 text-sm text-slate-500">
            Official accessibility support: <a className={officialLink} href="mailto:accessibleelections@toronto.ca">accessibleelections@toronto.ca</a> or 416-338-1111, press 6. For general help, call 311.
          </p>
        </CivicCard>
      </section>

      <section className="border-t border-slate-200 pt-6 text-sm text-slate-500">
        <p>
          This guide is practical and non-partisan. Confirm current dates, requirements, voting places, and accessibility information with <a className={officialLink} href="https://www.toronto.ca/city-government/elections/" target="_blank" rel="noopener noreferrer">Toronto Elections</a> before voting.
        </p>
      </section>
    </div>
  );
}
