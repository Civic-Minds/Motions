import React from 'react';
import { Link } from 'react-router-dom';
import { X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { getCommittee } from '../constants/data';
import { nameToSlug } from '../utils/slug';

export default function MotionPanel({ motion: m, onClose }) {
  return (
    <AnimatePresence>
      {m && (
        <>
          {/* Backdrop (mobile only) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 z-40 md:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-16 right-0 bottom-0 w-full sm:w-[480px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      m.status === 'Adopted'
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                        : (m.status === 'Lost' || m.status === 'Defeated')
                        ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                        : 'bg-slate-100 text-slate-700'
                    )}>
                      {m.status}
                    </span>
                    {m.significance >= 90 && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">High Impact</span>
                    )}
                    {m.significance >= 60 && m.significance < 90 && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">Notable</span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 leading-snug">{m.title}</h2>
                  <div className="flex flex-wrap gap-1.5 mt-2 text-xs text-slate-400">
                    <span>{m.id}</span>
                    <span>·</span>
                    <span>{m.date}</span>
                    {m.topic && <><span>·</span><span>{m.topic}</span></>}
                    <span>·</span>
                    <span>{getCommittee(m.id)}</span>
                  </div>
                  {m.url && (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#004a99] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View on toronto.ca
                    </a>
                  )}
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors shrink-0 mt-0.5">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Vote breakdown */}
              {m.votes && Object.keys(m.votes).length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Votes</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(m.votes).map(([name, vote]) => (
                      <Link
                        key={name}
                        to={`/councillors/${nameToSlug(name)}`}
                        onClick={onClose}
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
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
