import React, { useState, useMemo } from 'react';
import { Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import { ExternalLink, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { getCommittee } from '../constants/data';
import { nameToSlug } from '../utils/slug';

function StatusBadge({ status }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
      status === 'Adopted'
        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
        : status === 'Lost'
        ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
        : 'bg-slate-100 text-slate-700'
    )}>
      {status}
    </span>
  );
}

function VoteBar({ votes }) {
  const yes = Object.values(votes ?? {}).filter(v => v === 'YES').length;
  const no  = Object.values(votes ?? {}).filter(v => v === 'NO').length;
  if (yes === 0 && no === 0) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold text-emerald-600 w-14 text-right">{yes} YES</span>
      <div className="flex-1 h-2 bg-rose-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${Math.round((yes / (yes + no)) * 100)}%` }}
        />
      </div>
      <span className="text-sm font-bold text-rose-500 w-10">{no} NO</span>
    </div>
  );
}

function CouncillorGrid({ votes }) {
  if (!votes || Object.keys(votes).length === 0) return null;
  const sorted = Object.entries(votes).sort(([, a], [, b]) => {
    const order = { YES: 0, NO: 1, ABSENT: 2 };
    return (order[a] ?? 3) - (order[b] ?? 3);
  });
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
      {sorted.map(([name, vote]) => (
        <Link
          key={name}
          to={`/councillors/${nameToSlug(name)}`}
          className="flex items-center justify-between rounded-lg bg-slate-50 hover:bg-blue-50 px-3 py-2 text-xs transition-colors group"
        >
          <span className="text-slate-700 font-medium truncate group-hover:text-[#004a99] transition-colors">
            {name}
          </span>
          <span className={cn(
            "ml-2 font-bold shrink-0",
            vote === 'YES' ? 'text-emerald-600'
            : vote === 'NO' ? 'text-red-500'
            : 'text-slate-400'
          )}>
            {vote}
          </span>
        </Link>
      ))}
    </div>
  );
}

function VoteSection({ label, motionType, status, votes, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {label && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>}
          {motionType && <span className="text-sm font-semibold text-slate-800">{motionType}</span>}
          <StatusBadge status={status} />
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {!open && (
            <span className="text-xs text-slate-400">
              <span className="text-emerald-600 font-bold">{Object.values(votes ?? {}).filter(v => v === 'YES').length}</span>
              {' – '}
              <span className="text-red-500 font-bold">{Object.values(votes ?? {}).filter(v => v === 'NO').length}</span>
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-100">
          <div className="pt-4">
            <VoteBar votes={votes} />
          </div>
          <CouncillorGrid votes={votes} />
        </div>
      )}
    </div>
  );
}

export default function MotionPage({ motions = [] }) {
  const { motionId } = useParams();
  const navigate = useNavigate();

  const motion = useMemo(() => motions.find(m => m.id === motionId) ?? null, [motions, motionId]);

  // If this is a sub-entry, redirect to the primary
  if (motion?.parentId) {
    return <Navigate to={`/motions/${motion.parentId}`} replace />;
  }

  const subEntries = useMemo(
    () => motions.filter(m => m.parentId === motionId),
    [motions, motionId]
  );

  if (!motion) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">Motion not found.</div>
    );
  }

  const committee = motion.committee || getCommittee(motion.id);
  const isMultiVote = subEntries.length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={motion.status} />
          {motion.significance >= 90 && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">High Impact</span>
          )}
          {motion.significance >= 60 && motion.significance < 90 && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">Notable</span>
          )}
        </div>

        <h1 className="text-xl font-bold text-slate-900 leading-snug">{motion.title}</h1>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
          <span className="font-mono">{motion.id}</span>
          <span>·</span>
          <span>{motion.date}</span>
          <span>·</span>
          <span>{committee}</span>
          {motion.topic && <><span>·</span><span>{motion.topic}</span></>}
          {motion.url && (
            <>
              <span>·</span>
              <a
                href={motion.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#004a99] hover:underline font-medium"
              >
                toronto.ca <ExternalLink className="w-3 h-3" />
              </a>
            </>
          )}
        </div>
      </div>

      {/* Votes */}
      <div className="space-y-3">
        {isMultiVote ? (
          <>
            <VoteSection
              label="Final vote"
              motionType={motion.motionType}
              status={motion.status}
              votes={motion.votes}
              defaultOpen
            />

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Other votes on this item
              </p>
              {subEntries.map(sub => (
                <VoteSection
                  key={sub.id}
                  motionType={sub.motionType}
                  status={sub.status}
                  votes={sub.votes}
                  defaultOpen={false}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4 border border-slate-200 rounded-xl p-5">
            <VoteBar votes={motion.votes} />
            <CouncillorGrid votes={motion.votes} />
          </div>
        )}
      </div>
    </div>
  );
}
