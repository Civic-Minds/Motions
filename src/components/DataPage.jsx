import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, RefreshCw, Database } from 'lucide-react';
import { PageMeta } from './PageMeta';
import { CivicCard, CivicSectionLabel } from './ui/CivicCard';

const SOURCE_LINK_CLASS = 'text-[#004a99] underline underline-offset-2 hover:text-[#003875]';

export default function DataPage({ jurisdiction = { id: 'toronto', name: 'Toronto' } }) {
  const isVancouver = jurisdiction.id === 'vancouver';
  const sourceUrl = isVancouver
    ? 'https://opendata.vancouver.ca/explore/dataset/council-voting-records/'
    : 'https://open.toronto.ca/dataset/members-of-toronto-city-council-voting-record/';
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <PageMeta
        title={`Data & methodology | Motions ${jurisdiction.name}`}
        description={`How Motions ${jurisdiction.name} collects, classifies, and presents council data.`}
      />

      <div className="space-y-3">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to motions
        </Link>
        <CivicSectionLabel>ABOUT THE DATA</CivicSectionLabel>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Data & methodology</h1>
        <p className="text-base sm:text-lg text-slate-500 max-w-2xl">
          {isVancouver ? 'Motions turns public Vancouver council records into a clearer way to follow decisions and votes across the city.' : 'Motions turns public Toronto council records into a clearer way to follow decisions, votes, and neighbourhood-level activity.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CivicCard className="gap-3">
          <Database className="w-5 h-5 text-[#004a99]" />
          <h2 className="text-lg font-semibold text-slate-900">Sources</h2>
          <p className="text-sm leading-relaxed text-slate-500">
            Voting records come from <a className={SOURCE_LINK_CLASS} href={sourceUrl} target="_blank" rel="noopener noreferrer">{jurisdiction.name} Open Data</a>. Meeting details and agenda records come from the City of {jurisdiction.name}’s council and committee pages.
          </p>
          <a className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#004a99]" href={sourceUrl} target="_blank" rel="noopener noreferrer">
            {jurisdiction.name} Open Data <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </CivicCard>

        <CivicCard className="gap-3">
          <RefreshCw className="w-5 h-5 text-[#004a99]" />
          <h2 className="text-lg font-semibold text-slate-900">Updates</h2>
          <p className="text-sm leading-relaxed text-slate-500">
            Council data is checked and refreshed regularly as new meeting records become available. Candidate and election information is updated separately as the City publishes changes.
          </p>
        </CivicCard>
      </div>

      <section className="space-y-3">
        <CivicSectionLabel>HOW IT WORKS</CivicSectionLabel>
        <div className="grid gap-4 sm:grid-cols-3">
          <CivicCard className="gap-2">
            <h2 className="font-semibold text-slate-900">Motions</h2>
            <p className="text-sm leading-relaxed text-slate-500">Each item is kept as its own council or committee record, including its vote result and source documents.</p>
          </CivicCard>
          <CivicCard className="gap-2">
            <h2 className="font-semibold text-slate-900">Topics</h2>
            <p className="text-sm leading-relaxed text-slate-500">Topics and significance scores help organize the record and surface decisions that may be more useful to review first.</p>
          </CivicCard>
          <CivicCard className="gap-2">
            <h2 className="font-semibold text-slate-900">Locations</h2>
            <p className="text-sm leading-relaxed text-slate-500">{isVancouver ? 'Specific addresses and named places are mapped when they can be identified reliably. Vancouver councillors are elected at-large, so locations are not assigned to wards.' : 'Specific addresses and named places are mapped when they can be identified reliably. Geographic points are assigned to official Toronto wards.'}</p>
          </CivicCard>
        </div>
      </section>

      <section className="space-y-3">
        <CivicSectionLabel>{isVancouver ? 'GEOGRAPHY' : 'WARD COVERAGE'}</CivicSectionLabel>
        <CivicCard className="gap-2">
          <h2 className="text-lg font-semibold text-slate-900">{isVancouver ? 'Citywide council activity' : 'Citywide and ward-specific activity'}</h2>
          <p className="text-sm leading-relaxed text-slate-500">
            {isVancouver ? 'Vancouver’s mayor and councillors represent the entire city. Motions therefore remain in one shared citywide record.' : 'A motion is shown for a ward when its record identifies that ward or includes a reliably mapped location inside it. Citywide motions remain available in the overall record and are not placed on individual ward maps.'}
          </p>
        </CivicCard>
      </section>

      <section className="border-t border-slate-200 pt-6 space-y-2 text-sm text-slate-500">
        <CivicSectionLabel>DISCLAIMER</CivicSectionLabel>
        <p>
          Motions is an independent civic-information project and is not affiliated with the City of {jurisdiction.name}. Summaries, classifications, significance scores, and location tags are provided as helpful interpretations of public records; consult the linked official documents for the authoritative record.
        </p>
      </section>
    </div>
  );
}
