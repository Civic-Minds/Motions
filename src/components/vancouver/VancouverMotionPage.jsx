import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { PageMeta } from '../PageMeta';
import { CivicCard, CivicSectionLabel } from '../ui/CivicCard';
import { nameToSlug } from '../../utils/slug';

export default function VancouverMotionPage({ motions = [] }) {
    const { motionId } = useParams();
    const motion = motions.find(item => item.id === motionId);
    const voteGroups = useMemo(() => Object.entries(motion?.votes ?? {}).reduce((groups, [name, vote]) => { (groups[vote] ??= []).push(name); return groups; }, {}), [motion]);

    if (!motion) return <div className="py-20 text-center text-slate-500 text-sm">Motion not found.</div>;
    return <div className="max-w-4xl mx-auto space-y-6 pb-20">
        <PageMeta title={`${motion.title} | Motions Vancouver`} description={motion.summary || `${motion.status} · Vancouver council vote`} />
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft className="w-4 h-4" /> Back to Vancouver motions</Link>
        <div className="space-y-3"><CivicSectionLabel>{motion.committee} · {motion.date}</CivicSectionLabel><h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{motion.title}</h1><div className="flex flex-wrap gap-2"><span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-semibold">{motion.status}</span><span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-1 text-xs">{motion.topic}</span></div></div>
        <CivicCard className="gap-4"><div><CivicSectionLabel>VOTE RESULT</CivicSectionLabel><p className="text-3xl font-bold text-slate-900 mt-1">{motion.yesCount} – {motion.noCount}</p><p className="text-sm text-slate-500">In favour · In opposition</p></div><a href={motion.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#004a99]">Official source <ExternalLink className="w-3.5 h-3.5" /></a></CivicCard>
        <div className="grid gap-4 sm:grid-cols-2">{Object.entries(voteGroups).map(([vote, names]) => <CivicCard key={vote}><CivicSectionLabel>{vote.replace('_', ' ')}</CivicSectionLabel><div className="space-y-2 mt-1">{names.map(name => <Link key={name} to={`/councillors/${nameToSlug(name)}`} className="block text-sm text-slate-700 hover:text-[#004a99]">{name}</Link>)}</div></CivicCard>)}</div>
    </div>;
}
