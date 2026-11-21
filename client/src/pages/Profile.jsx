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
  const { user, setUser } = useAuth();
  const [privacyError, setPrivacyError] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function togglePublic() {
  setPrivacyError("");
  try {
    const data = await api("/api/users/me", { method: "PATCH", body: { isPublic: !user.isPublic } });
    setUser(data.user);
  } catch (err) {
    setPrivacyError(err.message);
  }
}
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
      <div className="privacy">
  <label>
    <input type="checkbox" checked={user.isPublic} onChange={togglePublic} />
    Public profile
  </label>
  <span>
    {user.isPublic
      ? "Anyone can see your list, ratings, and stats. Your private notes are never shown."
      : "Only you can see your list."}
  </span>
  <Link to={`/u/${user.username}`}>View as others see it</Link>
</div>
{privacyError && <p className="error">{privacyError}</p>}

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