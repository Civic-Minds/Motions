import React, { useMemo, useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, GitCompare, Mail, Phone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAttendance, getVotedWith } from '../utils/analytics';
import { TOPIC_PILL, WARD_COUNCILLORS, FORMER_MEMBERS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { nameToSlug, slugToName } from '../utils/slug';
import { cn } from '../lib/utils';
import MotionPanel from './MotionPanel';

const COUNCILLOR_WARD = {};
Object.entries(WARD_COUNCILLORS).forEach(([wardId, name]) => {
  const ward = TORONTO_WARDS.find(w => w.id === wardId);
  if (ward) COUNCILLOR_WARD[name] = { id: wardId, name: ward.name };
});

const TOPIC_LIGHT = {
  Housing: 'bg-blue-50 text-blue-700',
  Transit: 'bg-amber-50 text-amber-700',
  Finance: 'bg-emerald-50 text-emerald-700',
  Parks:   'bg-green-50 text-green-700',
  Climate: 'bg-teal-50 text-teal-700',
  General: 'bg-slate-100 text-slate-600',
};

export default function CouncillorProfile({ motions, councillors = [] }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [topicFilter, setTopicFilter] = useState('All');
  const [notableOnly, setNotableOnly] = useState(false);
  const [selectedMotion, setSelectedMotion] = useState(null);
  const [vsPickerOpen, setVsPickerOpen] = useState(false);
  const [vsSearch, setVsSearch] = useState('');
  const [tenure, setTenure] = useState({});

  useEffect(() => {
    fetch('/data/tenure.json').then(r => r.json()).then(setTenure).catch(() => {});
  }, []);

  const allNames = useMemo(() => {
    const s = new Set();
    motions.forEach(m => { if (m.votes) Object.keys(m.votes).forEach(n => s.add(n)); });
    return [...s].sort();
  }, [motions]);

  const selected = useMemo(() => slugToName(slug, allNames), [slug, allNames]);

  const ward = selected ? COUNCILLOR_WARD[selected] : null;
  const contact = councillors.find(c => c.name === selected) ?? null;

  const totalVotes = useMemo(() =>
    selected ? motions.filter(m => m.votes?.[selected]).length : 0,
    [selected, motions]);

  const attendance = useMemo(() =>
    selected ? getAttendance(motions, selected) : null,
    [selected, motions]);

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

  const votedWith = useMemo(() =>
    selected ? getVotedWith(motions, selected) : [],
    [selected, motions]);

  const voteHistory = useMemo(() => {
    if (!selected) return [];
    return motions
      .filter(m => m.votes?.[selected] && !m.trivial)
      .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0));
  }, [selected, motions]);

  const voteTopics = useMemo(() => {
    const topics = [...new Set(voteHistory.map(m => m.topic).filter(Boolean))];
    return ['All', ...topics];
  }, [voteHistory]);

  const filteredVotes = useMemo(() => {
    return voteHistory
      .filter(m => topicFilter === 'All' || m.topic === topicFilter)
      .filter(m => !notableOnly || m.significance >= 60);
  }, [voteHistory, topicFilter, notableOnly]);

  const vsPeers = useMemo(() =>
    allNames.filter(n => n !== selected).sort(),
    [allNames, selected]);

  const vsFiltered = vsSearch.trim()
    ? vsPeers.filter(n => n.toLowerCase().includes(vsSearch.toLowerCase()))
    : vsPeers;

  if (!selected && allNames.length > 0) {
    navigate('/councillors', { replace: true });
    return null;
  }
  if (!selected) return null;

  const initials = selected.split(' ').map(n => n[0]).slice(0, 2).join('');
  const lastName = selected.split(' ').at(-1);
  const photoUrl = `/images/councillors/${lastName}.jpg`;
  const yesCount = voteHistory.filter(m => m.votes[selected] === 'YES').length;
  const noCount = voteHistory.filter(m => m.votes[selected] === 'NO').length;
  const yesRate = voteHistory.length > 0 ? Math.round((yesCount / voteHistory.length) * 100) : null;

  return (
    <div className="pb-20">

      {/* Back link */}
      <Link
        to="/councillors"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Councillors
      </Link>

      {/* Former member notice */}
      {FORMER_MEMBERS[selected] && (
        <div className="mb-6 flex items-center gap-2.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          {FORMER_MEMBERS[selected]} · Historical record only
        </div>
      )}

      {/* Profile header */}
      <div className="flex items-start justify-between gap-6 mb-8">
        <div className="flex items-start gap-5">
          <div className="w-24 h-24 rounded-2xl bg-[#004a99] flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src={photoUrl}
              alt={selected}
              className="w-full h-full object-cover"
              onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
            />
            <span className="text-white font-bold text-2xl hidden w-full h-full items-center justify-center">{initials}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{selected}</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {ward ? `Ward ${ward.id} · ${ward.name}` : 'Toronto City Council'}
            </p>

            {/* Stats strip */}
            {attendance && (
              <div className="flex items-center gap-5 mt-3">
                <div>
                  <span className="text-lg font-black text-slate-800">{totalVotes}</span>
                  <span className="text-xs text-slate-400 ml-1.5">votes</span>
                </div>
                <div className="w-px h-4 bg-slate-200" />
                <div>
                  <span className={cn("text-lg font-black", attendance.pct >= 90 ? 'text-emerald-600' : attendance.pct >= 75 ? 'text-amber-500' : 'text-rose-500')}>
                    {attendance.daysPresent}/{attendance.totalDays}
                  </span>
                  <span className="text-xs text-slate-400 ml-1.5">meeting days</span>
                </div>
                <div className="w-px h-4 bg-slate-200" />
                <div>
                  <span className={cn("text-lg font-black", attendance.pct >= 90 ? 'text-emerald-600' : attendance.pct >= 75 ? 'text-amber-500' : 'text-rose-500')}>
                    {attendance.pct}%
                  </span>
                  <span className="text-xs text-slate-400 ml-1.5">attendance</span>
                </div>
                {yesRate !== null && (
                  <>
                    <div className="w-px h-4 bg-slate-200" />
                    <div>
                      <span className="text-lg font-black text-slate-800">{yesRate}%</span>
                      <span className="text-xs text-slate-400 ml-1.5">yes rate</span>
                    </div>
                  </>
                )}
                {tenure[selected] && (
                  <>
                    <div className="w-px h-4 bg-slate-200" />
                    <div>
                      <span className="text-lg font-black text-slate-800">{tenure[selected].since}</span>
                      <span className="text-xs text-slate-400 ml-1.5">on council since</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Contact */}
            {contact && (contact.email || contact.phone) && (
              <div className="flex flex-wrap gap-4 mt-3">
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-xs text-[#004a99] hover:underline">
                    <Mail className="w-3.5 h-3.5" />{contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors">
                    <Phone className="w-3.5 h-3.5" />{contact.phone}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* VS button */}
        <button
          onClick={() => setVsPickerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#004a99] text-white text-sm font-semibold rounded-xl hover:bg-[#003875] transition-colors shrink-0"
        >
          <GitCompare className="w-4 h-4" /> Compare
        </button>
      </div>

      {/* Two-column body */}
      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8 lg:items-start space-y-8 lg:space-y-0">

        {/* ── Left sidebar ── */}
        <div className="space-y-5 lg:sticky lg:top-24">

          {/* Voting DNA */}
          {dna.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-4">Voting DNA</p>
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
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${yesPct}%` }} />
                      <div className="h-full bg-rose-400 rounded-full" style={{ width: `${100 - yesPct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Most Aligned With */}
          {votedWith.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-4">Most Aligned With</p>
              <div className="space-y-2.5">
                {votedWith.slice(0, 5).map((peer, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Link
                      to={`/councillors/${nameToSlug(peer.name)}`}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#004a99] flex items-center justify-center shrink-0 transition-colors group"
                    >
                      <span className="text-[8px] font-bold text-slate-500 group-hover:text-white uppercase transition-colors">
                        {peer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </span>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <Link
                          to={`/councillors/${nameToSlug(peer.name)}`}
                          className="text-xs font-medium text-slate-700 hover:text-[#004a99] truncate transition-colors"
                        >
                          {peer.name}
                        </Link>
                        <span className={cn("text-[10px] font-bold shrink-0 ml-2",
                          peer.pct >= 80 ? 'text-emerald-600' : peer.pct >= 60 ? 'text-[#004a99]' : 'text-amber-500')}>
                          {peer.pct}%
                        </span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Least Aligned</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {votedWith.slice(-3).reverse().map((peer, i) => (
                      <Link
                        key={i}
                        to={`/councillors/${nameToSlug(peer.name)}`}
                        className="text-[10px] font-medium text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg hover:bg-rose-100 transition-colors"
                      >
                        {peer.name.split(' ').at(-1)} {peer.pct}%
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: vote history ── */}
        <div>
          {/* Filters bar */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              {voteTopics.map(topic => (
                <button
                  key={topic}
                  onClick={() => setTopicFilter(topic)}
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors",
                    topicFilter === topic
                      ? 'bg-[#004a99] text-white border-[#004a99]'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  )}
                >
                  {topic}
                </button>
              ))}
            </div>
            <button
              onClick={() => setNotableOnly(s => !s)}
              className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors shrink-0",
                notableOnly
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              )}
            >
              Notable only
            </button>
          </div>

          <p className="text-[10px] text-slate-400 mb-3">{filteredVotes.length} votes</p>

          {/* Vote rows */}
          <div className="space-y-2">
            {filteredVotes.map((m, i) => {
              const vote = m.votes[selected];
              return (
                <motion.button
                  key={m.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.01, 0.2) }}
                  onClick={() => setSelectedMotion(m)}
                  className="w-full text-left bg-white border border-slate-200 rounded-2xl p-4 hover:border-[#004a99]/40 hover:shadow-sm transition-all group flex items-start gap-3"
                >
                  <div className={cn(
                    "mt-0.5 w-1 self-stretch rounded-full shrink-0",
                    vote === 'YES' ? 'bg-emerald-400' : vote === 'NO' ? 'bg-rose-400' : 'bg-slate-200'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors leading-snug line-clamp-2">
                      {m.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        vote === 'YES' ? 'bg-emerald-50 text-emerald-700'
                        : vote === 'NO' ? 'bg-rose-50 text-rose-600'
                        : 'bg-slate-100 text-slate-500'
                      )}>
                        {vote}
                      </span>
                      {m.topic && (
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>
                          {m.topic}
                        </span>
                      )}
                      {m.significance >= 90 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">High Impact</span>}
                      {m.significance >= 60 && m.significance < 90 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Notable</span>}
                      <span className="text-[10px] text-slate-400 ml-auto">{m.date}</span>
                    </div>
                  </div>
                </motion.button>
              );
            })}

            {filteredVotes.length === 0 && (
              <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 text-sm">No votes match the current filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VS picker modal */}
      <AnimatePresence>
        {vsPickerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60]"
              onClick={() => { setVsPickerOpen(false); setVsSearch(''); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">Compare {selected.split(' ').at(-1)} with…</p>
                  <button onClick={() => { setVsPickerOpen(false); setVsSearch(''); }} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div className="px-4 py-2 border-b border-slate-100">
                  <input
                    type="text"
                    placeholder="Search councillors…"
                    value={vsSearch}
                    onChange={e => setVsSearch(e.target.value)}
                    autoFocus
                    className="w-full text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent py-1"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {vsFiltered.map(name => (
                    <button
                      key={name}
                      onClick={() => {
                        setVsPickerOpen(false);
                        setVsSearch('');
                        navigate(`/councillors/${nameToSlug(selected)}/vs/${nameToSlug(name)}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-bold text-slate-500 uppercase">
                          {name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-700">{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <MotionPanel motion={selectedMotion} onClose={() => setSelectedMotion(null)} />
    </div>
  );
}
