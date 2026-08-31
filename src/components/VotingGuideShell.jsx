import React from 'react';
import { PageMeta } from './PageMeta';
import PageColumn from './PageColumn';

export default function VotingGuideShell({ title, description, intro, children }) {
  return (
    <PageColumn className="space-y-8 pb-20">
      <PageMeta title={title} description={description} />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">How Voting Works</h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-500">{intro}</p>
        <p className="text-xs text-slate-400">Last updated: August 31, 2026</p>
      </div>

      {children}
    </PageColumn>
  );
}
