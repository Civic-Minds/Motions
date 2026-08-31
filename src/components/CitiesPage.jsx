import React, { lazy, Suspense } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { CivicCard, CivicSectionLabel } from './ui/CivicCard';
import { PageMeta } from './PageMeta';
import PageColumn from './PageColumn';

const CitiesMap = lazy(() => import('./CitiesMap'));

const CITIES = [
  { name: 'Toronto', href: '/toronto', description: 'Toronto City Council motions, wards, councillors, and votes.' },
  { name: 'Vancouver', href: '/vancouver', description: 'Vancouver City Council motions, councillors, and votes.' },
];

const WHY = [
  {
    title: 'Know what your city controls',
    description: 'City councils decide on local services, housing, transit, and budgets. Motions tracks exactly those decisions, in plain language.',
  },
  {
    title: 'Turn interest into action',
    description: 'Follow a motion, see how your councillor voted, and find the next step when you want to get involved.',
  },
];

export default function CitiesPage() {
  return (
    <PageColumn className="space-y-10 pb-20">
      <PageMeta
        title="Motions | See every vote. Know every decision."
        description="Motions connects you with your city council — plain-language summaries of what’s up for a vote, how each councillor voted, and what happens next."
      />

      <div className="space-y-3">
        <CivicSectionLabel>MOTIONS</CivicSectionLabel>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">See every vote. Know every decision.</h1>
        <p className="max-w-2xl leading-relaxed text-slate-500">
          Motions connects you with your city council — plain-language summaries of what’s up for a vote, how each councillor voted, and what happens next.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {WHY.map(item => (
          <CivicCard key={item.title} className="gap-2">
            <h2 className="text-base font-semibold text-slate-900">{item.title}</h2>
            <p className="text-sm leading-relaxed text-slate-500">{item.description}</p>
          </CivicCard>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <CivicSectionLabel>CITIES</CivicSectionLabel>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Choose a city</h2>
          <p className="mt-1 text-slate-500">Explore public council decisions and voting records by city.</p>
        </div>

        <Suspense fallback={<div className="h-[360px] w-full rounded-2xl bg-slate-100 animate-pulse sm:h-[420px]" />}>
          <CitiesMap />
        </Suspense>

        <div className="grid gap-3 sm:grid-cols-2">
          {CITIES.map(city => (
            <a key={city.name} href={city.href}>
              <CivicCard className="h-full hover:border-[#004a99]/40">
                <MapPin className="w-5 h-5 text-[#004a99]" />
                <h2 className="text-lg font-semibold text-slate-900">{city.name}</h2>
                <p className="text-sm leading-relaxed text-slate-500">{city.description}</p>
                <span className="mt-auto text-sm font-semibold text-[#004a99]">Explore {city.name} <ArrowRight className="inline w-4 h-4" /></span>
              </CivicCard>
            </a>
          ))}
        </div>
      </div>
    </PageColumn>
  );
}
