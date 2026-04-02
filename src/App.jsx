import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Scorecard from './components/Scorecard';
import BudgetTranslator from './components/BudgetTranslator';
import WardGrid from './components/WardGrid';
import DashboardView from './components/DashboardView';
import DataModule from './components/DataModule';
import CouncillorList from './components/CouncillorList';
import { useMotions } from './hooks/useMotions';

function App() {
  const { motions, loading } = useMotions();
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
          <div className="w-12 h-12 border-4 border-[#004a99] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading council data...</p>
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
            />
          } />
          <Route path="/wards"     element={<WardGrid motions={motions} />} />
          <Route path="/analytics" element={<Scorecard motions={motions} />} />
          <Route path="/export"    element={<DataModule motions={motions} />} />
          <Route path="/budget"    element={<BudgetTranslator />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
