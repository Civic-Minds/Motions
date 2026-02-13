import { COUNCILLORS } from '../constants/data';

const AlignmentHeatmap = ({ onSelect, motions }) => {
    // Show a relevant subset of councillors for the dashboard view
    const displayCouncillors = COUNCILLORS.slice(0, 15);

    const getAlignmentScore = (name) => {
        const totalMotions = motions.filter(m => m.votes && m.votes[name]).length;
        if (totalMotions === 0) return 75;

        const consensusVotes = motions.filter(m => {
            if (!m.votes || !m.votes[name]) return false;
            // Consensus = voted with majority
            const yesCount = Object.values(m.votes).filter(v => v === 'YES').length;
            const majorityVote = yesCount > (Object.keys(m.votes).length / 2) ? 'YES' : 'NO';
            return m.votes[name] === majorityVote;
        }).length;

        return Math.floor((consensusVotes / totalMotions) * 100);
    };

    return (
        <div className="councillor-alignment-grid">
            {displayCouncillors.map((c, i) => {
                const score = getAlignmentScore(c);
                return (
                    <div
                        key={i}
                        onClick={() => onSelect(c)}
                        className="p-3 border border-[#e2e8f0] rounded-lg bg-slate-50/50 hover:border-[#004a99] cursor-pointer transition-all active:scale-95 group"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-[10px] text-[#64748b] font-bold uppercase group-hover:text-[#004a99]">{c.split(' ')[1] || c}</p>
                            <span className="text-[10px] font-mono font-bold text-[#004a99]">{score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#cbd5e1] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#004a99]"
                                style={{ width: `${score}%` }}
                            ></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AlignmentHeatmap;
