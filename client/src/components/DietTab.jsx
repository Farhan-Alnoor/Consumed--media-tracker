import { useMemo } from "react";
import { Link } from "react-router-dom";
import { TYPES, TYPE_LABELS } from "../utils/media";
import { computeStats } from "../utils/stats";

export default function DietTab({ entries }) {
  const stats = useMemo(() => computeStats(entries), [entries]);
  const { total, byType } = stats;

  if (total === 0) {
    return (
      <p className="muted">
        Nothing to analyze yet. <Link to="/search">Add a few titles</Link> and your stats will show up here.
      </p>
    );
  }

  const present = TYPES.filter((t) => byType[t].count > 0);
  const top = stats.mostTracked;
  const share = Math.round((byType[top].count / total) * 100);
  const maxBar = Math.max(...stats.distribution, 1);

  const highlights = [
    {
      label: "Most tracked",
      type: stats.mostTracked,
      detail: stats.mostTracked && `${byType[stats.mostTracked].count} titles`,
    },
    {
      label: "Highest rated",
      type: stats.highestRated,
      detail: stats.highestRated && `${byType[stats.highestRated].avg.toFixed(1)} average score`,
      empty: "Rate 2+ titles in a type",
    },
    {
      label: "Most completed",
      type: stats.mostCompleted,
      detail: stats.mostCompleted && `${byType[stats.mostCompleted].completed} finished`,
      empty: "Nothing finished yet",
    },
  ];

  return (
    <div>
      <h2 className="diet-headline">
        {share >= 40 ? (
          <>
            Your diet is mostly <span data-media={top}>{TYPE_LABELS[top]}</span> ({share}% of your list)
          </>
        ) : (
          "A balanced diet: no single type dominates your list"
        )}
      </h2>

      <div className="stat-grid">
        <div className="stat"><div className="stat-value">{total}</div><div className="stat-label">Titles tracked</div></div>
        <div className="stat"><div className="stat-value">{stats.completed}</div><div className="stat-label">Completed</div></div>
        <div className="stat">
          <div className="stat-value">{stats.avgRating != null ? stats.avgRating.toFixed(1) : "—"}</div>
          <div className="stat-label">Average score ({stats.ratingCount} rated)</div>
        </div>
        <div className="stat"><div className="stat-value">{stats.episodes}</div><div className="stat-label">Episodes watched</div></div>
        <div className="stat"><div className="stat-value">{Number(stats.hours.toFixed(1))}</div><div className="stat-label">Hours played</div></div>
      </div>

      <section className="diet-section">
        <h3>Your plate</h3>
        <div className="mix-bar">
          {present.map((t) => (
            <div key={t} className="mix-seg" data-media={t} style={{ flexGrow: byType[t].count }} />
          ))}
        </div>
        <ul className="mix-legend">
          {present.map((t) => (
            <li key={t} data-media={t}>
              {TYPE_LABELS[t]}: {byType[t].count} ({Math.round((byType[t].count / total) * 100)}%)
            </li>
          ))}
        </ul>
      </section>

      <section className="diet-section">
        <h3>Your favorites</h3>
        <div className="stat-grid">
          {highlights.map((h) => (
            <div key={h.label} className="stat" data-media={h.type || undefined}>
              <div className="stat-label">{h.label}</div>
              <div className="stat-value">{h.type ? TYPE_LABELS[h.type] : "—"}</div>
              <div className="stat-label">{h.type ? h.detail : h.empty}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="diet-section">
        <h3>By media type</h3>
        <div className="stat-grid">
          {present.map((t) => {
            const b = byType[t];
            return (
              <div key={t} className="type-card" data-media={t}>
                <h4>{TYPE_LABELS[t]}</h4>
                <div className="kv"><span>Tracked</span><strong>{b.count}</strong></div>
                <div className="kv"><span>Completed</span><strong>{b.completed}</strong></div>
                <div className="kv"><span>In progress</span><strong>{b.in_progress}</strong></div>
                <div className="kv"><span>Planned</span><strong>{b.planned}</strong></div>
                <div className="kv"><span>Dropped</span><strong>{b.dropped}</strong></div>
                <div className="kv"><span>Average score</span><strong>{b.avg != null ? b.avg.toFixed(1) : "—"}</strong></div>
                <div className="progress" title="Share completed">
                  <div style={{ width: `${Math.round((b.completed / b.count) * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {stats.ratingCount > 0 && (
        <section className="diet-section">
          <h3>How you score things</h3>
          <div className="dist">
            {stats.distribution.map((count, i) => (
              <div key={i} className="dist-col">
                <span className="dist-label">{count || ""}</span>
                <div className="dist-bar-wrap">
                  <div className="dist-bar" style={{ height: `${(count / maxBar) * 100}%` }} />
                </div>
                <span className="dist-label">{i + 1}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}