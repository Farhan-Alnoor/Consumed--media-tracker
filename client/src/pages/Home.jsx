import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useMediaTheme from "../hooks/useMediaTheme";

const TYPES = ["movie", "tv", "game", "anime"];

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState(null);

  useMediaTheme(type);

  return (
    <div className="page">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h1>{user? `Welcome, ${user.username}` : "Consumed" }</h1>
        
         {user ? (
          <button className="ghost" onClick={logout}>Log out</button>
        ) : (
          <div className="row">
            <button className="ghost" onClick={() => navigate("/login")}>Log in</button>
            <button onClick={() => navigate("/register")}>Sign up</button>
          </div>
        )}
      </div>
       

      <div className="card">
        <p>Theme check:</p>
        <div className="row">
          {TYPES.map((t) => (
            <button key={t} onClick={() => setType(t)}>{t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}