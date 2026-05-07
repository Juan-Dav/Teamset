import { Router } from "express";
import { getAttendanceByTraining, setAttendanceStatus, getAttendanceStreak } from "./attendance.controller";

const router = Router();

router.get("/training/:trainingId", getAttendanceByTraining);
router.post("/set", setAttendanceStatus);
router.get("/streak/:playerId", getAttendanceStreak);

export default router;
