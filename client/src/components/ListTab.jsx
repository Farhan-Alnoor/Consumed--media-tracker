import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useMediaTheme from "../hooks/useMediaTheme";
import AddToListModal from "./AddToListModal";
import { TYPES, TYPE_LABELS, TYPE_NAME, STATUS_KEYS, STATUS_LABELS } from "../utils/media";






const DEFAULT_DIR = { title: "asc", status: "asc", score: "desc", type: "asc" };
const STATUS_ORDER = ["in_progress", "planned", "completed", "dropped"];

const byRecent = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt);

const COMPARATORS = {
  title: (a, b) =>
    a.item.title.localeCompare(b.item.title, undefined, { sensitivity: "base", numeric: true }),
  status: (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
  type: (a, b) => TYPE_NAME[a.item.type].localeCompare(TYPE_NAME[b.item.type]),
};

function sortEntries(list, sort) {
  const sorted = [...list]; // never sort the original array in place
  if (!sort) return sorted.sort(byRecent);

  const dir = sort.dir === "asc" ? 1 : -1;

  if (sort.key === "score") {
    return sorted.sort((a, b) => {
      if (a.rating == null && b.rating == null) return byRecent(a, b);
      if (a.rating == null) return 1; // unrated always last
      if (b.rating == null) return -1;
      return (a.rating - b.rating) * dir || byRecent(a, b);
    });
  }

  const compare = COMPARATORS[sort.key];
  return sorted.sort((a, b) => compare(a, b) * dir || byRecent(a, b));
}

function SortHeader({ label, sortKey, sort, onSort }) {
  const active = sort?.key === sortKey;
  const ariaSort = active ? (sort.dir === "asc" ? "ascending" : "descending") : "none";

  return (
    <th aria-sort={ariaSort}>
      <button type="button" className="th-btn" onClick={() => onSort(sortKey)}>
        {label}
        <span className="sort-arrow">{active ? (sort.dir === "asc" ? "▲" : "▼") : ""}</span>
      </button>
    </th>
  );
}






export default function ListTab({ entries, setEntries ,readOnly = false}) {
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState(null);
  const [sort, setSort] = useState(null); // null = most recently updated first

function toggleSort(key) {
  setSort((s) => {
    if (!s || s.key !== key) return { key, dir: DEFAULT_DIR[key] };
    if (s.dir === DEFAULT_DIR[key]) return { key, dir: s.dir === "asc" ? "desc" : "asc" };
    return null; // third click: back to the default order
  });
}


  useMediaTheme(type === "all" ? null : type);

  const visible = useMemo(
  () =>
    sortEntries(
      entries.filter(
        (e) =>
          e.item &&
          (type === "all" || e.item.type === type) &&
          (status === "all" || e.status === status)
      ),
      sort
    ),
  [entries, type, status, sort]
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
  return readOnly ? (
    <p className="muted">Nothing here yet.</p>
  ) : (
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
  Showing {visible.length} of {entries.length} ·{" "}
  {sort
    ? `sorted by ${sort.key}, ${sort.dir === "asc" ? "ascending" : "descending"}`
    : "most recently updated first"}
</span>
      </div>

      {visible.length === 0 ? (
        <p className="muted">No titles match these filters.</p>
      ) : (
        <div className="table-wrap">
          <table className="list-table">
            <thead>
  <tr>
    <SortHeader label="Title" sortKey="title" sort={sort} onSort={toggleSort} />
    <SortHeader label="Status" sortKey="status" sort={sort} onSort={toggleSort} />
    <SortHeader label="Score" sortKey="score" sort={sort} onSort={toggleSort} />
    <SortHeader label="Type" sortKey="type" sort={sort} onSort={toggleSort} />
  </tr>
</thead>
            <tbody>
              {visible.map((entry) => {
                const { item } = entry;
                const poster = item.posterUrl ? (
  <img src={item.posterUrl} alt="" loading="lazy" />
) : (
  <span className="poster-placeholder">?</span>
);
                return (
                  <tr key={entry._id}>
                    <td>
                      <div className="title-cell">
                        {readOnly ? (
  <span className="poster-btn static">{poster}</span>
) : (
  <button
    type="button"
    className="poster-btn"
    title="Edit entry"
    aria-label={`Edit ${item.title}`}
    onClick={() => setEditing(entry)}
  >
    {poster}
  </button>
)}
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

      {editing && !readOnly && (
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