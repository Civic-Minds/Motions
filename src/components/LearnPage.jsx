import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageMeta } from './PageMeta';
import { CivicCard } from './ui/CivicCard';
import PageColumn from './PageColumn';

const GUIDES = [
  {
    path: '/learn/how-council-works',
    title: 'How City Council Works',
    description: city => `Follow a local issue from proposal to public decision in ${city}.`,
  },
  {
    path: '/learn/how-a-council-vote-works',
    title: 'How a Council Vote Works',
    description: city => `Learn how to follow ${city}’s council votes and what to do next.`,
  },
  {
    path: '/learn/how-voting-works',
    title: 'How Voting Works',
    description: city => `Practical voting information for ${city}’s municipal election.`,
  },
  {
    path: '/learn/how-to-get-involved',
    title: 'How to Get Involved',
    description: city => `Find consultations, public notices, hearings, and ways to share your views in ${city}.`,
  },
];

export default function LearnPage({ jurisdiction = { name: 'Toronto' } }) {
  return (
    <PageColumn className="space-y-8 pb-20">
      <PageMeta
        title={`Learn | Motions ${jurisdiction.name}`}
        description={`Plain-language guides to how ${jurisdiction.name} City Council works and how residents can participate.`}
      />
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Learn</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-slate-500">
          Short, practical guides to help you understand your city council and take part in local decisions.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[...GUIDES, ...(jurisdiction.id === 'toronto' ? [{
          path: '/learn/how-strong-mayor-powers-work',
          title: 'How Toronto’s Strong Mayor Powers Work',
          description: () => 'Understand what the Mayor can do, what still requires Council, and where to follow the record.',
        }] : [])].map(guide => guide.comingSoon?.(jurisdiction.name) ? (
          <CivicCard key={guide.path} className="h-full gap-3">
            <h2 className="text-lg font-semibold text-slate-900">{guide.title}</h2>
            <p className="text-sm leading-relaxed text-slate-500">{guide.description(jurisdiction.name)}</p>
            <span className="mt-auto text-sm font-semibold text-slate-400">Coming soon</span>
          </CivicCard>
        ) : (
          <Link key={guide.path} to={guide.path}>
            <CivicCard className="h-full gap-3 transition-colors hover:border-[#004a99]/40">
              <h2 className="text-lg font-semibold text-slate-900">{guide.title}</h2>
              <p className="text-sm leading-relaxed text-slate-500">{guide.description(jurisdiction.name)}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#004a99]">
                Read guide <ArrowRight className="h-4 w-4" />
              </span>
            </CivicCard>
          </Link>
        ))}
      </div>
    </PageColumn>
  );
}
