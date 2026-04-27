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
  const cityIds = preSalesUser.city_ids; // [1,2,3,...19]

  if (!cityIds || cityIds.length === 0) {
    return {
      success: false,
      message: "No cities assigned to this pre-sales user",
    };
  }

  month = month || new Date().getMonth() + 1;
  year = year || new Date().getFullYear();

  const totalDaysInMonth = new Date(year, month, 0).getDate();

  // Step 1 — Leads fetch karo (city-wise + day-wise + advisor-wise)
  const placeholders = cityIds.map(() => "?").join(",");

  const [rows] = await pool.execute(
    `SELECT 
      l.advisor_id,
      l.city_id,
      DAY(l.enquiryTime)                                        AS day,
      COUNT(l.id)                                               AS total_leads,
      SUM(CASE WHEN l.status = 'Book' THEN 1 ELSE 0 END)       AS booked_leads,
      SUM(CASE WHEN l.advisor_id IS NULL OR l.advisor_id = 0 
               THEN 1 ELSE 0 END)                              AS unassigned_leads
     FROM leads l
     WHERE 
      MONTH(l.enquiryTime) = ?
      AND YEAR(l.enquiryTime)  = ?
      AND l.city_id IN (${placeholders})
     GROUP BY l.advisor_id, l.city_id, DAY(l.enquiryTime)
     ORDER BY l.advisor_id ASC, DAY(l.enquiryTime) ASC`,
    [month, year, ...cityIds],
  );

  if (rows.length === 0) {
    return {
      success: true,
      month,
      year,
      preSalesId: preSalesUser.id,
      data: [],
      teamTotal: null,
    };
  }

  // Step 2 — Unique advisor IDs nikalo (NULL/0 hatao)
  const advisorIds = [
    ...new Set(rows.map((r) => r.advisor_id).filter((id) => id && id !== 0)),
  ];

  // Step 3 — HRMS se advisor names lo
  let userMap = {};
  if (advisorIds.length > 0) {
    const [users] = await hrmsPool.execute(
      `SELECT 
        id,
        CONCAT_WS(' ', firstName, middleName, lastName) AS adviser_name
       FROM users
       WHERE id IN (${advisorIds.map(() => "?").join(",")})`,
      advisorIds,
    );
    users.forEach((u) => {
      userMap[u.id] = u.adviser_name;
    });
  }

  // Step 4 — City name map (req.user se hi milti hai)
  const cityMap = {};
  preSalesUser.city_ids.forEach((id, idx) => {
    cityMap[id] = preSalesUser.city_names[idx];
  });

  // Step 5 — Advisor-wise data build karo
  const adviserMap = {};

  rows.forEach((row) => {
    const advisorKey = row.advisor_id || "unassigned";

    if (!adviserMap[advisorKey]) {
      adviserMap[advisorKey] = {
        adviser_id: advisorKey === "unassigned" ? null : row.advisor_id,
        adviser_name:
          advisorKey === "unassigned"
            ? "Unassigned"
            : userMap[row.advisor_id] || "Unknown",
        total_leads: 0,
        total_booked: 0,
        active_days: new Set(),
        days: Array.from({ length: totalDaysInMonth }, (_, i) => ({
          day: i + 1,
          leads: 0,
          booked: 0,
        })),
      };
    }

    const adviser = adviserMap[advisorKey];
    const dayIndex = row.day - 1;

    adviser.days[dayIndex].leads += Number(row.total_leads);
    adviser.days[dayIndex].booked += Number(row.booked_leads);
    adviser.total_leads += Number(row.total_leads);
    adviser.total_booked += Number(row.booked_leads);
    adviser.active_days.add(row.day);
  });

  // Step 6 — Final format (same as image table)
  const data = Object.values(adviserMap).map((adviser) => ({
    adviser_id: adviser.adviser_id,
    adviser_name: adviser.adviser_name,
    total_leads: adviser.total_leads,
    total_booked: adviser.total_booked,
    avg_leads_per_day:
      adviser.active_days.size > 0
        ? parseFloat(
            (adviser.total_leads / adviser.active_days.size).toFixed(2),
          )
        : 0,
    cntb_percentage:
      adviser.total_leads > 0
        ? parseFloat(
            ((adviser.total_booked / adviser.total_leads) * 100).toFixed(1),
          )
        : 0,
    days: adviser.days, // [{day:1, leads:3, booked:1}, ...]
  }));

  // Step 7 — Team Total row
  const teamTotal = {
    total_leads: data.reduce((s, a) => s + a.total_leads, 0),
    total_booked: data.reduce((s, a) => s + a.total_booked, 0),
    days: Array.from({ length: totalDaysInMonth }, (_, i) => ({
      day: i + 1,
      leads: data.reduce((s, a) => s + a.days[i].leads, 0),
      booked: data.reduce((s, a) => s + a.days[i].booked, 0),
    })),
  };

  return {
    success: true,
    month,
    year,
    preSalesId: preSalesUser.id,
    preSalesName: preSalesUser.fullName,
    cities: preSalesUser.city_names, // assigned cities
    totalDaysInMonth,
    data, // adviser-wise rows
    teamTotal,
  };
};
