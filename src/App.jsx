import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Database } from 'lucide-react';

import Layout from './components/Layout';
import Scorecard from './components/Scorecard';
import BudgetTranslator from './components/BudgetTranslator';
import WardGrid from './components/WardGrid';
import DashboardView from './components/DashboardView';
import { useMotions } from './hooks/useMotions';

function App() {
  const { motions, loading, focusScore } = useMotions();
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

  const handleReset = () => {
    setSelectedCouncillor(null);
    setCompareList([]);
  };

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
    <BrowserRouter>
      <Layout
        motions={motions}
        selectedCouncillor={selectedCouncillor}
        setSelectedCouncillor={setSelectedCouncillor}
        compareList={compareList}
        setCompareList={setCompareList}
        handleReset={handleReset}
      >
        <Routes>
          <Route path="/" element={
            <DashboardView
              motions={motions}
              focusScore={focusScore}
              handleSelect={handleSelect}
              topic="dashboard"
            />
          } />

          <Route path="/wards" element={<WardGrid motions={motions} />} />
          <Route path="/budget" element={<BudgetTranslator />} />
          <Route path="/reports" element={<Scorecard motions={motions} />} />

          {['transit', 'housing'].map(topic => (
            <Route key={topic} path={`/${topic}`} element={
              <DashboardView
                motions={motions}
                focusScore={focusScore}
                handleSelect={handleSelect}
                topic={topic}
              />
            } />
          ))}

          <Route path="/data" element={
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Database size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 capitalize">Data Module</h3>
              <p className="text-slate-500 mt-1 max-w-xs">The data interface is currently under development. Please check back soon.</p>
            </div>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
