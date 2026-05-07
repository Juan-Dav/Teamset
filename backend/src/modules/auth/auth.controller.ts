import { Request, Response } from "express";
import { pool } from "../../config/db";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Credenciales incorrectas
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const [rows]: any = await pool.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);
    if (rows.length === 0) return res.status(401).json({ message: "Credenciales incorrectas" });
    const user = rows[0];
    res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: El email ya está registrado
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    const [existing]: any = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(400).json({ message: "El email ya está registrado" });

    const [result]: any = await pool.query(
      "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, password, phone || null, "player"]
    );

    const userId = result.insertId;
    res.status(201).json({ id: userId, name, email, phone, role: "player" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/auth/profile/{id}:
 *   get:
 *     summary: Obtener perfil de usuario
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Perfil de usuario
 *       404:
 *         description: Usuario no encontrado
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const [rows]: any = await pool.query("SELECT id, name, email, phone, role FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

/**
 * @swagger
 * /api/auth/profile/{id}:
 *   put:
 *     summary: Actualizar perfil de usuario
 *     tags: [Auth]
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
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *       500:
 *         description: Error del servidor
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, password } = req.body;
    let query = "UPDATE users SET name = ?, email = ?, phone = ?";
    let params: any[] = [name, email, phone];
    if (password) { query += ", password = ?"; params.push(password); }
    query += " WHERE id = ?";
    params.push(userId);
    await pool.query(query, params);
    const [rows]: any = await pool.query("SELECT id, name, email, phone, role FROM users WHERE id = ?", [userId]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};
