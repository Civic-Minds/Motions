import React from 'react';
import { ChevronRight } from 'lucide-react';

const ProfilePanel = ({ selected, onClose, onCompare, motions }) => {
    const isOpen = !!selected;

    // Calculate real DNA based on motions
    const getDNA = (name) => {
        const topics = ['Transit', 'Housing', 'Finance', 'Parks'];
        return topics.map(topic => {
            const topicMotions = motions.filter(m => m.topic === topic && m.votes && m.votes[name]);
            const total = topicMotions.length;
            const yes = topicMotions.filter(m => m.votes[name] === 'YES').length;
            const yesPercentage = total > 0 ? Math.floor((yes / total) * 100) : 60; // Default if no data

            let alignment = 'Standard';
            if (yesPercentage > 80) alignment = 'Champion';
            else if (yesPercentage < 30) alignment = 'Economic Caution';
            else if (yesPercentage > 60) alignment = 'Supporter';

            return { topic, yes: yesPercentage, no: 100 - yesPercentage, alignment };
        });
    };

    const currentDNA = getDNA(selected);

    const getStances = (name) => {
        return motions
            .filter(m => m.votes && m.votes[name])
            .slice(0, 4)
            .map(m => ({
                topic: m.topic,
                stance: m.votes[name],
                title: `${m.id}: ${m.title}`,
                date: m.date
            }));
    };

    return (
        <div className={`profile-panel ${isOpen ? 'open' : ''}`}>
            <div className="profile-header flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">Councillor<br />{selected || 'Profile'}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Toronto City Council • Ward Rep</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onCompare(selected)}
                        className="px-3 py-1.5 bg-toronto-blue text-white text-[10px] font-bold rounded-lg hover:bg-blue-800 transition-colors uppercase tracking-wider"
                    >
                        Versus Mode
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronRight size={20} className="text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="profile-content">
                <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Voting DNA</h3>
                    <div className="space-y-4">
                        {currentDNA.map((item, i) => (
                            <div key={i} className="dna-stat">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-[11px] font-bold text-slate-700">{item.topic}</span>
                                    <span className={`text-[10px] font-black ${item.yes > 50 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {item.yes}% SUPPORT
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-emerald-500" style={{ width: `${item.yes}%` }}></div>
                                    <div className="h-full bg-rose-500" style={{ width: `${item.no}%` }}></div>
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">Classified: {item.alignment}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Recent Voting Record</h3>
                    <div className="space-y-3">
                        {getStances(selected).map((item, i) => (
                            <div key={i} className="p-4 border border-slate-100 rounded-2xl hover:border-[#004a99] transition-all bg-white group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${item.topic === 'Housing' ? 'bg-blue-50 text-blue-600' :
                                        item.topic === 'Transit' ? 'bg-red-50 text-red-600' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>{item.topic}</span>
                                    <span className={`text-[10px] font-black ${item.stance === 'NO' ? 'text-rose-500 bg-rose-50' : 'text-emerald-600 bg-emerald-50'} px-2 py-0.5 rounded`}>
                                        {item.stance}
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-slate-700 leading-tight group-hover:text-[#004a99] transition-colors">{item.title}</p>
                                <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase">{item.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePanel;
