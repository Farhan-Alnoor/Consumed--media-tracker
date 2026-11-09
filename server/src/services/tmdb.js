const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";


async function tmdbFetch(path,params ={}){
    const url = new URL (`${BASE_URL}${path}`);
    url.searchParams.set("api_key",process.env.TMDB_API_KEY);
    for (const [key,value] of Object.entries(params)){
        url.searchParams.set(key,value);
    }

    const res = await fetch(url);
    if (!res.ok){
        throw new Error(`TMDB request failed with status ${res.status}`);
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