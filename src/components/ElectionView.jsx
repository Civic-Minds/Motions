import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ExternalLink, Vote, Info, Clock, CheckCircle2, AlertCircle, User, Mail, Phone, ChevronRight, ChevronDown, Building2, GraduationCap } from 'lucide-react';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { nameToSlug } from '../utils/slug';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAppContext } from '../contexts/AppContext';

const ELECTION_DATE = new Date('2026-10-26T00:00:00');
const NOMINATION_OPEN = new Date('2026-05-01T08:30:00');
const NOMINATION_CLOSE = new Date('2026-08-21T14:00:00');

const formatNominationDate = (date) => {
  if (!date) return null;
  return `Filed ${date}`;
};

function CandidateList({ candidates, emptyText, incumbentName, incumbentClass }) {
  if (!candidates?.length) {
    return <p className="text-sm text-slate-500 italic text-center py-8">{emptyText}</p>;
  }

  return (
    <div className="space-y-2">
      {candidates.map((candidate, i) => {
        const isIncumbent = incumbentName && candidate.name.toLowerCase() === incumbentName.toLowerCase();
        return (
          <div key={`${candidate.name}-${i}`} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-sm text-slate-900 truncate">{candidate.name}</span>
              {isIncumbent && (
                <span className={cn("shrink-0 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest", incumbentClass)}>
                  Incumbent
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {formatNominationDate(candidate.nominationDate) && (
                <span className="text-[9px] text-slate-500">{formatNominationDate(candidate.nominationDate)}</span>
              )}
              {candidate.email && <a href={`mailto:${candidate.email}`} aria-label={`Email ${candidate.name}`} className="text-slate-400 hover:text-slate-900"><Mail className="w-3.5 h-3.5" /></a>}
              {candidate.phone && <a href={`tel:${candidate.phone}`} aria-label={`Call ${candidate.name}`} className="text-slate-400 hover:text-slate-900"><Phone className="w-3.5 h-3.5" /></a>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ElectionView() {
  const { wardId: savedWardId, handleSetWard } = useAppContext();
  const today = new Date();
  const [candidateData, setCandidateData] = useState(null);
  const [expandedWards, setExpandedWards] = useState({});

  useEffect(() => {
    const blobBase = import.meta.env.VITE_BLOB_BASE_URL;
    fetch(blobBase ? `${blobBase}/candidates.json` : '/data/candidates.json')
      .then(res => res.json())
      .then(data => setCandidateData(data))
      .catch(err => console.error('Failed to load candidates:', err));
  }, []);
  
  const daysUntil = Math.ceil((ELECTION_DATE - today) / (1000 * 60 * 60 * 24));
  const isNominationOpen = today >= NOMINATION_OPEN && today <= NOMINATION_CLOSE;
  const isNominationPast = today > NOMINATION_CLOSE;

  const savedWard = useMemo(() => 
    TORONTO_WARDS.find(w => w.id === savedWardId),
    [savedWardId]
  );

  const wardCandidates = useMemo(() => {
    if (!candidateData || !savedWardId) return [];
    return candidateData.wards[savedWardId] || [];
  }, [candidateData, savedWardId]);

  const toggleWard = (id) => {
    setExpandedWards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const councillorName = savedWardId ? WARD_COUNCILLORS[savedWardId] : null;

  const handleWardChange = (event) => {
    const wardId = event.target.value || null;
    handleSetWard(wardId);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Page header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Election</p>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Toronto Election 2026</h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            {savedWard
              ? `Review the candidates and incumbent track record for Ward ${savedWard.id} before October 26.`
              : "Election day is October 26. Review the candidates and get ready to vote."
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="election-ward" className="text-xs font-bold text-slate-500">See your ward’s candidates</label>
          <select
            id="election-ward"
            value={savedWardId || ''}
            onChange={handleWardChange}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 focus:border-[#004a99] focus:outline-none focus:ring-2 focus:ring-[#004a99]/10"
          >
            <option value="">Choose a ward</option>
            {TORONTO_WARDS.map(ward => (
              <option key={ward.id} value={ward.id}>Ward {ward.id} — {ward.name}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Your Ballot - Explainer */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { title: "1. Mayor", desc: "One candidate city-wide", icon: <Building2 className="w-5 h-5" /> },
          { title: "2. Councillor", desc: "One candidate for your ward", icon: <User className="w-5 h-5" /> },
          { title: "3. Trustee", desc: "One for your school board", icon: <GraduationCap className="w-5 h-5" /> },
        ].map((item, i) => (
          <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 text-[#004a99] flex items-center justify-center">
              {item.icon}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Primary Focus: The Candidates & Records */}
      <section className="space-y-4">
        
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            {/* Intelligence Column */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
              <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                Track Records
              </h3>
              
              <div className="space-y-3">
                {/* Mayor Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:bg-white transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#004a99]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mayor</p>
                        <p className="font-bold text-sm leading-none">Citywide</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Incumbent</p>
                       <p className="text-xs text-slate-400">Olivia Chow</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Link 
                      to="/councillors/olivia-chow"
                      className="p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col items-center justify-center text-center gap-1 group/btn"
                    >
                      <span className="text-xs font-bold text-slate-900 group-hover/btn:text-blue-600 transition-colors">Voting Record</span>
                      <span className="text-[9px] text-slate-400">2023–2026 Term</span>
                    </Link>
                    <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center gap-1 grayscale opacity-50 cursor-not-allowed">
                      <span className="text-xs font-bold text-slate-900">Campaign Platform</span>
                      <span className="text-[9px] text-slate-400">Coming Soon</span>
                    </div>
                  </div>
                </div>

                {/* Councillor Card */}
                {savedWard ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:bg-white transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-[#004a99]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ward {savedWard.id}</p>
                          <p className="font-bold text-sm leading-none">{savedWard.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-[#004a99] uppercase tracking-widest">Incumbent</p>
                        <p className="text-xs text-slate-400">{councillorName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link 
                        to={`/councillors/${nameToSlug(councillorName)}`}
                        className="p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col items-center justify-center text-center gap-1 group/btn"
                      >
                        <span className="text-xs font-bold text-slate-900 group-hover/btn:text-blue-600 transition-colors">Legislative Record</span>
                        <span className="text-[9px] text-slate-400">350+ Votes Tracked</span>
                      </Link>
                      <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center gap-1 grayscale opacity-50 cursor-not-allowed">
                      <span className="text-xs font-bold text-slate-900">Candidate Record</span>
                      <span className="text-[9px] text-slate-400">Official listing</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-5 text-center space-y-3">
                    <p className="text-sm text-slate-400 italic">Save your ward to view your local representative's track record</p>
                    <Link 
                      to="/wards" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all"
                    >
                      <MapPin className="w-4 h-4" />
                      Find My Ward
                    </Link>
                  </div>
                )}

                {/* Non-Incumbent Notice */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex gap-3 items-start">
                   <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                   <p className="text-xs text-amber-800 leading-relaxed">
                     <strong>Note for new candidates:</strong> Since new candidates do not have a City Council voting record, we will link their official campaign websites and social media platforms as they become available.
                   </p>
                </div>
              </div>
            </div>

            {/* The Candidates Column */}
            <div className="space-y-3 order-first">
              <div className="flex items-center gap-2 px-1">
                <Vote className="w-4 h-4 text-[#004a99]" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">2026 candidates</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mayor</p>
                    <h4 className="font-bold text-sm text-slate-900">Citywide</h4>
                  </div>
                  <span className="text-[10px] text-slate-400">One choice</span>
                </div>
                <CandidateList
                  candidates={candidateData?.mayor}
                  emptyText="No mayor candidates registered yet."
                  incumbentName="Olivia Chow"
                  incumbentClass="bg-purple-50 text-purple-700"
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">City Councillor</p>
                    <h4 className="font-bold text-sm text-slate-900">{savedWard ? `Ward ${savedWard.id} · ${savedWard.name}` : 'Choose a ward first'}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400">One choice</span>
                </div>
                <CandidateList
                  candidates={wardCandidates}
                  emptyText={savedWardId ? `No candidates registered for Ward ${savedWardId} yet.` : 'Choose a ward to see its candidates.'}
                  incumbentName={councillorName}
                  incumbentClass="bg-blue-50 text-blue-700"
                />
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Grid - Secondary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 flex flex-col items-center justify-center text-center space-y-2"
        >
          <span className="text-3xl font-black tabular-nums">{daysUntil}</span>
          <span className="text-slate-400 font-medium uppercase tracking-widest text-xs">Days to Election</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Key Period</span>
            </div>
            <h3 className="font-bold text-slate-900">Nomination Period</h3>
            <p className="text-sm text-slate-500">Nominations are closed. The registered candidate list is shown above.</p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Status</span>
              <span className={cn(
                "text-sm font-bold",
                isNominationOpen ? "text-emerald-600" : isNominationPast ? "text-slate-400" : "text-amber-600"
              )}>
                {isNominationOpen ? "Open Now" : isNominationPast ? "Closed" : "Opening May 1"}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Closed Aug 21 at 2 p.m.</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Info className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Registration</span>
            </div>
            <h3 className="font-bold text-slate-900">Get ready to vote</h3>
            <p className="text-sm text-slate-500">From September 1, check your voter registration and request a mail-in ballot.</p>
          </div>
          <a 
            href="https://www.toronto.ca/city-government/elections/voter-information/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all"
          >
            Check MyVote <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>
      </div>

      {/* Resources List */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1">Official election resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Toronto Elections (Official)', url: 'https://www.toronto.ca/city-government/elections/', description: 'Official source for all voting information, dates, and results.' },
            { label: 'Voter Information', url: 'https://www.toronto.ca/city-government/elections/voter-information/', description: 'How to vote, where to vote, and eligibility requirements.' },
            { label: 'Candidate Information', url: 'https://www.toronto.ca/city-government/elections/candidate-information/', description: 'Rules and resources for people running for office.' },
            { label: 'Voter Registry Check', url: 'https://www.toronto.ca/city-government/elections/voter-information/voter-registration/', description: 'Ensure your name is on the list for the upcoming election.' }
          ].map((item, i) => (
            <a 
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 bg-white border border-slate-200 rounded-2xl hover:border-[#004a99]/40 hover:shadow-sm transition-all flex justify-between items-start gap-4"
            >
              <div className="space-y-1">
                <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.label}</p>
                <p className="text-sm text-slate-400 leading-snug">{item.description}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#004a99] mt-1 transition-colors" />
            </a>
          ))}
        </div>
      </section>

      {/* Candidate Explorer - Moved to Bottom */}
      <section className="space-y-4 pt-8 border-t border-slate-100">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">City-wide explorer</h3>
            <p className="text-sm text-slate-400">Browse candidates across all 25 Toronto wards</p>
          </div>
          {candidateData && (
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Updated: {new Date(candidateData.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {TORONTO_WARDS.map(ward => {
            const candidates = candidateData?.wards[ward.id] || [];
            const isExpanded = expandedWards[ward.id];
            
            return (
              <div key={ward.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => toggleWard(ward.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                      {ward.id}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-none">{ward.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                        {candidates.length.toLocaleString()} Candidate{candidates.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-300" /> : <ChevronRight className="w-5 h-5 text-slate-300" />}
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 border-t border-slate-50 pt-4 bg-slate-50/50">
                    {candidates.length > 0 ? (
                      candidates.map((c, i) => (
                        <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{c.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {c.email && <span className="text-[10px] text-slate-400">{c.email}</span>}
                                {c.email && c.phone && <span className="text-slate-200 text-[10px]">|</span>}
                                {c.phone && <span className="text-[10px] text-slate-400">{c.phone}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-2">No candidates registered yet</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footnote */}
      <div className="pt-8 text-center">
        <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
          Motions is an independent civic data project and is not affiliated with the City of Toronto or Toronto Elections. Always verify official dates and requirements at toronto.ca.
        </p>
      </div>
    </div>
  );
}
