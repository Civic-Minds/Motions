import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import MotionCardItem from '../MotionCardItem';
import { PageMeta } from '../PageMeta';
import { CivicCard, CivicSectionLabel } from '../ui/CivicCard';
import { slugToName } from '../../utils/slug';

export default function VancouverCouncillorProfile({ motions = [], councillors = [] }) {
    const { slug } = useParams();
    const names = councillors.length ? councillors : [...new Set(motions.flatMap(m => Object.keys(m.votes ?? {})))];
    const name = slugToName(slug, names);
    const votes = useMemo(() => motions.filter(m => m.votes?.[name]), [motions, name]);
    const yes = votes.filter(m => m.votes[name] === 'YES').length;
    const no = votes.filter(m => m.votes[name] === 'NO').length;
    if (!name) return <div className="py-20 text-center text-slate-500 text-sm">Councillor not found.</div>;
    return <div className="max-w-5xl mx-auto space-y-7 pb-20"><PageMeta title={`${name} | Motions Vancouver`} description={`Recorded voting history for Vancouver Councillor ${name}.`} /><Link to="/councillors" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft className="w-4 h-4" /> Back to councillors</Link><div><CivicSectionLabel>VANCOUVER CITY COUNCIL</CivicSectionLabel><h1 className="text-3xl font-bold text-slate-900 mt-1">{name}</h1><p className="text-slate-500 mt-2">At-large council member voting record.</p></div><div className="grid gap-3 grid-cols-3"><Stat label="Recorded votes" value={votes.length} /><Stat label="In favour" value={yes} /><Stat label="In opposition" value={no} /></div><CivicCard><div className="flex items-center justify-between gap-3"><CivicSectionLabel>VOTE HISTORY</CivicSectionLabel><a href="https://opendata.vancouver.ca/explore/dataset/council-voting-records/" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#004a99]">Source <ExternalLink className="inline w-3 h-3" /></a></div><div className="grid gap-3 mt-3">{votes.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 40).map((motion, index) => <MotionCardItem key={motion.id} motion={motion} index={index} vote={motion.votes[name]} />)}</div></CivicCard></div>;
}

function Stat({ label, value }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p><p className="text-xl font-bold text-slate-900 mt-1">{value.toLocaleString()}</p></div>; }
