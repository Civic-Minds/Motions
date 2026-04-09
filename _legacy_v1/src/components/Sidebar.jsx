import {
  LayoutDashboard,
  FileText,
  Database,
  Bus,
  Home,
  Coins,
  MapPin,
  Leaf,
  DollarSign,
  Trees,
  Flame,
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';

const Sidebar = ({ motions = [] }) => {
  const lastMeeting = motions.length > 0 ? motions[0]?.date : null;

  return (
    <aside className="sidebar">
      <Link to="/" className="logo">
        TORONTO COUNCIL<br />TRANSPARENCY
      </Link>

      <nav className="nav-section">
        <h3>Navigate</h3>
        <div className="space-y-1">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/contested" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Flame size={18} /> Most Contested
          </NavLink>
          <NavLink to="/wards" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MapPin size={18} /> Ward Impact
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={18} /> Reports
          </NavLink>
          <NavLink to="/data" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Database size={18} /> Open Data
          </NavLink>
        </div>
      </nav>

      <nav className="nav-section">
        <h3>Topics</h3>
        <div className="space-y-1">
          <NavLink to="/housing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Home size={18} /> Housing
          </NavLink>
          <NavLink to="/transit" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Bus size={18} /> Transit
          </NavLink>
          <NavLink to="/finance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <DollarSign size={18} /> Finance
          </NavLink>
          <NavLink to="/parks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Trees size={18} /> Parks
          </NavLink>
          <NavLink to="/climate" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Leaf size={18} /> Climate
          </NavLink>
          <NavLink to="/budget" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Coins size={18} /> Budget Translator
          </NavLink>
        </div>
      </nav>

      <div className="mt-auto p-4 bg-slate-100/50 rounded-xl border border-slate-200">
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Data Status</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {motions.length.toLocaleString()} MOTIONS LOADED
          </div>
          {lastMeeting && (
            <p className="text-[10px] text-slate-500 font-mono">Latest: {lastMeeting}</p>
          )}
          <p className="text-[10px] text-slate-400">2022–2026 Term · Toronto Open Data</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
