import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ExternalLink, Vote, Info, Clock, CheckCircle2, AlertCircle, User, Mail, Phone, ChevronRight, ChevronDown, Building2, GraduationCap } from 'lucide-react';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { getWardId } from '../utils/storage';
import { nameToSlug } from '../utils/slug';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const ELECTION_DATE = new Date('2026-10-26T00:00:00');
const NOMINATION_OPEN = new Date('2026-05-01T08:30:00');
const NOMINATION_CLOSE = new Date('2026-08-21T14:00:00');

export default function ElectionView() {
  const savedWardId = getWardId();
  const today = new Date();
  const [candidateData, setCandidateData] = useState(null);
  const [expandedWards, setExpandedWards] = useState({});
  const [candidateView, setCandidateView] = useState(savedWardId ? 'ward' : 'mayor');

  useEffect(() => {
    fetch('/data/candidates.json')
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

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Hero Header */}
      <section className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider"
        >
          <Vote className="w-3.5 h-3.5" />
          Toronto Municipal Election 2026
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          {savedWard ? (
            <>Your Ward: <span className="text-blue-600">{savedWard.name}</span></>
          ) : (
            <>Election Day is <span className="text-blue-600">October 26</span></>
          )}
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          {savedWard 
            ? `Review the candidates and the incumbent track record for Ward ${savedWard.id} before heading to the polls.`
            : "The 2026–2030 term will decide the future of Toronto's housing, transit, and infrastructure. Make sure you're ready to vote."
          }
        </p>
      </section>

      {/* Your Ballot - Explainer */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "1. Mayor", desc: "One candidate city-wide", icon: <Building2 className="w-5 h-5" />, color: "bg-purple-50 text-purple-600 border-purple-100" },
          { title: "2. Councillor", desc: "One candidate for your ward", icon: <User className="w-5 h-5" />, color: "bg-blue-50 text-blue-600 border-blue-100" },
          { title: "3. Trustee", desc: "One for your school board", icon: <GraduationCap className="w-5 h-5" />, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
        ].map((item, i) => (
          <div key={i} className={cn("p-4 rounded-3xl border flex items-center gap-4", item.color)}>
            <div className="shrink-0 w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
              {item.icon}
            </div>
            <div>
              <h4 className="font-black text-sm">{item.title}</h4>
              <p className="text-xs opacity-80 font-medium">{item.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Primary Focus: The Candidates & Records */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden relative shadow-2xl shadow-blue-900/20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight italic">The 2026 Field</h2>
            <p className="text-slate-400 text-lg">
              Review the track records of your current representatives and explore the profiles of new candidates.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Intelligence Column */}
            <div className="space-y-6">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-blue-400 px-2">
                <CheckCircle2 className="w-4 h-4" />
                Track Records
              </h3>
              
              <div className="space-y-4">
                {/* Mayor Card */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4 hover:bg-white/10 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400">The Mayor</p>
                        <p className="font-bold text-lg leading-none">City-Wide Race</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Incumbent</p>
                       <p className="text-xs text-slate-400">Olivia Chow</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Link 
                      to="/councillors/olivia-chow"
                      className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all flex flex-col items-center justify-center text-center gap-1 group/btn"
                    >
                      <span className="text-xs font-bold text-white group-hover/btn:text-blue-400 transition-colors">Voting Record</span>
                      <span className="text-[9px] text-slate-400">2023–2026 Term</span>
                    </Link>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center gap-1 grayscale opacity-50 cursor-not-allowed">
                      <span className="text-xs font-bold text-white">Campaign Platform</span>
                      <span className="text-[9px] text-slate-400">Coming Soon</span>
                    </div>
                  </div>
                </div>

                {/* Councillor Card */}
                {savedWard ? (
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4 hover:bg-white/10 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Ward {savedWard.id}</p>
                          <p className="font-bold text-lg leading-none">{savedWard.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Incumbent</p>
                        <p className="text-xs text-slate-400">{councillorName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link 
                        to={`/councillors/${nameToSlug(councillorName)}`}
                        className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all flex flex-col items-center justify-center text-center gap-1 group/btn"
                      >
                        <span className="text-xs font-bold text-white group-hover/btn:text-blue-400 transition-colors">Legislative Record</span>
                        <span className="text-[9px] text-slate-400">350+ Votes Tracked</span>
                      </Link>
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center gap-1 grayscale opacity-50 cursor-not-allowed">
                        <span className="text-xs font-bold text-white">Nomination Docs</span>
                        <span className="text-[9px] text-slate-400">Registered May 1</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-8 text-center space-y-4">
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
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 items-start">
                   <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                   <p className="text-[10px] text-amber-200/70 leading-relaxed">
                     <strong className="text-amber-400">Note for New Candidates:</strong> Since new candidates do not have a City Council voting record, we will be linking their official campaign websites and social media platforms as they become available.
                   </p>
                </div>
              </div>
            </div>

            {/* The Candidates Column */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-400">
                  <Vote className="w-4 h-4" />
                  The 2026 Candidates
                </h3>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setCandidateView('mayor')}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all",
                      candidateView === 'mayor' ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"
                    )}
                  >Mayor</button>
                  <button 
                    onClick={() => setCandidateView('ward')}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all",
                      candidateView === 'ward' ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"
                    )}
                  >Ward {savedWardId || ''}</button>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 h-[400px] overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {candidateView === 'mayor' ? (
                    candidateData?.mayor.length > 0 ? (
                      candidateData.mayor.map((c, i) => (
                        <div key={i} className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">{c.name}</span>
                              {c.name.toLowerCase().includes('chow') && (
                                <span className="text-[8px] bg-purple-500/20 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest text-purple-300">Incumbent</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {c.email && <a href={`mailto:${c.email}`} className="text-slate-400 hover:text-white"><Mail className="w-3.5 h-3.5" /></a>}
                              {c.phone && <a href={`tel:${c.phone}`} className="text-slate-400 hover:text-white"><Phone className="w-3.5 h-3.5" /></a>}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 italic text-center py-8">No Mayor candidates registered yet</p>
                    )
                  ) : (
                    wardCandidates.length > 0 ? (
                      wardCandidates.map((c, i) => (
                        <div key={i} className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">{c.name}</span>
                              {c.name.toLowerCase().includes(councillorName?.toLowerCase() || '') && (
                                <span className="text-[8px] bg-blue-500/20 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest text-blue-300">Incumbent</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {c.email && <a href={`mailto:${c.email}`} className="text-slate-400 hover:text-white"><Mail className="w-3.5 h-3.5" /></a>}
                              {c.phone && <a href={`tel:${c.phone}`} className="text-slate-400 hover:text-white"><Phone className="w-3.5 h-3.5" /></a>}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 space-y-4">
                        <Info className="w-8 h-8 text-slate-700 mx-auto opacity-50" />
                        <p className="text-sm text-slate-500 italic">No candidates have registered for Ward {savedWardId || 'this ward'} yet.</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Grid - Secondary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col items-center justify-center text-center space-y-2 shadow-xl shadow-slate-200"
        >
          <span className="text-5xl font-black tabular-nums">{daysUntil}</span>
          <span className="text-slate-400 font-medium uppercase tracking-widest text-xs">Days to Election</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Key Period</span>
            </div>
            <h3 className="font-bold text-slate-900">Nomination Period</h3>
            <p className="text-sm text-slate-500">Candidates can file papers to run for Mayor or Councillor.</p>
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
            <span className="text-xs text-slate-400 font-medium">Closes Aug 21</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Info className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Registration</span>
            </div>
            <h3 className="font-bold text-slate-900">Voter Registry</h3>
            <p className="text-sm text-slate-500">Check if you are on the list to vote in October.</p>
          </div>
          <a 
            href="https://www.toronto.ca/city-government/elections/voter-information/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all"
          >
            Check Status <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>
      </div>

      {/* Resources List */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 px-2">Official Election Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all flex justify-between items-start gap-4"
            >
              <div className="space-y-1">
                <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.label}</p>
                <p className="text-sm text-slate-400 leading-snug">{item.description}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-400 mt-1 transition-colors" />
            </a>
          ))}
        </div>
      </section>

      {/* Candidate Explorer - Moved to Bottom */}
      <section className="space-y-6 pt-12 border-t border-slate-100">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900">City-Wide Explorer</h3>
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
              <div key={ward.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
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
                        {candidates.length} Candidate{candidates.length !== 1 ? 's' : ''}
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
