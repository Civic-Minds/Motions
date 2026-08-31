import React, { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, Map, Building2, Vote, Menu, X, Search, MapPin } from 'lucide-react';
import { WARD_COUNCILLORS } from './constants/data';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from './lib/utils';
import { useMotions } from './hooks/useMotions';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { getInitialJurisdiction } from './constants/jurisdictions';

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
const VancouverElection = lazy(() => import('./components/vancouver/VancouverElection'));
const VancouverDataPage = lazy(() => import('./components/vancouver/VancouverDataPage'));

const TABS = [
  { path: '/councillors', label: 'Councillors', icon: Users },
  { path: '/committees',  label: 'Committees',  icon: Building2 },
  { path: '/wards',       label: 'Wards',       icon: Map },
  { path: '/election',    label: 'Election',    icon: Vote },
];

function Navbar({ onSearchOpen }) {
  const { wardId, handleLocate, handleClearWard, jurisdiction } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const councillorName = jurisdiction.geography === 'ward' && wardId ? WARD_COUNCILLORS[wardId] : null;
  const wardLastName = councillorName ? councillorName.split(' ').at(-1) : null;

  const active = TABS.find(t =>
    t.path === '/' ? location.pathname === '/' : location.pathname.startsWith(t.path)
  );
  const tabs = jurisdiction.geography === 'atLarge'
    ? TABS.filter(tab => tab.path !== '/wards' && tab.path !== '/committees')
    : TABS;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-6 h-16 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">

        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navigate('/')}>
          <span className="flex flex-col text-sm leading-[0.95]">
            <span className="font-bold text-slate-900">Motions</span>
          <span className="font-normal text-slate-500">{jurisdiction.name}</span>
          </span>
        </div>

        {/* Desktop nav — absolutely centered so it never shifts */}
        <nav className="hidden lg:flex items-center gap-1 justify-self-start">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = active?.path === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: ward + search + mobile toggle */}
        <div className="flex items-center justify-self-end gap-2 min-w-0 -mr-4 sm:mr-0">
          {jurisdiction.geography === 'ward' && wardId ? (
            <div className="hidden sm:flex items-center gap-0 bg-white border border-slate-200 rounded-xl hover:border-[#004a99]/40 transition-all group/ward">
              <button
                onClick={() => navigate(`/wards/${wardId}`)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 font-medium"
              >
                <MapPin className="w-3.5 h-3.5 text-[#004a99]" />
                Ward {wardId}{wardLastName ? ` · ${wardLastName}` : ''}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleClearWard(); }}
                className="pr-2.5 py-2 text-slate-300 hover:text-rose-500 transition-colors"
                title="Clear my ward"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : jurisdiction.geography === 'ward' ? (
            <button
              onClick={handleLocate}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 whitespace-nowrap text-sm text-slate-500 bg-white border border-slate-200 rounded-xl hover:border-slate-400 transition-all"
            >
              <MapPin className="w-3.5 h-3.5" />
                Find My Ward
            </button>
          ) : null}
          <a
            href={jurisdiction.id === 'toronto' ? '/vancouver/' : '/toronto/'}
            className="hidden md:inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            {jurisdiction.id === 'toronto' ? 'Vancouver' : 'Toronto'}
          </a>
          <button
            onClick={onSearchOpen}
            aria-label="Search"
            title="Search"
            className="hidden sm:flex items-center justify-center p-2.5 text-slate-500 bg-slate-100 hover:bg-slate-150 border border-slate-200 rounded-xl transition-all"
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
                  {tab.label}
                </button>
              );
            })}
            <a
              href={jurisdiction.id === 'toronto' ? '/vancouver/' : '/toronto/'}
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
  const { motions, councillors, meetings, loading, error } = useMotions(jurisdiction);
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
          <Route path="/election/how-to-vote" element={<VotingGuide />} />
          <Route path="/budget" element={<BudgetTranslator />} />
          <Route path="/data" element={jurisdiction.id === 'vancouver' ? <VancouverDataPage /> : <DataPage />} />
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

export default function App() {
  const jurisdiction = getInitialJurisdiction();
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
