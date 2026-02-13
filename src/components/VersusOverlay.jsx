import { ChevronRight } from 'lucide-react';

const VersusOverlay = ({ selection, onClose, motions }) => {
    if (selection.length < 2) return null;
    const [c1, c2] = selection;

    // Calculate real divergence from motions
    const divergence = motions
        .filter(m => m.votes && m.votes[c1] !== m.votes[c2])
        .map(m => ({
            id: m.id,
            title: m.title,
            topic: m.topic,
            c1: m.votes[c1],
            c2: m.votes[c2]
        }));

    // Calculate alignment score
    const totalVotes = motions.filter(m => m.votes && m.votes[c1] && m.votes[c2]).length;
    const sharedVotes = motions.filter(m => m.votes && m.votes[c1] === m.votes[c2]).length;
    const alignmentScore = totalVotes > 0 ? Math.floor((sharedVotes / totalVotes) * 100) : 100;

    return (
        <div className="versus-overlay open">
            <div className="versus-header">
                <div className="flex justify-between items-center px-8 py-6 bg-white border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold italic tracking-tight">VOTER DIVERGENCE</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{c1} VS {c2} • {alignmentScore}% ALIGNMENT</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight size={24} /></button>
                </div>
            </div>

            <div className="versus-content p-8">
                <div className="grid grid-cols-2 gap-8 mb-12">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{c1} DNA</h3>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500" style={{ width: '70%' }}></div>
                            <div className="h-full bg-rose-500" style={{ width: '30%' }}></div>
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-bold">
                            <span className="text-emerald-600">YES (70%)</span>
                            <span className="text-rose-600">NO (30%)</span>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{c2} DNA</h3>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500" style={{ width: '45%' }}></div>
                            <div className="h-full bg-rose-500" style={{ width: '55%' }}></div>
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-bold">
                            <span className="text-emerald-600">YES (45%)</span>
                            <span className="text-rose-600">NO (55%)</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black text-[#004a99] uppercase tracking-widest">Divergence Points</h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{divergence.length} MATCHES</span>
                </div>

                <div className="space-y-4">
                    {divergence.length > 0 ? divergence.map((item, i) => (
                        <div key={i} className="group p-5 border border-slate-100 rounded-2xl bg-white hover:border-[#004a99] transition-all hover:shadow-xl hover:shadow-slate-200/50">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${item.topic === 'Housing' ? 'border-toronto-blue text-toronto-blue bg-blue-50' :
                                            item.topic === 'Transit' ? 'border-red-500 text-red-500 bg-red-50' :
                                                'border-slate-400 text-slate-500 bg-slate-50'
                                            }`}>{item.topic}</span>
                                        <span className="text-[10px] font-mono font-bold text-slate-400">{item.id}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-[#004a99] transition-colors">{item.title}</p>
                                </div>
                                <div className="flex items-center gap-3 pl-8">
                                    <div className="text-center w-12 p-3 bg-slate-50 rounded-xl">
                                        <p className="text-[8px] text-slate-400 font-bold mb-1">{c1.split(' ')[1] || c1}</p>
                                        <span className={`text-xs font-black ${item.c1 === 'YES' ? 'text-emerald-600' : 'text-rose-500'}`}>{item.c1}</span>
                                    </div>
                                    <div className="w-px h-6 bg-slate-200"></div>
                                    <div className="text-center w-12 p-3 bg-slate-50 rounded-xl">
                                        <p className="text-[8px] text-slate-400 font-bold mb-1">{c2.split(' ')[1] || c2}</p>
                                        <span className={`text-xs font-black ${item.c2 === 'YES' ? 'text-emerald-600' : 'text-rose-500'}`}>{item.c2}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold">100% UNANIMOUS ON ALL RECENT MOTIONS</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VersusOverlay;
