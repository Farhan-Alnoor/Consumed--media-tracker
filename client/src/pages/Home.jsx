import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import useMediaTheme from "../hooks/useMediaTheme";

const TYPES = ["movie", "tv", "game", "anime"];

export default function Home() {
  const { user } = useAuth();

  const [type, setType] = useState(null);

  useMediaTheme(type);

  return (
    <div className="page">
      <h1>{user ? `Welcome, ${user.username}` : "Consumed"}</h1>


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