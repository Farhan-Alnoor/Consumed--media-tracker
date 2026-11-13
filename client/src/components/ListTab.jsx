import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useMediaTheme from "../hooks/useMediaTheme";
import AddToListModal from "./AddToListModal";
import { TYPES, TYPE_LABELS, TYPE_NAME, STATUS_KEYS, STATUS_LABELS } from "../utils/media";

export default function ListTab({ entries, setEntries }) {
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState(null);

  useMediaTheme(type === "all" ? null : type);

  const visible = useMemo(
    () =>
      entries.filter(
        (e) =>
          e.item &&
          (type === "all" || e.item.type === type) &&
          (status === "all" || e.status === status)
      ),
    [entries, type, status]
  );

  function handleUpdated(updated) {
    setEntries((list) => list.map((e) => (e._id === updated._id ? updated : e)));
    setEditing(null);
  }

  function handleDeleted(id) {
    setEntries((list) => list.filter((e) => e._id !== id));
    setEditing(null);
  }

  if (entries.length === 0) {
    return (
      <p className="muted">
        Your list is empty. <Link to="/search">Find something to add.</Link>
      </p>
    );
  }

  return (
    <div>
      <div className="row">
        {["all", ...TYPES].map((t) => (
          <button key={t} className={t === type ? "" : "ghost"} onClick={() => setType(t)}>
            {t === "all" ? "All" : TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="search-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUS_KEYS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <span className="muted" style={{ alignSelf: "center" }}>
          Showing {visible.length} of {entries.length}
        </span>
      </div>

      {visible.length === 0 ? (
        <p className="muted">No titles match these filters.</p>
      ) : (
        <div className="table-wrap">
          <table className="list-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Score</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((entry) => {
                const { item } = entry;
                return (
                  <tr key={entry._id}>
                    <td>
                      <div className="title-cell">
                        <button
                          type="button"
                          className="poster-btn"
                          title="Edit entry"
                          aria-label={`Edit ${item.title}`}
                          onClick={() => setEditing(entry)}
                        >
                          {item.posterUrl ? (
                            <img src={item.posterUrl} alt="" loading="lazy" />
                          ) : (
                            <span className="poster-placeholder">?</span>
                          )}
                        </button>
                        <Link to={`/media/${item.type}/${item.externalId}`}>{item.title}</Link>
                      </div>
                    </td>
                    <td>
                      <span className={`status status-${entry.status}`}>{STATUS_LABELS[entry.status]}</span>
                    </td>
                    <td>{entry.rating ?? "—"}</td>
                    <td>
                      <span className="chip" data-media={item.type}>{TYPE_NAME[item.type]}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <AddToListModal
          entry={editing}
          onClose={() => setEditing(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}