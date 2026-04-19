import { pool } from "../../config/mySqlDB.js";

export const getMonthlyEnquiry = async (year) => {
  try {
    console.log("📊 Model - Fetching for year:", year);

    // Check if table exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'leads'");
    if (tables.length === 0) {
      console.log("⚠️ Leads table does not exist");
      return [];
    }

    // 🔴 IMPORTANT: Using enquiryTime instead of created_at
    const query = `
      SELECT 
        MONTH(enquiryTime) AS month,
        DAY(enquiryTime) AS day,
        COUNT(id) AS total
      FROM leads
      WHERE YEAR(enquiryTime) = ?
      GROUP BY MONTH(enquiryTime), DAY(enquiryTime)
      ORDER BY month, day
    `;

    const [rows] = await pool.execute(query, [year]);
    console.log(`✅ Model - Found ${rows.length} records`);

    // Log first few records for debugging
    if (rows.length > 0) {
      console.log("📝 Sample record:", rows[0]);
    }

    return rows;
  } catch (error) {
    console.error("❌ Model Error:", error.message);
    throw error;
  }
};
