import React, { lazy, Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, MapPin, ChevronDown } from 'lucide-react';
import { WARD_COUNCILLORS } from './constants/data';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from './lib/utils';
import { useMotions } from './hooks/useMotions';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { getInitialJurisdiction, JURISDICTIONS } from './constants/jurisdictions';
import { formatElectionDate } from './utils/electionDate';
import { getLastJurisdiction, setLastJurisdiction } from './utils/storage';

const DashboardView     = lazy(() => import('./components/DashboardView'));
const MotionPage        = lazy(() => import('./components/MotionPage'));
const CouncillorList    = lazy(() => import('./components/CouncillorList'));
const CouncillorProfile = lazy(() => import('./components/CouncillorProfile'));
const CouncillorVotes   = lazy(() => import('./components/CouncillorVotes'));
const WardGrid          = lazy(() => import('./components/WardGrid'));
const BudgetTranslator  = lazy(() => import('./components/BudgetTranslator'));
const CommitteesView    = lazy(() => import('./components/CommitteesView'));
const MeetingPage       = lazy(() => import('./components/MeetingPage'));
const MeetingsListView  = lazy(() => import('./components/MeetingsListView'));
const GlobalSearch      = lazy(() => import('./components/GlobalSearch'));
const ElectionView      = lazy(() => import('./components/ElectionView'));
const DataPage          = lazy(() => import('./components/DataPage'));
const SiteFooter        = lazy(() => import('./components/SiteFooter'));
const VotingGuide       = lazy(() => import('./components/VotingGuide'));
const VancouverVotingGuide = lazy(() => import('./components/vancouver/VancouverVotingGuide'));
const TorontoSeoPage    = lazy(() => import('./components/TorontoSeoPage'));
const CitiesPage        = lazy(() => import('./components/CitiesPage'));
const SourcesPage       = lazy(() => import('./components/SourcesPage'));
const LegalPage         = lazy(() => import('./components/LegalPage'));
const AboutPage         = lazy(() => import('./components/AboutPage'));
const CivicGuidePage    = lazy(() => import('./components/CivicGuidePage'));
const LearnPage         = lazy(() => import('./components/LearnPage'));
const VancouverElection = lazy(() => import('./components/vancouver/VancouverElection'));

// About/Privacy/Terms now live outside the jurisdiction router (see
// StandaloneShell); a plain <Navigate> inside this router would just resolve
// relative to the basename again, so this forces a real full-page navigation
// out to the bare path instead.
function HardRedirect({ to }) {
  useEffect(() => { window.location.href = to; }, [to]);
  return null;
}

const TABS = [
  { path: '/councillors', label: 'Councillors' },
  { path: '/committees',  label: 'Committees' },
  { path: '/wards',       label: 'Wards' },
  { path: '/election',    label: 'Election' },
];

