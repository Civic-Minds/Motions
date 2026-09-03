import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageMeta } from './PageMeta';
import { CivicCard } from './ui/CivicCard';
import PageColumn from './PageColumn';
import { isOnOrAfter } from '../utils/electionDate';
import ShareButton from './ShareButton';

// CivicGuidePage's content is hand-written per city and only covers
// Toronto/Vancouver so far — mark these coming soon for any other city
// rather than routing to a page that has no content for it.
const hasNoGuideContent = (city, jurisdictionId) => !['toronto', 'vancouver'].includes(jurisdictionId);

const GUIDES = [
  {
    path: '/learn/how-council-works',
    title: 'How City Council Works',
    description: city => `Follow a local issue from proposal to public decision in ${city}.`,
    comingSoon: hasNoGuideContent,
  },
  {
    path: '/learn/how-a-council-vote-works',
    title: 'How a Council Vote Works',
    description: city => `Learn how to follow ${city}’s council votes and what to do next.`,
    comingSoon: hasNoGuideContent,
  },
  {
    path: '/learn/how-voting-works',
    title: 'How Voting Works',
    description: city => `Practical voting information for ${city}’s municipal election.`,
    comingSoon: hasNoGuideContent,
  },
  {
    path: '/learn/how-to-get-involved',
    title: 'How to Get Involved',
    description: city => `Find consultations, public notices, hearings, and ways to share your views in ${city}.`,
    comingSoon: hasNoGuideContent,
  },
  {
    path: '/learn/how-to-depute',
    title: 'How to Depute',
    description: city => `Register to speak to ${city}’s council or committee about an item on the agenda.`,
    comingSoon: hasNoGuideContent,
  },
];

function GuideCard({ guide, jurisdiction }) {
  if (guide.comingSoon?.(jurisdiction.name, jurisdiction.id)) {
    return (
      <CivicCard className="h-full gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{guide.title}</h2>
        <p className="text-sm leading-relaxed text-slate-500">{guide.description(jurisdiction.name)}</p>
        <span className="mt-auto text-sm font-semibold text-slate-400">Coming soon</span>
      </CivicCard>
    );
  }
  return (
    <Link to={guide.path}>
      <CivicCard className="h-full gap-3 transition-colors hover:border-[#004a99]/40">
        <h2 className="text-lg font-semibold text-slate-900">{guide.title}</h2>
        <p className="text-sm leading-relaxed text-slate-500">{guide.description(jurisdiction.name)}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#004a99]">
          Read guide <ArrowRight className="h-4 w-4" />
        </span>
      </CivicCard>
    </Link>
  );
}

export default function LearnPage({ jurisdiction = { name: 'Toronto' } }) {
  const reportUrl = `/contact?subject=${encodeURIComponent('Report an issue')}&about=other&page=${encodeURIComponent(window.location.href)}`;
  const electionUpcoming = jurisdiction?.election?.date ? !isOnOrAfter(jurisdiction.election.date) : false;
  const allGuides = [...GUIDES, ...(jurisdiction.id === 'toronto' ? [{
    path: '/learn/how-strong-mayor-powers-work',
    title: 'How Toronto’s Strong Mayor Powers Work',
    description: () => 'Understand what the Mayor can do, what still requires Council, and where to follow the record.',
  }] : [])];
  const votingGuide = electionUpcoming ? allGuides.find(g => g.path === '/learn/how-voting-works') : null;
  const otherGuides = votingGuide ? allGuides.filter(g => g.path !== votingGuide.path) : allGuides;

  return (
    <PageColumn className="space-y-8 pb-20">
      <PageMeta
        title={`Learn | Motions ${jurisdiction.name}`}
        description={`Plain-language guides to how ${jurisdiction.name} City Council works and how residents can participate.`}
      />
      <div>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Learn</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a href={reportUrl} className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-[#004a99]/40 hover:text-[#004a99]">Report</a>
            <ShareButton title={`Learn | Motions ${jurisdiction.name}`} />
          </div>
        </div>
        <p className="mt-2 max-w-2xl leading-relaxed text-slate-500">
          Short, practical guides to help you understand your city council and take part in local decisions.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {votingGuide && <GuideCard key={votingGuide.path} guide={votingGuide} jurisdiction={jurisdiction} />}
        <div className="grid gap-4 sm:grid-cols-2">
          {otherGuides.map(guide => <GuideCard key={guide.path} guide={guide} jurisdiction={jurisdiction} />)}
        </div>
      </div>
    </PageColumn>
  );
}
