import { hrmsPool, pool } from "../../config/mySqlDB.js";

export const getMonthlyEnquiry = async (year) => {
  try {
    // Check if table exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'leads'");
    if (tables.length === 0) {
      return [];
    }

    // IMPORTANT: Using enquiryTime instead of created_at
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
  year = new Date().getFullYear(),
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
      [year],
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

export const getPreSalesLeadAssignmentReport = async (req, month, year) => {
  const preSalesUser = req.user;

  month = month || new Date().getMonth() + 1;
  year = year || new Date().getFullYear();

  const totalDaysInMonth = new Date(year, month, 0).getDate();

  // Step 1 — City IDs directly req.user se
  const cityIds = preSalesUser.city_ids;

  if (!cityIds || cityIds.length === 0) {
    return { success: false, message: "No cities assigned to this user" };
  }

  const cityPlaceholders = cityIds.map(() => "?").join(",");

  // Step 2 — In cities ke travel advisers HRMS se nikalo
const [advisorUsers] = await hrmsPool.execute(
  `SELECT 
     u.id,
     CONCAT_WS(' ', u.aliasName, u.middleName, u.lastName) AS adviser_name
   FROM users u
   INNER JOIN roles r ON u.role_id = r.id
   INNER JOIN access_control ac ON ac.employee_id = u.id
   INNER JOIN access_control_cities acc ON acc.access_control_id = ac.id
   WHERE r.role_name = 'Travel Advisor'
     AND acc.city_id IN (${cityPlaceholders})
     AND u.is_active = 1`,
  cityIds
);

  if (!advisorUsers.length) {
    return {
      success: true,
      month, year,
      totalDaysInMonth,
      data: [],
      teamTotal: null,
    };
  }

  const advisorIds = advisorUsers.map((u) => u.id);
  const advisorPlaceholders = advisorIds.map(() => "?").join(",");

  // Step 3 — Har adviser ko date-wise kitne leads aaye
  const [leadRows] = await pool.execute(
    `SELECT 
       l.advisor_id,
       DAY(l.enquiryTime)                                   AS day,
       COUNT(l.id)                                          AS total_leads,
       SUM(CASE WHEN l.status = 'Book' THEN 1 ELSE 0 END)  AS booked_leads
     FROM leads l
     WHERE 
       MONTH(l.enquiryTime) = ?
       AND YEAR(l.enquiryTime) = ?
       AND l.advisor_id IN (${advisorPlaceholders})
     GROUP BY l.advisor_id, DAY(l.enquiryTime)
     ORDER BY l.advisor_id ASC, DAY(l.enquiryTime) ASC`,
    [month, year, ...advisorIds]
  );

  // Step 4 — Har adviser ka base structure
  const adviserMap = {};
  advisorUsers.forEach((u) => {
    adviserMap[u.id] = {
      adviser_id:   u.id,
      adviser_name: u.adviser_name,
      total_leads:  0,
      total_booked: 0,
      active_days:  new Set(),
      days: Array.from({ length: totalDaysInMonth }, (_, i) => ({
        day:    i + 1,
        leads:  0,
        booked: 0,
      })),
    };
  });

  // Step 5 — Leads data fill karo
 // Step 5 — Leads data fill karo
const filledDays = {}; // track karo kaunse days mein data aaya

leadRows.forEach((row) => {
  const adviser = adviserMap[row.advisor_id];
  if (!adviser) return;

  const dayIndex = row.day - 1;
  adviser.days[dayIndex].leads  = Number(row.total_leads);
  adviser.days[dayIndex].booked = Number(row.booked_leads);
  adviser.total_leads           += Number(row.total_leads);
  adviser.total_booked          += Number(row.booked_leads);
  adviser.active_days.add(row.day);
});

// Step 6 — Final format
const data = Object.values(adviserMap).map((adviser) => ({
  adviser_id:        adviser.adviser_id,
  adviser_name:      adviser.adviser_name,
  total_leads:       adviser.total_leads,
  total_booked:      adviser.total_booked,
  avg_leads_per_day:
    adviser.active_days.size > 0
      ? parseFloat((adviser.total_leads / adviser.active_days.size).toFixed(2))
      : "-",
  cntb_percentage:
    adviser.total_leads > 0
      ? parseFloat(((adviser.total_booked / adviser.total_leads) * 100).toFixed(1))
      : "-",
  days: adviser.days.map((d) => ({
    day:    d.day,
    leads:  d.leads  === 0 ? "-" : d.leads,
    booked: d.booked === 0 ? "-" : d.booked,
  })),
}));

  // Step 7 — Team total
 const teamTotal = {
  total_leads:  data.reduce((s, a) => s + a.total_leads, 0),
  total_booked: data.reduce((s, a) => s + a.total_booked, 0),
  days: Array.from({ length: totalDaysInMonth }, (_, i) => ({
    day:    i + 1,
    leads:  data.reduce((s, a) => s + (Number(a.days[i].leads) || 0), 0) || "-",
    booked: data.reduce((s, a) => s + (Number(a.days[i].booked) || 0), 0) || "-",
  })),
};
  return {
    success: true,
    month,
    year,
    totalDaysInMonth,
    data,
    teamTotal,
  };
};
