import React from 'react';
import { ExternalLink } from 'lucide-react';

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

export function GuideCard({ icon: Icon, title, children }) {
  return (
    <CivicCard className="gap-3">
      <Icon className="h-5 w-5 text-[#004a99]" />
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="text-sm leading-relaxed text-slate-500">{children}</div>
    </CivicCard>
  );
}

export function CivicMiniTile({ title, caption }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-center">
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <p className="text-[11px] leading-tight text-slate-500">{caption}</p>
    </div>
  );
}

export function OfficialLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#004a99] hover:underline">
      {children} <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
