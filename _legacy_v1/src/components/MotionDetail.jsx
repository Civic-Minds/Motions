import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ExternalLink, ArrowRight, FileText, CheckCircle2, XCircle, Clock, Link as LinkIcon, User, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { TOPIC_PILL } from '../constants/data';
import { cn } from '../lib/utils';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

// Extracts motion IDs referenced in text, e.g. "2024.EX15.3" or "EX15.3"
const REF_PATTERN = /\b(?:\d{4}\.)?([A-Z]{2,4}\d+\.\d+)\b/g;

// Derives the meeting-level agenda URL from a motion ID and date
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

const MotionLink = ({ motion: m }) => {
    const isAdopted = m.status === 'Adopted' || m.status?.includes('Carried');
    const isDefeated = m.status === 'Defeated';
    return (
        <Link
            to={`/motions/${m.id}`}
            className="flex items-center justify-between gap-6 p-6 bg-white border border-slate-100 rounded-[28px] hover:border-[#004a99]/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group"
        >
            <div className="flex items-center gap-5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-white shadow-sm group-hover:bg-[#004a99]/5 group-hover:text-[#004a99] transition-all">
                    <FileText size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-3">
                         <span className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-tighter">ITEM {m.id}</span>
                         <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded-md", TOPIC_PILL[m.topic] || TOPIC_PILL.General)}>
                            {m.topic}
                        </span>
                    </div>
                    <p className="text-[14px] font-black text-slate-900 truncate group-hover:text-[#004a99] transition-colors mt-1">
                        {m.title}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
                <Badge className={cn("text-[9px] font-black uppercase tracking-tighter", isAdopted ? 'bg-emerald-50 text-emerald-600' : isDefeated ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400')}>
                    {m.status}
                </Badge>
                <ArrowRight size={16} className="text-slate-200 group-hover:text-[#004a99] group-hover:translate-x-1 transition-all" />
            </div>
        </Link>
    );
};

const VoteGroup = ({ label, names, color, bg, hoverBg, onSelect }) => {
    if (!names.length) return null;
    return (
        <div className="space-y-3">
            <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em] opacity-60", color)}>{label} &mdash; {names.length}</h4>
            <div className="flex flex-wrap gap-2.5">
                {names.map(name => (
                    <button
                        key={name}
                        onClick={() => onSelect?.(name)}
                        className={cn("text-[11px] font-bold px-4 py-2 rounded-2xl border-2 transition-all active:scale-95 shadow-sm", bg, hoverBg)}
                    >
                        {name}
                    </button>
                ))}
                {names.length === 0 && <span className="text-[11px] font-bold text-slate-300">None</span>}
            </div>
        </div>
    );
};

const MotionDetail = ({ motions, onSelect }) => {
    const { motionId } = useParams();
    const navigate = useNavigate();

    const motionIndex = useMemo(() => {
        const idx = {};
        motions.forEach(m => { idx[m.id] = m; });
        return idx;
    }, [motions]);

    const motionItem = motionIndex[motionId];

    const references = useMemo(() => {
        if (!motionItem) return [];
        return parseReferences(motionItem.title)
            .filter(id => id !== motionItem.id && motionIndex[id])
            .map(id => motionIndex[id]);
    }, [motionItem, motionIndex]);

    const referencedBy = useMemo(() => {
        if (!motionItem) return [];
        return motions.filter(m => {
            if (m.id === motionItem.id) return false;
            return parseReferences(m.title).includes(motionItem.id);
        });
    }, [motionItem, motions]);

    if (!motionItem) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-8">
                <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200">
                    <XCircle size={40} />
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight">Motion not found</h3>
                    <p className="text-slate-500 font-medium mt-2">The record may have been archived or deleted.</p>
                </div>
                <Link to="/" className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-[#004a99] transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    const isAdopted = motionItem.status === 'Adopted' || motionItem.status?.includes('Carried');
    const isDefeated = motionItem.status === 'Defeated';

    const yesVoters = [];
    const noVoters = [];
    const absentVoters = [];
    if (motionItem.votes) {
        Object.entries(motionItem.votes).forEach(([name, vote]) => {
            if (vote === 'YES') yesVoters.push(name);
            else if (vote === 'NO') noVoters.push(name);
            else absentVoters.push(name);
        });
    }

    const total = yesVoters.length + noVoters.length;
    const yesPct = total > 0 ? Math.round((yesVoters.length / total) * 100) : 0;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1000px] mx-auto space-y-12 pb-24"
        >
            {/* Navigation Header */}
            <div className="flex items-center justify-between px-2">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#004a99] transition-all"
                >
                    <div className="w-9 h-9 rounded-xl border-2 border-slate-100 flex items-center justify-center group-hover:border-[#004a99]/30 transition-all">
                        <ChevronLeft size={18} strokeWidth={3} className="text-slate-300 group-hover:text-[#004a99]" />
                    </div>
                    Navigate Back
                </button>

                <div className="flex items-center gap-3">
                    <a
                        href={meetingUrl(motionItem.id, motionItem.date)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-slate-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-[#004a99]/30 hover:text-[#004a99] hover:shadow-xl transition-all group/link"
                    >
                        <FileText size={14} className="text-slate-300 group-hover/link:text-[#004a99]" /> Minutes
                    </a>
                    {motionItem.url && (
                        <a
                            href={motionItem.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2.5 px-5 py-2.5 bg-[#004a99] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#002d5c] shadow-lg shadow-blue-900/10 hover:shadow-blue-900/30 transition-all active:scale-95 group/link"
                        >
                            <ExternalLink size={14} className="text-white/70" /> Agenda Item
                        </a>
                    )}
                </div>
            </div>

            {/* Core Details Header */}
            <Card className="rounded-[40px] overflow-hidden border-2 border-slate-100 shadow-2xl shadow-slate-900/5">
                <CardContent className="p-10 sm:p-14 space-y-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Badge className={cn("text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border shadow-sm", TOPIC_PILL[motionItem.topic] || TOPIC_PILL.General)}>
                                {motionItem.topic}
                            </Badge>
                            <span className="text-[11px] font-mono font-black text-slate-300 uppercase tracking-widest">RECORD {motionItem.id}</span>
                            {motionItem.significance > 50 && (
                                <Badge className="bg-amber-50 text-amber-600 border border-amber-100 font-black text-[10px] px-3 py-1 rounded-lg flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    HIGH IMPACT RECORD
                                </Badge>
                            )}
                        </div>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-display font-black text-slate-900 leading-[1.2] tracking-tight">
                        {motionItem.title}
                    </h1>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-10 border-t border-slate-50">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[#004a99]">
                                <Clock size={14} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Decision Date</span>
                            </div>
                            <p className="text-xl font-display font-black text-slate-900">{motionItem.date}</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                {isAdopted ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-rose-500" />}
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Meeting Outcome</span>
                            </div>
                            <p className={cn("text-xl font-display font-black uppercase tracking-tighter", isAdopted ? 'text-emerald-500' : isDefeated ? 'text-rose-500' : 'text-slate-400')}>
                                {motionItem.status}
                            </p>
                        </div>
                        {motionItem.mover && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <User size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Mover</span>
                                </div>
                                <button onClick={() => onSelect?.(motionItem.mover)} className="text-xl font-display font-black text-slate-900 hover:text-[#004a99] transition-colors text-left leading-none">
                                    {motionItem.mover}
                                </button>
                            </div>
                        )}
                        {motionItem.seconder && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Users size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Seconder</span>
                                </div>
                                <button onClick={() => onSelect?.(motionItem.seconder)} className="text-xl font-display font-black text-slate-900 hover:text-[#004a99] transition-colors text-left leading-none">
                                    {motionItem.seconder}
                                </button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Voting Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Main Vote Record */}
                <div className="lg:col-span-3">
                   <Card className="rounded-[40px] border-2 border-slate-100 shadow-xl shadow-slate-900/5 bg-white h-full">
                        <CardContent className="p-10 sm:p-12 space-y-10">
                            <div>
                                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-4">
                                    Unified Voting Record <div className="h-px bg-slate-100 flex-1" />
                                </h3>
                                
                                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Aggregate Split</p>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-6xl font-display font-black text-slate-900 tracking-tighter">{yesVoters.length}</span>
                                            <span className="text-xl font-black text-slate-300 uppercase">/</span>
                                            <span className="text-4xl font-display font-black text-slate-400 tracking-tighter">{noVoters.length}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={cn("text-4xl font-display font-black tracking-tighter", yesPct >= 50 ? 'text-emerald-500' : 'text-rose-500')}>{yesPct}% Consensus</span>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total favorability</p>
                                    </div>
                                </div>

                                <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden flex border-2 border-white shadow-inner">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${yesPct}%` }}
                                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                        className="h-full bg-emerald-500 shadow-xl shadow-emerald-500/20" 
                                    />
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${100 - yesPct}%` }}
                                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                        className="h-full bg-rose-500 shadow-xl shadow-rose-500/20" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-10">
                                <VoteGroup label="In Favor (Adopted)" names={yesVoters.sort()} color="text-emerald-600" bg="bg-emerald-50 border-white text-emerald-800" hoverBg="hover:bg-emerald-600 hover:text-white" onSelect={onSelect} />
                                <VoteGroup label="Opposition" names={noVoters.sort()} color="text-rose-500" bg="bg-rose-50 border-white text-rose-800" hoverBg="hover:bg-rose-600 hover:text-white" onSelect={onSelect} />
                                <VoteGroup label="Absent / Not Recorded" names={absentVoters.sort()} color="text-slate-400" bg="bg-slate-50 border-white text-slate-500" hoverBg="hover:bg-slate-900 hover:text-white" onSelect={onSelect} />
                            </div>
                        </CardContent>
                   </Card>
                </div>

                {/* Relational Linkages */}
                <div className="lg:col-span-2 space-y-8">
                    {references.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4">
                                Linked Records <LinkIcon size={14} className="opacity-50" />
                            </h3>
                            <div className="space-y-4">
                                {references.map(m => <MotionLink key={m.id} motion={m} />)}
                            </div>
                        </div>
                    )}

                    {referencedBy.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4">
                                Derivative Work <Layers size={14} className="opacity-50" />
                            </h3>
                            <div className="space-y-4">
                                {referencedBy.map(m => <MotionLink key={m.id} motion={m} />)}
                            </div>
                        </div>
                    )}

                    {!references.length && !referencedBy.length && (
                        <Card className="rounded-[40px] bg-slate-50 border-2 border-white p-12 text-center h-fit">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                                <LinkIcon size={24} className="text-slate-200" />
                            </div>
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-3">Isolated Record</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter leading-relaxed">This motion has no <br /> documented relational linkages.</p>
                        </Card>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MotionDetail;
