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

export default function CitiesPage() {
  return (
    <PageColumn className="space-y-7 pb-20">
      <PageMeta title="Cities | Motions" description="Browse city council voting records and decisions from Motions." />
      <div>
        <CivicSectionLabel>CITIES</CivicSectionLabel>
        <h1 className="text-3xl font-bold text-slate-900 mt-1">Choose a city</h1>
        <p className="text-slate-500 mt-2">Explore public council decisions and voting records by city.</p>
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
    </PageColumn>
  );
}
