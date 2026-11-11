const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

async function tmdbFetch(path,params ={}){
    const url = new URL (`${BASE_URL}${path}`);
    url.searchParams.set("api_key",process.env.TMDB_API_KEY);
    for (const [key,value] of Object.entries(params)){
        url.searchParams.set(key,value);
    }

    const res = await fetch(url);
    if (!res.ok){
        const error = new Error(`TMDB request failed with status ${res.status}`);
        error.status = res.status;
        throw error;   
     }
    return res.json()
}


function normalize(result,type){
    return{
        type,
        source : "tmdb",
        externalId: String(result.id),
        title : result.title || result.name,
        posterUrl : result.poster_path ? `${IMAGE_BASE}${result.poster_path}`:null,
        overview: result.overview || "",
        releaseDate: result.release_date|| result.first_air_date || null,

    };
}

export async function searchMovies(query) {
    const data = await tmdbFetch("/search/movie",{query})
    return data.results.map((r)=> normalize(r,"movie"))
}


export async function searchTV(query){
    const data = await tmdbFetch("/search/tv",{query})
    return data.results.map((r)=> normalize(r,"tv"))
}


function normalizeDetails(data, type) {
  const isMovie = type === "movie";
  const runtime = isMovie ? data.runtime : data.episode_run_time?.[0];

  return {
    ...normalize(data, type),
    tagline: data.tagline || "",
    genres: (data.genres || []).map((g) => g.name),
    status: data.status || null,
    runtime: runtime || null,
    seasons: isMovie ? null : data.number_of_seasons ?? null,
    episodes: isMovie ? null : data.number_of_episodes ?? null,
    rating: data.vote_average ? Math.round(data.vote_average * 10) / 10 : null,
    backdropUrl: data.backdrop_path ? `${BACKDROP_BASE}${data.backdrop_path}` : null,
    creators: isMovie
      ? (data.credits?.crew || []).filter((c) => c.job === "Director").map((c) => c.name)
      : (data.created_by || []).map((c) => c.name),
    cast: (data.credits?.cast || []).slice(0, 12).map((c) => ({
      name: c.name,
      character: c.character,
    })),
  };
}

export async function getDetails(type, id) {
  const data = await tmdbFetch(`/${type}/${id}`, { append_to_response: "credits" });
  return normalizeDetails(data, type);
}