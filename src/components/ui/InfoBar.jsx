import React from 'react';

// Shared dot-separated metadata row used under a page's title (motion and
// meeting pages). Centralizes the separator logic so pages don't each hand-
// thread <span>·</span> between conditional fields.
export default function InfoBar({ children, className = '' }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 ${className}`}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span>·</span>}
          {item}
        </React.Fragment>
      ))}
    </div>
  );
}
