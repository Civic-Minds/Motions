import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Loader2, X } from 'lucide-react';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { nameToSlug } from '../utils/slug';
import { useAppContext } from '../contexts/AppContext';
import { CivicCard, CivicCardFooter, CivicPill } from './ui/CivicCard';

export default function YourWardCard() {
  const { wardId, handleSetWard } = useAppContext();
  const [status, setStatus] = useState('idle'); // idle | locating | error
  const [errorMsg, setErrorMsg] = useState('');
  const [showWardPicker, setShowWardPicker] = useState(false);

  function setWardId(id) {
    handleSetWard(id);
  }

  const ward = wardId ? TORONTO_WARDS.find(w => w.id === wardId) : null;
  const councillorName = wardId ? WARD_COUNCILLORS[wardId] : null;


  const handleLocate = async () => {
    setStatus('locating');
    setErrorMsg('');
    setShowWardPicker(false);
    try {
      const { geolocateWard } = await import('../utils/ward');
      const id = await geolocateWard();
      setWardId(id);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setShowWardPicker(true);
      if (err.message === 'denied') setErrorMsg('Location access denied.');
      else if (err.message === 'not_in_toronto') setErrorMsg('Not in Toronto.');
      else if (err.message === 'no_geolocation') setErrorMsg('Geolocation not supported.');
      else setErrorMsg('Could not detect location.');
    }
  };

  const handleClear = () => {
    setWardId(null);
    setStatus('idle');
    setErrorMsg('');
  };

  if (!wardId) {
    return (
      <CivicCard className="h-[140px] lg:h-full">
        <CivicPill className="bg-slate-100 text-slate-600">My ward</CivicPill>
        <p className="text-xs font-semibold text-slate-800 leading-snug">Find your ward</p>
        <p className="text-[9px] text-slate-500 leading-snug flex-1">See how your councillor votes</p>
        {status === 'error' && (
          <p className="text-[9px] text-rose-500 -mt-2">{errorMsg} Choose your ward below.</p>
        )}
        <CivicCardFooter>
          <span className="text-[9px] text-slate-500">Toronto wards</span>
          <button
            onClick={handleLocate}
            disabled={status === 'locating'}
            className="flex items-center gap-1 text-[9px] font-semibold text-[#004a99] hover:underline disabled:opacity-60 transition-all"
          >
            {status === 'locating' ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
            {status === 'locating' ? 'Locating…' : 'Find my ward'}
          </button>
        </CivicCardFooter>
        {showWardPicker && (
          <select
            aria-label="Choose your ward"
            defaultValue=""
            onChange={e => e.target.value && setWardId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] rounded-xl outline-none focus:ring-1 focus:ring-[#004a99]/30"
          >
            <option value="">Choose your ward</option>
            {TORONTO_WARDS.map(w => (
              <option key={w.id} value={w.id}>Ward {w.id} · {w.name}</option>
            ))}
          </select>
        )}
      </CivicCard>
    );
  }

  return (
      <CivicCard
        as={Link}
        to={`/wards/${wardId}`}
        data-testid="your-ward-card"
        aria-label={`Ward ${wardId}${ward?.name ? ` - ${ward.name}` : ''}. Councillor ${councillorName || ''}. Click to view ward motions.`}
        className="animate-fade-in-up gap-3 h-[140px] lg:h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004a99] cursor-pointer"
      >
        {/* Top row */}
        <div className="flex items-center justify-between gap-1">
          <span className="shrink-0 whitespace-nowrap text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#004a99]/10 text-[#004a99]">
            Ward {wardId}
          </span>
          {ward && <span className="max-w-[92px] text-right text-[9px] leading-tight text-slate-500">{ward.name}</span>}
        </div>

        {/* Councillor name */}
        <p className="text-xs font-semibold text-slate-800 leading-snug flex-1">
          {councillorName ?? 'Your councillor'}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-auto">
          <button
            onClick={e => { e.stopPropagation(); handleClear(); }}
            className="text-[9px] text-slate-500 hover:text-slate-600 transition-colors flex items-center gap-0.5 cursor-pointer"
          >
            <X className="w-2.5 h-2.5" /> change
          </button>
          {councillorName && (
            <Link
              to={`/councillors/${nameToSlug(councillorName)}`}
              onClick={e => e.stopPropagation()}
              className="text-[9px] font-semibold text-[#004a99] hover:underline cursor-pointer"
            >
              See more
            </Link>
          )}
        </div>

      </CivicCard>
  );
}
