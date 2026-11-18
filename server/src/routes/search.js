import { Router } from "express";
import * as tmdb from "../services/tmdb.js";
import * as anilist from "../services/anilist.js";
import * as igdb from "../services/igdb.js";

const router = Router();
const MAX_PAGE = 50;
const PROVIDERS = {
  movie: tmdb.searchMovies,
  tv: tmdb.searchTV,
  anime: anilist.searchAnime,
  game: igdb.searchGames,
};

router.get("/", async (req, res) => {
  const { q, type } = req.query;

  if (!q || !q.trim()) {
    return res.status(400).json({ message: "Query parameter 'q' is required" });
  }
  const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), MAX_PAGE);

  const search = Object.hasOwn(PROVIDERS, type) ? PROVIDERS[type] : null;

  if (!search) {
    return res.status(400).json({ message: "Unsupported type" });
  }

 try {
  const { results, hasMore } = await search(q.trim(), page);
  res.json({ results, page, hasMore : hasMore && page < MAX_PAGE });
} catch (err) {
  console.error(err);
  res.status(502).json({ message: "Failed to fetch from external provider" });
}
});

export default router;