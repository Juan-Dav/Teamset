import { pool } from "../../config/db";

export const getUsers = async () => {
  const [rows] = await pool.query("SELECT * FROM usuarios");
  return rows;
};

export const createUser = async (name: string, email: string) => {
  const [result] = await pool.query(
    "INSERT INTO usuarios (name, email) VALUES (?, ?)",
    [name, email]
  );
  return result;
};

export const updateUser = async (id: number, name: string, email: string) => {
  const [result] = await pool.query(
    "UPDATE usuarios SET name = ?, email = ? WHERE id = ?",
    [name, email, id]
  );
  return result;
};

export const deleteUser = async (id: number) => {
  const [result] = await pool.query(
    "DELETE FROM usuarios WHERE id = ?",
    [id]
  );
  return result;
};