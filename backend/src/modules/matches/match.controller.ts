import { Request, Response } from "express";
import { pool } from "../../config/db";

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Obtener todos los partidos
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: Lista de partidos
 */
export const getMatches = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, t.name as team_name 
      FROM matches m 
      JOIN teams t ON m.team_id = t.id 
      ORDER BY m.match_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Obtener partido por ID
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Partido encontrado
 *       404:
 *         description: Partido no encontrado
 */
export const getMatchById = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query("SELECT * FROM matches WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Partido no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/matches:
 *   post:
 *     summary: Crear nuevo partido
 *     tags: [Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - team_id
 *               - opponent
 *               - match_date
 *             properties:
 *               team_id:
 *                 type: integer
 *               opponent:
 *                 type: string
 *               match_date:
 *                 type: string
 *                 format: date
 *               sets_won:
 *                 type: integer
 *               sets_lost:
 *                 type: integer
 *               points_scored:
 *                 type: integer
 *               points_conceded:
 *                 type: integer
 *               result:
 *                 type: string
 *                 enum: [win, loss, draw]
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Partido creado
 */
export const createMatch = async (req: Request, res: Response) => {
  try {
    const { team_id, opponent, match_date, sets_won, sets_lost, points_scored, points_conceded, result, location, description } = req.body;
    const [resultDb]: any = await pool.query(
      "INSERT INTO matches (team_id, opponent, match_date, sets_won, sets_lost, points_scored, points_conceded, result, location, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [team_id, opponent, match_date, sets_won, sets_lost, points_scored, points_conceded, result, location, description]
    );
    res.status(201).json({ id: resultDb.insertId, team_id, opponent, match_date, result });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/matches/{id}:
 *   put:
 *     summary: Actualizar partido
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               opponent:
 *                 type: string
 *               match_date:
 *                 type: string
 *                 format: date
 *               sets_won:
 *                 type: integer
 *               sets_lost:
 *                 type: integer
 *               points_scored:
 *                 type: integer
 *               points_conceded:
 *                 type: integer
 *               result:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Partido actualizado
 */
export const updateMatch = async (req: Request, res: Response) => {
  try {
    const { opponent, match_date, sets_won, sets_lost, points_scored, points_conceded, result, location, description } = req.body;
    await pool.query(
      "UPDATE matches SET opponent = ?, match_date = ?, sets_won = ?, sets_lost = ?, points_scored = ?, points_conceded = ?, result = ?, location = ?, description = ? WHERE id = ?",
      [opponent, match_date, sets_won, sets_lost, points_scored, points_conceded, result, location, description, req.params.id]
    );
    res.json({ message: "Partido actualizado" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/matches/{id}:
 *   delete:
 *     summary: Eliminar partido
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Partido eliminado
 */
export const deleteMatch = async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM matches WHERE id = ?", [req.params.id]);
    res.json({ message: "Partido eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/matches/{id}/players:
 *   get:
 *     summary: Obtener estadísticas de jugadores en un partido
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estadísticas de jugadores
 */
export const getMatchPlayerStats = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT mps.*, p.jersey_number, u.name as player_name
      FROM match_player_stats mps
      JOIN players p ON mps.player_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE mps.match_id = ?
    `, [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};
