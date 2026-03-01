import {
  LayoutDashboard,
  FileText,
  Database,
  Bus,
  Home,
  Coins,
  MapPin
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <Link to="/" className="logo">
        TORONTO COUNCIL<br />TRANSPARENCY
      </Link>

      <nav className="nav-section">
        <h3>Navigate</h3>
        <div className="space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink
            to="/wards"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <MapPin size={18} /> Ward Impact
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FileText size={18} /> Reports
          </NavLink>
          <NavLink
            to="/data"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Database size={18} /> Open Data
          </NavLink>
        </div>
      </nav>

      <nav className="nav-section">
        <h3>Topics</h3>
        <div className="space-y-1">
          <NavLink
            to="/transit"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Bus size={18} /> Transit
          </NavLink>
          <NavLink
            to="/housing"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Home size={18} /> Housing
          </NavLink>
          <NavLink
            to="/budget"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Coins size={18} /> Budget Translator
          </NavLink>
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
