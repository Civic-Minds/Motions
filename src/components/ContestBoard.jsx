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
    'close-vote':       'Close',
    'defeated':         'Defeated',
    'unanimous':        'Unanimous',
    'landslide-defeat': 'Crushed',
};

const LIMIT = 50;

const ContestBoard = ({ motions }) => {
    const [topicFilter, setTopicFilter] = useState('all');

    const topics = useMemo(() => {
        const t = new Set(motions.map(m => m.topic).filter(Boolean));
        return ['all', ...['Housing', 'Transit', 'Finance', 'Parks', 'Climate', 'General'].filter(t.has.bind(t))];
    }, [motions]);

    const ranked = useMemo(() => {
        return motions
            .filter(m => !m.trivial && (topicFilter === 'all' || m.topic === topicFilter))
            .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0))
            .slice(0, LIMIT);
    }, [motions, topicFilter]);

    const maxScore = ranked[0]?.significance ?? 100;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight text-slate-800">MOST CONTESTED</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">
                        TOP {LIMIT} BY SIGNIFICANCE · 2022–2026 TERM
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                    {topics.map(t => (
                        <button
                            key={t}
                            onClick={() => setTopicFilter(t)}
                            className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border transition-colors ${
                                topicFilter === t
                                    ? 'bg-[#004a99] text-white border-[#004a99]'
                                    : 'text-slate-500 border-slate-200 hover:border-slate-400'
                            }`}
                        >
                            {t === 'all' ? 'All Topics' : t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {ranked.map((m, i) => {
                    const vals = Object.values(m.votes || {});
                    const yes = vals.filter(v => v === 'YES').length;
                    const no  = vals.filter(v => v === 'NO').length;
                    const barWidth = maxScore > 0 ? Math.round((m.significance / maxScore) * 100) : 0;

                    return (
                        <div key={m.id} className="group p-5 bg-white border border-slate-100 rounded-2xl hover:border-[#004a99] hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                            <div className="flex items-start gap-4">
                                {/* Rank */}
                                <div className="shrink-0 w-8 text-right">
                                    <span className="text-xs font-black text-slate-200">#{i + 1}</span>
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
                                            m.status === 'Adopted' ? 'bg-green-100 text-green-700' :
                                            m.status === 'Defeated' ? 'bg-rose-50 text-rose-600' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {m.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Significance bar */}
                                <div className="shrink-0 w-24 text-right">
                                    <div className="text-lg font-black text-[#004a99]">{m.significance}</div>
                                    <div className="text-[9px] text-slate-400 font-bold uppercase mb-1">sig score</div>
                                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#004a99]" style={{ width: `${barWidth}%` }}></div>
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
