import { COUNCILLORS } from '../constants/data';
import { getMemberAlignmentScore } from '../utils/analytics';

const AlignmentHeatmap = ({ onSelect, motions }) => {
    // Show a relevant subset of councillors for the dashboard view
    const displayCouncillors = COUNCILLORS.slice(0, 15);

    return (
        <div className="councillor-alignment-grid">
            {displayCouncillors.map((c, i) => {
                const score = getMemberAlignmentScore(motions, c);
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
