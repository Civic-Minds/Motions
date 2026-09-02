import React from 'react';
import { PageMeta } from './PageMeta';
import PageColumn from './PageColumn';

const CONTENT = {
  privacy: {
    title: 'Privacy | Motions',
    heading: 'Privacy',
    intro: 'This policy explains what information Motions collects, how it is used, and the choices available to visitors.',
    updated: 'August 31, 2026',
    sections: [
      ['Responsible organization', 'Motions is operated by Civic Minds, an independent civic data project. Civic Minds is responsible for the personal information, if any, that it collects or controls through Motions.'],
      ['Information collected', 'Motions does not require an account and does not ask visitors to submit personal information to browse the site. Google Analytics and Vercel Web Analytics may process information about visits, pages, referrers, devices, and broad location. Google Analytics may use cookies or similar identifiers; Vercel describes its analytics service as anonymized and cookie-free.'],
      ['Local storage and location access', 'Motions may store your selected city, ward (in cities with wards), or followed committees in your browser so the site can remember your preferences. These values are not submitted to Motions. Where a Find My Ward feature is available, it requests your device location only after you choose that feature; the location is used in your browser to identify a ward and is not stored by Motions.'],
      ['Use, disclosure, and retention', 'Information is used only to operate, understand, and improve the site. Motions does not sell personal information. Analytics and hosting providers may process technical information on Civic Minds’ behalf under their own terms and policies. Browser preferences remain until you clear them or remove them through the site.'],
      ['Service providers and transfers', 'Motions is hosted on Vercel and uses Google Analytics and Vercel Web Analytics. Issues and reports are handled through GitHub. These providers may process technical information in Canada, the United States, or another jurisdiction where they operate. Their own privacy policies govern their handling of information.'],
      ['Safeguards and public records', 'Civic Minds takes reasonable measures to protect information under its control. The council records displayed by Motions come from public city datasets and official council pages and are not treated as private submissions.'],
      ['Security incidents', 'If Civic Minds experiences a security incident involving personal information, it will assess the incident and take the notification or other steps required by applicable privacy law.'],
      ['Access, correction, and complaints', 'If you believe Civic Minds holds personal information about you, or if you have a privacy complaint, contact Civic Minds at privacy@civicminds.example. Do not include sensitive personal information in a public GitHub issue. This is a temporary placeholder and will be replaced with the final privacy address before the policy is treated as final.'],
      ['External links and changes', 'When you open an official source, map, GitHub issue form, or other external link, that service’s own privacy policy applies. This policy may be updated when the site or its services change.'],
    ],
  },
  terms: {
    title: 'Terms | Motions',
    heading: 'Terms of use',
    intro: 'These terms govern your use of Motions, an independent presentation of public city council records.',
    updated: 'August 31, 2026',
    sections: [
      ['Permitted use', 'You may use Motions for personal, educational, journalistic, and civic research. You may not misuse the site, interfere with its operation, or use it in a way that violates applicable law.'],
      ['Accuracy and authority', 'Motions may contain summaries, classifications, significance scores, or location tags that are incomplete, delayed, or incorrect. Motions is not an official city source and does not provide legal, professional, or government advice. Linked city records and meeting documents are the authoritative sources.'],
      ['Public participation', 'Motions is provided for information and civic research. It does not submit comments, votes, applications, complaints, or other communications to a city on your behalf. Verify deadlines, procedures, and legal requirements with the relevant official source.'],
      ['External services and content', 'Motions links to city websites, open-data platforms, maps, GitHub, and other third-party services. Civic Minds does not control those services and is not responsible for their content, availability, or privacy practices.'],
      ['Intellectual property', 'The public records and official materials linked through Motions remain subject to their original sources and applicable rights. The Motions software, presentation, and original written material may not be copied, redistributed, or used to mislead others about their source.'],
      ['Availability and changes', 'We may change, suspend, or discontinue parts of the site and may update its data, interpretations, and these terms as the project develops.'],
      ['No warranty', 'Motions is provided on an “as available” basis. To the extent permitted by law, Civic Minds makes no warranty that the site or its information will be complete, current, uninterrupted, or error-free.'],
    ],
  },
};

export default function LegalPage({ type }) {
  const page = CONTENT[type];
  return (
    <PageColumn className="space-y-7 pb-20">
      <PageMeta title={page.title} description={page.intro} />
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{page.heading}</h1>
        <p className="text-slate-500 mt-2 leading-relaxed">{page.intro}</p>
        <p className="mt-2 text-xs text-slate-400">Last updated: {page.updated}</p>
      </div>
      <div className="divide-y divide-slate-200 border-y border-slate-200">
        {page.sections.map(([heading, body]) => (
          <section key={heading} className="space-y-1.5 py-5">
            <h2 className="text-lg font-semibold text-slate-900">{heading}</h2>
            <p className="text-sm leading-relaxed text-slate-500">{body}</p>
          </section>
        ))}
      </div>
      <p className="text-sm text-slate-500">Questions about the project? <a href="https://github.com/Civic-Minds/Motions/issues" className="text-[#004a99] hover:underline">Open an issue on GitHub</a>.</p>
    </PageColumn>
  );
}
