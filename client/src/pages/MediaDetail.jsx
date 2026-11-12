import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import useMediaTheme from "../hooks/useMediaTheme";

const SAVE_LABELS = {
  idle: "Add to list",
  adding: "Adding...",
  added: "Added ✓",
  exists: "In your list",
  error: "Failed, retry",
};
const CREDIT_LABELS = { movie: "Directed by", tv: "Created by", anime: "Studio" ,game: "Developer"};
function formatRuntime(min) {
  if (!min) return null;
  return min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`;
}

export default function MediaDetail() {
  const { type, id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState("idle");

  useMediaTheme(type);

  // Load the details
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setItem(null);
    setSaveState("idle");

    api(`/api/media/${type}/${id}`)
      .then((data) => { if (!cancelled) setItem(data.item); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [type, id]);

  // If logged in, check whether this title is already in the user's list
  useEffect(() => {
    if (!user || !item) return;
    let cancelled = false;

    api("/api/entries")
      .then((data) => {
        const found = data.entries.some(
          (e) => e.item?.source === item.source && e.item?.externalId === item.externalId
        );
        if (!cancelled && found) setSaveState("exists");
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [user, item]);

  async function addToList() {
    if (!user) {
      navigate("/login", { state: { from: `/media/${type}/${id}` } });
      return;
    }
    setSaveState("adding");
    try {
      await api("/api/entries", {
        method: "POST",
        body: { item: { ...item, totalUnits: item.episodes }, status: "planned" },
      });
      setSaveState("added");
    } catch (err) {
      setSaveState(err.status === 409 ? "exists" : "error");
    }
  }

  if (loading) return <div className="page"><p className="muted">Loading...</p></div>;
  if (error) return <div className="page"><p className="error">{error}</p></div>;

  const year = item.releaseDate ? item.releaseDate.slice(0, 4) : null;
  const done = saveState === "added" || saveState === "exists";

  const facts = [
    year,
    formatRuntime(item.runtime),
    item.seasons != null && `${item.seasons} season${item.seasons === 1 ? "" : "s"}`,
    item.episodes != null && `${item.episodes} episodes`,
    item.status,
    item.rating != null && `★ ${item.rating}`,
  ].filter(Boolean);

  return (
    <div>
      <div
        className="hero"
        style={
          item.backdropUrl
            ?{ backgroundImage: `url(${item.backdropUrl})` }
            : undefined
        }
      />

      <div className="page">
        <div className="detail">
          {item.posterUrl ? (
            <img className="detail-poster" src={item.posterUrl} alt={item.title} />
          ) : (
            <div className="detail-poster poster-placeholder">No image</div>
          )}

          <div className="detail-info">
            <h1>{item.title}</h1>
            {item.tagline && <p className="muted"><em>{item.tagline}</em></p>}

            <div className="meta">
              {facts.map((f) => <span key={f}>{f}</span>)}
            </div>

            {item.genres.length > 0 && (
              <div className="row" style={{ margin: "1rem 0" }}>
                {item.genres.map((g) => <span key={g} className="chip">{g}</span>)}
              </div>
            )}

            {item.platforms?.length > 0 && (
            <p className="muted">Platforms: {item.platforms.join(", ")}</p>
            )}

            <h2>Overview</h2>
            <p>{item.overview || "No overview available."}</p>

            {item.creators.length > 0 && (
  <p className="muted">
    {CREDIT_LABELS[type] ?? "By"}: {item.creators.join(", ")}
  </p>
)}

            <button
              className={done ? "ghost" : ""}
              disabled={saveState === "adding" || done}
              onClick={addToList}
            >
              {SAVE_LABELS[saveState]}
            </button>
          </div>
        </div>

        {item.cast.length > 0 && (
          <>
            <h2>Cast</h2>
            <div className="cast">
              {item.cast.map((c, i) => (
                <div key={`${c.name}-${i}`} className="card">
                  <strong>{c.name}</strong>
                  <div className="muted">{c.character}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}