import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Scorecard from './components/Scorecard';
import BudgetTranslator from './components/BudgetTranslator';
import WardGrid from './components/WardGrid';
import DashboardView from './components/DashboardView';
import CouncillorList from './components/CouncillorList';
import { useMotions } from './hooks/useMotions';

function App() {
  const { motions, loading, error } = useMotions();
  const [selectedCouncillor, setSelectedCouncillor] = useState(null);
  const [compareList, setCompareList] = useState([]);

  const handleActivatePanel = ({ profile = null, compare = null } = {}) => {
    if (compare) {
      setSelectedCouncillor(null);
      setCompareList(compare);
    } else {
      setCompareList([]);
      setSelectedCouncillor(profile);
    }
  };

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
          <div className="w-12 h-12 border-4 border-[#004a99] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading council data...</p>
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
          <p className="text-slate-400 text-xs font-medium">{error}</p>
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
              handleSelect={handleSelect}
            />
          } />
          <Route path="/councillors" element={
            <CouncillorList
              motions={motions}
              onSelect={handleSelect}
              onActivate={handleActivatePanel}
            />
          } />
          <Route path="/councillors/:slug" element={
            <CouncillorList
              motions={motions}
              onSelect={handleSelect}
              onActivate={handleActivatePanel}
            />
          } />
          <Route path="/councillors/:slug/vs/:slug2" element={
            <CouncillorList
              motions={motions}
              onSelect={handleSelect}
              onActivate={handleActivatePanel}
            />
          } />
          <Route path="/wards"     element={<WardGrid motions={motions} onSelect={handleSelect} />} />
          <Route path="/analytics" element={<Scorecard motions={motions} />} />
          <Route path="/budget"    element={<BudgetTranslator />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
