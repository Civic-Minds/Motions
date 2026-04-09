import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Map, BarChart3, PieChart, Menu, X } from 'lucide-react';
import { cn } from './lib/utils';
import { useMotions } from './hooks/useMotions';

import DashboardView from './components/DashboardView';
import CouncillorList from './components/CouncillorList';
import WardGrid from './components/WardGrid';
import Scorecard from './components/Scorecard';
import BudgetTranslator from './components/BudgetTranslator';
import MotionDetail from './components/MotionDetail';

const TABS = [
  { path: '/',             label: 'Dashboard',   icon: LayoutDashboard },
  { path: '/councillors',  label: 'Councillors',  icon: Users },
  { path: '/wards',        label: 'Wards',        icon: Map },
  { path: '/analytics',   label: 'Scorecard',    icon: BarChart3 },
  { path: '/budget',      label: 'Budget',       icon: PieChart },
];

function Navbar({ motions }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeTab = TABS.find(t =>
    t.path === '/' ? location.pathname === '/' : location.pathname.startsWith(t.path)
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-2xl transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="relative">
            <div className="w-11 h-11 bg-gradient-to-br from-[#004a99] to-[#002d5c] rounded-[14px] flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <span className="text-white font-display font-black text-2xl leading-none tracking-tighter">M</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-[3px] border-white rounded-full shadow-sm" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-display font-black tracking-tight text-slate-900 leading-none">
              Motions
            </h1>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1.5 opacity-80">Toronto City Council</span>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab?.path === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[14px] font-bold transition-all duration-500 relative group/nav",
                  isActive
                    ? "text-[#004a99]"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-[18px] h-[18px] transition-transform duration-300 group-hover/nav:scale-110", isActive ? "text-[#004a99]" : "text-slate-400 group-hover/nav:text-slate-600")} />
                {tab.label}
                {isActive && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute inset-0 bg-[#004a99]/5 border border-[#004a99]/10 rounded-2xl -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-xs font-bold text-slate-600 tracking-tight">
            {motions.length} Motions Live
          </span>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm"
          onClick={() => setMobileOpen(o => !o)}
        >
          {mobileOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl px-4 py-4 absolute w-full shadow-2xl space-y-2"
          >
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab?.path === tab.path;
              return (
                <button
                  key={tab.path}
                  onClick={() => { navigate(tab.path); setMobileOpen(false); }}
                  className={cn(
                    "flex items-center gap-4 px-5 py-3.5 rounded-2xl text-base font-bold transition-all w-full text-left",
                    isActive ? "bg-[#004a99] text-white shadow-lg shadow-blue-950/20" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className="w-5 h-5" />
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
  const [selectedCouncillor, setSelectedCouncillor] = useState(null);
  const [compareList, setCompareList] = useState([]);

  const handleSelect = (name) => {
    if (compareList.length > 0) {
      if (compareList.includes(name)) {
        setCompareList(prev => prev.filter(c => c !== name));
      } else if (compareList.length < 2) {
        setCompareList(prev => [...prev, name]);
      }
    } else {
      setSelectedCouncillor(name);
    }
  };

  const handleActivatePanel = ({ profile = null, compare = null } = {}) => {
    if (compare) {
      setSelectedCouncillor(null);
      setCompareList(compare);
    } else {
      setCompareList([]);
      setSelectedCouncillor(profile);
    }
  };

  const handleReset = () => {
    setSelectedCouncillor(null);
    setCompareList([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-slate-50 border-t-primary rounded-full animate-spin mb-6" />
          <p className="text-slate-900 font-black text-xs uppercase tracking-[0.3em] pl-1">Synchronizing Dashboard</p>
        </div>
      </div>

    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4">
            <span className="text-rose-500 font-black text-lg">!</span>
          </div>
          <p className="text-slate-800 font-bold mb-1">Could not load council data</p>
          <p className="text-slate-400 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" style={{
      backgroundImage: 'radial-gradient(at 100% 0%, rgba(0,74,153,0.04) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(0,74,153,0.04) 0px, transparent 50%)',
      backgroundAttachment: 'fixed',
    }}>
      <Navbar motions={motions} />
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-8">
        <Routes>
          <Route path="/" element={<DashboardView motions={motions} onSelect={handleSelect} />} />
          <Route path="/councillors" element={
            <CouncillorList motions={motions} onSelect={handleSelect} onActivate={handleActivatePanel}
              selectedCouncillor={selectedCouncillor} setSelectedCouncillor={setSelectedCouncillor}
              compareList={compareList} setCompareList={setCompareList} onReset={handleReset} />
          } />
          <Route path="/councillors/:slug" element={
            <CouncillorList motions={motions} onSelect={handleSelect} onActivate={handleActivatePanel}
              selectedCouncillor={selectedCouncillor} setSelectedCouncillor={setSelectedCouncillor}
              compareList={compareList} setCompareList={setCompareList} onReset={handleReset} />
          } />
          <Route path="/councillors/:slug/vs/:slug2" element={
            <CouncillorList motions={motions} onSelect={handleSelect} onActivate={handleActivatePanel}
              selectedCouncillor={selectedCouncillor} setSelectedCouncillor={setSelectedCouncillor}
              compareList={compareList} setCompareList={setCompareList} onReset={handleReset} />
          } />
          <Route path="/motions/:motionId" element={<MotionDetail motions={motions} onSelect={handleSelect} />} />
          <Route path="/wards" element={<WardGrid motions={motions} onSelect={handleSelect} />} />
          <Route path="/analytics" element={<Scorecard motions={motions} />} />
          <Route path="/budget" element={<BudgetTranslator />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
