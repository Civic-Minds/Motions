import { NavLink, Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/" className="nav-logo">
                Toronto Council
            </Link>

            <div className="nav-links">
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
        </nav>
    );
};

export default Navbar;
