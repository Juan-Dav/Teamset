import app from "./app";
import { pool } from "./config/db";
import { setup } from "./setup";

const PORT = 3000;

const startServer = async () => {
  try {
    await setup();
    const connection = await pool.getConnection();
    console.log("✅ Conectado a MySQL");
    connection.release();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error conectando a MySQL:", error);
  }
};

startServer();
