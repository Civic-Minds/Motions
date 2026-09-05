import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ onClick, desktop = false, className = '' }) {
  const classes = desktop
    ? 'hidden xl:flex absolute -left-12 top-[13px] mt-0.5 items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors'
    : 'flex h-5 items-center gap-1.5 text-sm leading-5 text-slate-500 hover:text-slate-700 transition-colors';

  return (
    <button onClick={onClick} className={`${classes} ${className}`}>
      <ArrowLeft className={desktop ? 'w-4 h-4 text-slate-300' : 'w-4 h-4'} />
      Back
    </button>
  );
}
