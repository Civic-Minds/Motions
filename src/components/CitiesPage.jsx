import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { CivicCard } from './ui/CivicCard';
import { PageMeta } from './PageMeta';

const CitiesMap = lazy(() => import('./CitiesMap'));

function DeferredCitiesMap() {
  const mapPlaceholderRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const placeholder = mapPlaceholderRef.current;
    if (!placeholder) return undefined;
    if (!('IntersectionObserver' in window)) {
      const fallbackTimer = window.setTimeout(() => setShouldLoad(true), 0);
      return () => window.clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldLoad(true);
      observer.disconnect();
    });
    // Give the hero and supporting copy a clean first paint before starting
    // the Leaflet/map tile requests, even when the map is already near view.
    const deferTimer = window.setTimeout(() => observer.observe(placeholder), 1200);
    return () => {
      window.clearTimeout(deferTimer);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={mapPlaceholderRef}>
      {shouldLoad ? (
        <Suspense fallback={<div className="h-[460px] w-full rounded-2xl bg-slate-100 animate-pulse sm:h-[560px]" />}>
          <CitiesMap />
        </Suspense>
      ) : (
        <div className="h-[460px] w-full rounded-2xl bg-slate-100 sm:h-[560px]" aria-hidden="true" />
      )}
    </div>
  );
}

const WHY = [
  {
    title: 'Your city, your call',
    description: 'Housing, transit, budgets, streets — council decides them all. Motions shows you exactly what’s on the table before it’s decided.',
  },
  {
    title: 'From watching to acting',
    description: 'See how your councillor voted, then reach out, show up, or spread the word. Knowing is the first step.',
  },
];

export default function CitiesPage() {
  return (
    <div className="space-y-10 pb-20">
      <PageMeta
        title="Motions | See every vote. Know every decision."
        description="Follow what city councils are deciding, see how councillors vote, and understand what local decisions mean for your neighbourhood."
      />

      <div className="max-w-2xl mx-auto space-y-10">
        <div className="space-y-4 pt-2">
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            See every vote.<br /><span className="text-[#004a99]">Know every decision.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-slate-500">
            Council decides what happens on your street, your taxes, your transit — most of it happens where you can’t see. Motions puts the whole voting record in front of you.
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
      </div>

      <DeferredCitiesMap />
    </div>
  );
}
