import React, { useMemo, useState } from 'react';
import { getPairwiseAlignment } from '../utils/analytics';

function pctToColor(pct) {
    if (pct === null) return { bg: 'bg-slate-50', text: 'text-slate-200' };
    if (pct >= 90) return { bg: 'bg-emerald-500', text: 'text-white' };
    if (pct >= 80) return { bg: 'bg-emerald-400', text: 'text-white' };
    if (pct >= 70) return { bg: 'bg-emerald-200', text: 'text-emerald-900' };
    if (pct >= 60) return { bg: 'bg-amber-100', text: 'text-amber-800' };
    if (pct >= 50) return { bg: 'bg-orange-200', text: 'text-orange-900' };
    return { bg: 'bg-rose-300', text: 'text-rose-900' };
}

const AlignmentMatrix = ({ motions }) => {
    const [hovered, setHovered] = useState(null); // { row, col }

    const { names, matrix } = useMemo(() => getPairwiseAlignment(motions), [motions]);

    const shortName = (name) => name.split(' ').at(-1);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 font-mono">Pairwise Alignment Matrix</h4>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                        Agreement % on shared non-trivial votes · {names.length} councillors
                    </p>
                </div>
                <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
                    <div className="flex gap-0.5 items-center">
                        <div className="w-3 h-3 rounded bg-rose-300" />
                        <span className="mx-1">Low</span>
                        <div className="w-3 h-3 rounded bg-amber-100" />
                        <div className="w-3 h-3 rounded bg-emerald-200" />
                        <div className="w-3 h-3 rounded bg-emerald-500" />
                        <span className="ml-1">High</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="inline-grid" style={{ gridTemplateColumns: `80px repeat(${names.length}, 28px)`, gap: '2px' }}>
                    {/* Header row — rotated column labels */}
                    <div />
                    {names.map((name, j) => (
                        <div
                            key={j}
                            className={`flex items-end justify-center pb-1 transition-opacity ${hovered && hovered.col !== j ? 'opacity-30' : ''}`}
                            style={{ height: '72px' }}
                        >
                            <span
                                className="text-[8px] font-black text-slate-500 uppercase tracking-wide whitespace-nowrap"
                                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                            >
                                {shortName(name)}
                            </span>
                        </div>
                    ))}

                    {/* Data rows */}
                    {names.map((rowName, i) => (
                        <React.Fragment key={i}>
                            {/* Row label */}
                            <div
                                className={`flex items-center pr-2 transition-opacity ${hovered && hovered.row !== i ? 'opacity-30' : ''}`}
                            >
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight truncate">
                                    {shortName(rowName)}
                                </span>
                            </div>

                            {/* Cells */}
                            {names.map((colName, j) => {
                                const pct = matrix[i][j];
                                const { bg, text } = pctToColor(pct);
                                const isSelf = i === j;
                                const isHighlighted = !hovered || (hovered.row === i || hovered.col === j);

                                return (
                                    <div
                                        key={j}
                                        onMouseEnter={() => !isSelf && setHovered({ row: i, col: j })}
                                        onMouseLeave={() => setHovered(null)}
                                        title={isSelf ? rowName : `${rowName} ↔ ${colName}: ${pct ?? '—'}%`}
                                        className={`
                                            w-7 h-7 rounded flex items-center justify-center cursor-default
                                            transition-all duration-150
                                            ${isSelf ? 'bg-slate-900' : bg}
                                            ${!isHighlighted ? 'opacity-20' : ''}
                                            ${hovered?.row === i && hovered?.col === j ? 'scale-125 z-10 relative shadow-lg' : ''}
                                        `}
                                    >
                                        {!isSelf && pct !== null && (
                                            <span className={`text-[7px] font-black leading-none ${text}`}>
                                                {pct}
                                            </span>
                                        )}
                                        {isSelf && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Hover callout */}
            {hovered && matrix[hovered.row][hovered.col] !== null && (
                <div className="mt-4 p-3 bg-slate-900 rounded-xl inline-flex items-center gap-3">
                    <span className="text-[11px] font-black text-white">
                        {shortName(names[hovered.row])} ↔ {shortName(names[hovered.col])}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold">agree</span>
                    <span className={`text-[16px] font-black ${
                        matrix[hovered.row][hovered.col] >= 70 ? 'text-emerald-400' :
                        matrix[hovered.row][hovered.col] >= 50 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                        {matrix[hovered.row][hovered.col]}%
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold">of the time</span>
                </div>
            )}
        </div>
    );
};

export default AlignmentMatrix;
