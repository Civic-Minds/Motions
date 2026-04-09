import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { nameToSlug } from '../utils/slug';
import { cn } from '../lib/utils';

const STORAGE_KEY = 'motions_ward_id';


export default function YourWardCard({ motions }) {
  const [wardId, setWardId] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });
  const [status, setStatus] = useState('idle'); // idle | locating | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    try {
      if (wardId) localStorage.setItem(STORAGE_KEY, wardId);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [wardId]);

  const ward = TORONTO_WARDS.find(w => w.id === wardId);
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
          <div className="w-9 h-9 rounded-xl bg-[#004a99]/10 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-[#004a99]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Your Ward</p>
            <p className="text-xs text-slate-400">See how your councillor votes</p>
          </div>
        </div>
        {status === 'error' && (
          <p className="text-xs text-rose-500 -mt-2">{errorMsg}</p>
        )}
        <button
          onClick={handleLocate}
          disabled={status === 'locating'}
          className="flex items-center gap-2 px-4 py-2 bg-[#004a99] text-white text-sm font-semibold rounded-xl hover:bg-[#003875] disabled:opacity-60 transition-colors w-fit"
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
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 h-full"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 leading-snug">
              Ward {wardId}{ward ? ` · ${ward.name}` : ''}
            </p>
            <button onClick={handleClear} className="text-[9px] text-slate-400 hover:text-slate-600 transition-colors mt-0.5 flex items-center gap-0.5">
              <X className="w-2.5 h-2.5" /> change
            </button>
          </div>
          {councillorName && (
            <Link
              to={`/councillors/${nameToSlug(councillorName)}`}
              className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-[#004a99]/40 hover:text-[#004a99] transition-colors shrink-0"
            >
              {councillorName.split(' ').at(-1)} <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
