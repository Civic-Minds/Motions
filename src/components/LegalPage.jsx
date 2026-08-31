import React from 'react';
import { CivicCard } from './ui/CivicCard';
import { PageMeta } from './PageMeta';

const CONTENT = {
  privacy: {
    title: 'Privacy | Motions',
    heading: 'Privacy',
    intro: 'This policy explains what information Motions collects, how it is used, and the choices available to visitors.',
    sections: [
      ['Information collected', 'Motions does not require an account and does not ask visitors to submit personal information to browse the site. Vercel Web Analytics may process aggregated information about visits, pages, referrers, devices, and broad location. Vercel describes its analytics service as anonymized and cookie-free.'],
      ['Public records and third parties', 'The council records displayed by Motions come from public city datasets and official council pages. When you open an official source, map, GitHub issue form, or other external link, that service’s own privacy policy applies.'],
      ['Changes and questions', 'This policy may be updated when the site or its services change. Questions about privacy can be raised through the project’s GitHub issue tracker.'],
    ],
  },
  terms: {
    title: 'Terms | Motions',
    heading: 'Terms of use',
    intro: 'These terms govern your use of Motions, an independent presentation of public city council records.',
    sections: [
      ['Permitted use', 'You may use Motions for personal, educational, journalistic, and civic research. You may not misuse the site, interfere with its operation, or use it in a way that violates applicable law.'],
      ['Accuracy and authority', 'Motions may contain summaries, classifications, significance scores, or location tags that are incomplete, delayed, or incorrect. Motions is not an official city source and does not provide legal, professional, or government advice. Linked city records and meeting documents are the authoritative sources.'],
      ['Availability and changes', 'We may change, suspend, or discontinue parts of the site and may update its data, interpretations, and these terms as the project develops.'],
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
    </div>
  );
}
