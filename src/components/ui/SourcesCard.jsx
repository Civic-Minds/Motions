import React from 'react';
import { ExternalLink } from 'lucide-react';

// Shared "Sources" sidebar card for motion and meeting pages — a labeled,
// bordered list of external links. `links` is an array of
// { label, href } objects; falsy entries are skipped so callers can pass
// conditional links inline (e.g. `agendaUrl && { label: '...', href: agendaUrl }`).
export default function SourcesCard({ links }) {
  const visible = links.filter(Boolean);
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Sources</p>
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
        {visible.map(({ label, href }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 text-xs text-slate-500 hover:text-[#004a99] transition-colors"
          >
            {label} <ExternalLink className="w-3 h-3" />
          </a>
        ))}
      </div>
    </div>
  );
}
