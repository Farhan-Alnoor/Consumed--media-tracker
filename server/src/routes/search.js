import { Router } from "express";
import * as tmdb from "../services/tmdb.js";
import * as anilist from "../services/anilist.js";
import * as igdb from "../services/igdb.js";

const router = Router();

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

  const search = PROVIDERS[type];
  if (!search) {
    return res.status(400).json({ message: "Unsupported type" });
  }

  try {
    const results = await search(q.trim());
    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(502).json({ message: "Failed to fetch from external provider" });
  }
});

export default router;