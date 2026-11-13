import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import DietTab from "../components/DietTab";
import ListTab from "../components/ListTab";

const TABS = [
  { key: "diet", label: "Your Diet" },
  { key: "list", label: "My List" },
];

export default function Profile() {
  const { tab = "diet" } = useParams();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api("/api/entries")
      .then((data) => { if (!cancelled) setEntries(data.entries.filter((e) => e.item)); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (!TABS.some((t) => t.key === tab)) return <Navigate to="/profile" replace />;

  return (
    <div className="page">
      <div className="profile-header">
        <div className="avatar">{user.username[0].toUpperCase()}</div>
        <div>
          <h1>{user.username}</h1>
          <span className="muted">{user.email}</span>
        </div>
      </div>

      <nav className="tabs">
        {TABS.map((t) => (
          <Link key={t.key} to={`/profile/${t.key}`} className={t.key === tab ? "active" : ""}>
            {t.label}
          </Link>
        ))}
      </nav>

      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error &&
        (tab === "diet" ? (
          <DietTab entries={entries} />
        ) : (
          <ListTab entries={entries} setEntries={setEntries} />
        ))}
    </div>
  );
}