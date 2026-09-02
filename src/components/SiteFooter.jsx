import React from 'react';
import { Link } from 'react-router-dom';
import { formatElectionDate } from '../utils/electionDate';
import { JURISDICTIONS } from '../constants/jurisdictions';

const linkClass = 'text-sm text-slate-500 transition-colors hover:text-slate-900';

export default function SiteFooter({ jurisdiction, standalone = false }) {
  const isToronto = jurisdiction.geography === 'ward';
  const hasElectionPage = jurisdiction.id === 'toronto' || jurisdiction.id === 'vancouver';
  const electionDate = formatElectionDate(jurisdiction.election.date);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Standalone pages (About/Privacy/Terms) sit outside the jurisdiction
  // router, so an internal <Link> would resolve against the wrong (empty)
  // basename — send those to the full city-prefixed path instead.
  function FooterLink({ to, className, children, onClick }) {
    if (standalone) {
      return <a href={`${jurisdiction.path}${to}`} className={className} onClick={onClick}>{children}</a>;
    }
    return <Link to={to} className={className} onClick={onClick}>{children}</Link>;
  }

  return (
    <footer className="mt-8 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-8 sm:grid-cols-4 sm:gap-6 sm:py-10 lg:grid-cols-[200px_repeat(4,minmax(0,1fr))_220px] lg:gap-3">
        <div className="space-y-2 lg:col-span-2">
          <FooterLink to="/" onClick={scrollToTop} className="inline-flex flex-col text-sm leading-[0.95]">
            <span className="font-bold text-slate-900">Motions</span>
            <span className="font-normal text-slate-500">{jurisdiction.name}</span>
          </FooterLink>
          <p className="max-w-xs text-sm leading-relaxed text-slate-500">
            Follow the votes shaping your city.
          </p>
        </div>

        <div className="space-y-3 lg:col-start-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Cities</p>
          <div className="flex flex-col gap-2">
            {Object.values(JURISDICTIONS).map(city => (
              <a key={city.id} href={city.path} onClick={scrollToTop} className={linkClass}>{city.name}</a>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Your City</p>
          <div className="flex flex-col gap-2">
            <FooterLink to="/" onClick={scrollToTop} className={linkClass}>Motions</FooterLink>
            <FooterLink to="/councillors" onClick={scrollToTop} className={linkClass}>Councillors</FooterLink>
            {isToronto && <FooterLink to="/wards" onClick={scrollToTop} className={linkClass}>Wards</FooterLink>}
            {hasElectionPage ? (
              <FooterLink to="/election" onClick={scrollToTop} className={`${linkClass} inline-flex items-center gap-2`}>
                <span>Election</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#004a99]">{electionDate}</span>
              </FooterLink>
            ) : (
              <a href={jurisdiction.election.officialUrl} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-2`}>
                <span>Election</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#004a99]">{electionDate}</span>
              </a>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Understand</p>
          <div className="flex flex-col gap-2">
            <FooterLink to="/learn" onClick={scrollToTop} className={linkClass}>Learn</FooterLink>
            <FooterLink to="/map" onClick={scrollToTop} className={linkClass}>Map</FooterLink>
            <FooterLink to="/transparency" onClick={scrollToTop} className={linkClass}>Transparency</FooterLink>
            <FooterLink to="/sources" onClick={scrollToTop} className={linkClass}>Sources</FooterLink>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Project</p>
          <div className="flex flex-col gap-2">
            <a href="/about" className={linkClass}>About Motions</a>
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
            <a href="/privacy" className="hover:text-slate-600">Privacy</a>
            <a href="/contact" className="hover:text-slate-600">Contact</a>
            <a href="/terms" className="hover:text-slate-600">Terms</a>
            <span>© {new Date().getFullYear()} Civic Minds</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
