import { NavLink, useNavigate } from "react-router-dom";
import {
  ComponentsIcon,
  DashboardIcon,
  DocsIcon,
  LogoutIcon,
  PlusIcon,
  SearchIcon,
  HeartIcon,
} from "./Icons";

function Navbar({ token, role, onLogout }) {
  const navigate = useNavigate();

  const logout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2><ComponentsIcon /> Component Library</h2>

      <div>
        {token && (
          <>
            <NavLink to="/dashboard"><DashboardIcon /> Dashboard</NavLink>
            <NavLink to="/components"><ComponentsIcon /> Components</NavLink>
            <NavLink to="/categories"><DocsIcon /> Categories</NavLink>
            <NavLink to="/search"><SearchIcon /> Search</NavLink>
            <NavLink to="/favorites"><HeartIcon /> Favorites</NavLink>

            {role === "ADMIN" && (
              <>
                <NavLink to="/add-component"><PlusIcon /> Add Component</NavLink>
                <NavLink to="/admin/users"><DocsIcon /> Users</NavLink>
              </>
            )}

            <button onClick={logout}><LogoutIcon /> Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;