import React, { useState } from 'react';

const TOPIC_STYLES = {
    Housing:   'border-blue-400 text-blue-700 bg-blue-50',
    Transit:   'border-red-400 text-red-600 bg-red-50',
    Finance:   'border-emerald-400 text-emerald-700 bg-emerald-50',
    Parks:     'border-green-400 text-green-700 bg-green-50',
    Events:    'border-purple-400 text-purple-700 bg-purple-50',
    Climate:   'border-teal-400 text-teal-700 bg-teal-50',
    General:   'border-slate-300 text-slate-500 bg-slate-50',
};

const PAGE_SIZE = 100;

const DataModule = ({ motions }) => {
    const [page, setPage] = useState(1);
    const visible = motions.slice(0, page * PAGE_SIZE);
    const hasMore = visible.length < motions.length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black italic tracking-tight text-slate-800">Open Data</h1>
                <p className="text-slate-400 font-bold text-[10px] mt-1">
                    {motions.length} Motions • City of Toronto
                </p>
            </div>

            <div className="card">


                <table className="motion-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Title</th>
                            <th>Topic</th>
                            <th>Mover</th>
                            <th>Ward</th>
                            <th>Vote</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {motions.length > 0 && visible.map(m => {
                            const voteVals = m.votes ? Object.values(m.votes) : [];
                            const yes = voteVals.filter(v => v === 'YES').length;
                            const no = voteVals.filter(v => v === 'NO').length;
                            return (
                                <tr key={m.id}>
                                    <td className="font-mono text-[10px] text-slate-400 whitespace-nowrap">{m.id}</td>
                                    <td className="text-slate-500 whitespace-nowrap text-xs">{m.date}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-slate-900 text-sm">{m.title}</p>
                                            {m.trivial && (
                                                <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">Minor</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border whitespace-nowrap ${TOPIC_STYLES[m.topic] || TOPIC_STYLES.General}`}>
                                            {m.topic}
                                        </span>
                                    </td>
                                    <td className="text-xs text-[#004a99] font-bold whitespace-nowrap">{m.mover}</td>
                                    <td className="text-xs text-slate-500 whitespace-nowrap">{m.ward === 'City' ? 'City-wide' : `Ward ${m.ward}`}</td>
                                    <td className="whitespace-nowrap">
                                        {voteVals.length > 0 && (
                                            <span className="font-mono text-xs">
                                                <span className="text-emerald-600 font-bold">{yes}</span>
                                                <span className="text-slate-300 mx-1">–</span>
                                                <span className="text-rose-500 font-bold">{no}</span>
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                                            m.status === 'Adopted' || m.status.includes('Carried')
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {m.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {motions.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-8 text-slate-400 italic">
                                    No motions found in database
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {hasMore && (
                    <div className="px-4 py-3 border-t border-slate-100 text-center">
                        <button
                            onClick={() => setPage(p => p + 1)}
                            className="text-[11px] font-bold text-[#004a99] hover:underline"
                        >
                            Show more ({motions.length - visible.length} remaining)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataModule;
