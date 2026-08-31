import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import { CivicCard, CivicSectionLabel } from '../ui/CivicCard';
import { PageMeta } from '../PageMeta';
import { nameToSlug } from '../../utils/slug';

export default function VancouverCouncillorList({ motions = [], councillors = [] }) {
    const names = useMemo(() => councillors.length ? councillors : [...new Set(motions.flatMap(m => Object.keys(m.votes ?? {})))].sort(), [councillors, motions]);
    return <div className="max-w-5xl mx-auto space-y-7 pb-20"><PageMeta title="Vancouver Councillors | Motions" description="Explore Vancouver council members and their voting records." /><div><CivicSectionLabel>VANCOUVER CITY COUNCIL</CivicSectionLabel><h1 className="text-3xl font-bold text-slate-900 mt-1">Councillors</h1><p className="text-slate-500 mt-2">Vancouver councillors are elected at-large. Compare their recorded votes across the city’s public council record.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{names.map(name => <Link key={name} to={`/councillors/${nameToSlug(name)}`}><CivicCard className="min-h-[130px]"><Users className="w-5 h-5 text-[#004a99]" /><h2 className="font-semibold text-slate-900">{name}</h2><p className="text-xs text-slate-500">{motions.filter(m => m.votes?.[name]).length.toLocaleString()} recorded votes</p><span className="mt-auto text-xs font-semibold text-[#004a99]">View record <ArrowRight className="inline w-3.5 h-3.5" /></span></CivicCard></Link>)}</div></div>;
}
