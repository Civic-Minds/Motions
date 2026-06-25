import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { TOPIC_LIGHT, getCommittee } from '../constants/data';

export default function MotionCardItem({
  motion: m,
  index = 0,
  vote,
  showSummary = true,
  showStatus = true,
  showCommittee = true,
  showTopicBadge = true,
  showVoteBadge = !!vote,
  votePlacement = 'header',
}) {
  const navigate = useNavigate();

  const dotColor = vote != null
    ? (vote === 'YES' ? 'bg-emerald-400' : vote === 'NO' ? 'bg-rose-400' : 'bg-slate-200')
    : (m.status === 'Adopted' ? 'bg-emerald-400' : 'bg-rose-400');

  const statusColor = m.status === 'Adopted'
    ? 'bg-emerald-50 text-emerald-700'
    : m.status === 'Lost'
    ? 'bg-rose-50 text-rose-700'
    : 'bg-amber-50 text-amber-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
    >
      <div
        onClick={() => navigate(`/motions/${m.id}`)}
        className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-3 hover:border-[#004a99]/40 hover:shadow-sm transition-all group cursor-pointer"
      >
        <div className={cn('w-1 self-stretch rounded-full shrink-0', dotColor)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <p
              className="text-sm font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-2 leading-snug"
              title={m.title}
            >
              {m.title}
            </p>
            {vote && showVoteBadge && votePlacement === 'header' && (
              <span className={cn(
                'text-[10px] font-bold px-2 py-1 rounded-lg shrink-0',
                vote === 'YES' ? 'bg-emerald-50 text-emerald-700'
                  : vote === 'NO' ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-500'
              )}>
                Voted {vote === 'YES' ? 'Yes' : vote === 'NO' ? 'No' : vote}
              </span>
            )}
          </div>
          {showSummary && m.summary && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-snug">{m.summary}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {vote && showVoteBadge && votePlacement === 'inline' && (
              <span className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full',
                vote === 'YES' ? 'bg-emerald-50 text-emerald-700'
                  : vote === 'NO' ? 'bg-rose-50 text-rose-600'
                  : 'bg-slate-100 text-slate-500'
              )}>
                {vote === 'YES' ? 'Yes' : vote === 'NO' ? 'No' : vote}
              </span>
            )}
            {showStatus && (
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', statusColor)}>
                {m.status}
              </span>
            )}
            {showTopicBadge && m.topic && (
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full', TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>
                {m.topic}
              </span>
            )}
            {showCommittee && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {m.committee || getCommittee(m.id)}
              </span>
            )}
            {m.significance >= 90 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">High Impact</span>
            )}
            {m.significance >= 60 && m.significance < 90 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Notable</span>
            )}
            <span className="text-[10px] text-slate-400 ml-auto">{m.date}</span>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#004a99] shrink-0 mt-0.5 transition-colors" />
      </div>
    </motion.div>
  );
}
