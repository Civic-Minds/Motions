import React, { useState, useMemo } from 'react';
import { Search, Download } from 'lucide-react';

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
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        setPage(1);
        const s = search.toLowerCase();
        if (!s) return motions;
        return motions.filter(m =>
            m.title.toLowerCase().includes(s) ||
            m.id.toLowerCase().includes(s) ||
            (m.topic || '').toLowerCase().includes(s) ||
            (m.mover || '').toLowerCase().includes(s)
        );
    }, [search, motions]);

    const visible = filtered.slice(0, page * PAGE_SIZE);
    const hasMore = visible.length < filtered.length;

    const exportCSV = () => {
        const headers = ['ID', 'Date', 'Title', 'Topic', 'Mover', 'Seconder', 'Status', 'Ward', 'Trivial', 'URL'];
        const rows = motions.map(m => [
            m.id,
            m.date,
            `"${(m.title || '').replace(/"/g, '""')}"`,
            m.topic || '',
            `"${(m.mover || '').replace(/"/g, '""')}"`,
            `"${(m.seconder || '').replace(/"/g, '""')}"`,
            m.status,
            m.ward || '',
            m.trivial ? 'Yes' : 'No',
            m.url || '',
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'motions-toronto-council.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight text-slate-800">OPEN DATA</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">
                        {motions.length} MOTIONS • CITY OF TORONTO
                    </p>
                </div>
                <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-[#004a99] text-white rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors"
                >
                    <Download size={15} /> Download CSV
                </button>
            </div>

            <div className="card">
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search motions, topics, movers..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004a99] w-full"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    {search && (
                        <span className="absolute right-3 top-2.5 text-[11px] text-slate-400 font-bold">
                            {filtered.length} of {motions.length}
                        </span>
                    )}
                </div>

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
                        {filtered.length > 0 ? visible.map(m => {
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
                                                <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-bold uppercase whitespace-nowrap">Minor</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border whitespace-nowrap ${TOPIC_STYLES[m.topic] || TOPIC_STYLES.General}`}>
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
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${
                                            m.status === 'Adopted' || m.status.includes('Carried')
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {m.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={8} className="text-center py-8 text-slate-400 italic">
                                    No motions match "{search}"
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
                            Show more ({filtered.length - visible.length} remaining)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataModule;
