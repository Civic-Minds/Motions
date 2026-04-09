import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, Info, X, ChevronRight, Users, Activity } from 'lucide-react';
import { getMemberAlignmentMatrix } from '../utils/analytics';
import { COUNCILLORS } from '../constants/data';
import { cn } from '../lib/utils';

const AlignmentMatrix = ({ motions }) => {
    const [hovered, setHovered] = useState(null); // { row, col }
    const [selected, setSelected] = useState(null); // { name1, name2, score }

    const matrixData = useMemo(() => {
        // Filter to councillors with at least 10 votes to keep it legible
        const activeMembers = COUNCILLORS.filter(c => {
            const count = motions.filter(m => m.votes && m.votes[c]).length;
            return count > 10;
        }).sort((a, b) => a.split(' ').at(-1).localeCompare(b.split(' ').at(-1)));

        const matrix = getMemberAlignmentMatrix(motions, activeMembers);
        return { members: activeMembers, matrix };
    }, [motions]);

    const getColor = (score) => {
        if (score === null) return 'bg-slate-50';
        if (score >= 90) return 'bg-[#004a99]';
        if (score >= 80) return 'bg-[#004a99]/85';
        if (score >= 70) return 'bg-[#004a99]/70';
        if (score >= 60) return 'bg-[#004a99]/55';
        if (score >= 50) return 'bg-[#004a99]/40';
        if (score >= 40) return 'bg-rose-400/40';
        if (score >= 30) return 'bg-rose-500/60';
        return 'bg-rose-600';
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-[#004a99]';
        if (score >= 40) return 'text-amber-600';
        return 'text-rose-600';
    };

    if (!matrixData.members.length) return null;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-[#004a99]" strokeWidth={2.5} />
                        <h4 className="text-xl font-display font-black text-slate-900 tracking-tight leading-none">Voting Bloc Network</h4>
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Inter-member Alignment Analysis</p>
                </div>
                
                <div className="flex items-center gap-6 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md bg-[#004a99]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">High Sync</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md bg-slate-200" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Neutral</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md bg-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Dissent</span>
                    </div>
                </div>
            </div>

            <div className="relative group/matrix">
                {/* Scroll container for the matrix */}
                <div className="overflow-x-auto pb-6 scrollbar-hide cursor-crosshair">
                    <div className="inline-block min-w-full align-middle">
                        <table className="border-separate border-spacing-[3px] mx-auto">
                            <thead>
                                <tr>
                                    <th className="sticky left-0 z-20 bg-white/95 backdrop-blur-md p-1 min-w-[120px]"></th>
                                    {matrixData.members.map((member, i) => (
                                        <th key={member} className="p-1 min-w-[34px] h-[120px] relative">
                                            <div className="absolute left-1/2 bottom-3 -translate-x-1/2 -rotate-45 origin-bottom-left whitespace-nowrap text-[10px] font-black uppercase tracking-tighter text-slate-400 text-left">
                                                {member.split(' ').at(-1)}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {matrixData.members.map((m1, rowIdx) => (
                                    <tr key={m1} className="group/row">
                                        <td className="sticky left-0 z-20 bg-white/95 backdrop-blur-md px-4 py-2 text-right">
                                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 group-hover/row:text-[#004a99] transition-colors">
                                                {m1.split(' ').at(-1)}
                                            </span>
                                        </td>
                                        {matrixData.members.map((m2, colIdx) => {
                                            const score = matrixData.matrix[rowIdx][colIdx];
                                            const isHovered = hovered?.row === rowIdx || hovered?.col === colIdx;
                                            const isExact = hovered?.row === rowIdx && hovered?.col === colIdx;
                                            
                                            return (
                                                <td
                                                    key={m2}
                                                    onMouseEnter={() => setHovered({ row: rowIdx, col: colIdx })}
                                                    onMouseLeave={() => setHovered(null)}
                                                    onClick={() => score !== null && setSelected({ name1: m1, name2: m2, score })}
                                                    className={cn(
                                                        "w-9 h-9 sm:w-11 sm:h-11 rounded-[6px] sm:rounded-[8px] transition-all duration-300 relative cursor-pointer",
                                                        getColor(score),
                                                        isHovered ? 'ring-2 ring-[#004a99] shadow-lg z-10 scale-110' : 'opacity-90',
                                                        isExact && 'ring-4 scale-125 rounded-[12px] z-20 shadow-2xl'
                                                    )}
                                                >
                                                    {isExact && score !== null && (
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <span className="text-[10px] font-black text-white">{score}%</span>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail View Overlay */}
                <AnimatePresence>
                    {selected && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4"
                        >
                            <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                    <GitCompare size={80} className="text-white" />
                                </div>
                                
                                <button
                                    onClick={() => setSelected(null)}
                                    className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                                >
                                    <X size={20} />
                                </button>
                                
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#004a99] mb-4">Alignment Analysis</span>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xl font-display font-black text-white leading-none">{selected.name1.split(' ').at(-1)}</span>
                                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2">{selected.name1.split(' ').slice(0, -1).join(' ')}</span>
                                                </div>
                                                <div className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                                                    <GitCompare size={14} className="text-[#004a99]" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xl font-display font-black text-white leading-none">{selected.name2.split(' ').at(-1)}</span>
                                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2">{selected.name2.split(' ').slice(0, -1).join(' ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-10">
                                        <div className="relative w-24 h-24 shrink-0">
                                            <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(0,74,153,0.3)]" viewBox="0 0 36 36">
                                                <circle className="text-white/5" strokeWidth="3" stroke="currentColor" fill="none" cx="18" cy="18" r="15.9155" />
                                                <motion.circle
                                                    className="text-[#004a99]"
                                                    initial={{ strokeDasharray: '0, 100' }}
                                                    animate={{ strokeDasharray: `${selected.score}, 100` }}
                                                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                                    strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" cx="18" cy="18" r="15.9155"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-2xl font-display font-black text-white leading-none tracking-tighter">{selected.score}%</span>
                                                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1">SYNC</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 space-y-4">
                                            <p className="text-sm font-bold text-slate-400 leading-relaxed italic">
                                                "{selected.name1.split(' ').at(-1)} and {selected.name2.split(' ').at(-1)} demonstrate <span className={getScoreColor(selected.score)}>{selected.score >= 75 ? 'strong tactical cohesion' : selected.score >= 50 ? 'variable alignment' : 'systemic divergence'}</span> on city-wide policy motions."
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="px-2">
                <div className="p-8 rounded-[32px] bg-[#f8fafc] border-2 border-slate-100 flex flex-col sm:flex-row items-center gap-8">
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#004a99] shadow-sm border border-slate-100 shrink-0">
                        <Info size={24} strokeWidth={2.5} />
                     </div>
                     <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                        Calculated by comparing "YES/NO" votes on all non-procedural items where both members were present. Scores represent the statistical probability of these members voting in unison.
                     </p>
                </div>
            </div>
        </div>
    );
};

export default AlignmentMatrix;
