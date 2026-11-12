import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function MediaRow({ type, title, onActivate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canScroll, setCanScroll] = useState({ left: false, right: false });
  const trackRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    api(`/api/browse/${type}`)
      .then((data) => { if (!cancelled) setItems(data.results); })
      .catch(() => { if (!cancelled) setError("Couldn't load this right now."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [type]);

  // Work out which arrows should be visible
  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const left = el.scrollLeft > 4;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    setCanScroll((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [items, loading, updateArrows]);

  function scroll(direction) {
    const el = trackRef.current;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section
      className="media-row"
      data-media={type}
      onMouseEnter={() => onActivate?.(type)}
      onFocus={() => onActivate?.(type)}
    >
      <h2 className="row-title">{title}</h2>
      {error && <p className="muted">{error}</p>}

      <div className="carousel-wrap">
        {canScroll.left && (
          <button className="arrow arrow-left" onClick={() => scroll(-1)} aria-label="Scroll left">
            ‹
          </button>
        )}

        <div className="carousel" ref={trackRef} onScroll={updateArrows}>
          {loading
            ? Array.from({ length: 8 }, (_, i) => <div key={i} className="poster-skeleton" />)
            : items.map((item) => (
                <Link
                  key={`${item.source}:${item.externalId}`}
                  to={`/media/${item.type}/${item.externalId}`}
                  className="poster-card"
                >
                  {item.posterUrl ? (
                    <img src={item.posterUrl} alt={item.title} loading="lazy" />
                  ) : (
                    <div className="poster-placeholder">No image</div>
                  )}
                  <span className="poster-title">{item.title}</span>
                </Link>
              ))}
        </div>

        {canScroll.right && (
          <button className="arrow arrow-right" onClick={() => scroll(1)} aria-label="Scroll right">
            ›
          </button>
        )}
      </div>
    </section>
  );
}