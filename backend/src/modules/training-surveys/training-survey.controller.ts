import { Request, Response } from "express";
import { pool } from "../../config/db";

/**
 * @swagger
 * /api/training-surveys:
 *   post:
 *     summary: Crear o actualizar encuesta de entrenamiento
 *     tags: [Training Surveys]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - training_id
 *               - player_id
 *               - satisfaction
 *             properties:
 *               training_id:
 *                 type: integer
 *               player_id:
 *                 type: integer
 *               satisfaction:
 *                 type: string
 *                 enum: [happy, neutral, sad]
 *               suggestion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Encuesta guardada
 */
export const createSurvey = async (req: Request, res: Response) => {
  try {
    const { training_id, player_id, satisfaction, suggestion } = req.body;
    
    if (!['happy', 'neutral', 'sad'].includes(satisfaction)) {
      return res.status(400).json({ message: "Satisfaction debe ser: happy, neutral, o sad" });
    }
    
    const [existing]: any = await pool.query(
      "SELECT id FROM training_surveys WHERE training_id = ? AND player_id = ?",
      [training_id, player_id]
    );
    
    if (existing.length > 0) {
      await pool.query(
        "UPDATE training_surveys SET satisfaction = ?, suggestion = ? WHERE training_id = ? AND player_id = ?",
        [satisfaction, suggestion || null, training_id, player_id]
      );
    } else {
      await pool.query(
        "INSERT INTO training_surveys (training_id, player_id, satisfaction, suggestion) VALUES (?, ?, ?, ?)",
        [training_id, player_id, satisfaction, suggestion || null]
      );
    }
    
    res.json({ message: "Encuesta guardada" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/training-surveys/training/{trainingId}:
 *   get:
 *     summary: Obtener encuestas por entrenamiento
 *     tags: [Training Surveys]
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de encuestas del entrenamiento
 */
export const getSurveyByTraining = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT ts.*, u.name as player_name 
       FROM training_surveys ts
       JOIN players p ON ts.player_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE ts.training_id = ?`,
      [req.params.trainingId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/training-surveys/training/{trainingId}/player/{playerId}:
 *   get:
 *     summary: Obtener encuesta de un jugador
 *     tags: [Training Surveys]
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Encuesta del jugador o null
 */
export const getPlayerSurvey = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM training_surveys WHERE training_id = ? AND player_id = ?",
      [req.params.trainingId, req.params.playerId]
    );
    res.json(rows[0] || null);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};
