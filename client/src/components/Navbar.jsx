import {
  BarChart3,
  LayoutDashboard,
  Leaf,
  LogIn,
  Settings,
  Target,
  UserPlus
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

function Navbar() {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <Link to={user ? "/dashboard" : "/"} className="brand" aria-label="Self-care home">
        <span className="brand-mark">
          <Leaf size={18} />
        </span>
        <span>Self-care</span>
      </Link>

      <nav className="nav-links" aria-label="Primary navigation">
        {user ? (
          <>
            <NavLink to="/dashboard">
              <LayoutDashboard size={17} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/goals">
              <Target size={17} />
              <span>Goals</span>
            </NavLink>
            <NavLink to="/progress">
              <BarChart3 size={17} />
              <span>Progress</span>
            </NavLink>
            <NavLink to="/profile">
              <Settings size={17} />
              <span>Settings</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/login">
              <LogIn size={17} />
              <span>Login</span>
            </NavLink>
            <NavLink to="/signup" className="nav-cta">
              <UserPlus size={17} />
              <span>Signup</span>
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
