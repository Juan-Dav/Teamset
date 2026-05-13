import { Router } from "express";
import { getPlayers, getPlayerById, getPlayerByUserId, createPlayer, createPlayerWithUser, updatePlayerStats, updateAttendanceStreak, deletePlayer } from "./player.controller";

const router = Router();

router.get("/", getPlayers);
router.get("/user/:userId", getPlayerByUserId);
router.get("/:id", getPlayerById);
router.post("/", createPlayer);
router.post("/create-with-user", createPlayerWithUser);
router.put("/:id/stats", updatePlayerStats);
router.put("/:id/streak", updateAttendanceStreak);
router.delete("/:id", deletePlayer);

export default router;
