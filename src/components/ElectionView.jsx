import React, { useMemo, useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ExternalLink, Vote, Info, Clock, CheckCircle2, AlertCircle, User, Mail, Phone, ChevronRight, ChevronDown, Building2, GraduationCap } from 'lucide-react';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { nameToSlug } from '../utils/slug';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAppContext } from '../contexts/AppContext';
import YourWardCard from './YourWardCard';
import { CivicCard, CivicPill, CivicSectionLabel } from './ui/CivicCard';

const TorontoFullMap = lazy(() => import('./TorontoFullMap'));

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
  const { wardId: savedWardId } = useAppContext();
  const today = new Date();
  const [candidateData, setCandidateData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);

  useEffect(() => {
    const blobBase = import.meta.env.VITE_BLOB_BASE_URL;
    fetch(blobBase ? `${blobBase}/candidates.json` : '/data/candidates.json')
      .then(res => res.json())
      .then(data => setCandidateData(data))
      .catch(err => console.error('Failed to load candidates:', err));
  }, []);

  useEffect(() => {
    const blobBase = import.meta.env.VITE_BLOB_BASE_URL;
    fetch(blobBase ? `${blobBase}/wards.geojson` : '/data/wards.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('Failed to load ward boundaries:', err));
  }, []);
  
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

  const councillorName = savedWardId ? WARD_COUNCILLORS[savedWardId] : null;

  return (
    <div className="flex flex-col space-y-4 pb-20">
      {/* Election races */}
      <section className="order-4 space-y-4">
        
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            {/* Intelligence Column */}
            <div className="hidden">
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
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
                  <div>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Incumbent</p>
                    <p className="text-sm font-bold text-slate-900">Olivia Chow</p>
                  </div>
                  <Link to="/councillors/olivia-chow" className="text-xs font-semibold text-[#004a99] hover:underline">Voting Record</Link>
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
                </div>
                {savedWard && councillorName && (
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
                    <div>
                      <p className="text-[9px] font-bold text-[#004a99] uppercase tracking-widest">Incumbent</p>
                      <p className="text-sm font-bold text-slate-900">{councillorName}</p>
                    </div>
                    <Link to={`/councillors/${nameToSlug(councillorName)}`} className="text-xs font-semibold text-[#004a99] hover:underline">Legislative Record</Link>
                  </div>
                )}
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

      {/* My ward */}
      <section className="order-2 space-y-1.5">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 items-stretch overflow-hidden">
          <div className="lg:col-span-2 flex flex-col gap-1.5 min-w-0">
            <CivicSectionLabel>My ward</CivicSectionLabel>
            <div className="grid grid-cols-2 gap-3 items-stretch flex-1 min-w-0 h-[140px]">
              <YourWardCard />
              <CivicCard className="h-[140px]">
                <CivicPill className="bg-[#004a99]/10 text-[#004a99]">Candidates</CivicPill>
                <div className="grid grid-cols-2 gap-3 flex-1 items-end">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Your ward</p>
                    <p className="text-2xl font-black text-[#004a99]">{savedWardId ? wardCandidates.length.toLocaleString() : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Mayor</p>
                    <p className="text-2xl font-black text-[#004a99]">{candidateData?.mayor ? candidateData.mayor.length.toLocaleString() : '—'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                  <span className="text-[9px] text-slate-400">registered candidates</span>
                  <Link to="#candidates" className="text-[9px] font-semibold text-[#004a99]">See more</Link>
                </div>
              </CivicCard>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-1.5 min-w-0">
            <CivicSectionLabel>Important dates</CivicSectionLabel>
            <div className="grid grid-cols-2 gap-3 items-stretch flex-1 min-w-0">
              <CivicCard className="h-[140px]">
                <CivicPill className="bg-amber-50 text-amber-700">Key period</CivicPill>
                <p className="text-xs font-semibold text-slate-800 leading-snug flex-1">Nomination period</p>
                <p className="text-sm text-slate-500 leading-snug">{isNominationPast ? 'Nominations are closed.' : isNominationOpen ? 'Nominations are open.' : 'Nominations open May 1.'}</p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                  <span className="text-[9px] text-slate-400">Closes Aug 21</span>
                  <span className={cn("text-[9px] font-semibold", isNominationOpen ? "text-emerald-600" : "text-slate-500")}>
                    {isNominationOpen ? 'Open now' : isNominationPast ? 'Closed' : 'Upcoming'}
                  </span>
                </div>
              </CivicCard>

              <CivicCard className="h-[140px]">
                <CivicPill className="bg-slate-100 text-slate-600">Registration</CivicPill>
                <p className="text-xs font-semibold text-slate-800 leading-snug flex-1">Check your registration before election day.</p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                  <span className="text-[9px] text-slate-400">MyVote information</span>
                  <a href="https://www.toronto.ca/city-government/elections/voter-information/" target="_blank" rel="noopener noreferrer" className="text-[9px] font-semibold text-[#004a99]">Check MyVote ↗</a>
                </div>
              </CivicCard>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-1.5 min-w-0">
            <CivicSectionLabel>Voting days</CivicSectionLabel>
            <div className="grid grid-cols-2 gap-3 items-stretch flex-1 min-w-0">
              <CivicCard className="h-[140px]">
                <CivicPill className="bg-blue-50 text-[#004a99]">Election day</CivicPill>
                <p className="text-xs font-semibold text-slate-800 leading-snug flex-1">Monday, October 26, 2026, from 10 a.m. to 8 p.m.</p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                  <span className="text-[9px] text-slate-400">Citywide schedule</span>
                  <a href="https://www.toronto.ca/city-government/elections/voter-information/" target="_blank" rel="noopener noreferrer" className="text-[9px] font-semibold text-[#004a99]">Check MyVote ↗</a>
                </div>
              </CivicCard>

              <CivicCard className="h-[140px]">
                <CivicPill className="bg-slate-100 text-slate-600">Advance voting</CivicPill>
                <p className="text-xs font-semibold text-slate-800 leading-snug flex-1">October 6–11, 2026, from 10 a.m. to 7 p.m.</p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                  <span className="text-[9px] text-slate-400">Citywide schedule</span>
                  <a href="https://www.toronto.ca/city-government/elections/voter-information/" target="_blank" rel="noopener noreferrer" className="text-[9px] font-semibold text-[#004a99]">Check MyVote ↗</a>
                </div>
              </CivicCard>
            </div>
          </div>
        </div>
      </section>

      {/* Resources List */}
      <section className="order-5 space-y-6">
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

      {/* City-wide explorer */}
      <section className="order-6 space-y-4 pt-8 border-t border-slate-100">
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

        <Suspense fallback={<div className="w-full h-[420px] rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />}>
          <TorontoFullMap
            geojson={geoData}
            wardActivity={null}
            isFullscreen={mapFullscreen}
            onToggleFullscreen={() => setMapFullscreen(open => !open)}
          />
        </Suspense>
      </section>

      {/* Footnote */}
      <div className="order-7 pt-8 text-center">
        <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
          Motions is an independent civic data project and is not affiliated with the City of Toronto or Toronto Elections. Always verify official dates and requirements at toronto.ca.
        </p>
      </div>
    </div>
  );
}
