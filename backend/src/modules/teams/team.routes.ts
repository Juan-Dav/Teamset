import { Router } from "express";
import { getTeams, getTeamById, createTeam, updateTeam, deleteTeam, getTeamPlayers } from "./team.controller";

const router = Router();

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Obtener todos los equipos
 */
router.get("/", getTeams);
router.get("/:id", getTeamById);
router.get("/:id/players", getTeamPlayers);
router.post("/", createTeam);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);

export default router;
