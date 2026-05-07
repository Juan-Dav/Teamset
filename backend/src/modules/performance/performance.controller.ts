import { Request, Response } from "express";
import { pool } from "../../config/db";

/**
 * @swagger
 * /api/performance:
 *   get:
 *     summary: Obtener todos los registros de rendimiento
 *     tags: [Performance]
 *     responses:
 *       200:
 *         description: Lista de registros de rendimiento
 */
export const getPerformance = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT tp.*, t.name as team_name 
      FROM team_performance tp 
      JOIN teams t ON tp.team_id = t.id 
      ORDER BY tp.performance_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/performance/team/{teamId}:
 *   get:
 *     summary: Obtener rendimiento por equipo
 *     tags: [Performance]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Registros de rendimiento del equipo
 */
export const getPerformanceByTeam = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM team_performance WHERE team_id = ? ORDER BY performance_date DESC", [req.params.teamId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/performance:
 *   post:
 *     summary: Crear registro de rendimiento
 *     tags: [Performance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - team_id
 *               - performance_date
 *             properties:
 *               team_id:
 *                 type: integer
 *               performance_date:
 *                 type: string
 *                 format: date
 *               court_performance:
 *                 type: integer
 *               serve_performance:
 *                 type: integer
 *               attack_performance:
 *                 type: integer
 *               block_performance:
 *                 type: integer
 *               defense_performance:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registro creado
 */
export const createPerformance = async (req: Request, res: Response) => {
  try {
    const { team_id, performance_date, court_performance, serve_performance, attack_performance, block_performance, defense_performance, notes } = req.body;
    const overall_rating = ((court_performance + serve_performance + attack_performance + block_performance + defense_performance) / 5).toFixed(1);
    const [result]: any = await pool.query(
      "INSERT INTO team_performance (team_id, performance_date, court_performance, serve_performance, attack_performance, block_performance, defense_performance, overall_rating, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [team_id, performance_date, court_performance, serve_performance, attack_performance, block_performance, defense_performance, overall_rating, notes]
    );
    res.status(201).json({ id: result.insertId, team_id, overall_rating });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/performance/{id}:
 *   put:
 *     summary: Actualizar registro de rendimiento
 *     tags: [Performance]
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
 *               performance_date:
 *                 type: string
 *                 format: date
 *               court_performance:
 *                 type: integer
 *               serve_performance:
 *                 type: integer
 *               attack_performance:
 *                 type: integer
 *               block_performance:
 *                 type: integer
 *               defense_performance:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rendimiento actualizado
 */
export const updatePerformance = async (req: Request, res: Response) => {
  try {
    const { performance_date, court_performance, serve_performance, attack_performance, block_performance, defense_performance, notes } = req.body;
    const overall_rating = ((court_performance + serve_performance + attack_performance + block_performance + defense_performance) / 5).toFixed(1);
    await pool.query(
      "UPDATE team_performance SET performance_date = ?, court_performance = ?, serve_performance = ?, attack_performance = ?, block_performance = ?, defense_performance = ?, overall_rating = ?, notes = ? WHERE id = ?",
      [performance_date, court_performance, serve_performance, attack_performance, block_performance, defense_performance, overall_rating, notes, req.params.id]
    );
    res.json({ message: "Rendimiento actualizado", overall_rating });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};
