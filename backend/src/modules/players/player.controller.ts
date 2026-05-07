import { Request, Response } from "express";
import { pool } from "../../config/db";

/**
 * @swagger
 * /api/players:
 *   get:
 *     summary: Obtener todos los jugadores
 *     tags: [Players]
 *     responses:
 *       200:
 *         description: Lista de jugadores
 */
export const getPlayers = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, u.name, u.email, u.phone, t.name as team_name
      FROM players p 
      JOIN users u ON p.user_id = u.id 
      LEFT JOIN teams t ON p.team_id = t.id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     summary: Obtener jugador por ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jugador encontrado
 *       404:
 *         description: Jugador no encontrado
 */
export const getPlayerById = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT p.*, u.name, u.email, u.phone, t.name as team_name
      FROM players p 
      JOIN users u ON p.user_id = u.id 
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Jugador no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/players/user/{userId}:
 *   get:
 *     summary: Obtener jugador por ID de usuario
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jugador encontrado
 *       404:
 *         description: Jugador no encontrado
 */
export const getPlayerByUserId = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT p.*, u.name, u.email, u.phone, t.name as team_name
      FROM players p 
      JOIN users u ON p.user_id = u.id 
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.user_id = ?
    `, [req.params.userId]);
    if (rows.length === 0) return res.status(404).json({ message: "Jugador no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/players:
 *   post:
 *     summary: Crear o actualizar perfil de jugador
 *     tags: [Players]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - team_id
 *               - position
 *               - jersey_number
 *             properties:
 *               user_id:
 *                 type: integer
 *               team_id:
 *                 type: integer
 *               position:
 *                 type: string
 *               jersey_number:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Jugador creado/actualizado
 */
export const createPlayer = async (req: Request, res: Response) => {
  try {
    const { user_id, team_id, position, jersey_number } = req.body;
    await pool.query(
      `INSERT INTO players (user_id, team_id, position, jersey_number)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE team_id = VALUES(team_id), position = VALUES(position), jersey_number = VALUES(jersey_number)`,
      [user_id, team_id, position, jersey_number]
    );
    const [rows]: any = await pool.query("SELECT id FROM players WHERE user_id = ?", [user_id]);
    const playerId = rows[0]?.id;
    res.status(201).json({ id: playerId, user_id, team_id, position, jersey_number });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/players/{id}/stats:
 *   put:
 *     summary: Actualizar estadísticas de jugador
 *     tags: [Players]
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
 *               attacks:
 *                 type: integer
 *               blocks:
 *                 type: integer
 *               serves:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Estadísticas actualizadas
 */
export const updatePlayerStats = async (req: Request, res: Response) => {
  try {
    const { attacks, blocks, serves } = req.body;
    await pool.query(
      "UPDATE players SET attacks = ?, blocks = ?, serves = ? WHERE id = ?",
      [attacks, blocks, serves, req.params.id]
    );
    res.json({ message: "Estadísticas actualizadas" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/players/{id}/streak:
 *   put:
 *     summary: Actualizar racha de asistencia
 *     tags: [Players]
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
 *               streak:
 *                 type: integer
 *               last_attendance_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Racha actualizada
 */
export const updateAttendanceStreak = async (req: Request, res: Response) => {
  try {
    const { streak, last_attendance_date } = req.body;
    await pool.query("UPDATE players SET attendance_streak = ?, last_attendance_date = ? WHERE id = ?", 
      [streak, last_attendance_date, req.params.id]);
    res.json({ message: "Racha actualizada" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/players/{id}:
 *   delete:
 *     summary: Eliminar jugador
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jugador eliminado
 */
export const deletePlayer = async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM players WHERE id = ?", [req.params.id]);
    res.json({ message: "Jugador eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};
