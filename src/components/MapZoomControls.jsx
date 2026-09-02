import { Minus, Plus } from 'lucide-react';

export default function MapZoomControls({ mapRef, className = 'top-3' }) {
  return (
    <div className={`absolute right-3 ${className} z-[500] flex flex-col gap-2`}>
      <button
        type="button"
        onClick={() => mapRef.current?.zoomIn()}
        aria-label="Zoom in"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-600 shadow-md transition-colors hover:border-[#004a99]/40 hover:text-[#004a99]"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => mapRef.current?.zoomOut()}
        aria-label="Zoom out"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-600 shadow-md transition-colors hover:border-[#004a99]/40 hover:text-[#004a99]"
      >
        <Minus className="h-4 w-4" />
      </button>
    </div>
  );
}
