import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getCommittee } from '../constants/data';

export default function MotionDetail({ motions }) {
  const { motionId } = useParams();
  const navigate = useNavigate();
  const motion = motions?.find(m => m.id === motionId);

  if (!motion) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400 text-sm font-medium">Motion not found</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-lg font-semibold text-slate-900 leading-snug">{motion.title}</h1>
          <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            motion.status === 'Adopted' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
            : motion.status === 'Lost' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
            : 'bg-slate-100 text-slate-700'
          }`}>{motion.status}</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span>{motion.id}</span>
          <span>·</span>
          <span>{motion.date}</span>
          {motion.topic && <><span>·</span><span>{motion.topic}</span></>}
          <span>·</span>
          <span>{getCommittee(motion.id)}</span>
          {motion.significance >= 90 && <><span>·</span><span className="text-amber-600 font-semibold">High Impact</span></>}
          {motion.significance >= 60 && motion.significance < 90 && <><span>·</span><span className="text-amber-600 font-semibold">Notable</span></>}
        </div>
        {motion.url && (
          <a
            href={motion.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#004a99] hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View on toronto.ca
          </a>
        )}
        {motion.votes && Object.keys(motion.votes).length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Votes</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {Object.entries(motion.votes).map(([name, vote]) => (
                <div key={name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs">
                  <span className="text-slate-700 font-medium truncate">{name}</span>
                  <span className={`ml-2 font-semibold shrink-0 ${
                    vote === 'YES' ? 'text-emerald-600' : vote === 'NO' ? 'text-red-500' : 'text-slate-400'
                  }`}>{vote}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
