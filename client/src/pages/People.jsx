import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function People() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setUsers([]);
      setSearched(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api(`/api/users/search?q=${encodeURIComponent(q)}`);
        if (!cancelled) {
          setUsers(data.users);
          setSearched(true);
        }
      } catch {
        if (!cancelled) setUsers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="page">
      <h1>People</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by username..."
        style={{ width: "100%" }}
      />

      {query.trim().length > 0 && query.trim().length < 2 && (
        <p className="muted">Type at least 2 characters.</p>
      )}
      {loading && <p className="muted">Searching...</p>}
      {searched && !loading && users.length === 0 && <p className="muted">No users found.</p>}

      <ul className="user-list">
        {users.map((u) => (
          <li key={u.username}>
            <Link to={`/u/${u.username}`} className="user-row">
              <span className="avatar small">{u.username[0].toUpperCase()}</span>
              <span>{u.username}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}