import { Router } from "express";
import { getPerformance, getPerformanceByTeam, createPerformance, updatePerformance, getTeamStatsPerformance } from "./performance.controller";

const router = Router();

router.get("/", getPerformance);
router.get("/team-stats", getTeamStatsPerformance);
router.get("/team/:teamId", getPerformanceByTeam);
router.post("/", createPerformance);
router.put("/:id", updatePerformance);

export default router;
