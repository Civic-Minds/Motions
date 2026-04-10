import React, { useState, useEffect, useMemo } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Users, Map, Building2, Menu, X, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from './lib/utils';
import { useMotions } from './hooks/useMotions';

import DashboardView from './components/DashboardView';
import MotionPage from './components/MotionPage';
import CouncillorList from './components/CouncillorList';
import CouncillorProfile from './components/CouncillorProfile';
import WardGrid from './components/WardGrid';
import BudgetTranslator from './components/BudgetTranslator';
import CommitteesView from './components/CommitteesView';
import GlobalSearch from './components/GlobalSearch';

const TABS = [
  { path: '/councillors', label: 'Councillors', icon: Users },
  { path: '/committees',  label: 'Committees',  icon: Building2 },
  { path: '/wards',       label: 'Wards',       icon: Map },
];

function Navbar({ onSearchOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const active = TABS.find(t =>
    t.path === '/' ? location.pathname === '/' : location.pathname.startsWith(t.path)
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-[#004a99] flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-lg leading-none">M</span>
          </div>
          <span className="text-base leading-none">
            <span className="font-bold text-slate-900">Motions</span>
            <span className="font-normal text-slate-500 ml-1.5">Toronto</span>
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = active?.path === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
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

        {/* Right: search + mobile toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSearchOpen}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 bg-slate-100 hover:bg-slate-150 border border-slate-200 rounded-xl transition-all w-48 hidden sm:flex"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 text-left text-slate-400">Search…</span>
            <kbd className="text-[10px] font-medium text-slate-300 bg-white border border-slate-200 rounded px-1.5 py-0.5">⌘K</kbd>
          </button>
          <button
            onClick={onSearchOpen}
            className="sm:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setOpen(o => !o)}>
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
            className="md:hidden absolute w-full bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg"
          >
            {TABS.map(tab => {
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
  const { motions, councillors, loading, error } = useMotions();
  const [searchOpen, setSearchOpen] = useState(false);

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

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#004a99] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading council data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="text-center max-w-sm">
        <p className="font-semibold text-slate-800 mb-1">Could not load data</p>
        <p className="text-sm text-slate-400">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8">
        <Routes>
          <Route path="/" element={<DashboardView motions={motions} />} />
          <Route path="/motions/:motionId" element={<MotionPage motions={motions} />} />
          <Route path="/councillors" element={<CouncillorList motions={motions} councillors={councillors} />} />
          <Route path="/councillors/:slug" element={<CouncillorProfile motions={motions} councillors={councillors} />} />
          <Route path="/councillors/:slug/vs/:slug2" element={<CouncillorList motions={motions} councillors={councillors} />} />
          <Route path="/wards"          element={<WardGrid motions={motions} />} />
          <Route path="/wards/:wardId"  element={<WardGrid motions={motions} />} />
          <Route path="/committees" element={<CommitteesView motions={motions} />} />
          <Route path="/committees/:committeeSlug" element={<CommitteesView motions={motions} />} />
          <Route path="/budget" element={<BudgetTranslator />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 h-12 flex items-center justify-between text-xs text-slate-400">
          <span>Data: <a href="https://open.toronto.ca/dataset/members-of-toronto-city-council-voting-record/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 underline underline-offset-2 transition-colors">Toronto Open Data</a></span>
          <span className="hidden sm:block">A <a href="https://github.com/Civic-Minds" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">Civic Minds</a> project</span>
          <a href="https://github.com/Civic-Minds/Motions" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">GitHub</a>
        </div>
      </footer>

      <GlobalSearch
        motions={motions ?? []}
        councillorNames={councillorNames}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return <BrowserRouter><AppShell /><Analytics /></BrowserRouter>;
}
