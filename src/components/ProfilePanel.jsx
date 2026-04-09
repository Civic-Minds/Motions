import React, { useMemo, useState, useEffect } from 'react';
import { X, GitCompare, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAttendance, getVotedWith } from '../utils/analytics';
import { TOPIC_PILL, WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { cn } from '../lib/utils';

const COUNCILLOR_WARD = {};
Object.entries(WARD_COUNCILLORS).forEach(([wardId, name]) => {
  const ward = TORONTO_WARDS.find(w => w.id === wardId);
  if (ward) COUNCILLOR_WARD[name] = { id: wardId, name: ward.name };
});

export default function ProfilePanel({ selected, onClose, onCompare, onMotionClick, motions, councillors = [] }) {
  const [topicFilter, setTopicFilter] = useState('All');

  useEffect(() => {
    if (!selected) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, onClose]);

  const dna = useMemo(() => {
    if (!selected) return [];
    return ['Housing', 'Transit', 'Finance', 'Parks', 'Climate', 'General']
      .map(topic => {
        const relevant = motions.filter(m => m.topic === topic && m.votes?.[selected]);
        const total = relevant.length;
        const yes = relevant.filter(m => m.votes[selected] === 'YES').length;
        return { topic, yesPct: total > 0 ? Math.round((yes / total) * 100) : null, total };
      })
      .filter(d => d.total >= 3);
  }, [selected, motions]);

  const voteHistory = useMemo(() => {
    if (!selected) return [];
    return motions
      .filter(m => m.votes?.[selected] && !m.trivial)
      .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0))
      .slice(0, 20);
  }, [selected, motions]);

  const totalVotes = useMemo(() =>
    selected ? motions.filter(m => m.votes?.[selected]).length : 0,
    [selected, motions]);

  const attendance = useMemo(() =>
    selected ? getAttendance(motions, selected) : null,
    [selected, motions]);

  const votedWith = useMemo(() =>
    selected ? getVotedWith(motions, selected) : [],
    [selected, motions]);

  const voteTopics = useMemo(() => {
    const topics = [...new Set(voteHistory.map(m => m.topic).filter(Boolean))];
    return ['All', ...topics];
  }, [voteHistory]);

  const filteredVoteHistory = topicFilter === 'All'
    ? voteHistory
    : voteHistory.filter(m => m.topic === topicFilter);

  const ward = COUNCILLOR_WARD[selected];
  const contact = councillors.find(c => c.name === selected) ?? null;

  return (
    <AnimatePresence>
      {selected && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden pointer-events-auto">

              {/* Header */}
              <div className="p-6 border-b border-slate-100 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">{selected}</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {ward ? `Ward ${ward.id} · ${ward.name}` : 'Toronto City Council'}
                    </p>
                    {attendance && (
                      <div className="flex gap-4 mt-3">
                        <div>
                          <div className="text-base font-black text-slate-800">{totalVotes}</div>
                          <div className="text-[10px] text-slate-400 font-medium">votes cast</div>
                        </div>
                        <div className="w-px bg-slate-100" />
                        <div>
                          <div className={cn("text-base font-black", attendance.pct >= 90 ? 'text-emerald-600' : attendance.pct >= 75 ? 'text-amber-500' : 'text-rose-500')}>
                            {attendance.daysPresent}/{attendance.totalDays}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">meeting days</div>
                        </div>
                        <div>
                          <div className={cn("text-base font-black", attendance.pct >= 90 ? 'text-emerald-600' : attendance.pct >= 75 ? 'text-amber-500' : 'text-rose-500')}>
                            {attendance.pct}%
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">attendance</div>
                        </div>
                      </div>
                    )}
                    {contact && (contact.email || contact.phone) && (
                      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100">
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-xs text-[#004a99] hover:underline">
                            <Mail className="w-3 h-3" />{contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors">
                            <Phone className="w-3 h-3" />{contact.phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {onCompare && (
                      <button
                        onClick={() => onCompare(selected)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#004a99] text-white text-xs font-semibold rounded-lg hover:bg-[#003875] transition-colors"
                      >
                        <GitCompare className="w-3.5 h-3.5" /> VS
                      </button>
                    )}
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Voting DNA */}
                {dna.length > 0 && (
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Voting DNA</p>
                    <div className="space-y-3.5">
                      {dna.map(({ topic, yesPct, total }) => (
                        <div key={topic}>
                          <div className="flex justify-between items-end mb-1.5">
                            <span className="text-xs font-semibold text-slate-700">{topic}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">{total} votes</span>
                              <span className={cn("text-[10px] font-bold", yesPct >= 50 ? 'text-emerald-600' : 'text-rose-500')}>
                                {yesPct}% YES
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${yesPct}%` }} />
                            <div className="h-full bg-rose-400 rounded-full" style={{ width: `${100 - yesPct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Votes With */}
                {votedWith.length > 0 && (
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Most Aligned With</p>
                    <div className="space-y-2.5">
                      {votedWith.slice(0, 5).map((peer, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            <span className="text-[8px] font-bold text-slate-500 uppercase">
                              {peer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-slate-700 truncate">{peer.name}</span>
                              <span className={cn("text-[10px] font-bold shrink-0 ml-2",
                                peer.pct >= 80 ? 'text-emerald-600' : peer.pct >= 60 ? 'text-[#004a99]' : 'text-amber-500')}>
                                {peer.pct}%
                              </span>
                            </div>
                            <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={cn("h-full rounded-full", peer.pct >= 80 ? 'bg-emerald-500' : peer.pct >= 60 ? 'bg-[#004a99]' : 'bg-amber-400')}
                                style={{ width: `${peer.pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {votedWith.length > 5 && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Least aligned</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {votedWith.slice(-3).reverse().map((peer, i) => (
                            <span key={i} className="text-[10px] font-medium text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg">
                              {peer.name.split(' ').at(-1)} {peer.pct}%
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Notable Votes */}
                <div>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notable Votes</p>
                    {voteTopics.length > 2 && (
                      <div className="flex flex-wrap gap-1">
                        {voteTopics.map(topic => (
                          <button
                            key={topic}
                            onClick={() => setTopicFilter(topic)}
                            className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border transition-colors",
                              topicFilter === topic
                                ? 'bg-[#004a99] text-white border-[#004a99]'
                                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300')}
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {filteredVoteHistory.map((m, i) => {
                      const vote = m.votes[selected];
                      return (
                        <button
                          key={i}
                          onClick={() => onMotionClick?.(m)}
                          className="w-full text-left p-3.5 border border-slate-100 rounded-xl hover:border-[#004a99]/30 hover:bg-slate-50 transition-all bg-white group"
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-1.5">
                              {m.topic && (
                                <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded", TOPIC_PILL[m.topic] || TOPIC_PILL.General)}>
                                  {m.topic}
                                </span>
                              )}
                              {m.significance != null && (
                                <span className="text-[9px] text-slate-300 font-medium">{m.significance}</span>
                              )}
                            </div>
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded",
                              vote === 'YES' ? 'text-emerald-600 bg-emerald-50' :
                              vote === 'NO'  ? 'text-rose-500 bg-rose-50' :
                                               'text-amber-600 bg-amber-50')}>
                              {vote}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-700 leading-snug group-hover:text-[#004a99] transition-colors">
                            {m.title}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-1.5">{m.date}</p>
                        </button>
                      );
                    })}
                    {filteredVoteHistory.length === 0 && (
                      <p className="text-xs text-slate-400 italic py-4 text-center">No votes found for this topic.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
