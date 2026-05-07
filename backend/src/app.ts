import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import trainingRoutes from "./modules/trainings/training.routes";
import teamRoutes from "./modules/teams/team.routes";
import playerRoutes from "./modules/players/player.routes";
import matchRoutes from "./modules/matches/match.routes";
import performanceRoutes from "./modules/performance/performance.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import trainingSurveyRoutes from "./modules/training-surveys/training-survey.routes";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();

app.use(cors());
app.use(express.json());

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trainings", trainingRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/training-surveys", trainingSurveyRoutes);

export default app;