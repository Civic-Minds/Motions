import { getWardId } from '../utils/storage';
import React, { useMemo, useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import VsPickerModal from './VsPickerModal';
import { motion } from 'framer-motion';
import { getAttendance, getVotedWith } from '../utils/analytics';
import { TOPIC_LIGHT, WARD_COUNCILLORS, FORMER_MEMBERS, getCommittee } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { nameToSlug, slugToName } from '../utils/slug';
import { cn } from '../lib/utils';

const COUNCILLOR_WARD = {};
Object.entries(WARD_COUNCILLORS).forEach(([wardId, name]) => {
  const ward = TORONTO_WARDS.find(w => w.id === wardId);
  if (ward) COUNCILLOR_WARD[name] = { id: wardId, name: ward.name };
});


export default function CouncillorProfile({ motions, councillors = [] }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [vsPickerOpen, setVsPickerOpen] = useState(false);
  const [vsSearch, setVsSearch] = useState('');
  const [tenure, setTenure] = useState({});
  const [expenses, setExpenses] = useState(null);

  useEffect(() => {
    fetch('/data/tenure.json').then(r => r.json()).then(setTenure).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/data/expenses.json').then(r => r.json()).then(setExpenses).catch(() => {});
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

  const recentVotes = useMemo(() => {
    if (!selected) return [];
    return motions
      .filter(m => !m.parentId && m.votes?.[selected] && m.significance >= 60)
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
      .slice(0, 4);
  }, [selected, motions]);

  const totalVoteCount = useMemo(() =>
    selected ? motions.filter(m => !m.parentId && m.votes?.[selected]).length : 0,
    [selected, motions]);

  const committees = useMemo(() => {
    if (!selected) return [];
    const counts = {};
    motions.forEach(m => {
      if (m.votes?.[selected] === 'YES' || m.votes?.[selected] === 'NO') {
        const c = m.committee || getCommittee(m.id);
        counts[c] = (counts[c] || 0) + 1;
      }
    });
    const threshold = Math.max(1, Object.values(counts).reduce((a, b) => a + b, 0) * 0.05);
    return Object.entries(counts)
      .filter(([, n]) => n >= threshold)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [selected, motions]);

  const vsPeers = useMemo(() =>
    allNames.filter(n => n !== selected).sort(),
    [allNames, selected]);

  const expenseRecord = useMemo(() => {
    if (!expenses || !ward) return null;
    return expenses.councillors.find(c => c.ward === ward.id) ?? null;
  }, [expenses, ward]);


  const myWardId = getWardId();
  const myCouncillor = myWardId ? WARD_COUNCILLORS[myWardId] : null;

  if (!selected && allNames.length > 0) {
    navigate('/councillors', { replace: true });
    return null;
  }
  if (!selected) return null;

  const initials = selected.split(' ').map(n => n[0]).slice(0, 2).join('');
  const lastName = selected.split(' ').at(-1);
  const photoUrl = `/images/councillors/${lastName}.jpg`;
  const voteHistory = motions.filter(m => m.votes?.[selected]);
  const yesCount = voteHistory.filter(m => m.votes[selected] === 'YES').length;
  const noCount = voteHistory.filter(m => m.votes[selected] === 'NO').length;
  const yesRate = voteHistory.length > 0 ? Math.round((yesCount / voteHistory.length) * 100) : null;
  const isMyCouncillor = myCouncillor === selected;

  const EXPENSE_LABELS = {
    communication: 'Communication',
    constituency_and_business_meetings: 'Meetings',
    advertising_and_promotion: 'Advertising',
    professional_and_technical_services: 'Professional services',
    office_equipment_and_supplies: 'Equipment & supplies',
    transportation_kilometrage_parking: 'Transportation',
    telecom_services: 'Telecom',
    city_hall_civic_centre_rent_constituency_office: 'Office rent',
    other_expenses: 'Other',
  };

  return (
    <div className="pb-20">

      {/* Former member notice */}
      {FORMER_MEMBERS[selected] && (
        <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          {FORMER_MEMBERS[selected]} · Historical record only
        </div>
      )}

      {/* Profile header + stats integrated */}
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-4 mb-6">

        {/* Identity */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-[#004a99] flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src={photoUrl}
              alt={selected}
              className="w-full h-full object-cover"
              onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
            />
            <span className="text-white font-bold text-xl hidden w-full h-full items-center justify-center">{initials}</span>
          </div>
          <div className="min-w-[160px]">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{selected}</h1>
              {isMyCouncillor && (
                <span className="text-[10px] font-bold bg-[#004a99] text-white px-2.5 py-0.5 rounded-full">Your Councillor</span>
              )}
              {committees.map(c => (
                <button
                  key={c}
                  onClick={() => navigate(`/committees/${c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`)}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-[#004a99] hover:text-white transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{ward ? `Ward ${ward.id} · ${ward.name}` : 'Toronto City Council'}</p>
            {contact && (contact.email || contact.phone) && (
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors">
                    <Phone className="w-3 h-3" />{contact.phone}
                  </a>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-xs text-[#004a99] hover:underline">
                    <Mail className="w-3 h-3" />{contact.email}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stat cards */}
        {attendance && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 flex-1">

            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1">Votes cast</p>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col flex-1">
                <p className="text-2xl font-black text-slate-900">{totalVotes}</p>
                <p className="text-[10px] text-slate-400 mt-auto pt-2">all recorded votes</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1">Attendance</p>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col flex-1">
                <p className={cn("text-2xl font-black", attendance.pct >= 90 ? 'text-emerald-600' : attendance.pct >= 75 ? 'text-amber-500' : 'text-rose-500')}>
                  {attendance.pct}%
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{attendance.daysPresent}/{attendance.totalDays} days</p>
                <div className="mt-auto pt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", attendance.pct >= 90 ? 'bg-emerald-500' : attendance.pct >= 75 ? 'bg-amber-400' : 'bg-rose-500')} style={{ width: `${attendance.pct}%` }} />
                </div>
              </div>
            </div>

            {yesRate !== null && (
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1">Yes rate</p>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col flex-1">
                  <p className="text-2xl font-black text-slate-900">{yesRate}%</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{yesCount} yes · {noCount} no</p>
                  <div className="mt-auto pt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${yesRate}%` }} />
                    <div className="h-full bg-rose-400 rounded-full" style={{ width: `${100 - yesRate}%` }} />
                  </div>
                </div>
              </div>
            )}

            {tenure[selected]?.totalYears > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1">On council</p>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col flex-1">
                  <p className="text-2xl font-black text-slate-900">{tenure[selected].totalYears}<span className="text-sm font-semibold text-slate-400 ml-1">yr</span></p>
                  {tenure[selected].firstYear && <p className="text-[10px] text-slate-400 mt-0.5">since {tenure[selected].firstYear}</p>}
                </div>
              </div>
            )}

            {expenseRecord && (
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1">2025 office spend</p>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col flex-1">
                  <p className="text-2xl font-black text-slate-900">${Math.round(expenseRecord.office_expenses / 1000)}K</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{Math.min(100, Math.round((expenseRecord.office_expenses / 60053) * 100))}% of budget</p>
                  <div className="mt-auto pt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#004a99] rounded-full" style={{ width: `${Math.min(100, Math.round((expenseRecord.office_expenses / 60053) * 100))}%` }} />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Body: sidebar | vote cards | expenses */}
      <div className={cn("lg:grid lg:gap-8 lg:items-start", expenseRecord ? "lg:grid-cols-[220px_1fr_220px]" : "lg:grid-cols-[220px_1fr]")}>

        {/* Left sidebar */}
        <div className="space-y-4 lg:sticky lg:top-24 mb-6 lg:mb-0">

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
                        <span className="text-[10px] text-slate-400">{total}</span>
                        <span className={cn("text-[10px] font-bold", yesPct >= 50 ? 'text-emerald-600' : 'text-rose-500')}>{yesPct}%</span>
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
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#004a99] flex items-center justify-center shrink-0 transition-colors group relative overflow-hidden"
                    >
                      <span className="text-[8px] font-bold text-slate-500 group-hover:text-white uppercase transition-colors">
                        {peer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </span>
                      <img
                        src={`/images/councillors/${peer.name.split(' ').at(-1)}.jpg`}
                        alt={peer.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <Link to={`/councillors/${nameToSlug(peer.name)}`} className="text-xs font-medium text-slate-700 hover:text-[#004a99] truncate transition-colors">
                          {peer.name}
                        </Link>
                        <span className={cn("text-[10px] font-bold shrink-0 ml-2", peer.pct >= 80 ? 'text-emerald-600' : peer.pct >= 60 ? 'text-[#004a99]' : 'text-amber-500')}>
                          {peer.pct}%
                        </span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", peer.pct >= 80 ? 'bg-emerald-500' : peer.pct >= 60 ? 'bg-[#004a99]' : 'bg-amber-400')} style={{ width: `${peer.pct}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {votedWith.length > 5 && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Least Aligned</p>
                  {votedWith.slice(-3).reverse().map((peer, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Link
                        to={`/councillors/${nameToSlug(peer.name)}`}
                        className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 flex items-center justify-center shrink-0 transition-colors relative overflow-hidden"
                      >
                        <span className="text-[8px] font-bold text-rose-400 uppercase">
                          {peer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </span>
                        <img
                          src={`/images/councillors/${peer.name.split(' ').at(-1)}.jpg`}
                          alt={peer.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <Link to={`/councillors/${nameToSlug(peer.name)}`} className="text-xs font-medium text-slate-700 hover:text-[#004a99] truncate transition-colors">
                            {peer.name}
                          </Link>
                          <span className="text-[10px] font-bold text-rose-500 shrink-0 ml-2">{peer.pct}%</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-400 rounded-full" style={{ width: `${peer.pct}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Recent Notable Votes as mini-cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Recent Notable Votes</p>
            <button onClick={() => navigate(`/councillors/${slug}/votes`)} className="text-xs font-semibold text-[#004a99] hover:underline">
              See all {totalVoteCount} →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {recentVotes.map((m, i) => {
              const vote = m.votes[selected];
              return (
                <motion.button
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/motions/${m.id}`)}
                  className="bg-white border border-slate-200 rounded-2xl p-4 text-left group flex flex-col gap-2 hover:border-[#004a99]/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-1">
                    {m.topic
                      ? <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>{m.topic}</span>
                      : <span />}
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                      vote === 'YES' ? 'bg-emerald-50 text-emerald-700' : vote === 'NO' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                    )}>
                      {vote === 'YES' ? 'Yes' : vote === 'NO' ? 'No' : vote}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-3 leading-snug flex-1">
                    {m.title}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[9px] text-slate-400">{m.date}</span>
                    {m.significance >= 90 && <span className="text-[9px] font-semibold text-amber-600">High Impact</span>}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <button
            onClick={() => navigate(`/councillors/${slug}/votes`)}
            className="w-full mt-3 py-3 text-sm font-semibold text-[#004a99] bg-white border border-slate-200 rounded-2xl hover:border-[#004a99]/40 hover:shadow-sm transition-all"
          >
            See all {totalVoteCount} votes →
          </button>
        </div>

        {/* Right: Expenses detail */}
        {expenseRecord && (
          <div className="lg:sticky lg:top-24 mt-6 lg:mt-0">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">2025 Expenses</p>
                <a href={expenses.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-400 hover:text-[#004a99] transition-colors">Source ↗</a>
              </div>

              {(() => {
                const BUDGET = 60053;
                const spent = expenseRecord.office_expenses;
                const pct = Math.min(100, Math.round((spent / BUDGET) * 100));
                const over = spent > BUDGET;
                return (
                  <div className="mb-4">
                    <div className="flex items-end justify-between mb-1.5">
                      <span className="text-lg font-black text-slate-800">${spent.toLocaleString()}</span>
                      <span className={cn("text-[10px] font-bold", over ? 'text-amber-600' : 'text-slate-400')}>{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", over ? 'bg-amber-400' : 'bg-[#004a99]')} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">of ${BUDGET.toLocaleString()} budget</p>
                  </div>
                );
              })()}

              {expenseRecord.office_expense_breakdown && (() => {
                const breakdown = expenseRecord.office_expense_breakdown;
                const top = Object.entries(EXPENSE_LABELS)
                  .map(([k, label]) => ({ label, value: breakdown[k] ?? 0 }))
                  .filter(d => d.value > 0)
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 5);
                const maxVal = top[0]?.value ?? 1;
                return (
                  <div className="space-y-2">
                    {top.map(({ label, value }) => (
                      <div key={label}>
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[10px] text-slate-500">{label}</span>
                          <span className="text-[10px] font-semibold text-slate-700">${value.toLocaleString()}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-300 rounded-full" style={{ width: `${Math.round((value / maxVal) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

      </div>

      <VsPickerModal
        open={vsPickerOpen}
        selectedName={selected}
        peers={vsPeers}
        search={vsSearch}
        onSearchChange={setVsSearch}
        onClose={() => { setVsPickerOpen(false); setVsSearch(''); }}
        onSelect={(s1, s2) => { setVsPickerOpen(false); setVsSearch(''); navigate(`/councillors/${s1}/vs/${s2}`); }}
      />

    </div>
  );
}
