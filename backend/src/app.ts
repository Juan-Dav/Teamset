import express from "express";
import cors from "cors";
import userRoutes from "./modules/users/user.routes";
import trainingRoutes from "./modules/trainings/training.routes";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();

app.use(cors());
app.use(express.json());

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/trainings", trainingRoutes);

export default app;