import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Consumed</Link>
      <NavLink to="/search">Search</NavLink>
      {user && <NavLink to="/profile">Profile</NavLink>}
      <div className="spacer" />
      {user ? (
        <button className="ghost" onClick={() => { logout(); navigate("/"); }}>Log out</button>
      ) : (
        <>
          <button className="ghost" onClick={() => navigate("/login")}>Log in</button>
          <button onClick={() => navigate("/register")}>Sign up</button>
        </>
      )}
    </nav>
  );
}