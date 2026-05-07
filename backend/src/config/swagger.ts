import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TeamSet API",
      version: "1.0.0",
      description: "API de gestión de voleibol - Documentación con Swagger",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo",
      },
    ],
  },
  apis: ["src/modules/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);