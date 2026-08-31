import React from 'react';
import { PageMeta } from './PageMeta';
import { CivicCard } from './ui/CivicCard';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-7 pb-20">
      <PageMeta
        title="About | Motions"
        description="Why Motions exists and how it helps residents follow and participate in local democracy."
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">About Motions</h1>
        <p className="mt-2 leading-relaxed text-slate-500">
          Motions connects people with their city council so local decisions are easier to understand and participate in.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <CivicCard className="gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Know what your city controls</h2>
          <p className="text-sm leading-relaxed text-slate-500">
            City councils make decisions about local services, streets, housing, development, transit, budgets, and more. Other issues belong to provincial or federal governments, and knowing the difference helps direct questions to the people who can act on them.
          </p>
        </CivicCard>
        <CivicCard className="gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Turn interest into action</h2>
          <p className="text-sm leading-relaxed text-slate-500">
            Follow a motion, see how councillors voted, read the official record, and find the next step when you want to get involved. Understanding a decision is often the first step toward changing it.
          </p>
        </CivicCard>
      </div>

      <section className="border-t border-slate-200 pt-6 text-sm leading-relaxed text-slate-500">
        Motions is an independent, non-partisan civic data project by Civic Minds. We present public records in a more approachable format, while official city sources remain the authoritative record.
      </section>
    </div>
  );
}
