import React, { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';

export default function ShareButton({ title, className = '' }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Sharing can be cancelled; no visible error is needed.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-[#004a99]/40 hover:text-[#004a99] ${className}`}
      aria-label={`Share ${title}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : navigator.share ? <Share2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Share'}
    </button>
  );
}
