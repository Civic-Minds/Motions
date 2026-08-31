import React from 'react';
import { ExternalLink, Map } from 'lucide-react';
import { CivicCard, CivicSectionLabel } from './ui/CivicCard';
import { PageMeta } from './PageMeta';

const SOURCES = [
  {
    city: 'Toronto',
    description: 'City Council member voting records used for Toronto motions and vote histories.',
    href: 'https://open.toronto.ca/dataset/members-of-toronto-city-council-voting-record/',
    label: 'Toronto Open Data',
  },
  {
    city: 'Vancouver',
    description: 'Official council voting records used for Vancouver motions and councillor histories.',
    href: 'https://opendata.vancouver.ca/explore/dataset/council-voting-records/',
    label: 'Vancouver Open Data',
  },
  {
    city: 'Toronto',
    description: 'Official city council and committee pages provide meeting details, agenda context, and source documents.',
    href: 'https://www.toronto.ca/city-government/council/',
    label: 'Toronto council pages',
  },
  {
    city: 'Vancouver',
    description: 'Official city council and committee pages provide meeting details, agenda context, and source documents.',
    href: 'https://vancouver.ca/your-government/council-meetings.aspx',
    label: 'Vancouver council pages',
  },
  {
    city: 'Maps',
    description: 'OpenStreetMap tiles and address geocoding provide geographic context when a location can be identified reliably.',
    href: 'https://www.openstreetmap.org/copyright',
    label: 'OpenStreetMap attribution',
  },
];

export default function SourcesPage() {
  return (
    <div className="mx-auto w-full space-y-7 pb-20 lg:w-[calc(100%_-_444px)]">
      <PageMeta title="Sources | Motions" description="Official open data and civic sources used by Motions for Toronto and Vancouver council records." />
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Sources</h1>
        <p className="text-slate-500 mt-2 max-w-2xl">Motions is an independent presentation of public council records. These are the official datasets and public sources behind the site.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SOURCES.map(source => (
          <CivicCard key={`${source.city}-${source.label}`} className="gap-3">
            <Map className="w-5 h-5 text-[#004a99]" />
            <CivicSectionLabel>{source.city}</CivicSectionLabel>
            <p className="text-sm leading-relaxed text-slate-500">{source.description}</p>
            <a href={source.href} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#004a99]">{source.label} <ExternalLink className="w-3.5 h-3.5" /></a>
          </CivicCard>
        ))}
      </div>
      <p className="text-sm leading-relaxed text-slate-500">Summaries, topics, significance scores, and location tags are Motions’ interpretations. Use the linked official source when you need the authoritative record.</p>
    </div>
  );
}
