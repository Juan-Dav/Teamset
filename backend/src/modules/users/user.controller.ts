import { Request, Response } from "express";
import * as userService from "./user.service";

export const getAll = async (req: Request, res: Response) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const result = await userService.createUser(name, email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error creando usuario" });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const result = await userService.updateUser(
      Number(id),
      name,
      email
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error actualizando usuario" });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await userService.deleteUser(Number(id));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error eliminando usuario" });
  }
};