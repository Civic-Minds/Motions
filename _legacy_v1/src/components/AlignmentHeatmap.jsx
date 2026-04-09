import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getMemberAlignmentScore } from '../utils/analytics';
import { cn } from '../lib/utils';
import { Card, CardContent } from './ui/card';

const TIERS = [
    { title: 'Consensus',  min: 90, color: 'text-emerald-700', dot: 'bg-emerald-500', bar: 'bg-emerald-500',  accent: 'border-emerald-200', bg: 'bg-emerald-50/10' },
    { title: 'Standard',   min: 75, color: 'text-blue-700',   dot: 'bg-blue-500',   bar: 'bg-blue-500',    accent: 'border-blue-200',    bg: 'bg-blue-50/10' },
    { title: 'Variable',    min: 60, color: 'text-amber-700',   dot: 'bg-amber-400',   bar: 'bg-amber-400',    accent: 'border-amber-200',   bg: 'bg-amber-50/10' },
    { title: 'Dissent',     min: 0,  color: 'text-rose-700',    dot: 'bg-rose-400',    bar: 'bg-rose-400',     accent: 'border-rose-200',    bg: 'bg-rose-50/10' }
];

const AlignmentHeatmap = ({ onSelect, motions }) => {
    const scored = useMemo(() => {
        const voteCounts = {};
        motions.forEach(m => {
            if (!m.votes) return;
            Object.keys(m.votes).forEach(name => {
                voteCounts[name] = (voteCounts[name] || 0) + 1;
            });
        });
        
        return Object.entries(voteCounts)
            .filter(([, count]) => count >= 5)
            .map(([name]) => ({
                name,
                lastName: name.split(' ').at(-1),
                score: getMemberAlignmentScore(motions, name)
            }))
            .filter(m => m.score !== null)
            .sort((a, b) => b.score - a.score);
    }, [motions]);

    const bucketed = useMemo(() => {
        return TIERS.map(tier => ({
            ...tier,
            members: scored.filter(s => s.score >= tier.min && (TIERS.find(t => t.min > tier.min && s.score >= t.min) === undefined))
        }));
    }, [scored]);

    return (
        <div className="space-y-4">
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-1"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            >
                {bucketed.map((tier) => (
                    <motion.div
                        key={tier.title}
                        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } } }}
                        className={cn("flex flex-col rounded-[2.5rem] border border-slate-100 p-8 transition-all duration-500", tier.bg)}
                    >
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-3">
                                 <div className={cn("w-2.5 h-2.5 rounded-full", tier.dot)} />
                                 <h4 className={cn("text-[11px] font-black uppercase tracking-[0.25em]", tier.color)}>
                                    {tier.title}
                                </h4>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 opacity-60">
                                {tier.members.length}
                            </span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {tier.members.map((member, idx) => (
                                <motion.div
                                    key={member.name}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.04, type: 'spring', stiffness: 300, damping: 28 }}
                                    onClick={() => onSelect(member.name)}
                                    className="group p-5 bg-white border border-slate-100/60 rounded-2xl cursor-pointer hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-500 relative"
                                >
                                    <div className="flex justify-between items-baseline mb-3">
                                        <span className="text-[11px] font-black text-slate-900 group-hover:text-primary transition-colors truncate uppercase tracking-tight">
                                            {member.lastName}
                                        </span>
                                        <span className={cn("text-xs font-black", tier.color)}>
                                            {member.score}%
                                        </span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${member.score}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className={cn("h-full rounded-full transition-all duration-1000", tier.bar)} 
                                        />
                                    </div>
                                </motion.div>
                            ))}
                            {tier.members.length === 0 && (
                                <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200/40 rounded-[2rem] bg-white/40">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Balanced</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
            <div className="flex items-center gap-2 px-2 mt-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Councillors with fewer than 5 recorded votes are not shown.
                </p>
            </div>
        </div>
    );
};

export default AlignmentHeatmap;
