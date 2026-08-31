import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

const linkClass = 'text-sm text-slate-500 transition-colors hover:text-slate-900';

export default function SiteFooter() {
  const { jurisdiction } = useAppContext();
  const isToronto = jurisdiction.geography === 'ward';
  const electionDate = new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric' })
    .format(new Date(`${jurisdiction.election.date}T00:00:00`));
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  return (
    <footer className="mt-8 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-8 sm:grid-cols-4 sm:gap-6 sm:py-10 lg:grid-cols-[200px_repeat(4,minmax(0,1fr))_220px] lg:gap-3">
        <div className="space-y-2 lg:col-span-2">
          <Link to="/" onClick={scrollToTop} className="inline-flex flex-col text-sm leading-[0.95]">
            <span className="font-bold text-slate-900">Motions</span>
            <span className="font-normal text-slate-500">{jurisdiction.name}</span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-slate-500">
            Follow the votes shaping your city.
          </p>
        </div>

        <div className="space-y-3 lg:col-start-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Cities</p>
          <div className="flex flex-col gap-2">
            <a href="/toronto" onClick={scrollToTop} className={linkClass}>Toronto</a>
            <a href="/vancouver" onClick={scrollToTop} className={linkClass}>Vancouver</a>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Explore</p>
          <div className="flex flex-col gap-2">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={linkClass}>Motions</Link>
            <Link to="/councillors" onClick={scrollToTop} className={linkClass}>Councillors</Link>
            {isToronto && <Link to="/wards" onClick={scrollToTop} className={linkClass}>Wards</Link>}
            <Link to="/election" onClick={scrollToTop} className={`${linkClass} inline-flex items-center gap-2`}>
              <span>Election</span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#004a99]">{electionDate}</span>
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Data</p>
          <div className="flex flex-col gap-2">
            <Link to="/transparency" onClick={scrollToTop} className={linkClass}>Transparency</Link>
            <Link to="/sources" onClick={scrollToTop} className={linkClass}>Sources</Link>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Project</p>
          <div className="flex flex-col gap-2">
            <a href="https://github.com/Civic-Minds/Motions" target="_blank" rel="noopener noreferrer" className={linkClass}>GitHub</a>
            <a href="https://github.com/Civic-Minds/Motions/issues" target="_blank" rel="noopener noreferrer" className={linkClass}>Report an issue</a>
          </div>
        </div>

      </div>

      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-6 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Motions is a civic data project by{' '}
            <a href="https://github.com/Civic-Minds" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 hover:underline">
              Civic Minds
            </a>
            , built with care in Canada.
          </span>
          <div className="flex items-center gap-3">
            <Link to="/privacy" onClick={scrollToTop} className="hover:text-slate-600">Privacy</Link>
            <Link to="/terms" onClick={scrollToTop} className="hover:text-slate-600">Terms</Link>
            <span>© {new Date().getFullYear()} Civic Minds</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
