import React, { useState, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';

const TOPIC_STYLES = {
    Housing:  'border-blue-400 text-blue-700 bg-blue-50',
    Transit:  'border-red-400 text-red-600 bg-red-50',
    Finance:  'border-emerald-400 text-emerald-700 bg-emerald-50',
    Parks:    'border-green-400 text-green-700 bg-green-50',
    Climate:  'border-teal-400 text-teal-700 bg-teal-50',
    Events:   'border-purple-400 text-purple-700 bg-purple-50',
    General:  'border-slate-300 text-slate-500 bg-slate-50',
};

const FLAG_STYLES = {
    'close-vote':       'bg-rose-50 text-rose-600 border-rose-200',
    'defeated':         'bg-slate-100 text-slate-500 border-slate-200',
    'unanimous':        'bg-emerald-50 text-emerald-600 border-emerald-200',
    'landslide-defeat': 'bg-slate-100 text-slate-400 border-slate-200',
};

const FLAG_LABELS = {
    'close-vote':       'Close Vote',
    'defeated':         'Defeated',
    'unanimous':        'Unanimous',
    'landslide-defeat': 'Crushed',
};

const FLAG_FILTER_STYLES = {
    'close-vote':       { active: 'bg-rose-600 text-white border-rose-600',       inactive: 'text-rose-600 border-rose-200 hover:border-rose-400 bg-rose-50/50' },
    'unanimous':        { active: 'bg-emerald-600 text-white border-emerald-600',  inactive: 'text-emerald-700 border-emerald-200 hover:border-emerald-400 bg-emerald-50/50' },
    'landslide-defeat': { active: 'bg-slate-500 text-white border-slate-500',      inactive: 'text-slate-500 border-slate-200 hover:border-slate-400 bg-slate-50' },
    'defeated':         { active: 'bg-slate-700 text-white border-slate-700',      inactive: 'text-slate-600 border-slate-200 hover:border-slate-400 bg-slate-50' },
};

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
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border whitespace-nowrap ${TOPIC_STYLES[m.topic] || TOPIC_STYLES.General}`}>
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
