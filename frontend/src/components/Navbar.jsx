import { NavLink, useNavigate } from "react-router-dom";
import {
  ComponentsIcon,
  DashboardIcon,
  DocsIcon,
  LogoutIcon,
  PlusIcon,
  SearchIcon,
} from "./Icons";

function Navbar({ token, role, onLogout }) {
  const navigate = useNavigate();

  const logout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <NavLink to={token ? "/dashboard" : "/"} className="brand-link" aria-label="SmartDB home">
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-copy">
          <strong>Smart<span>DB</span></strong>
          <small>Intelligent Search Platform</small>
        </span>
      </NavLink>

      <div>
        {!token && (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/signup" className="signup-nav-link">Sign Up</NavLink>
          </>
        )}

        {token && (
          <>
            <NavLink to="/dashboard"><DashboardIcon /> Dashboard</NavLink>
            <NavLink to="/components"><ComponentsIcon /> Components</NavLink>
            <NavLink to="/categories"><DocsIcon /> Categories</NavLink>
            <NavLink to="/search"><SearchIcon /> Search</NavLink>
            <NavLink to="/analytics"><DashboardIcon /> Analytics</NavLink>

            {role === "ADMIN" && <NavLink to="/add-component"><PlusIcon /> Add Component</NavLink>}

            <button onClick={logout}><LogoutIcon /> Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}


export default Navbar;