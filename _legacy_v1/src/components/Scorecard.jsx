import React, { useMemo } from 'react';
import { Target, AlertCircle, FileText, TrendingUp, UserMinus, ShieldCheck, Zap, BarChart3, Fingerprint, Activity, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { COUNCILLORS } from '../constants/data';
import { cn } from '../lib/utils';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import AlignmentMatrix from './AlignmentMatrix';

const statsContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const statsItem = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const Scorecard = ({ motions }) => {
    // Calculate Stats
    const totalMotions = motions.length;
    const trivialMotions = motions.filter(m => m.trivial).length;
    const trivialPercentage = totalMotions > 0 ? Math.floor((trivialMotions / totalMotions) * 100) : 0;

    const majorWins = motions
        .filter(m => !m.trivial && (m.status === 'Adopted' || m.status.includes('Carried')))
        .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0))
        .slice(0, 10);

    const nonTrivial = motions.filter(m => !m.trivial);
    const passed = nonTrivial.filter(m => m.status === 'Adopted' || m.status.includes('Carried'));
    const efficiency = nonTrivial.length > 0 ? Math.floor((passed.length / nonTrivial.length) * 100) : 0;

    const dissenterStats = {};
    COUNCILLORS.forEach(c => {
        dissenterStats[c] = motions.filter(m => m.votes && m.votes[c] === 'NO').length;
    });
    const biggestDissenter = Object.entries(dissenterStats)
        .sort((a, b) => b[1] - a[1])[0];

    const topicCounts = motions.reduce((acc, m) => {
        acc[m.topic] = (acc[m.topic] || 0) + 1;
        return acc;
    }, {});
    const topTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0];

    const sessionTimeline = useMemo(() => {
        const byDate = {};
        motions.forEach(m => {
            if (!byDate[m.date]) byDate[m.date] = { total: 0, adopted: 0 };
            byDate[m.date].total += 1;
            if (m.status === 'Adopted' || m.status?.includes('Carried')) byDate[m.date].adopted += 1;
        });
        return Object.entries(byDate)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([date, counts]) => ({ date, ...counts }));
    }, [motions]);

    const maxSessionTotal = Math.max(...sessionTimeline.map(s => s.total), 1);

    return (
        <div className="space-y-16 pb-20">
            
            {/* ── Page Header ── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 px-2 outline-none">
                <div className="space-y-5">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-[#004a99]/10 flex items-center justify-center text-[#004a99]">
                             <BarChart3 size={22} strokeWidth={2.5} />
                         </div>
                         <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Intelligence</h2>
                    </div>
                    <h1 className="text-5xl font-display font-black text-slate-900 tracking-tight leading-none">Council Performance</h1>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                        Audit legislative output, voting blocs, and session efficiency with high-fidelity tracking of Toronto's public record.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-8 py-5 bg-slate-900 text-white rounded-[24px] flex items-center gap-4 shadow-2xl shadow-slate-900/20 active:scale-95 transition-all">
                        <TrendingUp size={22} className="text-[#004a99]" strokeWidth={2.5} />
                        <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60">System Yield</span>
                            <span className="text-xl font-display font-black tracking-tighter">{efficiency}% Efficiency</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4-Card Analysis Header */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-2" variants={statsContainer} initial="hidden" animate="show">
                <Card className="rounded-[40px] overflow-hidden group shadow-lg" variants={statsItem}>
                    <CardContent className="p-10 flex flex-col justify-between h-full bg-gradient-to-br from-white to-blue-50/20 relative">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-[#004a99]/5 rounded-xl text-[#004a99]">
                                    <CheckCircle2 size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Substantive</h3>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-7xl font-display font-black text-slate-900 tracking-tighter leading-none">{100 - trivialPercentage}%</span>
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-black text-[9px] px-2 py-0.5 rounded-md">QUALITY</Badge>
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-4 opacity-70">Meaningful Items</p>
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-10 uppercase tracking-tight leading-relaxed">
                            Excluding procedural and <br /> routine admin motions.
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-[40px] overflow-hidden group shadow-lg" variants={statsItem}>
                    <CardContent className="p-10 flex flex-col justify-between h-full bg-gradient-to-br from-white to-amber-50/20 relative">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                                    <AlertCircle size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Registry</h3>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-7xl font-display font-black text-slate-900 tracking-tighter leading-none">{trivialPercentage}%</span>
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-black text-[9px] px-2 py-0.5 rounded-md">ADMIN</Badge>
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-4 opacity-70">Operational Load</p>
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-10 uppercase tracking-tight leading-relaxed">
                            Routine scheduling and <br /> internal housekeeping.
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-[40px] overflow-hidden group shadow-lg" variants={statsItem}>
                    <CardContent className="p-10 flex flex-col justify-between h-full bg-gradient-to-br from-white to-emerald-50/20 relative">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                                    <Activity size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Success</h3>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-7xl font-display font-black text-slate-900 tracking-tighter leading-none">{efficiency}%</span>
                                <Badge className="bg-[#10b981]/10 text-emerald-700 hover:bg-[#10b981]/10 border-none font-black text-[9px] px-2 py-0.5 rounded-md">PASS</Badge>
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-4 opacity-70">Strategic Conversion</p>
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-10 uppercase tracking-tight leading-relaxed">
                            Motions with real impact <br /> successfully adopted.
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-[40px] overflow-hidden group shadow-lg" variants={statsItem}>
                    <CardContent className="p-10 flex flex-col justify-between h-full bg-gradient-to-br from-white to-rose-50/20 relative">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
                                    <UserMinus size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Friction</h3>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-display font-black text-slate-900 tracking-tight block truncate uppercase mb-2">{biggestDissenter[0]}</span>
                                <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none font-black text-[10px] w-fit px-3 py-1.5 rounded-lg">
                                    {biggestDissenter[1]} NO VOTES
                                </Badge>
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-4 opacity-70">Top Dissenter</p>
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-10 uppercase tracking-tight leading-relaxed">
                            Consistent opposition to <br /> council consensus.
                        </p>
                    </CardContent>
                </Card>
            </motion.div>


            {/* Pairwise Alignment Matrix */}
            <div className="px-2">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                    Pairwise Network Mapping <div className="h-px bg-slate-200 flex-1" />
                </h3>
                <Card className="rounded-[48px] overflow-hidden border-2 border-slate-100 shadow-2xl shadow-slate-900/5">
                    <CardContent className="p-1 bg-white">
                         <AlignmentMatrix motions={motions} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 px-2">
                {/* Impact Intelligence */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-lg">
                                <Zap size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="text-xl font-display font-black text-slate-900 tracking-tight">High-Impact Adoptions</h4>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Official Term Achievements</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="h-8 rounded-xl font-black text-[9px] uppercase tracking-widest px-4 border-slate-200 text-slate-500">SIGNIFICANCE SORT</Badge>
                    </div>

                    <motion.div
                        className="grid gap-6"
                        initial="hidden"
                        animate="show"
                        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
                    >
                        {majorWins.map((win, i) => (
                            <motion.div
                                key={i}
                                variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } } }}
                                className="bg-white rounded-[32px] border-2 border-slate-100 p-8 flex gap-10 items-center hover:border-[#004a99]/30 hover:shadow-2xl hover:shadow-[#004a99]/5 transition-all duration-500 group relative overflow-hidden"
                            >
                                <div className={cn(
                                    "hidden sm:flex w-20 h-20 rounded-[24px] items-center justify-center border-4 border-white shadow-xl font-black transition-all duration-700 group-hover:scale-110 group-hover:rotate-3",
                                    win.topic === 'Finance' ? 'bg-emerald-50 text-emerald-600' : 
                                    win.topic === 'Transit' ? 'bg-rose-50 text-rose-600' :
                                    'bg-blue-50 text-[#004a99]'
                                )}>
                                    <FileText size={28} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 min-w-0 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="font-mono text-[10px] font-bold py-1 px-3 border-slate-100 bg-slate-50 shadow-sm">ID {win.id}</Badge>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.2em]",
                                            win.topic === 'Finance' ? 'text-emerald-600' : 
                                            win.topic === 'Transit' ? 'text-rose-600' :
                                            'text-[#004a99]'
                                        )}>{win.topic}</span>
                                    </div>
                                    <p className="font-black text-slate-900 text-lg leading-[1.4] group-hover:text-[#004a99] transition-colors tracking-tight line-clamp-2">{win.title}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="w-24 h-24 bg-slate-50 border-2 border-white rounded-[32px] flex flex-col items-center justify-center group-hover:bg-[#004a99] group-hover:scale-110 transition-all duration-700 shadow-sm group-hover:shadow-2xl group-hover:shadow-blue-900/20 group-hover:rotate-6">
                                        <span className="text-3xl font-display font-black text-slate-900 group-hover:text-white leading-none tracking-tighter">{win.significance}</span>
                                        <span className="text-[9px] font-black text-slate-400 group-hover:text-white/60 uppercase tracking-[0.2em] mt-2">Impact</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                </div>

                {/* Tactical Overlays */}
                <div className="space-y-12">
                     <Card className="rounded-[48px] bg-slate-900 text-white border-none overflow-hidden relative group shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#004a99]/30 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                        <CardContent className="p-12 relative z-10">
                            <div className="w-16 h-16 bg-white/10 rounded-[28px] flex items-center justify-center mb-10 border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                                <ShieldCheck size={32} strokeWidth={2.5} className="text-[#004a99]" />
                            </div>
                            <h4 className="text-[11px] font-black tracking-[0.3em] uppercase text-[#004a99] mb-6 flex items-center gap-3">
                                <div className="w-8 h-0.5 bg-[#004a99]" /> Intelligence Engine
                            </h4>
                            <p className="text-2xl text-white leading-[1.5] font-black font-display italic tracking-tight">
                                "Council exhibits high institutional inertia in {topTopic ? topTopic[0] : 'core sectors'}, maintaining a record {efficiency}% strategic adoption rate."
                            </p>
                        </CardContent>
                    </Card>

                    <div className="space-y-8">
                        <div className="flex items-center justify-between px-2">
                             <h4 className="text-[11px] font-black tracking-[0.3em] uppercase text-slate-400">Opposition Leaders</h4>
                             <Badge variant="ghost" className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Global "NO" Counts</Badge>
                        </div>
                        <div className="space-y-3">
                            {Object.entries(dissenterStats)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5)
                                .map(([name, count], i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-white border-2 border-slate-50 hover:border-[#004a99]/30 rounded-[32px] transition-all duration-500 group cursor-default active:scale-95 shadow-sm hover:shadow-xl">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-sm text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-700 border-2 border-white shadow-sm">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <span className="text-[15px] font-black text-slate-900 tracking-tight block leading-none">{name}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 block opacity-60">Representative</span>
                                            </div>
                                        </div>
                                        <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[12px] px-4 py-2 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                                            {count} NO
                                        </Badge>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <Card className="rounded-[40px] bg-[#f8fafc] border-2 border-slate-100 p-10 flex flex-col items-center text-center group hover:border-[#004a99]/20 transition-all duration-700">
                         <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-slate-900/5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 border border-slate-50">
                             <Fingerprint size={28} className="text-emerald-500" strokeWidth={2.5} />
                         </div>
                         <h5 className="text-[11px] font-black uppercase tracking-[0.25em] mb-4 text-slate-900">Verified Integrity</h5>
                         <p className="text-sm font-bold text-slate-400 leading-relaxed px-4 uppercase tracking-tighter">
                             Aggregated directly from Toronto public records. Updated session-by-session.
                         </p>
                    </Card>
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="px-2">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                    Temporal Velocity <div className="h-px bg-slate-200 flex-1" />
                </h3>
                <Card className="rounded-[48px] border-2 border-slate-100 bg-white overflow-hidden shadow-2xl shadow-slate-900/5">
                    <CardContent className="p-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
                            <div className="space-y-2">
                                <h4 className="text-3xl font-display font-black text-slate-900 tracking-tight">Institutional Output</h4>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Aggregated activity across {sessionTimeline.length} recorded council sessions</p>
                            </div>
                            <div className="flex items-center gap-8 bg-slate-50 px-8 py-4 rounded-3xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-slate-200 shadow-sm" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Procedural</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Substantive</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-end gap-2 h-64 overflow-x-auto pb-8 scrollbar-hide px-2">
                            {sessionTimeline.map((session, i) => (
                                <div key={i} className="group relative flex flex-col items-center gap-2 shrink-0 h-full" style={{ minWidth: '24px', flex: '1 0 24px', maxWidth: '48px' }}>
                                    <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-5 rounded-[24px] shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100 group-hover:-translate-y-2 pointer-events-none z-30 min-w-[180px] border border-white/10">
                                        <p className="text-[10px] font-black text-[#004a99] uppercase tracking-[0.2em] mb-3">{session.date}</p>
                                        <div className="space-y-2.5">
                                            <div className="flex justify-between items-center text-xs font-bold">
                                                <span className="text-slate-400 uppercase tracking-widest">Aggregate</span>
                                                <span className="text-lg font-black tracking-tighter">{session.total}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs font-bold">
                                                <span className="text-slate-400 uppercase tracking-widest">Adopted</span>
                                                <span className="text-lg font-black tracking-tighter text-emerald-400">{session.adopted}</span>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-slate-900 rotate-45 border-r border-b border-white/10" />
                                    </div>
                                    
                                    <div className="w-full flex flex-col items-center justify-end h-full relative cursor-crosshair">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(session.adopted / maxSessionTotal) * 100}%` }}
                                            transition={{ duration: 1.5, delay: i * 0.02, ease: [0.16, 1, 0.3, 1] }}
                                            className="w-full rounded-t-lg bg-emerald-500 shadow-lg shadow-emerald-500/10 transition-all duration-500 group-hover:scale-x-125 z-10"
                                        />
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${((session.total - session.adopted) / maxSessionTotal) * 100}%` }}
                                            transition={{ duration: 1.5, delay: i * 0.02, ease: [0.16, 1, 0.3, 1] }}
                                            className="w-full bg-slate-100 rounded-t-sm transition-all duration-500 group-hover:scale-x-110 group-hover:bg-slate-200"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex justify-between items-center mt-12 pt-8 border-t-2 border-slate-50 text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">
                            <span>{sessionTimeline[0]?.date}</span>
                            <div className="flex-1 mx-12 h-0.5 bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
                            <span>{sessionTimeline.at(-1)?.date}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Scorecard;
