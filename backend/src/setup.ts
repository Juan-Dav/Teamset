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

    console.log("Eliminando datos existentes...");
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    // Remover TRUNCATE para preservar datos existentes
    // await connection.query("TRUNCATE TABLE notification_recipients");
    // await connection.query("TRUNCATE TABLE notifications");
    // await connection.query("TRUNCATE TABLE team_performance");
    // await connection.query("TRUNCATE TABLE match_player_stats");
    // await connection.query("TRUNCATE TABLE matches");
    // await connection.query("TRUNCATE TABLE attendance");
    // await connection.query("TRUNCATE TABLE training_assignments");
    // await connection.query("TRUNCATE TABLE trainings");
    // await connection.query("TRUNCATE TABLE players");
    // await connection.query("TRUNCATE TABLE teams");
    // await connection.query("TRUNCATE TABLE users");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("Ejecutando schema.sql...");
    const schema = fs.readFileSync("./database/schema.sql", "utf8");
    await connection.query(schema);

    console.log("Asegurando columnas faltantes...");
    await connection.query("ALTER TABLE trainings ADD COLUMN IF NOT EXISTS survey_question TEXT");
    await connection.query("ALTER TABLE training_surveys ADD COLUMN IF NOT EXISTS suggestion TEXT");

    console.log("Creando usuario admin por defecto (ID 1)...");
    const adminEmail = "admin@teamset.com";
    const adminPassword = "admin123";
    // Verificar si el admin ya existe
    const [existingAdmin]: any = await connection.query("SELECT id FROM users WHERE email = ?", [adminEmail]);
    if (existingAdmin.length === 0) {
      await connection.query(
        "INSERT INTO users (id, name, email, password, role) VALUES (1, ?, ?, ?, ?)",
        ["Administrador", adminEmail, adminPassword, "admin"]
      );
      console.log(`Admin creado: ${adminEmail} / ${adminPassword} (ID: 1)`);
    } else {
      console.log("Admin ya existe, saltando creación.");
    }

    console.log("Base de datos configurada exitosamente");
    await connection.end();
  } catch (error) {
    console.error("Error al configurar la base de datos:", error);
  }
};

if (require.main === module) {
  setup();
}
