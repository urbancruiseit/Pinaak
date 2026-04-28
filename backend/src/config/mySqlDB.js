import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Force mysql2 to interpret all DATETIME values as IST regardless of where
// the Node process runs (Hostinger servers are UTC; this prevents the
// 5h30m drift between local and live environments).
const IST_TIMEZONE = "+05:30";

// Pinaak Pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: IST_TIMEZONE,
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
  timezone: IST_TIMEZONE,
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
