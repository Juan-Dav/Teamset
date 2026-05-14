import { Request, Response } from "express";
import { pool } from "../../config/db";

export const getStandings = async (req: Request, res: Response) => {
  try {
    const teamId = req.query.team_id || null;
    const [rows]: any = await pool.query("CALL sp_calcular_tabla_posiciones(?)", [teamId]);
    const standings = rows?.[0] ?? rows ?? [];
    res.json(standings);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};
