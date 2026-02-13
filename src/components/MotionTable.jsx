import React from 'react';
import { Filter, ExternalLink } from 'lucide-react';

const MotionTable = ({ motions }) => {
    return (
        <div className="card">
            <div className="card-title">
                RECENT MOTIONS
                <Filter size={18} className="text-slate-400 cursor-pointer" />
            </div>
            <table className="motion-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Motion Title</th>
                        <th>Mover / Seconder</th>
                        <th>Status</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {motions.map((m, i) => (
                        <tr key={i}>
                            <td className="font-mono text-[10px] text-slate-500">{m.id}</td>
                            <td className="font-semibold text-slate-800">
                                <div className="flex items-center gap-2">
                                    {m.title}
                                    {m.trivial && (
                                        <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-bold uppercase">
                                            Minor
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
                            <td>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${m.status === 'Adopted' || m.status.includes('Carried')
                                        ? 'bg-green-100 text-green-700'
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
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MotionTable;
