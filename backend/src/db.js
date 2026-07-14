import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "mindsync",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL connesso!");
});

pool.on("error", (err) => {
  console.error("❌ Errore DB:", err);
});

export default pool;