function Navbar({ onSearchOpen }) {
  const { wardId, handleLocate, handleClearWard, jurisdiction } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const cityMenuRef = useRef(null);
  const councillorName = jurisdiction.geography === 'ward' && wardId ? WARD_COUNCILLORS[wardId] : null;
  const wardLastName = councillorName ? councillorName.split(' ').at(-1) : null;

  const active = TABS.find(t =>
    t.path === '/' ? location.pathname === '/' : location.pathname.startsWith(t.path)
  );
  const tabs = jurisdiction.geography === 'atLarge'
    ? TABS.filter(tab => tab.path !== '/wards')
    : TABS;

  useEffect(() => {
    if (!cityOpen) return undefined;
    const handlePointerDown = event => {
      if (!cityMenuRef.current?.contains(event.target)) setCityOpen(false);
    };
    const handleKeyDown = event => {
      if (event.key === 'Escape') setCityOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [cityOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="relative max-w-[1400px] mx-auto px-6 h-16 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">

        {/* Logo */}
        <div className="flex w-[150px] shrink-0 items-center gap-3 cursor-pointer select-none" onClick={() => navigate('/')}> 
          <span className="flex flex-col text-sm leading-[0.95]">
            <span className="font-bold text-slate-900">Motions</span>
          <span className="font-normal text-slate-500">{jurisdiction.name}</span>
          </span>
        </div>

        {/* Desktop nav — absolutely centered so it never shifts */}
        <nav className="hidden lg:absolute lg:left-[max(236px,calc(50%-29rem))] lg:flex items-center gap-0">
          {tabs.map(tab => {
            const isActive = active?.path === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm whitespace-nowrap transition-colors duration-200",
                  isActive
                    ? "font-semibold text-slate-900"
                    : "font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <span>{tab.label}</span>
                {tab.path === '/election' && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#004a99]">
                    {formatElectionDate(jurisdiction.election.date)}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: ward + search + mobile toggle */}
        <div className="flex items-center justify-self-end gap-1 min-w-0 -mr-4 sm:mr-0">
          {jurisdiction.geography === 'ward' && wardId ? (
            <div className="hidden sm:flex items-center gap-0 group/ward">
              <button
                onClick={() => navigate(`/wards/${wardId}`)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <MapPin className="w-3.5 h-3.5 text-[#004a99]" />
                Ward {wardId}{wardLastName ? ` · ${wardLastName}` : ''}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleClearWard(); }}
                className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-100 hover:text-rose-500"
                title="Clear my ward"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : jurisdiction.geography === 'ward' ? (
            <button
              onClick={handleLocate}
              className="hidden sm:flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <MapPin className="w-3.5 h-3.5" />
                Find My Ward
            </button>
          ) : null}
          <div ref={cityMenuRef} className="relative hidden md:block">
            <button
              onClick={() => setCityOpen(value => !value)}
              aria-expanded={cityOpen}
              aria-haspopup="menu"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {jurisdiction.name}
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', cityOpen && 'rotate-180')} />
            </button>
            {cityOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 min-w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg" role="menu">
                {Object.values(JURISDICTIONS).map(city => (
                  <a
                    key={city.id}
                    href={city.path}
                    role="menuitem"
                    aria-current={city.id === jurisdiction.id ? 'page' : undefined}
                    onClick={() => setCityOpen(false)}
                    className={cn(
                      'block rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      city.id === jurisdiction.id ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    {city.name}
                  </a>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onSearchOpen}
            aria-label="Search"
            title="Search"
            className="hidden sm:flex items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={onSearchOpen}
            className="sm:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setOpen(o => !o)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden absolute w-full bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg"
          >
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = active?.path === tab.path;
              return (
                <button
                  key={tab.path}
                  onClick={() => { navigate(tab.path); setOpen(false); }}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.path === '/election' && (
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      isActive ? 'bg-white/15 text-white' : 'bg-blue-50 text-[#004a99]'
                    )}>
                      {formatElectionDate(jurisdiction.election.date)}
                    </span>
                  )}
                </button>
              );
            })}
            <a
              href={jurisdiction.id === 'toronto' ? '/vancouver' : '/toronto'}
              className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Switch to {jurisdiction.id === 'toronto' ? 'Vancouver' : 'Toronto'}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppShell() {
  const { jurisdiction } = useAppContext();
  const { motions, councillors, meetings, metadata, loading, error } = useMotions(jurisdiction);
  const [searchOpen, setSearchOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const toggleCompareMode = () => setCompareMode(m => !m);
  const location = useLocation();
  useEffect(() => {
    if (!location.pathname.startsWith('/councillors')) setCompareMode(false);
  }, [location.pathname]);

  const councillorNames = useMemo(() => {
    if (!motions) return [];
    const nameSet = new Set();
    motions.forEach(m => { if (m.votes) Object.keys(m.votes).forEach(n => nameSet.add(n)); });
    return [...nameSet].sort();
  }, [motions]);

  // Global Cmd+K listener
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const contentArea = () => {
    if (loading) return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#004a99] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading council data...</p>
        </div>
      </div>
    );
    if (error) return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center max-w-sm">
          <p className="font-semibold text-slate-800 mb-1">Could not load data</p>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-4 border-[#004a99] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<DashboardView motions={motions} meetings={meetings} jurisdiction={jurisdiction} />} />
          <Route path="/motions/:motionId" element={<MotionPage motions={motions} jurisdiction={jurisdiction} />} />
          <Route path="/councillors" element={<CouncillorList motions={motions} councillors={councillors} compareMode={compareMode} onCompareModeToggle={toggleCompareMode} jurisdiction={jurisdiction} />} />
          <Route path="/councillors/:slug" element={<CouncillorProfile motions={motions} councillors={councillors} jurisdiction={jurisdiction} />} />
          <Route path="/councillors/:slug/votes" element={<CouncillorVotes motions={motions} />} />
          <Route path="/councillors/:slug/vs/:slug2" element={<CouncillorList motions={motions} councillors={councillors} />} />
          {jurisdiction.id === 'toronto' && <><Route path="/wards" element={<WardGrid motions={motions} />} /><Route path="/wards/:wardId" element={<WardGrid motions={motions} />} /></>}
          <Route path="/committees" element={<CommitteesView motions={motions} meetings={meetings} />} />
          <Route path="/committees/:committeeSlug" element={<CommitteesView motions={motions} meetings={meetings} />} />
          <Route path="/meetings" element={<MeetingsListView meetings={meetings} jurisdiction={jurisdiction} />} />
          <Route path="/meetings/:meetingRef" element={<MeetingPage meetings={meetings} jurisdiction={jurisdiction} />} />
          <Route path="/election" element={jurisdiction.id === 'vancouver' ? <VancouverElection /> : <ElectionView />} />
          <Route path="/election/how-to-vote" element={<Navigate to="/learn/how-voting-works" replace />} />
          <Route path="/learn/how-to-vote" element={<Navigate to="/learn/how-voting-works" replace />} />
          <Route path="/learn/how-voting-works" element={jurisdiction.id === 'vancouver' ? <VancouverVotingGuide jurisdiction={jurisdiction} /> : <VotingGuide jurisdiction={jurisdiction} />} />
          <Route path="/budget" element={<BudgetTranslator />} />
          <Route path="/transparency" element={<DataPage jurisdiction={jurisdiction} motions={motions} metadata={metadata} />} />
          <Route path="/data" element={<Navigate to="/transparency" replace />} />
          <Route path="/cities" element={<CitiesPage />} />
          <Route path="/sources" element={<SourcesPage jurisdiction={jurisdiction} />} />
          <Route path="/privacy" element={<HardRedirect to="/privacy" />} />
          <Route path="/terms" element={<HardRedirect to="/terms" />} />
          <Route path="/about" element={<HardRedirect to="/about" />} />
          <Route path="/learn" element={<LearnPage jurisdiction={jurisdiction} />} />
          <Route path="/learn/how-council-works" element={<CivicGuidePage type="council" jurisdiction={jurisdiction} />} />
          <Route path="/learn/how-a-council-vote-works" element={<CivicGuidePage type="voting" jurisdiction={jurisdiction} />} />
          <Route path="/learn/how-to-get-involved" element={<CivicGuidePage type="involvement" jurisdiction={jurisdiction} />} />
          {jurisdiction.id === 'toronto' && <Route path="/learn/how-strong-mayor-powers-work" element={<CivicGuidePage type="strongMayor" jurisdiction={jurisdiction} />} />}
          {jurisdiction.id === 'toronto' && <>
            <Route path="/council-voting-records" element={<TorontoSeoPage type="council" motions={motions} />} />
            <Route path="/ward-voting-records" element={<TorontoSeoPage type="wards" motions={motions} />} />
            <Route path="/councillor-voting-records" element={<TorontoSeoPage type="councillors" motions={motions} />} />
          </>}
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6">
        {contentArea()}
      </main>

      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>

      {!loading && (
        <Suspense fallback={null}>
          <GlobalSearch
            motions={motions ?? []}
            councillorNames={councillorNames}
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

const STANDALONE_PATHS = new Set(['/', '/about', '/privacy', '/terms']);

function StandaloneShell() {
  // If they've previously visited a city, the logo takes them back there
  // instead of the generic homepage — otherwise About/Privacy/Terms feel like
  // they've kicked the visitor out of "their" city.
  const lastJurisdiction = getLastJurisdiction();
  const logoHref = lastJurisdiction && JURISDICTIONS[lastJurisdiction] ? `/${lastJurisdiction}` : '/';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center">
          <a href={logoHref} className="font-bold text-slate-900 text-sm">Motions</a>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6">
        <Suspense fallback={
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-4 border-[#004a99] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<CitiesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<LegalPage type="privacy" />} />
            <Route path="/terms" element={<LegalPage type="terms" />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-6 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Motions is a civic data project by{' '}
            <a href="https://github.com/Civic-Minds" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 hover:underline">
              Civic Minds
            </a>
            , built with care in Canada.
          </span>
          <div className="flex items-center gap-3">
            <Link to="/about" className="hover:text-slate-600">About</Link>
            <a href="https://github.com/Civic-Minds/Motions" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600">GitHub</a>
            <Link to="/privacy" className="hover:text-slate-600">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-600">Terms</Link>
            <span>© {new Date().getFullYear()} Civic Minds</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  if (typeof window !== 'undefined' && STANDALONE_PATHS.has(window.location.pathname)) {
    return (
      <BrowserRouter>
        <StandaloneShell />
        <Analytics />
        <SpeedInsights />
      </BrowserRouter>
    );
  }

  const jurisdiction = getInitialJurisdiction();
  setLastJurisdiction(jurisdiction.id);
  return (
    <BrowserRouter basename={jurisdiction.path}>
      <AppProvider jurisdiction={jurisdiction}>
        <AppShell />
      </AppProvider>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
}
