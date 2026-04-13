import { getWardId } from '../utils/storage';
import React, { useState, useMemo } from 'react';
import { Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import { ExternalLink, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { getCommittee, WARD_COUNCILLORS } from '../constants/data';
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
  const dispYesCount = (totals && totals.yes > yes.length) ? totals.yes : yes.length;
  const dispNoCount  = (totals && totals.no > no.length) ? totals.no : no.length;

  const showYes = dispYesCount > 0;
  const showNo  = dispNoCount > 0;

  return (
    <div className="space-y-4">
      {/* YES / NO split — render if there are any votes (even non-councillor) */}
      {(showYes || showNo) && (
        <div className={cn("gap-3", showYes && showNo ? "grid grid-cols-2" : "")}>
          {showYes && (
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">
                Yes · {dispYesCount}
              </p>
              <NameList
                names={yes}
                colorClass="text-slate-700 bg-emerald-50"
                hoverClass="hover:bg-emerald-100 hover:text-emerald-900"
              />
              {totals && totals.yes > yes.length && (
                <div className="text-xs font-medium py-1 px-2 text-slate-500 italic">
                  + {totals.yes - yes.length} non-councillors
                </div>
              )}
            </div>
          )}
          {showNo && (
            <div>
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
                No · {dispNoCount}
              </p>
              <NameList
                names={no}
                colorClass="text-slate-700 bg-red-50"
                hoverClass="hover:bg-red-100 hover:text-red-900"
              />
              {totals && totals.no > no.length && (
                <div className="text-xs font-medium py-1 px-2 text-slate-500 italic">
                  + {totals.no - no.length} non-councillors
                </div>
              )}
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
    </div>
  );
}

const MOTION_TYPE_INFO = {
  'Refer Item':       'A vote to send this item to a committee or staff for further study rather than deciding it now.',
  'Amendment':        'A proposed change to the wording or scope of the main motion.',
  'Reconsideration':  'A vote on whether to revisit a decision that was already made.',
  'Defer':            'A vote to postpone consideration of this item to a later date.',
  'Procedural':       'A procedural vote governing how the meeting or debate is conducted.',
  'Adoption':         'A vote to formally adopt the main item as presented.',
  'Direction':        'A directive from council to staff on how to proceed.',
};

function VoteSection({ label, motionType, title, status, votes, resultText, defaultOpen = false, hideStatus = false }) {
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
          {!hideStatus && <StatusBadge status={status} />}
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
          {title && <p className="pt-4 text-sm text-slate-600 leading-snug">{title}</p>}
          {MOTION_TYPE_INFO[motionType] && (
            <p className={cn("text-xs text-slate-400 leading-relaxed", title ? "" : "pt-4")}>
              {MOTION_TYPE_INFO[motionType]}
            </p>
          )}
          <VoteBar votes={votes} resultText={resultText} />
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

  const myWardId = getWardId();
  const myCouncillor = myWardId ? WARD_COUNCILLORS[myWardId] : null;
  const myVote = myCouncillor ? (motion.votes?.[myCouncillor] ?? null) : null;

  // Parse "by Councillor [Mover], seconded by Councillor [Seconder]"
  const authorship = useMemo(() => {
    // 1. Check for explicit fields first
    const mover = motion.mover;
    const seconder = motion.seconder;
    
    if (mover) {
      return {
        mover: mover.trim(),
        seconder: seconder?.trim(),
        displayTitle: motion.title.split('- by')[0].trim()
      };
    }

    // 2. Fallback to title parsing
    const m = motion.title.match(/-\s*by\s+Councillor\s+([^,]+)(?:,\s*seconded\s+by\s+Councillor\s+([^.]+))?/i);
    if (!m) return null;
    return {
      mover: m[1].trim(),
      seconder: m[2]?.trim(),
      displayTitle: motion.title.split('- by')[0].trim()
    };
  }, [motion.title, motion.mover, motion.seconder]);

  const displayTitle = authorship ? authorship.displayTitle : motion.title;

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

        <h1 className="text-xl font-bold text-slate-900 leading-snug">{displayTitle}</h1>

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

      {/* Context / Authorship / Summary */}
      {(authorship || motion.summary) && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
          {authorship && (
            <div className="px-5 py-4 bg-white border-b border-slate-200 flex flex-wrap items-center gap-x-8 gap-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Mover</span>
                <Link
                  to={`/councillors/${nameToSlug(authorship.mover)}`}
                  className="text-sm font-bold text-[#004a99] hover:underline decoration-2 underline-offset-4"
                >
                  {authorship.mover}
                </Link>
              </div>
              {authorship.seconder && (
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Seconder</span>
                  <Link
                    to={`/councillors/${nameToSlug(authorship.seconder)}`}
                    className="text-sm font-bold text-[#004a99] hover:underline decoration-2 underline-offset-4"
                  >
                    {authorship.seconder}
                  </Link>
                </div>
              )}
            </div>
          )}
          {motion.summary && (
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Motion Summary</p>
              <p className="text-sm text-slate-700 leading-relaxed">{motion.summary}</p>
            </div>
          )}
        </div>
      )}

      {/* Funding — prefer Gemini-labeled keyAmounts; fall back to raw amounts */}
      {(() => {
        // keyAmounts: [{label, value, unit, type}] — set by generate_summaries.js
        if (motion.keyAmounts?.length > 0) {
          const fmtDollar = v =>
            v >= 1_000_000_000 ? `${(v / 1_000_000_000).toFixed(1)}B`
            : v >= 1_000_000   ? `${(v / 1_000_000).toFixed(1)}M`
            : v >= 1_000       ? `${(v / 1_000).toFixed(0)}K`
            :                    `${v}`;
          const fmtAmt = ({ value, unit }) =>
            unit === '$' ? `$${fmtDollar(value)}`
            : unit === '%' ? `${value}%`
            : `${value} ${unit}`;

          return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Funding</p>
              <div className="flex flex-col gap-1.5">
                {motion.keyAmounts.map((amt, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-4">
                    <span className="text-xs text-slate-500">{amt.label}</span>
                    <span className="text-sm font-semibold text-slate-800 shrink-0">{fmtAmt(amt)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Fallback: raw amounts (no labels) — hide if too many (budget docs etc.)
        if (motion.amounts?.length > 0 && motion.amounts.length <= 10) {
          const fmt = v =>
            v >= 1_000_000_000 ? `${(v / 1_000_000_000).toFixed(1)}B`
            : v >= 1_000_000   ? `${(v / 1_000_000).toFixed(1)}M`
            :                    `${(v / 1_000).toFixed(0)}K`;
          const items = motion.amounts.map(a =>
            typeof a === 'number' ? { value: a } : a
          );
          return (
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide shrink-0">Funding</p>
              <div className="flex flex-wrap gap-2 items-center">
                {items.slice(0, 3).map((amt, i) => (
                  <span key={i} className="text-sm font-semibold text-slate-800">
                    ${fmt(amt.value)}
                  </span>
                ))}
                {items.length > 3 && (
                  <span className="text-xs text-slate-400">+{items.length - 3} more</span>
                )}
              </div>
            </div>
          );
        }

        return null;
      })()}

      {/* Related motions */}
      {motion.relatedMotions?.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Referenced Motions</p>
          <div className="flex flex-wrap gap-2">
            {motion.relatedMotions.map(id => (
              <Link
                key={id}
                to={`/motions/${id}`}
                className="text-xs font-mono font-medium text-[#004a99] bg-white border border-[#004a99]/20 px-2.5 py-1 rounded-lg hover:bg-[#004a99]/5 transition-colors"
              >
                {id}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Your councillor callout */}
      {myCouncillor && myVote && (
        <div className={cn(
          "flex items-center justify-between gap-3 rounded-xl px-5 py-3 border",
          myVote === 'YES' ? 'bg-emerald-50 border-emerald-200' :
          myVote === 'NO'  ? 'bg-red-50 border-red-200' :
                             'bg-slate-50 border-slate-200'
        )}>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">Your Councillor</span>
            <Link
              to={`/councillors/${nameToSlug(myCouncillor)}`}
              className="text-sm font-bold text-[#004a99] hover:underline decoration-2 underline-offset-4"
            >
              {myCouncillor}
            </Link>
          </div>
          <span className={cn(
            "text-sm font-bold px-3 py-1 rounded-full",
            myVote === 'YES'    ? 'bg-emerald-100 text-emerald-700' :
            myVote === 'NO'     ? 'bg-red-100 text-red-700' :
                                  'bg-slate-100 text-slate-500'
          )}>
            {myVote}
          </span>
        </div>
      )}

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
                  title={sub.title !== motion.title ? sub.title : undefined}
                  status={sub.status}
                  votes={sub.votes}
                  resultText={sub.resultText}
                  defaultOpen={false}
                />
              ))}
            </div>
          </>
        ) : Object.keys(motion.votes ?? {}).length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-xl p-5 text-center">
            <p className="text-sm text-slate-400">No recorded votes for this item.</p>
          </div>
        ) : (
          <VoteSection
            motionType={motion.motionType}
            status={motion.status}
            votes={motion.votes}
            resultText={motion.resultText}
            defaultOpen={true}
            hideStatus={true}
          />
        )}
      </div>
    </div>
  );
}
