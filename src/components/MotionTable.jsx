import React, { useState, useMemo } from 'react';
import { Filter, ExternalLink, X } from 'lucide-react';

const PAGE_SIZE = 50;

const MotionTable = ({ motions }) => {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [hideMinor, setHideMinor] = useState(false);
    const [notableOnly, setNotableOnly] = useState(false);
    const [sortBy, setSortBy] = useState('recent');
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        setPage(1);
        let result = motions.filter(m => {
            if (hideMinor && m.trivial) return false;
            if (notableOnly && (!m.flags || m.flags.length === 0)) return false;
            if (statusFilter === 'adopted' && m.status !== 'Adopted' && !m.status.includes('Carried')) return false;
            if (statusFilter === 'other' && (m.status === 'Adopted' || m.status.includes('Carried'))) return false;
            if (search) {
                const q = search.toLowerCase();
                return m.title.toLowerCase().includes(q) || (m.mover || '').toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
            }
            return true;
        });

        if (sortBy === 'significance') {
            result = [...result].sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0));
        }
        // 'recent' preserves the default newest-first order from motions.json

        return result;
    }, [motions, search, statusFilter, hideMinor, notableOnly, sortBy]);

    const visible = filtered.slice(0, page * PAGE_SIZE);
    const hasMore = visible.length < filtered.length;

    const hasActiveFilters = search || statusFilter !== 'all' || hideMinor || notableOnly || sortBy !== 'recent';

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setHideMinor(false);
        setNotableOnly(false);
        setSortBy('recent');
    };

    return (
        <div className="card">
            <div className="card-title">
                MOTIONS
                <div className="flex items-center gap-2 ml-auto">
                    {hasActiveFilters && (
                        <span className="text-[10px] text-slate-500">
                            {filtered.length} of {motions.length}
                        </span>
                    )}
                    <button
                        onClick={() => setFiltersOpen(o => !o)}
                        className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded transition-colors ${filtersOpen || hasActiveFilters ? 'bg-[#004a99] text-white' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                        <Filter size={12} />
                        Filter
                        {hasActiveFilters && (
                            <span className="ml-1 bg-white text-[#004a99] rounded-full w-4 h-4 flex items-center justify-center text-[9px]">
                                {[search, statusFilter !== 'all', hideMinor, notableOnly, sortBy !== 'recent'].filter(Boolean).length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {filtersOpen && (
                <div className="px-4 pb-3 pt-1 border-b border-slate-100 flex flex-wrap gap-3 items-center">
                    <input
                        type="text"
                        placeholder="Search title, mover, ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="text-[11px] border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#004a99] w-52"
                    />

                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="text-[11px] border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none focus:border-[#004a99]"
                    >
                        <option value="all">All statuses</option>
                        <option value="adopted">Adopted</option>
                        <option value="other">Defeated / Referred</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="text-[11px] border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none focus:border-[#004a99]"
                    >
                        <option value="recent">Sort: Recent</option>
                        <option value="significance">Sort: Most Significant</option>
                    </select>

                    <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
                        <input type="checkbox" checked={hideMinor} onChange={e => setHideMinor(e.target.checked)} className="accent-[#004a99]" />
                        Hide minor
                    </label>

                    <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
                        <input type="checkbox" checked={notableOnly} onChange={e => setNotableOnly(e.target.checked)} className="accent-[#004a99]" />
                        Notable only
                    </label>

                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 ml-auto">
                            <X size={11} /> Clear
                        </button>
                    )}
                </div>
            )}

            <table className="motion-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Motion Title</th>
                        <th>Mover / Seconder</th>
                        <th>Vote</th>
                        <th>Status</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {visible.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center text-slate-400 text-[11px] py-6">
                                No motions match the current filters.
                            </td>
                        </tr>
                    ) : (
                        visible.map((m, i) => (
                            <tr key={i}>
                                <td>
                                    <div className="font-mono text-[10px] text-slate-500">{m.id}</div>
                                    {m.significance != null && (
                                        <div className="text-[9px] text-slate-300 font-bold mt-0.5">{m.significance}</div>
                                    )}
                                </td>
                                <td className="font-semibold text-slate-800">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {m.title}
                                        {m.trivial && (
                                            <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-bold uppercase whitespace-nowrap">
                                                Minor
                                            </span>
                                        )}
                                        {m.flags?.includes('close-vote') && (
                                            <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded font-bold uppercase whitespace-nowrap">
                                                Close
                                            </span>
                                        )}
                                        {m.flags?.includes('landslide-defeat') && (
                                            <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded font-bold uppercase whitespace-nowrap">
                                                Crushed
                                            </span>
                                        )}
                                        {m.flags?.includes('unanimous') && (
                                            <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded font-bold uppercase whitespace-nowrap">
                                                Unanimous
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="text-[11px] font-bold text-[#004a99] uppercase">{m.mover}</div>
                                    {m.seconder && (
                                        <div className="text-[10px] text-slate-500 italic">Seconded by {m.seconder}</div>
                                    )}
                                </td>
                                <td className="whitespace-nowrap">
                                    {m.votes && (() => {
                                        const vals = Object.values(m.votes);
                                        const yes = vals.filter(v => v === 'YES').length;
                                        const no = vals.filter(v => v === 'NO').length;
                                        return (
                                            <span className="font-mono text-xs">
                                                <span className="text-emerald-600 font-bold">{yes}</span>
                                                <span className="text-slate-300 mx-1">–</span>
                                                <span className="text-rose-500 font-bold">{no}</span>
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                        m.status === 'Adopted' || m.status.includes('Carried')
                                            ? 'bg-green-100 text-green-700'
                                            : m.status === 'Defeated'
                                                ? 'bg-rose-50 text-rose-600'
                                                : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {m.status}
                                    </span>
                                </td>
                                <td>
                                    {m.url && (
                                        <a href={m.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#004a99]">
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </td>
                            </tr>
                        ))
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
    );
};

export default MotionTable;
