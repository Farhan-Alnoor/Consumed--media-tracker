import { useState, useRef , useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import useMediaTheme from "../hooks/useMediaTheme";
import MediaCard from "../components/MediaCard";
import AddToListModal from "../components/AddToListModal";

const TYPES = ["movie", "tv", "game", "anime"];
const SUPPORTED = ["movie", "tv","anime","game"]; // backend providers that exist so far

const keyOf = (r) => `${r.source}:${r.externalId}`;

export default function Search() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState("movie");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [saved, setSaved] = useState({});
  const [modalItem, setModalItem] = useState(null);
  const requestId = useRef(0);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(false);
const [loadingMore, setLoadingMore] = useState(false);
const lastSearch = useRef({ q: "", t: "" }); // the search that produced the current results
const resultsRef = useRef([]);
resultsRef.current = results;
const sentinelRef = useRef(null);
  useMediaTheme(type)
async function runSearch(q, t, pageNum = 1) {
  const id = ++requestId.current;
  const append = pageNum > 1;

  if (append) {
    setLoadingMore(true);
  } else {
    setLoading(true);
    setHasMore(false);
  }
  setError("");

  try {
    const data = await api(
      `/api/search?q=${encodeURIComponent(q.trim())}&type=${t}&page=${pageNum}`
    );
    if (id !== requestId.current) return;

    lastSearch.current = { q, t };

    const prev = append ? resultsRef.current : [];
    const seen = new Set(prev.map(keyOf));
    const fresh = data.results.filter((r) => !seen.has(keyOf(r)));

    setResults(append ? [...prev, ...fresh] : data.results);
    setPage(pageNum);
    setHasMore(data.hasMore && (!append || fresh.length > 0));
    setSearched(true);
  } catch (err) {
    if (id !== requestId.current) return;
    if (!append) setResults([]);
    setError(err.message);
  } finally {
    if (id === requestId.current) {
      setLoading(false);
      setLoadingMore(false);
    }
  }
}

function loadMore() {
  runSearch(lastSearch.current.q, lastSearch.current.t, page + 1);
}

useEffect(() => {
  const el = sentinelRef.current;
  if (!el || !hasMore || loading || loadingMore || error) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadMore();
    },
    { rootMargin: "400px" } // start loading before the user actually hits the bottom
  );
  observer.observe(el);
  return () => observer.disconnect();
}, [hasMore, loading, loadingMore, error, page]);


  function onSubmit(e){
   
    e.preventDefault();
    if (!query.trim()|| !SUPPORTED.includes(type)) return;
    runSearch(query,type);
  }


   function selectType(t) {
  requestId.current++; // cancel any in-flight search
  setType(t);
  setResults([]);
  setSearched(false);
  setError("");
  setLoading(false);
  setLoadingMore(false);
  setHasMore(false);
  setPage(1);
  if (query.trim() && SUPPORTED.includes(t)) runSearch(query, t);
}

function addToList(item) {
  if (!user) {
    navigate("/login", { state: { from: "/search" } });
    return;
  }
  setModalItem(item);
}


    return(
        <div className="page">
            <h1>Search</h1>
            <div className="row">
                {TYPES.map((t)=>(
                    <button key={t}className={t=== type? "":"ghost"} onClick={()=>selectType(t)}>
                        {t}
                    </button>
                ))}
            </div>
            <form className="search-bar" onSubmit={onSubmit}>
                <input
                value={query}
                onChange={(e)=> setQuery(e.target.value)}
                placeholder={`Search ${type}...`}
                />
                <button type= "submit" disabled = {loading || !SUPPORTED.includes(type)}>
                    Search
                </button>
            </form>
            {!SUPPORTED.includes(type) && <p className="muted">Search for {type} is coming soon.</p>}
      {loading && <p className="muted">Searching...</p>}
      {error && <p className="error">{error}</p>}
      {searched && !loading && !error && results.length === 0 && (
        <p className="muted">No results found.</p>
      )}

      <div className="grid">
        {results.map((item) => {
          const key = `${item.source}:${item.externalId}`;
          return (
            <MediaCard key={key} item={item} state={saved[key] || "idle"} onAdd={addToList} />
          );
        })}
      </div>
     {hasMore && (
  <>
    <div ref={sentinelRef} className="sentinel" />
    {loadingMore && <p className="muted load-more">Loading more...</p>}
  </>
)}

{error && hasMore && results.length > 0 && (
  <div className="load-more">
    <p className="error">Couldn't load more results.</p>
    <button className="ghost" onClick={loadMore}>Try again</button>
  </div>
)}
      {modalItem && (
  <AddToListModal
    item={modalItem}
    onClose={() => setModalItem(null)}
    onDone={(state) => {
      setSaved((s) => ({ ...s, [`${modalItem.source}:${modalItem.externalId}`]: state }));
      setModalItem(null);
    }}
  />
)}
    </div>
    )

}