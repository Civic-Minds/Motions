import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, X, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { nameToSlug } from '../utils/slug';
import { cn } from '../lib/utils';

const STORAGE_KEY = 'motions_ward_id';

const voteColor = (vote) =>
  vote === 'YES' ? 'text-emerald-600' : vote === 'NO' ? 'text-rose-500' : 'text-slate-400';

const voteBg = (vote) =>
  vote === 'YES' ? 'bg-emerald-50' : vote === 'NO' ? 'bg-rose-50' : 'bg-slate-50';

export default function YourWardCard({ motions }) {
  const [wardId, setWardId] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [status, setStatus] = useState('idle'); // idle | locating | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (wardId) localStorage.setItem(STORAGE_KEY, wardId);
  }, [wardId]);

  const ward = TORONTO_WARDS.find(w => w.id === wardId);
  const councillorName = wardId ? WARD_COUNCILLORS[wardId] : null;

  const recentVotes = useMemo(() => {
    if (!councillorName) return [];
    return motions
      .filter(m => m.votes?.[councillorName] && !m.trivial)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  }, [motions, councillorName]);

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
      else if (err.message === 'not_in_toronto') setErrorMsg('You don\'t appear to be in Toronto.');
      else if (err.message === 'no_geolocation') setErrorMsg('Geolocation not supported.');
      else setErrorMsg('Could not detect location.');
    }
  };

  const handleClear = () => {
    setWardId(null);
    setStatus('idle');
    setErrorMsg('');
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!wardId) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#004a99]/10 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-[#004a99]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Your Ward</p>
            <p className="text-xs text-slate-400">See how your councillor has been voting</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === 'error' && (
            <p className="text-xs text-rose-500">{errorMsg}</p>
          )}
          <button
            onClick={handleLocate}
            disabled={status === 'locating'}
            className="flex items-center gap-2 px-4 py-2 bg-[#004a99] text-white text-sm font-semibold rounded-xl hover:bg-[#003875] disabled:opacity-60 transition-colors"
          >
            {status === 'locating' ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Locating…</>
            ) : (
              <><MapPin className="w-3.5 h-3.5" /> Find my ward</>
            )}
          </button>
        </div>
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
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Ward</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
              Ward {wardId}{ward ? ` · ${ward.name}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {councillorName && (
              <Link
                to={`/councillors/${nameToSlug(councillorName)}`}
                className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-[#004a99]/40 hover:text-[#004a99] transition-colors"
              >
                {councillorName.split(' ').at(-1)} <ChevronRight className="w-3 h-3" />
              </Link>
            )}
            <button onClick={handleClear} className="p-1 hover:bg-slate-100 rounded-lg transition-colors" title="Change ward">
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Recent votes */}
        {recentVotes.length > 0 ? (
          <>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Votes</p>
            <div className="space-y-1.5 flex-1">
              {recentVotes.map((m, i) => (
                <Link
                  key={m.id}
                  to={`/motions/${m.id}`}
                  className="group flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 hover:border-[#004a99]/30 hover:bg-slate-50 transition-all"
                >
                  <span className={cn(
                    "shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-0.5",
                    voteBg(m.votes[councillorName]),
                    voteColor(m.votes[councillorName])
                  )}>
                    {m.votes[councillorName]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 group-hover:text-[#004a99] transition-colors line-clamp-1 leading-snug">
                      {m.title}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{m.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-400">No recent votes found.</p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
