import { useEffect, useState } from "react";

import { api } from "../api/client";
import useMediaTheme from "../hooks/useMediaTheme";
import EntryCard from "../components/EntryCard";
import { useLocation,Link } from "react-router-dom";

const TYPES = ["all", "movie", "tv", "game", "anime"];
const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
];

export default function List() {
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useMediaTheme(type === "all" ? null : type);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (status !== "all") params.set("status", status);

    api(`/api/entries?${params}`)
      .then((data) => { if (!cancelled) setEntries(data.entries); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [type, status]);

  async function updateEntry(id, changes) {
    setError("");
    try {
      const data = await api(`/api/entries/${id}`, { method: "PATCH", body: changes });
      setEntries((list) => list.map((e) => (e._id === id ? data.entry : e)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteEntry(id) {
    if (!window.confirm("Remove this from your list?")) return;
    setError("");
    try {
      await api(`/api/entries/${id}`, { method: "DELETE" });
      setEntries((list) => list.filter((e) => e._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <h1>My List</h1>

      <div className="row">
        {TYPES.map((t) => (
          <button key={t} className={t === type ? "" : "ghost"} onClick={() => setType(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="search-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && entries.length === 0 && !error && (
        <p className="muted">
          Nothing here yet. <Link to="/search">Find something to add.</Link>
        </p>
      )}

      <div className="entry-list">
        {entries.map((entry) => (
          <EntryCard key={entry._id} entry={entry} onUpdate={updateEntry} onDelete={deleteEntry} />
        ))}
      </div>
    </div>
  );
}