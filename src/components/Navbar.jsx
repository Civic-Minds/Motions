import { NavLink, Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/" className="nav-logo">
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

            <div className="ml-auto nav-status">
                <div className="nav-status-dot" />
                <span>Live Data</span>
            </div>
        </nav>
    );
};

export default Navbar;
