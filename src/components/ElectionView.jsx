import React, { useMemo, useState, useEffect, lazy, Suspense } from 'react';
import { Calendar, MapPin, ExternalLink, Vote, Info, Clock, CheckCircle2, AlertCircle, User, Mail, Phone, ChevronRight, ChevronDown, Building2, GraduationCap } from 'lucide-react';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { nameToSlug } from '../utils/slug';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { extractWardId } from '../utils/ward';
import { useAppContext } from '../contexts/AppContext';
import YourWardCard from './YourWardCard';
import { CivicCard, CivicCardFooter, CivicPill, CivicSectionLabel } from './ui/CivicCard';
import { PageMeta } from './PageMeta';
import { previewImage } from '../utils/meta';
import ShareButton from './ShareButton';
import { union as unionPolygons } from '@turf/union';

const TorontoFullMap = lazy(() => import('./TorontoFullMap'));

const candidateCountLabel = count => `${count.toLocaleString()} candidate${count === 1 ? '' : 's'}`;

const TRUSTEE_BOARDS = [
  { id: 'tdsb', label: 'English public', name: 'Toronto District School Board', wardsByCityWard: { 1: '1', 2: '2', 3: '2', 4: '3', 5: '6', 6: '4', 7: '1', 8: '6', 9: '8', 10: '5', 11: '7', 12: '7', 13: '7', 14: '10', 15: '8', 16: '8', 17: '9', 18: '4', 19: '10', 20: '10', 21: '11', 22: '9', 23: '11', 24: '12', 25: '12' } },
  { id: 'tdcsb', label: 'English Catholic', name: 'Toronto Catholic District School Board', wardsByCityWard: { 1: '1', 2: '2', 3: '4', 4: '4', 5: '10', 6: '5', 7: '3', 8: '5', 9: '6', 10: '9', 11: '9', 12: '9', 13: '9', 14: '11', 15: '11', 16: '11', 17: '11', 18: '5', 19: '11', 20: '12', 21: '7', 22: '7', 23: '8', 24: '12', 25: '8' } },
  { id: 'csv', label: 'French public', name: 'Conseil scolaire Viamonde', wardNames: { 2: '2 – Est', 3: '3 – Centre', 4: '4 – Ouest' }, wardsByCityWard: { 1: '4', 2: '4', 3: '4', 4: '4', 5: '4', 6: '2', 7: '4', 8: '4', 9: '4', 10: '3', 11: '3', 12: '3', 13: '3', 14: '3', 15: '2', 16: '2', 17: '2', 18: '2', 19: '3', 20: '2', 21: '2', 22: '2', 23: '2', 24: '2', 25: '2' } },
  { id: 'cscm', label: 'French Catholic', name: 'Conseil scolaire catholique MonAvenir', wardNames: { 3: '3 – Toronto Ouest', 4: '4 – Toronto Est' }, wardsByCityWard: { 1: '3', 2: '3', 3: '3', 4: '3', 5: '3', 6: '3', 7: '3', 8: '3', 9: '3', 10: '3', 11: '3', 12: '3', 13: '3', 14: '4', 15: '4', 16: '4', 17: '4', 18: '3', 19: '4', 20: '4', 21: '4', 22: '4', 23: '4', 24: '4', 25: '4' } }
];

