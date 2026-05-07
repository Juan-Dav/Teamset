import { Router } from "express";
import { getPerformance, getPerformanceByTeam, createPerformance, updatePerformance } from "./performance.controller";

const router = Router();

router.get("/", getPerformance);
router.get("/team/:teamId", getPerformanceByTeam);
router.post("/", createPerformance);
router.put("/:id", updatePerformance);

export default router;
