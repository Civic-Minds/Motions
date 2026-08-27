import React from 'react';

export const civicCardClass = 'bg-white border border-slate-200 rounded-2xl p-4 text-left group flex flex-col gap-2 hover:border-[#004a99]/40 hover:shadow-sm transition-all';

export function CivicCard({ as: Component = 'div', className = '', children, ...props }) {
  return (
    <Component className={`${civicCardClass}${className ? ` ${className}` : ''}`} {...props}>
      {children}
    </Component>
  );
}

export function CivicSectionLabel({ children, className = '' }) {
  return <p className={`text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1 ${className}`}>{children}</p>;
}

export function CivicPill({ children, className = '' }) {
  return <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full self-start ${className}`}>{children}</span>;
}

export function CivicCardFooter({ children, align = 'between', className = '' }) {
  return (
    <div className={`flex items-center ${align === 'end' ? 'justify-end' : 'justify-between'} mt-auto pt-2 border-t border-slate-50 ${className}`}>
      {children}
    </div>
  );
}
