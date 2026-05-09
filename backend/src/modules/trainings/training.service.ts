import { pool } from "../../config/db";

export const getTrainings = async () => {
  const [rows] = await pool.query("SELECT * FROM entrenamientos");
  return rows;
};

export const createTraining = async (title: string, date: string) => {
  const [result] = await pool.query(
    "INSERT INTO entrenamientos (title, date) VALUES (?, ?)",
    [title, date]
  );
  return result;
};

export const updateTraining = async (
  id: number,
  title: string,
  date: string
) => {
  const [result] = await pool.query(
    "UPDATE entrenamientos SET title = ?, date = ? WHERE id = ?",
    [title, date, id]
  );
  return result;
};

export const deleteTraining = async (id: number) => {
  const [result] = await pool.query(
    "DELETE FROM entrenamientos WHERE id = ?",
    [id]
  );
  return result;
};