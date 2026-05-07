import { Router } from "express";
import { getPlayers, getPlayerById, getPlayerByUserId, createPlayer, updatePlayerStats, updateAttendanceStreak, deletePlayer } from "./player.controller";

const router = Router();

router.get("/", getPlayers);
router.get("/user/:userId", getPlayerByUserId);
router.get("/:id", getPlayerById);
router.post("/", createPlayer);
router.put("/:id/stats", updatePlayerStats);
router.put("/:id/streak", updateAttendanceStreak);
router.delete("/:id", deletePlayer);

export default router;
