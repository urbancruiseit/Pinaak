import { pool } from "../../config/mySqlDB.js";

export const getMonthlyEnquiry = async (year) => {
  try {

    // Check if table exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'leads'");
    if (tables.length === 0) {
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



export const getLeadCountByDateForYear = async (
  year = new Date().getFullYear()
) => {
  try {
    const [result] = await pool.execute(
      `SELECT 
        DATE(enquiryTime) as date,
        COUNT(*) as leadCount
       FROM leads
       WHERE 
        YEAR(enquiryTime) = ?
       GROUP BY DATE(enquiryTime)
       ORDER BY DATE(enquiryTime) ASC`,
      [year]
    );

    if (result.length === 0) {
      return { success: true, year, avgLeadsPerDay: 0, data: [] };
    }

    const totalLeads = result.reduce((sum, row) => sum + row.leadCount, 0);
    const totalDays = result.length;
    const avgLeadsPerDay = parseFloat((totalLeads / totalDays).toFixed(2));

    return {
      success: true,
      year,
      totalLeads,
      totalDays,
      avgLeadsPerDay,
      data: result.map((row) => ({
        date: row.date,
        leadCount: row.leadCount,
      })),
    };
  } catch (error) {
    console.error("getLeadCountByDateForYear error:", error);
    throw error;
  }
};









