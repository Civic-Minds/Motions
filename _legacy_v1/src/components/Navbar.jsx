import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const close = () => setMenuOpen(false);

    return (
        <>
            <nav className="navbar">
                <Link to="/" className="nav-logo" onClick={close}>
                    Motions
                    <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-[0.12em] mt-0.5">
                        Toronto Council
                    </span>
                </Link>

                <div className="nav-links">
                    <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/councillors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Councillors
                    </NavLink>
                    <NavLink to="/wards" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Wards
                    </NavLink>

                    <div className="nav-divider" />

                    <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Analytics
                    </NavLink>
                    <NavLink to="/budget" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Budget
                    </NavLink>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <div className="nav-status">
                        <div className="nav-status-dot" />
                        <span>Live Data</span>
                    </div>
                    <button
                        className="nav-hamburger"
                        onClick={() => setMenuOpen(p => !p)}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            {menuOpen && (
                <div className="nav-mobile-drawer">
                    <NavLink to="/" end className={({ isActive }) => `nav-mobile-link ${isActive ? 'active' : ''}`} onClick={close}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/councillors" className={({ isActive }) => `nav-mobile-link ${isActive ? 'active' : ''}`} onClick={close}>
                        Councillors
                    </NavLink>
                    <NavLink to="/wards" className={({ isActive }) => `nav-mobile-link ${isActive ? 'active' : ''}`} onClick={close}>
                        Wards
                    </NavLink>
                    <div className="nav-mobile-divider" />
                    <NavLink to="/analytics" className={({ isActive }) => `nav-mobile-link ${isActive ? 'active' : ''}`} onClick={close}>
                        Analytics
                    </NavLink>
                    <NavLink to="/budget" className={({ isActive }) => `nav-mobile-link ${isActive ? 'active' : ''}`} onClick={close}>
                        Budget
                    </NavLink>
                </div>
            )}
        </>
    );
};

export default Navbar;
