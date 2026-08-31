import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Building2, Users } from 'lucide-react';
import { CivicCard, CivicSectionLabel } from './ui/CivicCard';
import { PageMeta } from './PageMeta';
import PageColumn from './PageColumn';

const PAGES = {
  council: {
    title: 'Toronto City Council Voting Records | Motions',
    description: 'Search Toronto City Council voting records, see how councillors voted, and read plain-language explanations of city decisions.',
    label: 'TORONTO CITY COUNCIL',
    heading: 'Toronto City Council voting records',
    intro: 'Motions makes Toronto City Council decisions easier to follow. Search the public record, open any motion, and see the recorded vote and what the decision means.',
    links: [['/', 'Browse council motions'], ['/meetings', 'Browse council meetings'], ['/councillors', 'Compare councillors']],
  },
  wards: {
    title: 'Toronto Ward Voting Records | Motions',
    description: 'Explore Toronto council motions by ward and see decisions connected to your neighbourhood.',
    label: 'TORONTO WARDS',
    heading: 'Toronto ward voting records',
    intro: 'Find council decisions connected to Toronto neighbourhoods. Choose a ward to explore local motions, mapped locations, and the councillor representing it.',
    links: [['/wards', 'Explore all Toronto wards'], ['/councillors', 'View councillor records'], ['/meetings', 'Browse council meetings']],
  },
  councillors: {
    title: 'Toronto Councillor Voting Records | Motions',
    description: 'Compare Toronto councillors’ recorded votes, attendance, and alignment across city council motions.',
    label: 'TORONTO COUNCILLORS',
    heading: 'Toronto councillor voting records',
    intro: 'See how Toronto councillors voted on the same public motions. Compare voting records, attendance, and areas where councillors agreed or differed.',
    links: [['/councillors', 'Browse Toronto councillors'], ['/council-voting-records', 'Search all council votes'], ['/wards', 'Explore Toronto wards']],
  },
};

export default function TorontoSeoPage({ type, motions = [] }) {
  const page = PAGES[type];
  const notable = useMemo(() => motions
    .filter(motion => !motion.parentId && motion.significance >= 60)
    .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0) || b.date?.localeCompare(a.date))
    .slice(0, 3), [motions]);

  return (
    <PageColumn className="space-y-8 pb-20">
      <PageMeta title={page.title} description={page.description} />
      <div className="space-y-3">
        <CivicSectionLabel>{page.label}</CivicSectionLabel>
        <h1 className="text-3xl font-bold text-slate-900">{page.heading}</h1>
        <p className="max-w-2xl text-slate-500 leading-relaxed">{page.intro}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={BarChart3} value={motions.length.toLocaleString()} label="recorded motions" />
        <Stat icon={Users} value="25" label="city wards" />
        <Stat icon={Building2} value="1997–present" label="modern council record" />
      </div>

      <CivicCard>
        <CivicSectionLabel>EXPLORE MOTIONS</CivicSectionLabel>
        <div className="grid gap-2 mt-2 sm:grid-cols-3">
          {page.links.map(([href, label]) => (
            <Link key={href} to={href} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-3 text-sm font-semibold text-[#004a99] hover:bg-blue-50">
              {label}<ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          ))}
        </div>
      </CivicCard>

      {notable.length > 0 && (
        <section className="space-y-3">
          <CivicSectionLabel>RECENT NOTABLE DECISIONS</CivicSectionLabel>
          <div className="grid gap-3">
            {notable.map(motion => (
              <Link key={motion.id} to={`/motions/${motion.id}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 hover:border-[#004a99]/40">
                <p className="font-semibold text-slate-800">{motion.title}</p>
                <p className="mt-1 text-xs text-slate-500">{motion.date} · {motion.committee || 'Toronto City Council'}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </PageColumn>
  );
}

function Stat({ icon: Icon, value, label }) {
  return <CivicCard className="gap-1"><Icon className="h-4 w-4 text-[#004a99]" /><p className="text-lg font-bold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></CivicCard>;
}
