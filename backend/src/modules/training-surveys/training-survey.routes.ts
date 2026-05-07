import { Router } from "express";
import { createSurvey, getSurveyByTraining, getPlayerSurvey } from "./training-survey.controller";

const router = Router();

router.post("/", createSurvey);
router.get("/training/:trainingId", getSurveyByTraining);
router.get("/training/:trainingId/player/:playerId", getPlayerSurvey);

export default router;
