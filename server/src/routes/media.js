import { Router } from "express";
import { getDetails } from "../services/tmdb.js";

const router = Router();
const SUPPORTED = ["movie", "tv"];

router.get("/:type/:id", async (req, res) => {
  const { type, id } = req.params;

  if (!SUPPORTED.includes(type)) {
    return res.status(400).json({ message: "Unsupported media type" });
  }
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  try {
    const item = await getDetails(type, id);
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