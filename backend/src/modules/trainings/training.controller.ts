import { Request, Response } from "express";
import * as trainingService from "./training.service";

export const getAll = async (req: Request, res: Response) => {
  try {
    const trainings = await trainingService.getTrainings();
    res.json(trainings);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo entrenamientos" });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { title, date } = req.body;
    const result = await trainingService.createTraining(title, date);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error creando entrenamiento" });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, date } = req.body;

    const result = await trainingService.updateTraining(
      Number(id),
      title,
      date
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error actualizando entrenamiento" });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await trainingService.deleteTraining(Number(id));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error eliminando entrenamiento" });
  }
};