import { useMemo } from 'react';
import { getMemberAlignmentScore } from '../utils/analytics';

const AlignmentHeatmap = ({ onSelect, motions }) => {
    // Derive councillor list from actual vote data — anyone with ≥5 recorded votes
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
            {scored.map(({ name, score }, i) => (
                <div
                    key={i}
                    onClick={() => onSelect(name)}
                    className="p-3 border border-[#e2e8f0] rounded-lg bg-slate-50/50 hover:border-[#004a99] cursor-pointer transition-all active:scale-95 group"
                >
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] text-[#64748b] font-bold uppercase group-hover:text-[#004a99] truncate pr-1">
                            {name.split(' ').at(-1)}
                        </p>
                        <span className="text-[10px] font-mono font-bold text-[#004a99] shrink-0">{score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#cbd5e1] rounded-full overflow-hidden">
                        <div className="h-full bg-[#004a99]" style={{ width: `${score}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AlignmentHeatmap;
