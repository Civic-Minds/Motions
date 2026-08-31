import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

const linkClass = 'text-sm text-slate-500 transition-colors hover:text-slate-900';

export default function SiteFooter() {
  const { jurisdiction } = useAppContext();
  const isToronto = jurisdiction.geography === 'ward';
  return (
    <footer className="mt-8 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-8 sm:grid-cols-[1.4fr_repeat(4,1fr)] sm:gap-6 sm:py-10">
        <div className="space-y-2">
          <Link to="/" className="inline-flex flex-col text-sm leading-[0.95]">
            <span className="font-bold text-slate-900">Motions</span>
            <span className="font-normal text-slate-500">{jurisdiction.name}</span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-slate-500">
            A clearer way to follow {jurisdiction.name} council decisions and votes.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Cities</p>
          <div className="flex flex-col gap-2">
            <Link to="/cities" className={linkClass}>Browse all cities</Link>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Explore</p>
          <div className="flex flex-col gap-2">
            <Link to="/" className={linkClass}>Motions</Link>
            <Link to="/councillors" className={linkClass}>Councillors</Link>
            {isToronto && <Link to="/wards" className={linkClass}>Wards</Link>}
            <Link to="/election" className={linkClass}>Election</Link>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Data</p>
          <div className="flex flex-col gap-2">
            <Link to="/data" className={linkClass}>Data & methodology</Link>
            <a href={isToronto ? 'https://open.toronto.ca/' : 'https://opendata.vancouver.ca/'} target="_blank" rel="noopener noreferrer" className={linkClass}>{jurisdiction.name} Open Data</a>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Project</p>
          <div className="flex flex-col gap-2">
            <a href="https://github.com/Civic-Minds/Motions" target="_blank" rel="noopener noreferrer" className={linkClass}>GitHub</a>
            <a href="https://github.com/Civic-Minds/Motions/issues" target="_blank" rel="noopener noreferrer" className={linkClass}>Report an issue</a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-6 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>Independent civic information for {jurisdiction.name}.</span>
          <span>© {new Date().getFullYear()} Civic Minds</span>
        </div>
      </div>
    </footer>
  );
}
