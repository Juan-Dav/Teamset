import { Router } from "express";
import { getTeamStatsPerformance } from "./performance.controller";

const router = Router();

router.get("/team-stats", getTeamStatsPerformance);

export default router;
