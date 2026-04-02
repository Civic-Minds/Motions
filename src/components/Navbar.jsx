import { NavLink, Link } from 'react-router-dom';

const Navbar = ({ motions = [] }) => {
    const lastMeeting = motions.length > 0 ? motions[0]?.date : null;

    return (
        <nav className="navbar">
            <Link to="/" className="nav-logo">
                TORONTO<br />COUNCIL
            </Link>

            <div className="nav-links">
                <NavLink to="/councillors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Councillors
                </NavLink>
                <NavLink to="/wards" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Wards
                </NavLink>
                <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Analytics
                </NavLink>
                <NavLink to="/export" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Export
                </NavLink>
                <NavLink to="/budget" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Budget
                </NavLink>
            </div>

            {motions.length > 0 && (
                <div className="nav-status">
                    <span className="nav-status-dot" />
                    {motions.length.toLocaleString()} motions
                    {lastMeeting && <span className="nav-status-date">· {lastMeeting}</span>}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
