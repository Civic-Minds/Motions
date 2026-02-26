import {
  LayoutDashboard,
  FileText,
  Database,
  Bus,
  Home,
  Coins,
  MapPin
} from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView }) => {
  return (
    <aside className="sidebar">
      <div className="logo" onClick={() => setCurrentView('dashboard')} style={{ cursor: 'pointer' }}>
        TORONTO COUNCIL<br />TRANSPARENCY
      </div>

      <nav className="nav-section">
        <h3>Navigate</h3>
        <div className="space-y-1">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button
            onClick={() => setCurrentView('wards')}
            className={`nav-item ${currentView === 'wards' ? 'active' : ''}`}
          >
            <MapPin size={18} /> Ward Impact
          </button>
          <button
            onClick={() => setCurrentView('reports')}
            className={`nav-item ${currentView === 'reports' ? 'active' : ''}`}
          >
            <FileText size={18} /> Reports
          </button>
          <button
            onClick={() => setCurrentView('data')}
            className={`nav-item ${currentView === 'data' ? 'active' : ''}`}
          >
            <Database size={18} /> Open Data
          </button>
        </div>
      </nav>

      <nav className="nav-section">
        <h3>Topics</h3>
        <div className="space-y-1">
          <button
            onClick={() => setCurrentView('transit')}
            className={`nav-item ${currentView === 'transit' ? 'active' : ''}`}
          >
            <Bus size={18} /> Transit
          </button>
          <button
            onClick={() => setCurrentView('housing')}
            className={`nav-item ${currentView === 'housing' ? 'active' : ''}`}
          >
            <Home size={18} /> Housing
          </button>
          <button
            onClick={() => setCurrentView('budget')}
            className={`nav-item ${currentView === 'budget' ? 'active' : ''}`}
          >
            <Coins size={18} /> Budget Translator
          </button>
        </div>
      </nav>

      <div className="mt-auto p-4 bg-slate-100/50 rounded-xl border border-slate-200">
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Active Monitoring</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            TMMIS SYNC ACTIVE
          </div>
          <div className="text-[10px] text-slate-500 font-mono space-y-1">
            <p>• CC37 (FEB 4, 2026)</p>
            <p>• CC38 (FEB 10, 2026)</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
