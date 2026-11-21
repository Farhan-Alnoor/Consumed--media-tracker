import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import DietTab from "../components/DietTab";
import ListTab from "../components/ListTab";

const TABS = [
  { key: "diet", label: "Diet" },
  { key: "list", label: "List" },
];

export default function PublicProfile() {
  const { username, tab = "diet" } = useParams();
  const [profile, setProfile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setProfile(null);
    setEntries([]);

    (async () => {
      try {
        const name = encodeURIComponent(username);
        const p = await api(`/api/users/${name}`);
        if (cancelled) return;
        setProfile(p);

        if (!p.isPrivate) {
          const e = await api(`/api/users/${name}/entries`);
          if (!cancelled) setEntries(e.entries);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [username]);

  if (!TABS.some((t) => t.key === tab)) return <Navigate to={`/u/${username}`} replace />;

  if (loading) return <div className="page"><p className="muted">Loading...</p></div>;
  if (error) return <div className="page"><p className="error">{error}</p></div>;

  const { user, isOwner, isPrivate } = profile;
  const since = new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="page">
      <div className="profile-header">
        <div className="avatar">{user.username[0].toUpperCase()}</div>
        <div>
          <h1>{user.username}</h1>
          <span className="muted">Member since {since}</span>
        </div>
      </div>

      {isOwner && (
        <p className="notice">
          {user.isPublic
            ? "This is how others see your profile. "
            : "Your profile is private, so only you can see this page. "}
          <Link to="/profile">Back to your profile</Link>
        </p>
      )}

      {isPrivate ? (
        <div className="card">
          <strong>This profile is private.</strong>
          <p className="muted" style={{ marginBottom: 0 }}>{user.username} hasn't shared their list.</p>
        </div>
      ) : (
        <>
          <nav className="tabs">
            {TABS.map((t) => (
              <Link key={t.key} to={`/u/${username}/${t.key}`} className={t.key === tab ? "active" : ""}>
                {t.label}
              </Link>
            ))}
          </nav>

          {tab === "diet" ? (
            <DietTab entries={entries} readOnly />
          ) : (
            <ListTab entries={entries} readOnly />
          )}
        </>
      )}
    </div>
  );
}