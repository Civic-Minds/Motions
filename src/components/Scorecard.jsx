import React from 'react';
import { Target, AlertCircle, FileText, TrendingUp, UserMinus, ShieldCheck, Zap, BarChart3, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';
import { COUNCILLORS } from '../constants/data';

const statsContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const statsItem = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } },
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

    return (
        <div className="space-y-10">
            {/* 4-Card Analysis Header */}
            <motion.div className="dashboard-stats-row" variants={statsContainer} initial="hidden" animate="show">
                <motion.div className="card-mainline border-l-4 border-l-[#004a99] !p-8" variants={statsItem}>
                     <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-black text-[#004a99] uppercase tracking-[0.25em] mb-3 opacity-60">Substantive Focus</p>
                        <div className="flex items-baseline gap-3">
                            <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{100 - trivialPercentage}%</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Core Output</span>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-end gap-3 max-w-[240px]">
                        <div className="w-12 h-12 rounded-2xl bg-[#004a99]/5 border border-[#004a99]/10 flex items-center justify-center text-[#004a99]">
                            <Target size={22} />
                        </div>
                    </div>
                </motion.div>

                <motion.div className="card-mini border-l-4 border-l-amber-500" variants={statsItem}>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4 opacity-60">Admin Overhead</p>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{trivialPercentage}%</span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Trivial</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight italic">Procedural Buffer</span>
                </motion.div>

                <motion.div className="card-mini border-l-4 border-l-emerald-500" variants={statsItem}>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 opacity-60">Legislative Yield</p>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{efficiency}%</span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Passed</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Adoption Velocity</span>
                </motion.div>

                <motion.div className="card-mini border-l-4 border-l-rose-500" variants={statsItem}>
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-4 opacity-60">Top Oppositionalist</p>
                    <div className="flex flex-col gap-2">
                        <span className="text-[14px] font-black text-slate-900 tracking-tighter leading-tight uppercase font-mono">{biggestDissenter[0]?.split(' ').at(-1)}</span>
                        <div className="inline-flex items-center justify-center py-1 bg-rose-50 rounded-lg border border-rose-100">
                             <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest">{biggestDissenter[1]} NO VOTES</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Impact Intelligence */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="px-2 flex justify-between items-center mb-2">
                        <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 font-mono">Impact Pulse: Major Adoptions</h4>
                        <span className="text-[9px] font-black text-slate-400 opacity-60">SORTED BY SIGNIFICANCE</span>
                    </div>
                    <motion.div
                        className="grid gap-4"
                        initial="hidden"
                        animate="show"
                        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}
                    >
                        {majorWins.map((win, i) => (
                            <motion.div
                                key={i}
                                variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } } }}
                                className="group p-4 sm:p-6 bg-white/80 backdrop-blur-md border border-slate-100 rounded-[28px] flex gap-3 sm:gap-6 items-center hover:border-[#004a99]/30 hover:shadow-2xl transition-all duration-500 cursor-default relative overflow-hidden"
                            >
                                <div className={`hidden sm:flex w-14 h-14 rounded-3xl items-center justify-center border font-black transition-all duration-500 ${
                                    win.topic === 'Finance' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' : 
                                    win.topic === 'Transit' ? 'bg-rose-50 border-rose-100 text-rose-600 group-hover:bg-rose-500 group-hover:text-white' :
                                    'bg-blue-50 border-blue-100 text-blue-600 group-hover:bg-[#004a99] group-hover:text-white'
                                }`}>
                                    <Zap size={24} className="transition-transform group-hover:scale-110" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-60 font-mono">#{win.id}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#004a99]">{win.topic}</span>
                                    </div>
                                    <p className="font-bold text-slate-900 text-[15px] leading-snug tracking-tight group-hover:text-[#004a99] transition-colors">{win.title}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="px-3 py-1.5 bg-slate-900 rounded-2xl flex flex-col items-center justify-center shadow-lg group-hover:bg-[#004a99] transition-colors">
                                        <span className="text-[12px] font-black text-white leading-none tracking-tighter">{win.significance}</span>
                                        <span className="text-[7px] font-black text-white/50 uppercase tracking-[0.1em] mt-0.5">SIG</span>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#004a99]/5 blur-[100px] pointer-events-none -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Tactical Overlays */}
                <div className="space-y-8">
                     <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-[#004a99]/8 rounded-[20px] flex items-center justify-center mb-6 group-hover:bg-[#004a99] transition-colors duration-500">
                                <FileText size={24} className="text-[#004a99] group-hover:text-white transition-colors duration-500" />
                            </div>
                            <h4 className="text-[11px] font-black mb-4 tracking-[0.25em] uppercase text-[#004a99] border-l-2 border-l-[#004a99] pl-3">Session Synopsis</h4>
                            <p className="text-[13px] text-slate-600 leading-relaxed font-semibold italic">
                                "Council demonstrates a high density of substantive output in {topTopic ? topTopic[0] : 'core sectors'}, with a {efficiency}% strategic adoption rate across {nonTrivial.length} items."
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="px-2 flex justify-between items-center mb-2">
                             <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 font-mono">Dissent Alpha</h4>
                             <span className="text-[9px] font-black text-slate-400 opacity-60 font-mono">TOP NO VOTES</span>
                        </div>
                        <div className="bg-white/50 backdrop-blur-sm border border-slate-100 rounded-[32px] overflow-hidden p-2">
                            {Object.entries(dissenterStats)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5)
                                .map(([name, count], i) => (
                                    <div key={i} className="flex items-center justify-between p-5 hover:bg-white hover:shadow-xl rounded-[24px] transition-all duration-500 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-[12px] text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <span className="text-sm font-black text-slate-800 uppercase tracking-tighter truncate leading-tight block">{name}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Opposing Council Force</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[11px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 tracking-tighter group-hover:bg-rose-500 group-hover:text-white transition-colors uppercase whitespace-nowrap">
                                                {count} NO
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-emerald-100 rounded-[32px] shadow-sm relative overflow-hidden group hover:border-emerald-200 hover:shadow-lg transition-all duration-500">
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors duration-500">
                                <Fingerprint size={24} className="text-emerald-500 group-hover:text-white transition-colors duration-500" />
                            </div>
                            <h5 className="text-[11px] font-black uppercase tracking-[0.25em] mb-2 text-slate-900">Legislative Fingerprint</h5>
                            <p className="text-[10px] font-semibold text-slate-400 leading-relaxed">System-wide transparency is verified. All data points are extracted from primary legislative records.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scorecard;
