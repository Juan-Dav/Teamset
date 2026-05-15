import { Request, Response } from "express";
import { pool } from "../../config/db";

export const getTeamStatsPerformance = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query("CALL sp_calcular_rendimiento_equipo()");
    const performance = rows?.[0] ?? rows ?? [];
    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};
