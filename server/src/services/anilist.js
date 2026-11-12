const API_URL  = "https://graphql.anilist.co";

const SEARCH_QUERY = `
query ($search: String) {
  Page(perPage: 20) {
    media(search: $search, type: ANIME, isAdult: false, sort: SEARCH_MATCH) {
      id
      title { romaji english }
      coverImage { large }
      description(asHtml: false)
      startDate { year month day }
    }
  }
}`;

const DETAILS_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english }
    coverImage { extraLarge }
    bannerImage
    description(asHtml: false)
    startDate { year month day }
    genres
    episodes
    duration
    status
    averageScore
    studios(isMain: true) { nodes { name } }
    characters(sort: [ROLE, RELEVANCE], perPage: 12) {
      edges {
        role
        node { name { full } }
        voiceActors(language: JAPANESE) { name { full } }
      }
    }
  }
}`;

const STATUS_LABELS = {
  FINISHED: "Finished",
  RELEASING: "Airing",
  NOT_YET_RELEASED: "Not yet released",
  CANCELLED: "Cancelled",
  HIATUS: "On hiatus",
};

async function anilistFetch(query, variables) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.errors) {
    const error = new Error(json.errors?.[0]?.message || `AniList request failed with status ${res.status}`);
    error.status = json.errors?.[0]?.status || res.status;
    throw error;
  }
  return json.data;
}

// AniList descriptions contain stray HTML like <br> and <i>
function cleanDescription(text) {
  return (text || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
}

// AniList dates can be partial (year only), so fill in the gaps
function toDate({ year, month, day } = {}) {
  if (!year) return null;
  const mm = String(month || 1).padStart(2, "0");
  const dd = String(day || 1).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function normalize(media) {
  return {
    type: "anime",
    source: "anilist",
    externalId: String(media.id),
    title: media.title.english || media.title.romaji,
    posterUrl: media.coverImage?.extraLarge || media.coverImage?.large || null,
    overview: cleanDescription(media.description),
    releaseDate: toDate(media.startDate),
  };
}

export async function searchAnime(query) {
  const data = await anilistFetch(SEARCH_QUERY, { search: query });
  return data.Page.media.map(normalize);
}

export async function getDetails(id) {
  const data = await anilistFetch(DETAILS_QUERY, { id: Number(id) });
  const m = data.Media;

  return {
    ...normalize(m),
    tagline: "",
    genres: m.genres || [],
    status: STATUS_LABELS[m.status] || null,
    runtime: m.duration || null, // minutes per episode
    seasons: null,
    episodes: m.episodes ?? null,
    rating: m.averageScore ? Math.round(m.averageScore) / 10 : null, // 0-100 -> 0-10
    backdropUrl: m.bannerImage || null,
    creators: (m.studios?.nodes || []).map((s) => s.name),
    cast: (m.characters?.edges || []).map((e) => {
      const voice = e.voiceActors?.[0]?.name?.full;
      return {
        name: e.node.name.full,
        character: voice ? `Voiced by ${voice}` : e.role,
      };
    }),
  };
}