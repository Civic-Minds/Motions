import React from 'react';
import { ExternalLink, Database, Building2, Map } from 'lucide-react';
import { CivicCard, CivicSectionLabel } from './ui/CivicCard';
import { PageMeta } from './PageMeta';
import PageColumn from './PageColumn';

const SOURCES = [
  {
    city: 'Toronto',
    category: 'Open Data',
    icon: Database,
    description: 'City Council member voting records used for Toronto motions and vote histories.',
    href: 'https://open.toronto.ca/dataset/members-of-toronto-city-council-voting-record/',
    label: 'Toronto Open Data',
  },
  {
    city: 'Vancouver',
    category: 'Open Data',
    icon: Database,
    description: 'Official council voting records used for Vancouver motions and councillor histories.',
    href: 'https://opendata.vancouver.ca/explore/dataset/council-voting-records/',
    label: 'Vancouver Open Data',
  },
  {
    city: 'Toronto',
    category: 'Council Pages',
    icon: Building2,
    description: 'Official city council and committee pages provide meeting details, agenda context, and source documents.',
    href: 'https://www.toronto.ca/city-government/council/',
    label: 'Toronto council pages',
  },
  {
    city: 'Vancouver',
    category: 'Council Pages',
    icon: Building2,
    description: 'Official city council and committee pages provide meeting details, agenda context, and source documents.',
    href: 'https://vancouver.ca/your-government/city-council-meetings-and-decisions.aspx',
    label: 'Vancouver council pages',
  },
  {
    city: 'Yellowknife',
    category: 'Council Pages',
    icon: Building2,
    description: 'Official meeting agendas, minutes, and recordings from Yellowknife City Council and committees.',
    href: 'https://www.yellowknife.ca/council-meetings-and-agendas/council-calendar-and-livestream',
    label: 'Yellowknife council calendar',
  },
  {
    city: 'Winnipeg',
    category: 'Open Data',
    icon: Database,
    description: 'Official council voting records used for Winnipeg motions and councillor histories.',
    href: 'https://data.winnipeg.ca/Council-Services/Council-Voting-Data/f9mn-vti8',
    label: 'Winnipeg Open Data',
  },
  {
    city: 'Winnipeg',
    category: 'Council Pages',
    icon: Building2,
    description: 'Official meeting agendas, minutes, and decisions on the Decision Making Information System (DMIS).',
    href: 'https://dmis.winnipeg.ca/',
    label: 'Winnipeg council pages',
  },
  {
    city: 'Maps',
    category: 'Maps',
    icon: Map,
    description: 'OpenStreetMap tiles and address geocoding provide geographic context when a location can be identified reliably.',
    href: 'https://www.openstreetmap.org/copyright',
    label: 'OpenStreetMap attribution',
  },
];

export default function SourcesPage({ jurisdiction = { id: 'toronto', name: 'Toronto' } }) {
  const filteredSources = SOURCES.filter(source => source.city === jurisdiction.name || source.city === 'Maps');
  return (
    <PageColumn className="space-y-7 pb-20">
      <PageMeta
        title={`Sources | Motions ${jurisdiction.name}`}
        description={`Official open data and civic sources used by Motions for ${jurisdiction.name} council records.`}
      />
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Sources</h1>
        <p className="text-slate-500 mt-2 max-w-2xl">Motions is an independent presentation of public council records. These are the official datasets and public sources behind the site.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredSources.map(source => (
          <CivicCard key={`${source.city}-${source.label}`} className="gap-3">
            <source.icon className="w-5 h-5 text-[#004a99]" />
            <CivicSectionLabel>{source.category}</CivicSectionLabel>
            <p className="text-sm leading-relaxed text-slate-500">{source.description}</p>
            <a href={source.href} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#004a99]">{source.label} <ExternalLink className="w-3.5 h-3.5" /></a>
          </CivicCard>
        ))}
      </div>
    </PageColumn>
  );
}
