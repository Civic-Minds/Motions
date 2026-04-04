import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ExternalLink, ArrowRight, FileText } from 'lucide-react';
import { TOPIC_PILL } from '../constants/data';

// Extracts motion IDs referenced in text, e.g. "2024.EX15.3" or "EX15.3"
const REF_PATTERN = /\b(?:\d{4}\.)?([A-Z]{2,4}\d+\.\d+)\b/g;

// Derives the meeting-level agenda URL from a motion ID and date
// e.g. id="MPB38.1", date="Feb 10, 2026" → https://secure.toronto.ca/council/agenda.do?meeting=2026.MPB38
function meetingUrl(id, date) {
    const year = new Date(date).getFullYear();
    const meetingCode = id.replace(/\.\d+$/, ''); // strip item number
    return `https://secure.toronto.ca/council/agenda.do?meeting=${year}.${meetingCode}`;
}

function parseReferences(title) {
    const ids = [];
    let match;
    const re = new RegExp(REF_PATTERN.source, 'g');
    while ((match = re.exec(title)) !== null) {
        ids.push(match[1]);
    }
    return [...new Set(ids)];
}

const MotionLink = ({ motion }) => {
    const isAdopted = motion.status === 'Adopted' || motion.status?.includes('Carried');
    const isDefeated = motion.status === 'Defeated';
    return (
        <Link
            to={`/motions/${motion.id}`}
            className="flex items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-[#004a99]/30 hover:bg-white hover:shadow-sm transition-all group"
        >
            <div className="flex items-center gap-3 min-w-0">
                <span className="text-[9px] font-mono font-bold text-slate-400 shrink-0">{motion.id}</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shrink-0 ${TOPIC_PILL[motion.topic] || TOPIC_PILL.General}`}>
                    {motion.topic}
                </span>
                <p className="text-[11px] font-bold text-slate-700 truncate group-hover:text-[#004a99] transition-colors">
                    {motion.title}
                </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[9px] font-black ${isAdopted ? 'text-emerald-500' : isDefeated ? 'text-rose-500' : 'text-slate-400'}`}>
                    {motion.status}
                </span>
                <ArrowRight size={12} className="text-slate-300 group-hover:text-[#004a99] transition-colors" />
            </div>
        </Link>
    );
};

const VoteGroup = ({ label, names, color, bg }) => {
    if (!names.length) return null;
    return (
        <div>
            <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${color}`}>{label} — {names.length}</p>
            <div className="flex flex-wrap gap-2">
                {names.map(name => (
                    <span key={name} className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border ${bg}`}>
                        {name}
                    </span>
                ))}
            </div>
        </div>
    );
};

const MotionDetail = ({ motions }) => {
    const { motionId } = useParams();
    const navigate = useNavigate();

    const motionIndex = useMemo(() => {
        const idx = {};
        motions.forEach(m => { idx[m.id] = m; });
        return idx;
    }, [motions]);

    const motion = motionIndex[motionId];

    const references = useMemo(() => {
        if (!motion) return [];
        return parseReferences(motion.title)
            .filter(id => id !== motion.id && motionIndex[id])
            .map(id => motionIndex[id]);
    }, [motion, motionIndex]);

    const referencedBy = useMemo(() => {
        if (!motion) return [];
        return motions.filter(m => {
            if (m.id === motion.id) return false;
            return parseReferences(m.title).includes(motion.id);
        });
    }, [motion, motions]);

    if (!motion) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <p className="text-slate-400 font-bold text-sm">Motion not found.</p>
                <Link to="/" className="text-[#004a99] text-xs font-black uppercase tracking-widest hover:underline">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const isAdopted = motion.status === 'Adopted' || motion.status?.includes('Carried');
    const isDefeated = motion.status === 'Defeated';

    const yesVoters = [];
    const noVoters = [];
    const absentVoters = [];
    if (motion.votes) {
        Object.entries(motion.votes).forEach(([name, vote]) => {
            if (vote === 'YES') yesVoters.push(name);
            else if (vote === 'NO') noVoters.push(name);
            else absentVoters.push(name);
        });
    }

    const total = yesVoters.length + noVoters.length;
    const yesPct = total > 0 ? Math.round((yesVoters.length / total) * 100) : 0;

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-24">
            {/* Back */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-[#004a99] transition-colors"
            >
                <ChevronLeft size={14} strokeWidth={3} /> Back
            </button>

            {/* Header */}
            <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${TOPIC_PILL[motion.topic] || TOPIC_PILL.General}`}>
                            {motion.topic}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-slate-400">{motion.id}</span>
                        {motion.significance > 15 && (
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg uppercase tracking-wide">
                                High Impact · {motion.significance}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <a
                            href={meetingUrl(motion.id, motion.date)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-[#004a99] transition-colors"
                        >
                            <FileText size={13} /> Meeting Minutes
                        </a>
                        {motion.url && (
                            <a
                                href={motion.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-[#004a99] transition-colors"
                            >
                                <ExternalLink size={13} /> Agenda Item
                            </a>
                        )}
                    </div>
                </div>

                <h1 className="text-xl font-black text-slate-900 leading-snug tracking-tight mb-5">
                    {motion.title}
                </h1>

                <div className="flex flex-wrap gap-6 text-center">
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date</p>
                        <p className="text-sm font-black text-slate-800">{motion.date}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Outcome</p>
                        <p className={`text-sm font-black ${isAdopted ? 'text-emerald-500' : isDefeated ? 'text-rose-500' : 'text-slate-400'}`}>
                            {motion.status}
                        </p>
                    </div>
                    {motion.mover && (
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mover</p>
                            <p className="text-sm font-black text-slate-800">{motion.mover}</p>
                        </div>
                    )}
                    {motion.seconder && (
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Seconder</p>
                            <p className="text-sm font-black text-slate-800">{motion.seconder}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* References this motion makes */}
            {references.length > 0 && (
                <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm space-y-3">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">References</h2>
                    {references.map(m => <MotionLink key={m.id} motion={m} />)}
                </div>
            )}

            {/* Motions that reference this one */}
            {referencedBy.length > 0 && (
                <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm space-y-3">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Referenced By</h2>
                    {referencedBy.map(m => <MotionLink key={m.id} motion={m} />)}
                </div>
            )}

            {/* Vote breakdown */}
            {total > 0 && (
                <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm space-y-6">
                    <div>
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Vote Record</h2>
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-[11px] font-bold text-slate-400">{yesVoters.length} YES · {noVoters.length} NO</span>
                            <span className="text-[11px] font-black text-slate-700">{yesPct}% in favour</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-400 transition-all duration-700" style={{ width: `${yesPct}%` }} />
                            <div className="h-full bg-rose-400 transition-all duration-700" style={{ width: `${100 - yesPct}%` }} />
                        </div>
                    </div>

                    <VoteGroup label="Yes" names={yesVoters.sort()} color="text-emerald-600" bg="bg-emerald-50 border-emerald-100 text-emerald-800" />
                    <VoteGroup label="No" names={noVoters.sort()} color="text-rose-500" bg="bg-rose-50 border-rose-100 text-rose-800" />
                    <VoteGroup label="Absent" names={absentVoters.sort()} color="text-slate-400" bg="bg-slate-50 border-slate-100 text-slate-500" />
                </div>
            )}
        </div>
    );
};

export default MotionDetail;
