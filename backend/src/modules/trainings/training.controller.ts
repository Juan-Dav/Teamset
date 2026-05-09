import { Request, Response } from "express";
import { pool } from "../../config/db";

/**
 * @swagger
 * /api/trainings:
 *   get:
 *     summary: Obtener todos los entrenamientos
 *     tags: [Entrenamientos]
 *     responses:
 *       200:
 *         description: Lista de entrenamientos
 */
export const getTrainings = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, te.name as team_name 
      FROM entrenamientos t 
      LEFT JOIN equipos te ON t.team_id = te.id 
      ORDER BY t.date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo entrenamientos" });
  }
};

/**
 * @swagger
 * /api/trainings:
 *   post:
 *     summary: Crear nuevo entrenamiento
 *     tags: [Entrenamientos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *             properties:
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               team_id:
 *                 type: integer
 *               survey_question:
 *                 type: string
 *     responses:
 *       201:
 *         description: Entrenamiento creado
 */
export const createTraining = async (req: Request, res: Response) => {
  try {
    const { title, date, team_id, survey_question } = req.body;
    const [result]: any = await pool.query(
      "INSERT INTO entrenamientos (title, date, team_id, survey_question) VALUES (?, ?, ?, ?)",
      [title, date, team_id || null, survey_question || null]
    );
    res.status(201).json({ id: result.insertId, title, date, team_id, survey_question });
  } catch (error) {
    res.status(500).json({ error: "Error creando entrenamiento" });
  }
};

/**
 * @swagger
 * /api/trainings/{id}:
 *   put:
 *     summary: Actualizar entrenamiento
 *     tags: [Entrenamientos]
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
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               team_id:
 *                 type: integer
 *               survey_question:
 *                 type: string
 *     responses:
 *       200:
 *         description: Entrenamiento actualizado
 */
export const updateTraining = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, date, team_id, survey_question } = req.body;
    await pool.query(
      "UPDATE entrenamientos SET title = ?, date = ?, team_id = ?, survey_question = ? WHERE id = ?",
      [title, date, team_id, survey_question, id]
    );
    res.json({ message: "Entrenamiento actualizado" });
  } catch (error) {
    res.status(500).json({ error: "Error actualizando entrenamiento" });
  }
};

/**
 * @swagger
 * /api/trainings/{id}:
 *   delete:
 *     summary: Eliminar entrenamiento
 *     tags: [Entrenamientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entrenamiento eliminado
 */
export const deleteTraining = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM entrenamientos WHERE id = ?", [id]);
    res.json({ message: "Entrenamiento eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error eliminando entrenamiento" });
  }
};
