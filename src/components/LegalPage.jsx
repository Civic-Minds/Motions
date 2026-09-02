import React from 'react';
import { PageMeta } from './PageMeta';
import PageColumn from './PageColumn';

const CONTENT = {
  privacy: {
    title: 'Privacy | Motions',
    heading: 'Privacy',
    intro: 'This policy explains what information Motions collects, why we use it, and the choices you have.',
    updated: 'September 2, 2026',
    sections: [
      ['Who runs Motions', 'Motions is run by Civic Minds, an independent civic data project. If Motions collects information from you, Civic Minds is responsible for it.'],
      ['What we collect', 'You do not need an account to use Motions, and you can browse without sending us personal information. Google Analytics, Vercel Web Analytics, and Vercel Speed Insights may receive information about visits, pages, referrers, devices, general location, and page performance. Google Analytics may use cookies or similar identifiers. Vercel describes Web Analytics as anonymized and cookie-free.'],
      ['Information saved in your browser and location access', 'Motions may save your selected city, ward, or followed committees in your browser so it can remember your preferences. We do not send these preferences to Motions. If you choose Find My Ward, your device shares its location with your browser so Motions can identify your ward. We do not store that location.'],
      ['How we use information', 'We use information to run, understand, and improve Motions. We do not sell personal information. Analytics and hosting providers may process technical information for us under their own policies. Browser preferences stay until you clear them in your browser.'],
      ['Service providers and transfers', 'Motions is hosted on Vercel and uses Google Analytics, Vercel Web Analytics, and Vercel Speed Insights. Some pages also load fonts from Google Fonts and map tiles from OpenStreetMap. These services may receive standard technical information needed to provide their services and may process it in Canada, the United States, or another country where they operate. Their own privacy policies explain how they handle that information.'],
      ['Security and public records', 'Civic Minds takes reasonable steps to protect information under its control. The council records shown on Motions come from public city datasets and official council pages; they are not private submissions to Motions.'],
      ['Security incidents', 'If Civic Minds experiences a security incident involving personal information, we will assess it and take any steps required by applicable privacy law.'],
      ['Questions, corrections, and complaints', <>You can ask what personal information we hold about you, ask us to correct it, or make a privacy complaint through the <a href="/contact?subject=Privacy%20request" className="text-[#004a99] hover:underline">privacy contact form</a>.</>],
      ['When you contact us', 'The contact form opens your email app and does not store your message on Motions. Your message and email address are handled by your email provider and Civic Minds’ email service. We keep correspondence only as long as needed to respond and maintain necessary records.'],
      ['External links and updates', 'When you open an official source, map, or other external link, that service’s own privacy policy applies. We may update this policy when Motions or its services change.'],
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
      <p className="text-sm text-slate-500">Questions about Motions? <a href={type === 'privacy' ? '/contact?subject=Privacy%20request' : '/contact'} className="text-[#004a99] hover:underline">Contact us</a>.</p>
    </PageColumn>
  );
}
