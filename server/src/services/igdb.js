const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const API_URL = "https://api.igdb.com/v4";

let cachedToken = null; // { value, expiresAt }

// IGDB uses Twitch's client-credentials OAuth. Tokens last weeks, so we cache one in memory.
async function getToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
    throw new Error("TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set");
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    const error = new Error(`Twitch token request failed with status ${res.status}`);
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // refresh a minute early
  };
  return cachedToken.value;
}

async function igdbFetch(endpoint, body, retry = true) {
  const token = await getToken();

  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body, // IGDB takes a plain-text query language, not JSON
  });

  // Token rejected: drop the cache and try once more with a fresh one
  if (res.status === 401 && retry) {
    cachedToken = null;
    return igdbFetch(endpoint, body, false);
  }

  if (!res.ok) {
    const error = new Error(`IGDB request failed with status ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

// The search term goes inside double quotes in IGDB's query language, so escape it
function escapeQuery(text) {
  return text.replace(/[\r\n]+/g, " ").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function imageUrl(imageId, size) {
  return imageId ? `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg` : null;
}

function normalize(game) {
  return {
    type: "game",
    source: "igdb",
    externalId: String(game.id),
    title: game.name,
    posterUrl: imageUrl(game.cover?.image_id, "cover_big"),
    overview: game.summary || "",
    releaseDate: game.first_release_date
      ? new Date(game.first_release_date * 1000).toISOString().slice(0, 10)
      : null,
  };
}

export async function searchGames(query) {
  const games = await igdbFetch(
    "games",
    `search "${escapeQuery(query)}";
     fields name, cover.image_id, summary, first_release_date;
     where version_parent = null;
     limit 20;`
  );
  return games.map(normalize);
}

export async function getDetails(id) {
  const games = await igdbFetch(
    "games",
    `fields name, summary, cover.image_id, screenshots.image_id, first_release_date,
            genres.name, platforms.name, total_rating,
            involved_companies.developer, involved_companies.company.name;
     where id = ${Number(id)};`
  );

  if (games.length === 0) {
    const error = new Error("Game not found");
    error.status = 404;
    throw error;
  }

  const g = games[0];
  return {
    ...normalize(g),
    tagline: "",
    genres: (g.genres || []).map((x) => x.name),
    platforms: (g.platforms || []).map((x) => x.name),
    status: null,
    runtime: null,
    seasons: null,
    episodes: null,
    rating: g.total_rating ? Math.round(g.total_rating) / 10 : null, // 0-100 -> 0-10
    backdropUrl: imageUrl(g.screenshots?.[0]?.image_id, "1080p"),
    creators: (g.involved_companies || [])
      .filter((c) => c.developer)
      .map((c) => c.company.name),
    cast: [],
  };
}