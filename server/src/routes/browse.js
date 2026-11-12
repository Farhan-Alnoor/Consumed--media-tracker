import { Router } from "express";
import * as tmdb from "../services/tmdb.js";
import * as anilist from "../services/anilist.js";
import * as igdb from "../services/igdb.js";
import { cached } from "../utils/cache.js";

const router = Router();
const THIRTY_MINUTES = 30 * 60 * 1000;

const PROVIDERS = {
  movie: tmdb.trendingMovies,
  tv: tmdb.trendingTV,
  anime: anilist.trendingAnime,
  game: igdb.popularGames,
};

router.get("/:type", async (req, res) => {
  const { type } = req.params;

  if (!Object.hasOwn(PROVIDERS, type)) {
    return res.status(400).json({ message: "Unsupported media type" });
  }

  try {
    const results = await cached(`browse:${type}`, THIRTY_MINUTES, PROVIDERS[type]);
    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(502).json({ message: "Failed to fetch from external provider" });
  }
});

export default router;