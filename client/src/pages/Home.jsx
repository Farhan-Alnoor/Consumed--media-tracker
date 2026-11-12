import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import useMediaTheme from "../hooks/useMediaTheme";
import MediaRow from "../components/MediaRow";

const ROWS = [
  { type: "movie", title: "Trending movies" },
  { type: "tv", title: "Trending TV" },
  { type: "anime", title: "Trending anime" },
  { type: "game", title: "Popular games" },
];

export default function Home() {
  const { user } = useAuth();
  const [activeType, setActiveType] = useState(null);

  useMediaTheme(activeType);

  return (
    <div className="page">
      <h1>{user ? `Welcome, ${user.username}` : "Track everything you watch and play"}</h1>
      <p className="muted">Discover what's popular right now, and keep track of your own list.</p>

      {ROWS.map((row) => (
        <MediaRow key={row.type} type={row.type} title={row.title} onActivate={setActiveType} />
      ))}
    </div>
  );
}