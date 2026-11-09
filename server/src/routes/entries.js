import {Router} from "express";
import {protect} from "../middleware/auth.js";
import { addEntry, listEntries, updateEntry, deleteEntry } from "../controllers/entryController.js";

const router = Router();

router.use(protect);

router.post("/",addEntry);

router.get("/",listEntries);
router.patch("/:id",updateEntry);
router.delete("/:id", deleteEntry);



export default router;