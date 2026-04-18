import { pool } from "../../config/db";

export const getUsers = async () => {
  const [rows] = await pool.query("SELECT * FROM users");
  return rows;
};

export const createUser = async (name: string, email: string) => {
  const [result] = await pool.query(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    [name, email]
  );
  return result;
};

export const updateUser = async (id: number, name: string, email: string) => {
  const [result] = await pool.query(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, id]
  );
  return result;
};

export const deleteUser = async (id: number) => {
  const [result] = await pool.query(
    "DELETE FROM users WHERE id = ?",
    [id]
  );
  return result;
};