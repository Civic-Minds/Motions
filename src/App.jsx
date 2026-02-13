import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertCircle,
  Database,
  Home,
  FileText
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import MotionTable from './components/MotionTable';
import AlignmentHeatmap from './components/AlignmentHeatmap';
import ProfilePanel from './components/ProfilePanel';
import VersusOverlay from './components/VersusOverlay';
import Scorecard from './components/Scorecard';

function App() {
  const [motions, setMotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCouncillor, setSelectedCouncillor] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/data/motions.json');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setMotions(data);
      } catch (error) {
        console.error('Error loading motions:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

  const startComparison = (name) => {
    setCompareList([name]);
    setSelectedCouncillor(null);
  };

  const filteredMotions = currentView === 'dashboard'
    ? motions
    : motions.filter(m => m.topic.toLowerCase() === currentView.toLowerCase());

  // Calculate Real Triviality
  const totalMotions = motions.length;
  const trivialMotions = motions.filter(m => m.trivial).length;
  const trivialPercentage = totalMotions > 0 ? Math.floor((trivialMotions / totalMotions) * 100) : 0;
  const focusScore = 100 - trivialPercentage;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-toronto-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing with TMMIS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <ProfilePanel
        selected={selectedCouncillor}
        onCompare={startComparison}
        onClose={() => setSelectedCouncillor(null)}
        motions={motions}
      />

      <VersusOverlay
        selection={compareList}
        onClose={() => setCompareList([])}
        motions={motions}
      />

      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="main-content">
        {compareList.length === 1 && (
          <div className="mb-6 p-4 bg-toronto-blue text-white rounded-xl flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3">
              <Users size={20} />
              <div>
                <p className="text-sm font-bold">Versus Mode Active</p>
                <p className="text-xs opacity-90">Select another councillor below to compare with <strong>{compareList[0]}</strong></p>
              </div>
            </div>
            <button
              onClick={() => setCompareList([])}
              className="text-xs font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {currentView === 'reports' ? (
          <Scorecard motions={motions} />
        ) : (
          <>
            <header className="section-header flex justify-between items-end">
              <div>
                <h2 className="capitalize">{currentView} Session Overview</h2>
                <p className="text-muted">Data updated daily at 9:00 AM • February 2026</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50" onClick={() => {
                  setSelectedCouncillor(null);
                  setCompareList([]);
                  setCurrentView('dashboard');
                }}>Clear View</button>
                <button
                  onClick={() => setCurrentView('reports')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  Generate Report
                </button>
              </div>
            </header>

            {currentView === 'dashboard' || currentView === 'transit' || currentView === 'housing' ? (
              <>
                <div className="stats-grid">
                  <div className="card">
                    <div className="card-title">
                      TRIVIALITY SCORE
                      <AlertCircle size={16} className="text-slate-400" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-sm font-semibold text-slate-600 mb-1">
                        Score: <span className={focusScore > 70 ? "text-emerald-700" : "text-amber-700"}>{focusScore}% Focus on Core</span>
                      </p>
                      <div className="score-bar-container mt-1">
                        <div className="score-bar-fill" style={{ width: `${focusScore}%`, backgroundColor: focusScore > 70 ? '#059669' : '#d97706' }}></div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 leading-snug">
                        <strong>Analysis:</strong> {focusScore > 75 ? "Council focus remains primarily on significant civic matters this session." : "A significant portion of this session was occupied by administrative or minor items."}
                      </p>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-title">
                      MEMBER ALIGNMENT
                      <Users size={16} className="text-slate-400" />
                    </div>
                    <AlignmentHeatmap onSelect={handleSelect} motions={motions} />
                  </div>
                </div>

                <MotionTable motions={filteredMotions} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  {currentView === 'data' ? <Database size={32} className="text-slate-400" /> :
                    <Home size={32} className="text-slate-400" />}
                </div>
                <h3 className="text-xl font-bold text-slate-900 capitalize">{currentView} Module</h3>
                <p className="text-slate-500 mt-1 max-w-xs">The {currentView} interface is currently under development. Please check back soon.</p>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="mt-6 px-4 py-2 bg-toronto-blue text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
