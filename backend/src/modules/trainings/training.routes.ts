import { Router } from "express";
import { getTrainings, createTraining, updateTraining, deleteTraining } from "./training.controller";

const router = Router();

router.get("/", getTrainings);
router.post("/", createTraining);
router.put("/:id", updateTraining);
router.delete("/:id", deleteTraining);

export default router;
