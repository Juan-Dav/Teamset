import { Request, Response } from "express";
import { pool } from "../../config/db";

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Obtener todos los equipos
 *     tags: [Equipos]
 *     responses:
 *       200:
 *         description: Lista de equipos
 */
export const getTeams = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM equipos ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Obtener equipo por ID
 *     tags: [Equipos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipo encontrado
 *       404:
 *         description: Equipo no encontrado
 */
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query("SELECT * FROM equipos WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Equipo no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Crear nuevo equipo
 *     tags: [Equipos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               coach_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Equipo creado
 */
export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name, category, coach_name } = req.body;
    const [result]: any = await pool.query("INSERT INTO equipos (name, category, coach_name) VALUES (?, ?, ?)", [name, category, coach_name]);
    res.status(201).json({ id: result.insertId, name, category, coach_name });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Actualizar equipo
 *     tags: [Equipos]
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
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               coach_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Equipo actualizado
 */
export const updateTeam = async (req: Request, res: Response) => {
  try {
    const { name, category, coach_name } = req.body;
    await pool.query("UPDATE equipos SET name = ?, category = ?, coach_name = ? WHERE id = ?", [name, category, coach_name, req.params.id]);
    res.json({ id: req.params.id, name, category, coach_name });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Eliminar equipo
 *     tags: [Equipos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipo eliminado
 */
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM equipos WHERE id = ?", [req.params.id]);
    res.json({ message: "Equipo eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/teams/{id}/players:
 *   get:
 *     summary: Obtener jugadores de un equipo
 *     tags: [Equipos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de jugadores del equipo
 */
export const getTeamPlayers = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, u.name, u.email, u.phone 
      FROM jugadores p 
      JOIN usuarios u ON p.user_id = u.id 
      WHERE p.team_id = ?
    `, [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};
