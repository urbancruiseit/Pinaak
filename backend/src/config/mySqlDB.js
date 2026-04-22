import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Pinaak Pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
});

// ✅ HRMS Pool (Naya)
export const hrmsPool = mysql.createPool({
  host: process.env.HRMS_DB_HOST,
  user: process.env.HRMS_DB_USER,
  password: process.env.HRMS_DB_PASSWORD,
  database: process.env.HRMS_DB_NAME,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
});

// Pinaak Connection Test
export const connectMySQL = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Pinaak MySQL Connected Successfully!");
    connection.release();
  } catch (err) {
    console.error("❌ Pinaak MySQL Connection Failed:", err.message);
    throw err;
  }
};

// ✅ HRMS Connection Test (Naya)
export const connectHRMSMySQL = async () => {
  try {
    const connection = await hrmsPool.getConnection();
    console.log("✅ HRMS MySQL Connected Successfully!");
    connection.release();
  } catch (err) {
    console.error("❌ HRMS MySQL Connection Failed:", err.message);
    throw err;
  }
};
