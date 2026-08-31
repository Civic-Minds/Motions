import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Users, Vote } from 'lucide-react';
import MotionCardItem from '../MotionCardItem';
import { PageMeta } from '../PageMeta';
import { CivicCard, CivicSectionLabel } from '../ui/CivicCard';

export default function VancouverDashboard({ motions = [], meetings = [] }) {
    const recent = useMemo(() => [...motions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12), [motions]);
    const councilMembers = useMemo(() => new Set(motions.flatMap(m => Object.keys(m.votes ?? {}))).size, [motions]);
    const latestDate = recent[0]?.date ?? 'No records';

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <PageMeta title="Motions | Vancouver Council Voting Tracker" description="See what Vancouver City Council voted on and how each member voted." />
            <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr] items-stretch">
                <div className="rounded-3xl bg-slate-900 text-white p-7 sm:p-9 flex flex-col justify-between min-h-[280px]">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Vancouver civic record</p>
                        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mt-3">What did council decide?</h1>
                        <p className="text-slate-300 mt-4 max-w-xl leading-relaxed">Browse Vancouver motions in plain language and see how each council member voted. Vancouver elects council citywide, so every resident shares the same council record.</p>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-8">
                        <Link to="/election" className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100">2026 Election <ArrowRight className="w-4 h-4" /></Link>
                        <Link to="/councillors" className="inline-flex items-center gap-2 rounded-xl border border-slate-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-800">Council members</Link>
                    </div>
                </div>
                <CivicCard className="p-6 justify-between">
                    <div>
                        <CivicSectionLabel>VANCOUVER AT A GLANCE</CivicSectionLabel>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <Stat icon={Vote} label="Vote events" value={motions.length.toLocaleString()} />
                            <Stat icon={Users} label="Members" value={councilMembers || '—'} />
                            <Stat icon={CalendarDays} label="Meetings" value={meetings.length.toLocaleString()} />
                            <Stat icon={CalendarDays} label="Latest record" value={latestDate} small />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-6">Records come from the City of Vancouver’s official voting dataset.</p>
                </CivicCard>
            </section>

            <section className="space-y-3">
                <div className="flex items-end justify-between gap-4"><div><CivicSectionLabel>RECENT COUNCIL RECORD</CivicSectionLabel><h2 className="text-xl font-bold text-slate-900 mt-1">Latest votes</h2></div><Link to="/meetings" className="text-sm font-semibold text-[#004a99]">Meetings <ArrowRight className="inline w-4 h-4" /></Link></div>
                <div className="grid gap-3">{recent.map((motion, index) => <MotionCardItem key={motion.id} motion={motion} index={index} />)}</div>
                {!recent.length && <CivicCard><p className="text-sm text-slate-500">Vancouver data is not available yet.</p></CivicCard>}
            </section>
        </div>
    );
}

function Stat({ icon: Icon, label, value, small }) {
    return <div className="rounded-xl bg-slate-50 p-3"><Icon className="w-4 h-4 text-[#004a99]" /><p className="text-[10px] text-slate-400 mt-2">{label}</p><p className={`font-bold text-slate-800 ${small ? 'text-xs' : 'text-lg'}`}>{value}</p></div>;
}
