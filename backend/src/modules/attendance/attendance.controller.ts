import { Request, Response } from "express";
import { pool } from "../../config/db";

/**
 * @swagger
 * /api/attendance/training/{trainingId}:
 *   get:
 *     summary: Obtener asistencia por entrenamiento
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de asistencia
 */
export const getAttendanceByTraining = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT a.*, p.jersey_number, u.name as player_name, u.email
      FROM attendance a
      JOIN players p ON a.player_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE a.training_id = ?
    `, [req.params.trainingId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/attendance/set:
 *   post:
 *     summary: Establecer asistencia
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - training_id
 *               - player_id
 *               - status
 *             properties:
 *               training_id:
 *                 type: integer
 *               player_id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [attending, not_attending, pending]
 *     responses:
 *       200:
 *         description: Asistencia actualizada
 */
export const setAttendanceStatus = async (req: Request, res: Response) => {
  try {
    const { training_id, player_id, status } = req.body;
    
    // Check if attendance already exists
    const [existing]: any = await pool.query(
      "SELECT id, status FROM attendance WHERE training_id = ? AND player_id = ?",
      [training_id, player_id]
    );
    
    if (existing.length > 0) {
      const previousStatus = existing[0].status;
      
      await pool.query(
        "UPDATE attendance SET status = ?, confirmed_at = ? WHERE training_id = ? AND player_id = ?",
        [status, status === 'attending' ? new Date() : null, training_id, player_id]
      );
      
      // Only increment streak if changing from non-attending to attending
      if (status === 'attending' && previousStatus !== 'attending') {
        await pool.query(
          "UPDATE players SET attendance_streak = attendance_streak + 1, last_attendance_date = CURDATE() WHERE id = ?",
          [player_id]
        );
      }
      // Decrement streak if changing from attending to non-attending
      else if (status !== 'attending' && previousStatus === 'attending') {
        await pool.query(
          "UPDATE players SET attendance_streak = GREATEST(attendance_streak - 1, 0) WHERE id = ?",
          [player_id]
        );
      }
    } else {
      await pool.query(
        "INSERT INTO attendance (training_id, player_id, status, confirmed_at) VALUES (?, ?, ?, ?)",
        [training_id, player_id, status, status === 'attending' ? new Date() : null]
      );
      
      // Increment streak for new attendance confirmation
      if (status === 'attending') {
        await pool.query(
          "UPDATE players SET attendance_streak = attendance_streak + 1, last_attendance_date = CURDATE() WHERE id = ?",
          [player_id]
        );
      }
    }
    
    res.json({ message: "Asistencia actualizada" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/attendance/streak/{playerId}:
 *   get:
 *     summary: Obtener racha de asistencia
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Racha de asistencia
 */
export const getAttendanceStreak = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      "SELECT id, attendance_streak, last_attendance_date FROM players WHERE id = ?",
      [req.params.playerId]
    );
    res.json(rows[0] || { attendance_streak: 0, last_attendance_date: null });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};
