import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import NumberInput from "./NumberInput";

const STATUSES = [
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
];

const PROGRESS = {
  tv: { label: "Episodes watched", step: 1 },
  anime: { label: "Episodes watched", step: 1 },
  game: { label: "Hours played", step: 0.5 },
};

// Add mode: pass `item` + `onDone`. Edit mode: pass `entry` + `onUpdated` + `onDeleted`.
export default function AddToListModal({ item: itemProp, entry, onClose, onDone, onUpdated, onDeleted }) {
  const isEdit = Boolean(entry);
  const item = entry ? entry.item : itemProp;

  const dialogRef = useRef(null);
  const [status, setStatus] = useState(entry?.status ?? "planned");
  const [rating, setRating] = useState(entry?.rating != null ? String(entry.rating) : "");
  const [progress, setProgress] = useState(entry ? String(entry.progress ?? 0) : "");
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const progressConfig = PROGRESS[item.type];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();

    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isEdit) {
        const changes = {
          status,
          rating: rating === "" ? null : Number(rating),
          notes: notes.trim(),
        };
        if (progressConfig) changes.progress = progress === "" ? 0 : Number(progress);

        const data = await api(`/api/entries/${entry._id}`, { method: "PATCH", body: changes });
        onUpdated(data.entry);
      } else {
        const body = { item, status };
        if (notes.trim()) body.notes = notes.trim();
        if (rating !== "") body.rating = Number(rating);
        if (progressConfig && progress !== "") body.progress = Number(progress);

        await api("/api/entries", { method: "POST", body });
        onDone("added");
      }
    } catch (err) {
      if (!isEdit && err.status === 409) {
        onDone("exists");
      } else {
        setError(err.message);
        setSubmitting(false);
      }
    }
  }

  async function handleDelete() {
    if (!window.confirm("Remove this from your list?")) return;
    setError("");
    setSubmitting(true);
    try {
      await api(`/api/entries/${entry._id}`, { method: "DELETE" });
      onDeleted(entry._id);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current.close();
      }}
    >
      <form className="modal-body" onSubmit={handleSubmit}>
        <div>
          <h2>{isEdit ? "Edit entry" : "Add to your list"}</h2>
          <span className="muted">{item.title}</span>
        </div>

        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>

        <div className="field">
          <label htmlFor="rating">Rating (0-10, optional)</label>
          <NumberInput id="rating" value={rating} onChange={setRating} min={0} max={10} step={0.5} />
        </div>

        {progressConfig && (
          <div className="field">
            <label htmlFor="progress">{progressConfig.label} (optional)</label>
            <NumberInput
              id="progress"
              value={progress}
              onChange={setProgress}
              min={0}
              max={item.totalUnits ?? undefined}
              step={progressConfig.step}
            />
          </div>
        )}

        <label>
          Notes (optional)
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="row modal-actions">
          {isEdit && (
            <button type="button" className="ghost danger" disabled={submitting} onClick={handleDelete}>
              Remove
            </button>
          )}
          <button type="button" className="ghost" onClick={() => dialogRef.current.close()}>
            Cancel
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Add to list"}
          </button>
        </div>
      </form>
    </dialog>
  );
}