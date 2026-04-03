import { useMemo } from 'react';
import { getMemberAlignmentScore } from '../utils/analytics';

const TIERS = [
    { title: 'Solid Consensus',  min: 90, color: 'text-emerald-700', dot: 'bg-emerald-500', bar: 'bg-emerald-500',  accent: 'border-emerald-200', bg: 'bg-emerald-50/20' },
    { title: 'Constructive',      min: 75, color: 'text-[#004a99]',   dot: 'bg-[#004a99]',   bar: 'bg-[#004a99]',    accent: 'border-blue-200',    bg: 'bg-blue-50/20' },
    { title: 'Variable',          min: 60, color: 'text-amber-700',   dot: 'bg-amber-400',   bar: 'bg-amber-400',    accent: 'border-amber-200',   bg: 'bg-amber-50/20' },
    { title: 'Systemic Dissent',  min: 0,  color: 'text-rose-700',    dot: 'bg-rose-400',    bar: 'bg-rose-400',     accent: 'border-rose-200',    bg: 'bg-rose-50/20' }
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
            .sort((a, b) => b.score - a.score);
    }, [motions]);

    const bucketed = useMemo(() => {
        return TIERS.map(tier => ({
            ...tier,
            members: scored.filter(s => s.score >= tier.min && (TIERS.find(t => t.min > tier.min && s.score >= t.min) === undefined))
        }));
    }, [scored]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-1 h-full">
            {bucketed.map((tier) => (
                <div key={tier.title} className={`flex flex-col rounded-[32px] border border-slate-100 p-6 ${tier.bg} transition-all duration-500`}>
                    <div className="flex justify-between items-center mb-8 px-1">
                        <div className="flex items-center gap-2.5">
                             <div className={`w-2 h-2 rounded-full ${tier.dot}`} />
                             <h4 className={`text-[11px] font-black uppercase tracking-[0.25em] ${tier.color}`}>
                                {tier.title}
                            </h4>
                        </div>
                        <span className="text-[11px] font-black text-slate-400 opacity-60">
                            {tier.members.length}
                        </span>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        {tier.members.map((member) => (
                            <div
                                key={member.name}
                                onClick={() => onSelect(member.name)}
                                className="group p-5 bg-white/90 backdrop-blur-md border border-slate-100/50 rounded-2xl cursor-pointer hover:shadow-2xl hover:border-[#004a99]/30 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
                            >
                                <div className="flex justify-between items-baseline mb-4">
                                    <span className="text-[11px] font-black text-slate-800 group-hover:text-[#004a99] transition-colors truncate uppercase tracking-tight">
                                        {member.lastName}
                                    </span>
                                    <span className={`text-[12px] font-black ${tier.color}`}>
                                        {member.score}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/30">
                                    <div 
                                        className={`h-full rounded-full ${tier.bar} transition-all duration-1000`} 
                                        style={{ width: `${member.score}%` }} 
                                    />
                                </div>
                            </div>
                        ))}
                        {tier.members.length === 0 && (
                            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200/40 rounded-3xl bg-white/30">
                                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest leading-none">Neutral Tier</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AlignmentHeatmap;
