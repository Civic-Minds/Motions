import React, { useState, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { TOPIC_BADGE, FLAG_STYLES, FLAG_LABELS, FLAG_FILTER_STYLES } from '../constants/data';

const RANK_STYLES = [
    'text-amber-500',
    'text-slate-400',
    'text-orange-400',
];

const LIMIT = 50;

const ContestBoard = ({ motions }) => {
    const [flagFilter, setFlagFilter] = useState(null);

    const availableFlags = useMemo(() => {
        const flagCounts = {};
        motions.filter(m => !m.trivial).forEach(m => {
            (m.flags || []).forEach(f => {
                flagCounts[f] = (flagCounts[f] || 0) + 1;
            });
        });
        return Object.keys(FLAG_LABELS).filter(f => flagCounts[f] > 0);
    }, [motions]);

    const ranked = useMemo(() => {
        return motions
            .filter(m => {
                if (m.trivial) return false;
                if (flagFilter && !(m.flags || []).includes(flagFilter)) return false;
                return true;
            })
            .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0))
            .slice(0, LIMIT);
    }, [motions, flagFilter]);

    const maxScore = ranked[0]?.significance ?? 100;

    return (
        <div className="space-y-4">
            {/* Flag pills */}
            {availableFlags.length > 0 && (
                <div className="flex gap-2 flex-wrap items-center">
                    <span className="text-[9px] font-bold uppercase text-slate-300 tracking-widest pr-1">Filter</span>
                    {availableFlags.map(f => {
                        const isActive = flagFilter === f;
                        const styles = FLAG_FILTER_STYLES[f];
                        return (
                            <button
                                key={f}
                                onClick={() => setFlagFilter(isActive ? null : f)}
                                className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border transition-colors ${
                                    isActive ? styles.active : styles.inactive
                                }`}
                            >
                                {FLAG_LABELS[f]}
                            </button>
                        );
                    })}
                    {ranked.length > 0 && (
                        <span className="text-[9px] text-slate-300 font-bold ml-auto">{ranked.length} motions</span>
                    )}
                </div>
            )}

            {/* List */}
            <div className="space-y-2">
                {ranked.length === 0 && (
                    <div className="py-16 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                        No motions match these filters
                    </div>
                )}
                {ranked.map((m, i) => {
                    const vals = Object.values(m.votes || {});
                    const yes = vals.filter(v => v === 'YES').length;
                    const no  = vals.filter(v => v === 'NO').length;
                    const barWidth = maxScore > 0 ? Math.round((m.significance / maxScore) * 100) : 0;
                    const rankStyle = RANK_STYLES[i] ?? 'text-slate-200';

                    return (
                        <div key={m.id} className="group p-5 bg-white border border-slate-100 rounded-2xl hover:border-[#004a99] hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                            <div className="flex items-start gap-4">
                                {/* Rank */}
                                <div className="shrink-0 w-8 text-right pt-0.5">
                                    <span className={`text-xs font-black ${rankStyle}`}>#{i + 1}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border whitespace-nowrap ${TOPIC_BADGE[m.topic] || TOPIC_BADGE.General}`}>
                                            {m.topic}
                                        </span>
                                        {(m.flags || []).map(f => (
                                            <span key={f} className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border whitespace-nowrap ${FLAG_STYLES[f] || ''}`}>
                                                {FLAG_LABELS[f] || f}
                                            </span>
                                        ))}
                                        <span className="text-[9px] font-mono text-slate-300">{m.id}</span>
                                    </div>

                                    <p className="font-bold text-slate-800 text-sm leading-snug group-hover:text-[#004a99] transition-colors">
                                        {m.title}
                                    </p>

                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="text-[10px] text-slate-400 font-bold">{m.date}</span>
                                        {yes + no > 0 && (
                                            <span className="font-mono text-xs">
                                                <span className="text-emerald-600 font-bold">{yes}</span>
                                                <span className="text-slate-300 mx-1">–</span>
                                                <span className="text-rose-500 font-bold">{no}</span>
                                            </span>
                                        )}
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            m.status === 'Adopted'  ? 'bg-green-100 text-green-700' :
                                            m.status === 'Defeated' ? 'bg-rose-50 text-rose-600' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {m.status}
                                        </span>
                                        {m.mover && (
                                            <span className="text-[10px] text-slate-400 truncate hidden sm:block">
                                                {m.mover}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Significance */}
                                <div className="shrink-0 w-20 text-right">
                                    <div className="text-lg font-black text-[#004a99]">{m.significance}</div>
                                    <div className="text-[9px] text-slate-400 font-bold uppercase mb-1.5">sig</div>
                                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#004a99] transition-all" style={{ width: `${barWidth}%` }}></div>
                                    </div>
                                </div>

                                {/* Link */}
                                {m.url && (
                                    <a href={m.url} target="_blank" rel="noreferrer" className="shrink-0 text-slate-300 hover:text-[#004a99] transition-colors mt-0.5">
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ContestBoard;
