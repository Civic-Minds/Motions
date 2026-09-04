import { getWardId } from '../utils/storage';
import React, { useMemo, useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, Mail, Phone, Vote } from 'lucide-react';
import VsPickerModal from './VsPickerModal';
import { getAttendance, getVotedWith } from '../utils/analytics';
import { TOPIC_LIGHT, TOPICS, WARD_COUNCILLORS, FORMER_MEMBERS, getCommittee } from '../constants/data';
import { nameToSlug, slugToName } from '../utils/slug';
import { COUNCILLOR_WARD } from '../utils/councillorWard';
import { cn } from '../lib/utils';
import MotionCardItem from './MotionCardItem';
import { PageMeta } from './PageMeta';
import { previewImage } from '../utils/meta';
import ShareButton from './ShareButton';
import { CivicCard } from './ui/CivicCard';

const VANCOUVER_PROFILE_SLUGS = {
  'Mayor Ken Sim': 'mayor-ken-sim',
  'Rebecca Bligh': 'rebecca-bligh',
  'Lisa Dominato': 'lisa-dominato',
  'Pete Fry': 'pete-fry',
  'Sarah Kirby-Yung': 'sarah-kirby-yung',
  'Mike Klassen': 'mike-klassen',
  'Lucy Maloney': 'lucy-maloney',
  'Peter Meiszner': 'peter-meiszner',
  'Brian Montague': 'brian-montague',
  'Sean Orr': 'sean-orr',
  'Lenny Zhou': 'lenny-zhou',
};

