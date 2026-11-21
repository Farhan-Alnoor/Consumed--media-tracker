import { Router } from "express";
import { protect, optionalAuth } from "../middleware/auth.js";
import { searchUsers, getProfile, getProfileEntries, updateMe } from "../controllers/userController.js";

const router = Router();

router.get("/search", searchUsers);
router.patch("/me", protect, updateMe);
router.get("/:username", optionalAuth, getProfile);
router.get("/:username/entries", optionalAuth, getProfileEntries);

export default router;