function CandidateList({ candidates, emptyText, incumbentName, incumbentClass, hideIncumbent = false, initialVisible = Infinity }) {
  const [showAll, setShowAll] = useState(false);
  const listedCandidates = hideIncumbent && incumbentName
    ? candidates?.filter(candidate => candidate.name.toLowerCase() !== incumbentName.toLowerCase())
    : candidates;

  if (!listedCandidates?.length) {
    return <p className="text-sm text-slate-500 italic text-center py-8">{emptyText}</p>;
  }

  const orderedCandidates = [...listedCandidates].sort((a, b) => {
    const aIsIncumbent = incumbentName && a.name.toLowerCase() === incumbentName.toLowerCase();
    const bIsIncumbent = incumbentName && b.name.toLowerCase() === incumbentName.toLowerCase();
    if (aIsIncumbent !== bIsIncumbent) return aIsIncumbent ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  const visibleCandidates = showAll ? orderedCandidates : orderedCandidates.slice(0, initialVisible);

  return (
    <div className="space-y-1.5">
      {visibleCandidates.map((candidate, i) => {
        const isIncumbent = incumbentName && candidate.name.toLowerCase() === incumbentName.toLowerCase();
        return (
          <div key={`${candidate.name}-${i}`} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-sm text-slate-900 truncate">{candidate.name}</span>
              {isIncumbent && (
                <span className={cn("shrink-0 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest", incumbentClass)}>
                  Incumbent
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {candidate.website && <a href={candidate.website} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${candidate.name}'s website`} className="text-slate-500 hover:text-[#004a99]"><ExternalLink className="w-3.5 h-3.5" /></a>}
              {candidate.email && <a href={`mailto:${candidate.email}`} aria-label={`Email ${candidate.name}`} className="text-slate-500 hover:text-slate-900"><Mail className="w-3.5 h-3.5" /></a>}
              {candidate.phone && <a href={`tel:${candidate.phone}`} aria-label={`Call ${candidate.name}`} className="text-slate-500 hover:text-slate-900"><Phone className="w-3.5 h-3.5" /></a>}
            </div>
          </div>
        );
      })}
      {orderedCandidates.length > initialVisible && (
        <button type="button" onClick={() => setShowAll(value => !value)} className="w-full pt-1 text-xs font-semibold text-[#004a99] hover:underline">
          {showAll ? 'Show fewer candidates' : `Show ${orderedCandidates.length - initialVisible} more candidates`}
        </button>
      )}
    </div>
  );
}

function ChangeWardButton({ onChange }) {
  const { handleSetWard } = useAppContext();
  const [open, setOpen] = useState(false);

  function selectWard(id) {
    if (!id) return;
    handleSetWard(id);
    onChange?.(id);
    setOpen(false);
  }

  return (
    <div className="relative shrink-0">
      <button type="button" onClick={() => setOpen(value => !value)} className="text-xs font-semibold text-[#004a99] hover:underline">
        Change ward
      </button>
      {open && (
        <div role="listbox" aria-label="Choose your ward" className="absolute right-0 top-7 z-20 max-h-72 w-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 text-xs text-slate-700 shadow-xl">
          {TORONTO_WARDS.map(ward => (
            <button key={ward.id} type="button" role="option" onClick={() => selectWard(ward.id)} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-blue-50 hover:text-[#004a99]">
              Ward {ward.id} · {ward.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChangeSystemButton({ boardId, boards, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button type="button" onClick={() => setOpen(value => !value)} className="text-xs font-semibold text-[#004a99] hover:underline">
        Change system
      </button>
      {open && (
        <div role="listbox" aria-label="Choose your school system" className="absolute right-0 top-7 z-20 w-72 rounded-xl border border-slate-200 bg-white p-1.5 text-xs text-slate-700 shadow-xl">
          {boards.map(board => (
            <button key={board.id} type="button" role="option" aria-selected={board.id === boardId} onClick={() => { onChange(board.id); setOpen(false); }} className={cn("block w-full rounded-lg px-3 py-2 text-left", board.id === boardId ? "bg-blue-50 font-semibold text-[#004a99]" : "hover:bg-blue-50 hover:text-[#004a99]")}>
              {board.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function buildTrusteeGeojson(geoData, board) {
  if (!geoData?.features?.length) return null;
  const cityFeatures = Object.fromEntries(geoData.features.map(feature => [extractWardId(feature.properties), feature]));
  const features = [...new Set(Object.values(board.wardsByCityWard))].map(trusteeWard => {
    const cityFeaturesForTrusteeWard = Object.entries(board.wardsByCityWard)
      .filter(([, mappedWard]) => mappedWard === trusteeWard)
      .map(([cityWard]) => cityFeatures[cityWard])
      .filter(Boolean);
    const geometry = cityFeaturesForTrusteeWard.length === 1
      ? cityFeaturesForTrusteeWard[0].geometry
      : unionPolygons({ type: 'FeatureCollection', features: cityFeaturesForTrusteeWard })?.geometry;
    return {
      type: 'Feature',
      properties: { WARD_NUM: trusteeWard },
      geometry
    };
  }).filter(feature => feature.geometry);
  return { type: 'FeatureCollection', features };
}

function TrusteeSection({ candidateData, wardId, geoData, onCityWardChange }) {
  const [boardId, setBoardId] = useState('tdsb');
  const [selectedTrusteeWard, setSelectedTrusteeWard] = useState(null);
  const board = TRUSTEE_BOARDS.find(item => item.id === boardId) || TRUSTEE_BOARDS[0];
  const userTrusteeWard = wardId ? board.wardsByCityWard[wardId] : null;
  const trusteeWards = [...new Set(Object.values(board.wardsByCityWard))].sort((a, b) => Number(a) - Number(b));
  const trusteeWard = selectedTrusteeWard || userTrusteeWard || trusteeWards[0] || null;
  const candidates = trusteeWard ? candidateData?.trustees?.[board.id]?.[trusteeWard] || [] : [];
  const trusteeGeojson = useMemo(() => buildTrusteeGeojson(geoData, board), [geoData, board]);
  const trusteeWardCards = trusteeWards.map(wardNumber => ({ id: wardNumber, name: board.wardNames?.[wardNumber] ? `Trustee ward ${board.wardNames[wardNumber]}` : `Trustee ward ${wardNumber}` }));
  const trusteeWardCandidateCounts = Object.fromEntries(
    trusteeWardCards.map(trusteeWardCard => {
      const count = candidateData?.trustees?.[board.id]?.[trusteeWardCard.id]?.length || 0;
      return [trusteeWardCard.id, `${count.toLocaleString()} candidates`];
    })
  );
  useEffect(() => {
    setSelectedTrusteeWard(null);
  }, [boardId, wardId]);

  return (
    <section className="order-7 space-y-3">
      {geoData && trusteeWard && (
        <div>
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <h3 className="text-lg font-bold text-slate-900">Trustee candidates</h3>
            <div className="flex items-center gap-2">
              <ChangeSystemButton boardId={boardId} boards={TRUSTEE_BOARDS} onChange={setBoardId} />
              <ChangeWardButton onChange={onCityWardChange} />
              <ShareButton title="Toronto Trustee Candidates 2026" />
            </div>
          </div>
          <Suspense fallback={<div className="h-[420px] rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />}>
            <TorontoFullMap
              geojson={trusteeGeojson}
              wardActivity={trusteeWardCards}
              wardSubtextById={trusteeWardCandidateCounts}
              wardLabel="Trustee ward"
              wardLabelById={Object.fromEntries(trusteeWardCards.map(ward => [ward.id, ward.name]))}
              highlightWardId={trusteeWard}
              onWardSelect={setSelectedTrusteeWard}
            />
          </Suspense>
          <CivicCard className="mt-3 gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Candidates</p>
                <p className="text-base font-bold text-slate-900">{board.wardNames?.[trusteeWard] ? `Trustee ward ${board.wardNames[trusteeWard]}` : `Trustee ward ${trusteeWard}`}</p>
              </div>
              <span className="text-sm text-slate-500">{candidates.length.toLocaleString()} candidates</span>
            </div>
            <CandidateList candidates={candidates} emptyText="No trustee candidates registered yet." incumbentClass="bg-blue-50 text-blue-700" />
          </CivicCard>
        </div>
      )}
    </section>
  );
}

export default function ElectionView() {
  const { wardId: savedWardId } = useAppContext();
  const [candidateData, setCandidateData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [selectedWardId, setSelectedWardId] = useState(savedWardId || null);

  useEffect(() => {
    const blobBase = import.meta.env.VITE_BLOB_BASE_URL;
    const url = import.meta.env.DEV || !blobBase ? '/data/candidates.json' : `${blobBase}/candidates.json`;
    fetch(url)
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
  
  const savedWard = useMemo(() => 
    TORONTO_WARDS.find(w => w.id === savedWardId),
    [savedWardId]
  );

  const wardCandidates = useMemo(() => {
    if (!candidateData || !savedWardId) return [];
    return candidateData.wards[savedWardId] || [];
  }, [candidateData, savedWardId]);

  const selectedWard = useMemo(() =>
    TORONTO_WARDS.find(w => w.id === selectedWardId),
    [selectedWardId]
  );

  const selectedWardCandidates = useMemo(() => {
    if (!candidateData || !selectedWardId) return [];
    return candidateData.wards?.[selectedWardId] || [];
  }, [candidateData, selectedWardId]);

  const councillorName = savedWardId ? WARD_COUNCILLORS[savedWardId] : null;
  const selectedCouncillorName = selectedWardId ? WARD_COUNCILLORS[selectedWardId] : null;

  const wardCandidateCounts = useMemo(() => {
    if (!candidateData) return null;
    return Object.fromEntries(
      TORONTO_WARDS.map(ward => {
        const count = (candidateData.wards?.[ward.id] || []).length;
        return [ward.id, candidateCountLabel(count)];
      })
    );
  }, [candidateData]);

  return (
    <div className="flex flex-col space-y-4 pb-20">
      <PageMeta
        title="Toronto Election 2026 | Motions Toronto"
        description="Review Toronto candidates, wards, voting dates, and registration information."
        image={previewImage('Toronto Election 2026', 'Toronto municipal election')}
      />
      {/* Election races */}
      <section className="order-7 space-y-4">
        
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            {/* Intelligence Column */}
            <div className="hidden">
              <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
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
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mayor</p>
                        <p className="font-bold text-sm leading-none">Citywide</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Incumbent</p>
                       <p className="text-xs text-slate-500">Olivia Chow</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Link 
                      to="/councillors/olivia-chow"
                      className="p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col items-center justify-center text-center gap-1 group/btn"
                    >
                      <span className="text-xs font-bold text-slate-900 group-hover/btn:text-blue-600 transition-colors">Voting Record</span>
                      <span className="text-[9px] text-slate-500">2023–2026 Term</span>
                    </Link>
                    <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center gap-1 grayscale opacity-50 cursor-not-allowed">
                      <span className="text-xs font-bold text-slate-900">Campaign Platform</span>
                      <span className="text-[9px] text-slate-500">Coming Soon</span>
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
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ward {savedWard.id}</p>
                          <p className="font-bold text-sm leading-none">{savedWard.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-[#004a99] uppercase tracking-widest">Incumbent</p>
                        <p className="text-xs text-slate-500">{councillorName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link 
                        to={`/councillors/${nameToSlug(councillorName)}`}
                        className="p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col items-center justify-center text-center gap-1 group/btn"
                      >
                        <span className="text-xs font-bold text-slate-900 group-hover/btn:text-blue-600 transition-colors">Voting Record</span>
                        <span className="text-[9px] text-slate-500">350+ Votes Tracked</span>
                      </Link>
                      <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center gap-1 grayscale opacity-50 cursor-not-allowed">
                      <span className="text-xs font-bold text-slate-900">Candidate Record</span>
                      <span className="text-[9px] text-slate-500">Official listing</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-5 text-center space-y-3">
                    <p className="text-sm text-slate-500 italic">Save your ward to view your local representative's track record</p>
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
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">2026 candidates</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
              <div className="self-start h-fit bg-white border border-slate-200 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mayor</p>
                    <h4 className="font-bold text-sm text-slate-900">Citywide</h4>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
                  <div>
                    <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">Incumbent</p>
                    <p className="text-sm font-bold text-slate-900">Olivia Chow</p>
                  </div>
                  <Link to="/councillors/olivia-chow" className="text-xs font-semibold text-[#004a99] hover:underline">Voting Record</Link>
                </div>
                <CandidateList
                  candidates={candidateData?.mayor}
                  incumbentName="Olivia Chow"
                  incumbentClass="bg-purple-50 text-purple-700"
                  hideIncumbent
                  emptyText="No other mayor candidates registered yet."
                  initialVisible={10}
                />
              </div>

              <div className="self-start h-fit bg-white border border-slate-200 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">City Councillor</p>
                <h4 className="font-bold text-sm text-slate-900">{selectedWard ? `Ward ${selectedWard.id} · ${selectedWard.name}` : 'Choose a ward first'}</h4>
                  </div>
                </div>
                {selectedWard && selectedCouncillorName && (
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
                    <div>
                      <p className="text-[9px] font-bold text-[#004a99] uppercase tracking-widest">Incumbent</p>
                      <p className="text-sm font-bold text-slate-900">{selectedCouncillorName}</p>
                    </div>
                    <Link to={`/councillors/${nameToSlug(selectedCouncillorName)}`} className="text-xs font-semibold text-[#004a99] hover:underline">Voting Record</Link>
                  </div>
                )}
                <CandidateList
                  candidates={selectedWardCandidates}
                  incumbentName={selectedCouncillorName}
                  incumbentClass="bg-blue-50 text-blue-700"
                  hideIncumbent
                  emptyText={selectedWardId ? `No other candidates registered for Ward ${selectedWardId} yet.` : 'Choose a ward on the map to see its candidates.'}
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
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Your ward</p>
                    <p className="text-2xl font-black text-[#004a99]">{savedWardId ? wardCandidates.length.toLocaleString() : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Mayor</p>
                    <p className="text-2xl font-black text-[#004a99]">{candidateData?.mayor ? candidateData.mayor.length.toLocaleString() : '—'}</p>
                  </div>
                </div>
                <CivicCardFooter align="end">
                  <Link to="#candidates" className="text-[9px] font-semibold text-[#004a99]">See more</Link>
                </CivicCardFooter>
              </CivicCard>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-1.5 min-w-0">
            <CivicSectionLabel>Election information</CivicSectionLabel>
            <div className="grid grid-cols-2 gap-3 items-stretch flex-1 min-w-0">
              <CivicCard className="h-[140px]">
                <CivicPill className="bg-blue-50 text-[#004a99]">Where to vote</CivicPill>
                <p className="text-xs font-semibold text-slate-800 leading-snug flex-1">From September 1, find where and when you can vote.</p>
                <CivicCardFooter align="end">
                  <a href="https://www.toronto.ca/city-government/elections/voter-information/myvote/" target="_blank" rel="noopener noreferrer" className="text-[9px] font-semibold text-[#004a99]">Register ↗</a>
                </CivicCardFooter>
              </CivicCard>

              <CivicCard className="h-[140px]">
                <CivicPill className="bg-slate-100 text-slate-600">How to vote</CivicPill>
                <p className="text-xs font-semibold text-slate-800 leading-snug flex-1">What to bring, how to get help, and your voting rights.</p>
                <CivicCardFooter align="end">
                  <Link to="/election/how-to-vote" className="text-[9px] font-semibold text-[#004a99] whitespace-nowrap">Non-partisan guide ↗</Link>
                </CivicCardFooter>
              </CivicCard>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-1.5 min-w-0">
            <CivicSectionLabel>Voting days</CivicSectionLabel>
            <div className="grid grid-cols-2 gap-3 items-stretch flex-1 min-w-0">
              <CivicCard className="h-[140px]">
                <CivicPill className="bg-blue-50 text-[#004a99]">Election day</CivicPill>
                <p className="text-xs font-semibold text-slate-800 leading-snug flex-1">October 26, 2026, from 10 a.m. to 8 p.m.</p>
                <CivicCardFooter align="end">
                  <a href="https://www.toronto.ca/city-government/elections/voter-information/" target="_blank" rel="noopener noreferrer" className="text-[9px] font-semibold text-[#004a99] whitespace-nowrap">Check MyVote ↗</a>
                </CivicCardFooter>
              </CivicCard>

              <CivicCard className="h-[140px]">
                <CivicPill className="bg-slate-100 text-slate-600">Advance voting</CivicPill>
                <p className="text-xs font-semibold text-slate-800 leading-snug flex-1">October 6–11, 2026, from 10 a.m. to 7 p.m.</p>
                <CivicCardFooter align="end">
                  <a href="https://www.toronto.ca/city-government/elections/voter-information/" target="_blank" rel="noopener noreferrer" className="text-[9px] font-semibold text-[#004a99] whitespace-nowrap">Check MyVote ↗</a>
                </CivicCardFooter>
              </CivicCard>
            </div>
          </div>
        </div>
      </section>

      {/* Resources List */}
      <section className="order-8 space-y-6">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1">Official election resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            to="/election/how-to-vote"
            className="group p-4 bg-white border border-slate-200 rounded-2xl hover:border-[#004a99]/40 hover:shadow-sm transition-all flex justify-between items-start gap-4"
          >
            <div className="space-y-1">
              <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">How to vote</p>
              <p className="text-sm text-slate-500 leading-snug">Where to vote, when to vote, what to bring, and your rights.</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#004a99] mt-1 transition-colors" />
          </Link>
          {[
            { label: 'Toronto Elections (Official)', url: 'https://www.toronto.ca/city-government/elections/', description: 'Official source for all voting information, dates, and results.' },
            { label: 'Voter Information', url: 'https://www.toronto.ca/city-government/elections/voter-information/', description: 'How to vote, where to vote, and eligibility requirements.' },
            { label: 'Candidate Information', url: 'https://www.toronto.ca/city-government/elections/candidate-information/', description: 'Rules and resources for people running for office.' },
            { label: 'Voter Registry Check', url: 'https://www.toronto.ca/city-government/elections/voter-information/voter-registration/', description: 'Ensure your name is on the list for the upcoming election.' },
            { label: 'Contribution Rebates', url: 'https://www.toronto.ca/city-government/elections/candidates-third-party-advertisers/contribution-rebates/', description: 'Learn how eligible contributions to candidates can be rebated.' },
            { label: 'Election Signs', url: 'https://www.toronto.ca/city-government/public-notices-bylaws/bylaw-enforcement/election-signs/', description: 'Check Toronto’s rules for placing election signs.' }
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
                <p className="text-sm text-slate-500 leading-snug">{item.description}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#004a99] mt-1 transition-colors" />
            </a>
          ))}
        </div>
      </section>

      {/* Candidates by ward */}
      <section className="order-6 space-y-4">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Mayor and councillor candidates</h3>
          </div>
          <div className="flex items-center gap-3">
              <ChangeWardButton onChange={setSelectedWardId} />
            <ShareButton title="Toronto Election 2026" />
          </div>
        </div>

        <Suspense fallback={<div className="w-full h-[560px] rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />}>
          <TorontoFullMap
            geojson={geoData}
            wardActivity={null}
            wardSubtextById={wardCandidateCounts}
            onWardSelect={setSelectedWardId}
            isFullscreen={mapFullscreen}
            onToggleFullscreen={() => setMapFullscreen(open => !open)}
          />
        </Suspense>
      </section>

      <TrusteeSection candidateData={candidateData} wardId={selectedWardId || savedWardId} geoData={geoData} onCityWardChange={setSelectedWardId} />

      {/* Footnote */}
      <div className="order-9 pt-8 text-center">
        <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
          Motions is an independent civic data project and is not affiliated with the City of Toronto or Toronto Elections. Always verify official dates and requirements at toronto.ca.
        </p>
      </div>
    </div>
  );
}