// ── Sub-component: profile header ─────────────────────────────────────────
function ProfileHeader({ selected, ward, committees, isMyCouncillor, electionStatus, jurisdiction }) {
  const initials = selected.split(' ').map(n => n[0]).slice(0, 2).join('');
  const lastName = selected.split(' ').at(-1);
  const photoUrl = `/images/councillors/${lastName}.jpg`;

  return (
    <div className="flex items-center gap-4 min-w-0 w-full">
      <div className="w-16 h-16 rounded-2xl bg-[#004a99] flex items-center justify-center shrink-0 overflow-hidden">
        <img
          src={photoUrl}
          alt={selected}
          className="w-full h-full object-cover"
          decoding="async"
          onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
        />
        <span className="text-white font-bold text-xl hidden w-full h-full items-center justify-center">{initials}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-slate-900 leading-tight truncate">{selected}</h1>
          {isMyCouncillor && (
            <span className="text-[10px] font-bold bg-[#004a99] text-white px-2.5 py-0.5 rounded-full">Your Councillor</span>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-0.5 break-words">{ward ? `Ward ${ward.id} · ${ward.name}` : `${jurisdiction.name} City Council`}</p>
        {electionStatus && (
          <Link
            to="/election"
            className={cn(
              "inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors",
              electionStatus.type === 'filed'
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : electionStatus.type === 'withdrawn'
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            )}
          >
            <Vote className="w-3 h-3" />
            {electionStatus.type === 'filed'
              ? electionStatus.office === 'Mayor' ? 'Filed to run for Mayor in 2026' : electionStatus.wardId === ward?.id ? 'Filed to run again in 2026' : `Filed to run in Ward ${electionStatus.wardId}`
              : electionStatus.type === 'withdrawn'
                ? electionStatus.filedWard ? `Withdrew from Ward ${electionStatus.withdrawnWard}; running in Ward ${electionStatus.filedWard}` : `Withdrew from Ward ${electionStatus.withdrawnWard}`
                : 'Not listed as a 2026 candidate'}
          </Link>
        )}
        {committees.length > 0 && (
          <div className="text-xs text-slate-500 leading-snug mt-2.5" title={committees.join(', ')}>
            <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider mr-2">Committees</span>
            <span>{committees.length.toLocaleString()} assigned</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-component: voting stats row ───────────────────────────────────────
function VotingStats({ attendance, totalVotes, yesRate, yesCount, noCount, tenureData }) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1">Votes cast</p>
        <CivicCard className="h-[112px]">
          <p className="text-2xl font-black text-slate-900">{totalVotes.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 mt-auto pt-2">all recorded votes</p>
        </CivicCard>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1">Attendance</p>
        <CivicCard className="h-[112px]">
          <p className={cn("text-2xl font-black", attendance.pct >= 90 ? 'text-emerald-600' : attendance.pct >= 75 ? 'text-amber-500' : 'text-rose-500')}>
            {attendance.pct}%
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">{attendance.daysPresent.toLocaleString()}/{attendance.totalDays.toLocaleString()} days</p>
          <div className="mt-auto pt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full", attendance.pct >= 90 ? 'bg-emerald-500' : attendance.pct >= 75 ? 'bg-amber-400' : 'bg-rose-500')} style={{ width: `${attendance.pct}%` }} />
          </div>
        </CivicCard>
      </div>

      {yesRate !== null && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1">Yes rate</p>
          <CivicCard className="h-[112px]">
            <p className="text-2xl font-black text-slate-900">{yesRate}%</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{yesCount.toLocaleString()} yes · {noCount.toLocaleString()} no</p>
            <div className="mt-auto pt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${yesRate}%` }} />
              <div className="h-full bg-rose-400 rounded-full" style={{ width: `${100 - yesRate}%` }} />
            </div>
          </CivicCard>
        </div>
      )}

      {tenureData?.totalYears > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1">On council</p>
          <CivicCard className="h-[112px]">
            <p className="text-2xl font-black text-slate-900">{tenureData.totalYears}<span className="text-sm font-semibold text-slate-500 ml-1">yr</span></p>
            {tenureData.firstYear && <p className="text-[10px] text-slate-500 mt-0.5">since {tenureData.firstYear}</p>}
          </CivicCard>
        </div>
      )}

    </>
  );
}

// ── Sub-component: peer alignment sidebar ─────────────────────────────────
function PeerAlignment({ dna, votedWith }) {
  return (
    <div className="space-y-4 lg:sticky lg:top-24 mb-6 lg:mb-0">

      {dna.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-4">Voting DNA</p>
          <div className="space-y-3.5">
            {dna.map(({ topic, yesPct, total }) => (
              <div key={topic}>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">{topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{total.toLocaleString()}</span>
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

      {votedWith.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-4">Most Aligned With</p>
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
                    loading="lazy"
                    decoding="async"
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
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Least Aligned</p>
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
                      loading="lazy"
                      decoding="async"
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
  );
}

// ── Sub-component: expense breakdown ──────────────────────────────────────
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

function ExpenseBreakdown({ expenseRecord, sourceUrl }) {
  const BUDGET = 60053;
  const spent = expenseRecord.office_expenses;
  const pct = Math.min(100, Math.round((spent / BUDGET) * 100));
  const over = spent > BUDGET;
  const breakdown = expenseRecord.office_expense_breakdown;
  const top = breakdown
    ? Object.entries(EXPENSE_LABELS)
        .map(([k, label]) => ({ label, value: breakdown[k] ?? 0 }))
        .filter(d => d.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    : [];
  const maxVal = top[0]?.value ?? 1;

  return (
    <div className="lg:sticky lg:top-24 mt-6 lg:mt-0">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">2025 Expenses</p>
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-500 hover:text-[#004a99] transition-colors">Source ↗</a>
        </div>
        <div className="mb-4">
          <div className="flex items-end justify-between mb-1.5">
            <span className="text-lg font-black text-slate-800">${spent.toLocaleString()}</span>
            <span className={cn("text-[10px] font-bold", over ? 'text-amber-600' : 'text-slate-500')}>{pct}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full", over ? 'bg-amber-400' : 'bg-[#004a99]')} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">of ${BUDGET.toLocaleString()} budget</p>
        </div>
        {top.length > 0 && (
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
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function CouncillorProfile({ motions, councillors = [], jurisdiction = { id: 'toronto', name: 'Toronto' } }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [vsPickerOpen, setVsPickerOpen] = useState(false);
  const [vsSearch, setVsSearch] = useState('');
  const [tenure, setTenure] = useState({});
  const [expenses, setExpenses] = useState(null);
  const [candidateData, setCandidateData] = useState(null);
  const isVancouver = jurisdiction.id === 'vancouver';
  const currentNames = useMemo(() => new Set((jurisdiction.currentCouncillors ?? []).map(c => typeof c === 'string' ? c : c.name)), [jurisdiction.currentCouncillors]);

  const blobBase = import.meta.env.VITE_BLOB_BASE_URL;

  useEffect(() => {
    const url = blobBase ? `${blobBase}/tenure.json` : '/data/tenure.json';
    fetch(url).then(r => r.json()).then(setTenure).catch(() => {});
  }, []);

  useEffect(() => {
    const url = blobBase ? `${blobBase}/expenses.json` : '/data/expenses.json';
    fetch(url).then(r => r.json()).then(setExpenses).catch(() => {});
  }, []);

  useEffect(() => {
    const url = import.meta.env.DEV || !blobBase ? '/data/candidates.json' : `${blobBase}/candidates.json`;
    fetch(url).then(r => r.json()).then(setCandidateData).catch(() => {});
  }, []);

  const allNames = useMemo(() => {
    const s = new Set();
    motions.forEach(m => { if (m.votes) Object.keys(m.votes).forEach(n => s.add(n)); });
    return [...s].filter(name => currentNames.size === 0 || currentNames.has(name)).sort();
  }, [motions, currentNames]);

  const selected = useMemo(() => slugToName(slug, allNames), [slug, allNames]);
  const ward = selected ? COUNCILLOR_WARD[selected] : null;
  const contact = councillors.find(c => c.name === selected) ?? null;
  const vancouverProfileUrl = isVancouver && VANCOUVER_PROFILE_SLUGS[selected]
    ? `https://vancouver.ca/your-government/${VANCOUVER_PROFILE_SLUGS[selected]}.aspx`
    : null;
  const hasCandidateTracking = jurisdiction.id === 'toronto';
  const electionStatus = useMemo(() => {
    if (!hasCandidateTracking) return null;
    if (!candidateData || !selected) return null;
    const normalize = name => name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const mayorCandidate = (candidateData.mayor ?? []).find(candidate => normalize(candidate.name) === normalize(selected));
    if (mayorCandidate) return { type: 'filed', office: 'Mayor' };
    const filedWard = Object.entries(candidateData.wards ?? []).find(([, candidates]) =>
      candidates.some(candidate => normalize(candidate.name) === normalize(selected))
    );
    const withdrawnRace = (candidateData.withdrawn ?? []).find(candidate =>
      candidate.office === 'Councillor'
      && candidate.wardId === ward?.id
      && normalize(candidate.name) === normalize(selected)
    );
    if (withdrawnRace) {
      return {
        type: 'withdrawn',
        withdrawnWard: withdrawnRace.wardId,
        filedWard: filedWard?.[0] || null
      };
    }
    return filedWard ? { type: 'filed', wardId: filedWard[0] } : { type: 'not-listed' };
  }, [candidateData, selected, ward, hasCandidateTracking]);

  const totalVotes = useMemo(() =>
    selected ? motions.filter(m => m.votes?.[selected]).length : 0,
    [selected, motions]);

  const attendance = useMemo(() =>
    selected ? getAttendance(motions, selected) : null,
    [selected, motions]);

  const dna = useMemo(() => {
    if (!selected) return [];
    return TOPICS
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
      .filter(m => !m.parentId && m.votes?.[selected])
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
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
    return Object.entries(counts)
      .filter(([, n]) => n >= 5)
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

  const voteHistory = motions.filter(m => m.votes?.[selected]);
  const yesCount = voteHistory.filter(m => m.votes[selected] === 'YES').length;
  const noCount = voteHistory.filter(m => m.votes[selected] === 'NO').length;
  const yesRate = voteHistory.length > 0 ? Math.round((yesCount / voteHistory.length) * 100) : null;
  const isMyCouncillor = myCouncillor === selected;

  return (
    <div className="pb-20">
      <PageMeta
        title={`${selected} | Motions ${jurisdiction.name}`}
        description={`See ${selected}'s voting record and council activity.`}
        image={previewImage(selected, ward ? `Ward ${ward.id} · ${ward.name}` : `${jurisdiction.name} City Council`)}
      />
      <div className="flex justify-end mb-2">
        <ShareButton title={selected} />
      </div>

      {FORMER_MEMBERS[selected] && (
        <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          {FORMER_MEMBERS[selected]} · Historical record only
        </div>
      )}

      {/* Profile header + stats */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[220px_minmax(0,1fr)_220px] lg:gap-8 items-start mb-6">
        <ProfileHeader selected={selected} ward={ward} committees={committees} isMyCouncillor={isMyCouncillor} electionStatus={electionStatus} jurisdiction={jurisdiction} />

        {attendance && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-0 w-full">
            <VotingStats
              attendance={attendance}
              totalVotes={totalVotes}
              yesRate={yesRate}
              yesCount={yesCount}
              noCount={noCount}
              tenureData={tenure[selected]}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1">Contact</p>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-center gap-3 h-[112px]">
            {contact?.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#004a99] transition-colors break-all">
                <Phone className="w-3.5 h-3.5 shrink-0" />{contact.phone}
              </a>
            )}
            {contact?.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-xs text-[#004a99] hover:underline break-all">
                <Mail className="w-3.5 h-3.5 shrink-0" />{contact.email}
              </a>
            )}
            {vancouverProfileUrl && (
              <a href={vancouverProfileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[#004a99] hover:underline">
                <ExternalLink className="w-3.5 h-3.5 shrink-0" /> City profile & contact
              </a>
            )}
          </div>
        </div>

      </div>

      {/* Body: sidebar | vote cards | expenses */}
      <div className={cn("lg:grid lg:gap-8 lg:items-start", expenseRecord ? "lg:grid-cols-[220px_1fr_220px]" : "lg:grid-cols-[220px_1fr]")}>

        <PeerAlignment dna={dna} votedWith={votedWith} />

        {/* Center: Recent Votes */}
        <div>
          <div className="space-y-2">
            {recentVotes.map((m, i) => (
              <MotionCardItem
                key={m.id}
                motion={m}
                index={i}
                vote={m.votes[selected]}
                showSummary={false}
                votePlacement="header"
              />
            ))}
          </div>

          <button
            onClick={() => navigate(`/councillors/${slug}/votes`)}
            className="w-full mt-3 py-3 text-sm font-semibold text-[#004a99] bg-white border border-slate-200 rounded-2xl hover:border-[#004a99]/40 hover:shadow-sm transition-all"
          >
            See all {totalVoteCount.toLocaleString()} votes →
          </button>
        </div>

        {expenseRecord && (
          <ExpenseBreakdown expenseRecord={expenseRecord} sourceUrl={expenses.source_url} />
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
