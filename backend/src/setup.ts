import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

export const setup = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      multipleStatements: true,
    });

    console.log("Creando base de datos...");
    await connection.query("CREATE DATABASE IF NOT EXISTS teamset_db");
    await connection.query("USE teamset_db");

    console.log("Corrigiendo tabla encuestas_entrenamiento...");
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    await connection.query("DROP TABLE IF EXISTS encuestas_entrenamiento");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("Ejecutando schema.sql...");
    const schema = fs.readFileSync("./database/schema.sql", "utf8");
    await connection.query(schema);

    console.log("Asegurando columnas faltantes...");
    await connection.query("ALTER TABLE entrenamientos ADD COLUMN IF NOT EXISTS survey_question TEXT");

    console.log("Creando/actualizando usuario admin (ID 1)...");
    const adminEmail = "admin@teamset.com";
    const adminPassword = "admin123";
    await connection.query(
      `INSERT INTO usuarios (id, name, email, password, role) VALUES (1, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), password = VALUES(password), role = VALUES(role)`,
      ["Administrador", adminEmail, adminPassword, "admin"]
    );
    console.log(`Admin asegurado: ${adminEmail} / ${adminPassword} (ID: 1)`);

    console.log("Base de datos configurada exitosamente");
    await connection.end();
  } catch (error) {
    console.error("Error al configurar la base de datos:", error);
  }
};

if (require.main === module) {
  setup();
}
