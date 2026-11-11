import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import useMediaTheme from "../hooks/useMediaTheme";
import MediaCard from "../components/MediaCard";

const TYPES = ["movie", "tv", "game", "anime"];
const SUPPORTED = ["movie", "tv"]; // backend providers that exist so far



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

  const requestId = useRef(0);

  useMediaTheme(type)

  async function runSearch(q, t) {
    const id = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const data = await api(`/api/search?q=${encodeURIComponent(q.trim())}&type=${t}`);
      if (id !== requestId.current) return;
      setResults(data.results);
      setSearched(true);
    } catch (err) {
      if (id !== requestId.current) return;
      setResults([]);
      setError(err.message);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }
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
    if (query.trim() && SUPPORTED.includes(t)) runSearch(query, t);
  }


async function addToList(item){
    if (!user){
        navigate("/login",{state :{from:"/search"}});
        return;
    }

    const key = `${item.source}:${item.externalId}`;
    setSaved((s)=>({...s,[key]:"adding"}));
    try{
        await api("/api/entries",{method:"POST",body:{item,status:"planned"}});
        setSaved((s) => ({ ...s, [key]: "added" }));

    }
    catch (err){
        setSaved((s)=>({...s,[key]: err.status === 409?"exists": "error"}));

    }
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
                placeholder={`Search${type}...`}
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
    </div>
    )

}