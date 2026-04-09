import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Users, Map, BarChart3, PieChart, Building2, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from './lib/utils';
import { useMotions } from './hooks/useMotions';

import DashboardView from './components/DashboardView';
import CouncillorList from './components/CouncillorList';
import WardGrid from './components/WardGrid';
import Scorecard from './components/Scorecard';
import BudgetTranslator from './components/BudgetTranslator';
import CommitteesView from './components/CommitteesView';
import MotionDetail from './components/MotionDetail';

const TABS = [
  { path: '/councillors', label: 'Councillors', icon: Users },
  { path: '/wards',       label: 'Wards',       icon: Map },
  { path: '/committees',  label: 'Committees',  icon: Building2 },
  { path: '/analytics',   label: 'Scorecard',   icon: BarChart3 },
  { path: '/budget',      label: 'Budget',      icon: PieChart },
];

function Navbar() {
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
          <div>
            <span className="font-bold text-slate-900 text-base leading-none">Motions</span>
            <span className="text-slate-400 font-normal text-sm ml-2">Toronto Council</span>
          </div>
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


        {/* Mobile toggle */}
        <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setOpen(o => !o)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
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

function AppShell() {
  const { motions, loading, error } = useMotions();

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
      <Navbar />
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8">
        <Routes>
          <Route path="/" element={<DashboardView motions={motions} />} />
          <Route path="/councillors" element={<CouncillorList motions={motions} />} />
          <Route path="/councillors/:slug" element={<CouncillorList motions={motions} />} />
          <Route path="/councillors/:slug/vs/:slug2" element={<CouncillorList motions={motions} />} />
          <Route path="/motions/:motionId" element={<MotionDetail motions={motions} />} />
          <Route path="/wards"       element={<WardGrid motions={motions} />} />
          <Route path="/committees" element={<CommitteesView motions={motions} />} />
          <Route path="/analytics" element={<Scorecard motions={motions} />} />
          <Route path="/budget"    element={<BudgetTranslator />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return <BrowserRouter><AppShell /></BrowserRouter>;
}
