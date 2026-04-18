import { Router } from "express";
import * as controller from "./training.controller";

const router = Router();

/**
 * @swagger
 * /api/trainings:
 *   get:
 *     summary: Obtener todos los entrenamientos
 *     responses:
 *       200:
 *         description: Lista de entrenamientos
 */
router.get("/", controller.getAll);

/**
 * @swagger
 * /api/trainings:
 *   post:
 *     summary: Crear entrenamiento
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
 *                 example: 2026-04-16
 *     responses:
 *       200:
 *         description: Entrenamiento creado
 */
router.post("/", controller.create);

/**
 * @swagger
 * /api/trainings/{id}:
 *   put:
 *     summary: Actualizar entrenamiento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del entrenamiento
 *         schema:
 *           type: integer
 */
router.put("/:id", controller.update);

/**
 * @swagger
 * /api/trainings/{id}:
 *   delete:
 *     summary: Eliminar entrenamiento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del entrenamiento
 *         schema:
 *           type: integer
 */
router.delete("/:id", controller.remove);

export default router;