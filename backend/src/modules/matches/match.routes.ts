import { Router } from "express";
import { getMatches, getMatchById, createMatch, updateMatch, deleteMatch, getMatchPlayerStats } from "./match.controller";

const router = Router();

router.get("/", getMatches);
router.get("/:id", getMatchById);
router.get("/:id/stats", getMatchPlayerStats);
router.post("/", createMatch);
router.put("/:id", updateMatch);
router.delete("/:id", deleteMatch);

export default router;
