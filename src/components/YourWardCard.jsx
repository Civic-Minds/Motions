import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { nameToSlug } from '../utils/slug';
import { cn } from '../lib/utils';
import { getWardId, setWardId as saveWardId } from '../utils/storage';

export default function YourWardCard({ motions }) {
  const navigate = useNavigate();
  const [wardId, setWardIdState] = useState(() => getWardId());
  const [status, setStatus] = useState('idle'); // idle | locating | error
  const [errorMsg, setErrorMsg] = useState('');

  function setWardId(id) {
    setWardIdState(id);
    saveWardId(id);
  }

  const ward = wardId ? TORONTO_WARDS.find(w => w.id === wardId) : null;
  const councillorName = wardId ? WARD_COUNCILLORS[wardId] : null;


  const handleLocate = async () => {
    setStatus('locating');
    setErrorMsg('');
    try {
      const { geolocateWard } = await import('../utils/ward');
      const id = await geolocateWard();
      setWardId(id);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
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
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-4 h-full">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#004a99]/10 flex items-center justify-center shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#004a99]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900">Your Ward</p>
            <p className="text-[9px] text-slate-400">See how your councillor votes</p>
          </div>
        </div>
        {status === 'error' && (
          <p className="text-[9px] text-rose-500 -mt-2">{errorMsg}</p>
        )}
        <button
          onClick={handleLocate}
          disabled={status === 'locating'}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#004a99] text-white text-xs font-semibold rounded-lg hover:bg-[#003875] disabled:opacity-60 transition-colors w-fit"
        >
          {status === 'locating' ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Locating…</>
          ) : (
            <><MapPin className="w-3.5 h-3.5" /> Find my ward</>
          )}
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate(`/wards/${wardId}`)}
        className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 h-full w-full text-left hover:border-[#004a99]/40 hover:shadow-sm transition-all"
      >
        {/* Top row */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#004a99]/10 text-[#004a99]">
            Ward {wardId}
          </span>
          {ward && <span className="text-[9px] text-slate-400 truncate">{ward.name}</span>}
        </div>

        {/* Councillor name */}
        <p className="text-xs font-semibold text-slate-800 leading-snug flex-1">
          {councillorName ?? 'Your councillor'}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-auto">
          <button
            onClick={e => { e.stopPropagation(); handleClear(); }}
            className="text-[9px] text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-0.5"
          >
            <X className="w-2.5 h-2.5" /> change
          </button>
          {councillorName && (
            <Link
              to={`/councillors/${nameToSlug(councillorName)}`}
              onClick={e => e.stopPropagation()}
              className="text-[9px] font-semibold text-[#004a99] hover:underline"
            >
              See more
            </Link>
          )}
        </div>

      </motion.button>
    </AnimatePresence>
  );
}
