import React from 'react';
import { Link } from 'react-router-dom';
import { CivicCard } from './ui/CivicCard';
import { PageMeta } from './PageMeta';

const CONTENT = {
  privacy: {
    title: 'Privacy | Motions',
    label: 'PRIVACY',
    heading: 'Privacy',
    intro: 'Motions is designed to be useful without accounts, profiles, or user-submitted personal information.',
    sections: [
      ['Analytics', 'Motions uses Vercel Web Analytics to understand aggregate visits, pages, referrers, devices, and broad location information. Vercel describes this service as anonymized and cookie-free.'],
      ['Public records', 'The council records displayed here come from public city datasets and official council pages. Motion summaries, topics, significance scores, and location tags are Motions’ interpretations of those records.'],
      ['External links', 'When you open an official source, map, or other external link, that site’s own privacy policy applies.'],
    ],
  },
  terms: {
    title: 'Terms | Motions',
    label: 'TERMS',
    heading: 'Terms of use',
    intro: 'Motions is an independent civic-information project that makes public council records easier to explore.',
    sections: [
      ['Use of the site', 'You may use Motions for personal, educational, journalistic, and civic research. Please link to the official source when accuracy or legal effect matters.'],
      ['Accuracy and authority', 'Motions may contain summaries, classifications, scores, or location tags that are incomplete or wrong. The linked city records and meeting documents are the authoritative sources.'],
      ['Changes', 'We may update the site, data, interpretations, and these terms as the project changes.'],
    ],
  },
};

export default function LegalPage({ type }) {
  const page = CONTENT[type];
  return (
    <div className="max-w-3xl mx-auto space-y-7 pb-20">
      <PageMeta title={page.title} description={page.intro} />
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{page.heading}</h1>
        <p className="text-slate-500 mt-2 leading-relaxed">{page.intro}</p>
      </div>
      <div className="grid gap-3">
        {page.sections.map(([heading, body]) => (
          <CivicCard key={heading} className="gap-2">
            <h2 className="text-lg font-semibold text-slate-900">{heading}</h2>
            <p className="text-sm leading-relaxed text-slate-500">{body}</p>
          </CivicCard>
        ))}
      </div>
      <p className="text-sm text-slate-500">Questions about the project? <a href="https://github.com/Civic-Minds/Motions/issues" className="text-[#004a99] hover:underline">Open an issue on GitHub</a>.</p>
      <Link to="/" className="text-sm font-semibold text-[#004a99] hover:underline">Back to Motions</Link>
    </div>
  );
}
