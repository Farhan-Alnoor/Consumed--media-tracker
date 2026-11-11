import { useState } from "react";
import Poster from "./Poster.jsx";
import { Link } from "react-router-dom";
const STATUSES = [
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
];
const PROGRESS_LABEL = { tv: "Episodes", anime: "Episodes", game: "Hours" };
export default function EntryCard({ entry, onUpdate, onDelete }) {
  const { item } = entry;
  const [rating, setRating] = useState(entry.rating ?? "");
  const [progress, setProgress] = useState(entry.progress ?? 0);
  const href = `/media/${item.type}/${item.externalId}`;
  function commitRating() {
    const next = rating === "" ? null : Number(rating);
    if (next !== (entry.rating ?? null)) onUpdate(entry._id, { rating: next });
  }

  function commitProgress() {
    const next = progress === "" ? 0 : Number(progress);
    if (next !== entry.progress) onUpdate(entry._id, { progress: next });
  }

  const year = item.releaseDate ? item.releaseDate.slice(0, 4) : "Unknown";
  const progressLabel = PROGRESS_LABEL[item.type];

  return (
    <div className="entry">
      <Poster item = {item} href={href}></Poster>

      <div className="entry-body">
        <div>
          <h3><Link to= {href}>{item.title}</Link></h3>
          <span className="muted">{item.type} · {year}</span>
        </div>

        <div className="entry-controls">
          <label>
            Status
            <select value={entry.status} onChange={(e) => onUpdate(entry._id, { status: e.target.value })}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>

          <label>
            Rating (0-10)
            <input
              type="number" min="0" max="10" step="0.5"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              onBlur={commitRating}
            />
          </label>

          {progressLabel && (
            <label>
              {progressLabel}
              <input
                type="number" min="0"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                onBlur={commitProgress}
              />
            </label>
          )}
        </div>

        <button className="ghost" onClick={() => onDelete(entry._id)}>Remove</button>
      </div>
    </div>
  );
}