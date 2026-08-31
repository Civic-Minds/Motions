import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageMeta } from './PageMeta';
import { CivicCard } from './ui/CivicCard';

const GUIDES = [
  {
    path: '/learn/how-council-works',
    title: 'How City Council Works',
    description: city => `Follow a local issue from proposal to public decision in ${city}.`,
  },
  {
    path: '/learn/how-council-voting-works',
    title: 'How Council Voting Works',
    description: city => `Learn how to read ${city}’s recorded votes and what to do next.`,
  },
];

export default function LearnPage({ jurisdiction = { name: 'Toronto' } }) {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
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
        {GUIDES.map(guide => (
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
    </div>
  );
}
