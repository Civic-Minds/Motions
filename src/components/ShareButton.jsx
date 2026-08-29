import React, { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';

export default function ShareButton({ title, className = '' }) {
  const [copied, setCopied] = useState(false);
  const supportsNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  async function copyUrl(url) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return;
    }

    // Clipboard API is unavailable on the phone when the local site is served
    // over plain HTTP. This keeps sharing useful during local-device testing.
    const input = document.createElement('textarea');
    input.value = url;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, input.value.length);
    const copiedWithLegacyApi = document.execCommand('copy');
    input.remove();
    if (!copiedWithLegacyApi) throw new Error('copy_failed');
  }

  async function share() {
    const url = window.location.href;
    if (supportsNativeShare) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // Cancellation is expected. Other native-share failures should still
        // fall through to copying the URL.
        if (error?.name === 'AbortError') return;
      }
    }

    try {
      await copyUrl(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // No supported share or copy method is available.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-[#004a99]/40 hover:text-[#004a99] ${className}`}
      aria-label={`Share ${title}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : supportsNativeShare ? <Share2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Share'}
    </button>
  );
}
