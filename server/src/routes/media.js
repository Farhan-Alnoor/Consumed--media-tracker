import { Router } from "express";
import * as tmdb from "../services/tmdb.js";
import * as anilist from "../services/anilist.js";
import * as igdb from "../services/igdb.js";

const router = Router();

const PROVIDERS = {
  movie: (id) => tmdb.getDetails("movie", id),
  tv: (id) => tmdb.getDetails("tv", id),
  anime: (id) => anilist.getDetails(id),
  game: (id) => igdb.getDetails(id),
};

router.get("/:type/:id", async (req, res) => {
  const { type, id } = req.params;

  const getDetails = Object.hasOwn(PROVIDERS, type) ? PROVIDERS[type] : null;
  if (!getDetails) {
    return res.status(400).json({ message: "Unsupported media type" });
  }
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  try {
    const item = await getDetails(id);
    res.json({ item });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ message: "Title not found" });
    }
    console.error(err);
    res.status(502).json({ message: "Failed to fetch from external provider" });
  }
});

export default router;