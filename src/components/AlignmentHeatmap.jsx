import { useMemo } from 'react';
import { getMemberAlignmentScore } from '../utils/analytics';

const scoreStyle = (score) => {
    if (score >= 85) return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (score >= 70) return { bar: 'bg-[#004a99]',   text: 'text-[#004a99]',   bg: 'bg-blue-50',    border: 'border-blue-200' };
    if (score >= 55) return { bar: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' };
    return               { bar: 'bg-rose-500',   text: 'text-rose-700',   bg: 'bg-rose-50',    border: 'border-rose-200' };
};

const AlignmentHeatmap = ({ onSelect, motions }) => {
    const councillors = useMemo(() => {
        const voteCounts = {};
        motions.forEach(m => {
            if (!m.votes) return;
            Object.keys(m.votes).forEach(name => {
                voteCounts[name] = (voteCounts[name] || 0) + 1;
            });
        });
        return Object.entries(voteCounts)
            .filter(([, count]) => count >= 5)
            .map(([name]) => name)
            .sort((a, b) => a.split(' ').at(-1).localeCompare(b.split(' ').at(-1)));
    }, [motions]);

    const scored = useMemo(() =>
        councillors
            .map(c => ({ name: c, score: getMemberAlignmentScore(motions, c) }))
            .sort((a, b) => b.score - a.score),
        [councillors, motions]
    );

    return (
        <div className="councillor-alignment-grid">
            {scored.map(({ name, score }) => {
                const style = scoreStyle(score);
                return (
                    <div
                        key={name}
                        onClick={() => onSelect(name)}
                        title={name}
                        className={`p-3 border rounded-lg cursor-pointer transition-all active:scale-95 hover:shadow-md hover:border-[#004a99] group ${style.border} ${style.bg}`}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] text-slate-600 font-bold uppercase group-hover:text-[#004a99] truncate pr-1">
                                {name.split(' ').at(-1)}
                            </p>
                            <span className={`text-[11px] font-mono font-black shrink-0 ${style.text}`}>{score}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/60 rounded-full overflow-hidden border border-white/40">
                            <div className={`h-full rounded-full transition-all ${style.bar}`} style={{ width: `${score}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AlignmentHeatmap;
