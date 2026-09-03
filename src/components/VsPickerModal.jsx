import React from 'react';
import { X } from 'lucide-react';
import { usePresence } from '../hooks/usePresence';
import { cn } from '../lib/utils';
import { nameToSlug } from '../utils/slug';

export default function VsPickerModal({ open, selectedName, peers, search, onSearchChange, onClose, onSelect }) {
  const filtered = search.trim()
    ? peers.filter(n => n.toLowerCase().includes(search.toLowerCase()))
    : peers;

  const { rendered, entered } = usePresence(open, 200);

  if (!rendered) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] transition-opacity duration-200 ease-out",
          entered ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none transition-all duration-200 ease-out",
          entered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-[0.97] translate-y-2"
        )}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">
              Compare {selectedName.split(' ').at(-1)} with…
            </p>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <div className="px-4 py-2 border-b border-slate-100">
            <input
              type="text"
              placeholder="Search councillors…"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              autoFocus
              className="w-full text-sm text-slate-900 placeholder:text-slate-500 outline-none bg-transparent py-1"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.map(name => (
              <button
                key={name}
                onClick={() => onSelect(nameToSlug(selectedName), nameToSlug(name))}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-[8px] font-bold text-slate-500 uppercase">
                    {name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
