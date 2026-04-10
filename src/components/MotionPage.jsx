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

// Parse "Carried, 18-7" or "Lost, 10-13" → { yes, no } or null
function parseResultTotals(resultText) {
  const m = resultText?.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (!m) return null;
  // First number is always YES (for/carried), second is NO
  return { yes: parseInt(m[1], 10), no: parseInt(m[2], 10) };
}

function VoteBar({ votes, resultText }) {
  const recorded = Object.values(votes ?? {});
  const recYes = recorded.filter(v => v === 'YES').length;
  const recNo  = recorded.filter(v => v === 'NO').length;

  // Use result string totals when recorded votes are clearly incomplete
  const totals = parseResultTotals(resultText);
  const yes = (totals && totals.yes > recYes) ? totals.yes : recYes;
  const no  = (totals && totals.no  > recNo)  ? totals.no  : recNo;

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

function NameList({ names, colorClass, hoverClass }) {
  return (
    <div className="space-y-1">
      {names.map(name => (
        <Link
          key={name}
          to={`/councillors/${nameToSlug(name)}`}
          className={cn("block text-xs font-medium py-1 px-2 rounded-lg transition-colors truncate", colorClass, hoverClass)}
        >
          {name}
        </Link>
      ))}
    </div>
  );
}

function CouncillorGrid({ votes, resultText }) {
  if (!votes || Object.keys(votes).length === 0) return null;

  const yes     = Object.entries(votes).filter(([, v]) => v === 'YES').map(([n]) => n).sort();
  const no      = Object.entries(votes).filter(([, v]) => v === 'NO').map(([n]) => n).sort();
  const absent  = Object.entries(votes).filter(([, v]) => v === 'ABSENT').map(([n]) => n).sort();

  const totals = parseResultTotals(resultText);
  const isPartial = totals && (totals.yes > yes.length || totals.no > no.length);

  const showYes = yes.length > 0;
  const showNo  = no.length > 0;

  return (
    <div className="space-y-4">
      {/* YES / NO split — only render columns with votes */}
      {(showYes || showNo) && (
        <div className={cn("gap-3", showYes && showNo ? "grid grid-cols-2" : "")}>
          {showYes && (
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">
                Yes · {yes.length}
              </p>
              <NameList
                names={yes}
                colorClass="text-slate-700 bg-emerald-50"
                hoverClass="hover:bg-emerald-100 hover:text-emerald-900"
              />
            </div>
          )}
          {showNo && (
            <div>
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
                No · {no.length}
              </p>
              <NameList
                names={no}
                colorClass="text-slate-700 bg-red-50"
                hoverClass="hover:bg-red-100 hover:text-red-900"
              />
            </div>
          )}
        </div>
      )}

      {/* Absent — compact inline */}
      {absent.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Absent · {absent.length}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {absent.map(name => (
              <Link
                key={name}
                to={`/councillors/${nameToSlug(name)}`}
                className="text-xs text-slate-400 bg-slate-100 hover:bg-slate-200 hover:text-slate-600 px-2 py-1 rounded-lg transition-colors"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Partial data note for advisory committees */}
      {isPartial && (
        <p className="text-[10px] text-slate-400 pt-1">
          Breakdown shows City Councillors only. {totals.yes}–{totals.no} total vote from all committee members.
        </p>
      )}
    </div>
  );
}

function VoteSection({ label, motionType, status, votes, resultText, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const totals = parseResultTotals(resultText);
  const recYes = Object.values(votes ?? {}).filter(v => v === 'YES').length;
  const recNo  = Object.values(votes ?? {}).filter(v => v === 'NO').length;
  const dispYes = (totals && totals.yes > recYes) ? totals.yes : recYes;
  const dispNo  = (totals && totals.no  > recNo)  ? totals.no  : recNo;

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
              <span className="text-emerald-600 font-bold">{dispYes}</span>
              {' – '}
              <span className="text-red-500 font-bold">{dispNo}</span>
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-100">
          <div className="pt-4">
            <VoteBar votes={votes} resultText={resultText} />
          </div>
          <CouncillorGrid votes={votes} resultText={resultText} />
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
              resultText={motion.resultText}
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
                  resultText={sub.resultText}
                  defaultOpen={false}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4 border border-slate-200 rounded-xl p-5">
            <VoteBar votes={motion.votes} resultText={motion.resultText} />
            <CouncillorGrid votes={motion.votes} resultText={motion.resultText} />
          </div>
        )}
      </div>
    </div>
  );
}
