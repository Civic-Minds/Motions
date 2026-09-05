import React from 'react';
import { ArrowLeft } from 'lucide-react';

// `floating` positions Back in a gutter reserved by the page's own left
// padding (see the pl-* classes on each page's outer container) instead of
// relying on whatever margin happens to exist outside the page column — that
// margin can be zero at common desktop widths, which used to make this
// overlap the title. Reserving the space in our own padding means it never
// depends on viewport width.
export default function BackButton({ onClick, floating = false, className = '' }) {
  const classes = floating
    ? 'hidden sm:flex absolute items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors'
    : 'flex h-5 shrink-0 items-center gap-1.5 text-sm leading-5 text-slate-500 hover:text-slate-700 transition-colors';

  return (
    <button onClick={onClick} className={`${classes} ${className}`}>
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );
}
