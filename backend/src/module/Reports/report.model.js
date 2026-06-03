import { hrmsPool, pool } from "../../config/mySqlDB.js";

export const getMonthlyEnquiry = async (year) => {
  try {
    // Check if table exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'leads'");
    if (tables.length === 0) {
      return [];
    }

    const query = `
      SELECT 
        MONTH(enquiryTime) AS month,
        DAY(enquiryTime)   AS day,
        COUNT(id)          AS total
      FROM leads
      WHERE YEAR(enquiryTime) = ?
      GROUP BY MONTH(enquiryTime), DAY(enquiryTime)
      ORDER BY month, day
    `;

    const [rows] = await pool.execute(query, [year]);

    if (rows.length > 0) {
      console.log("📝 Sample record:", rows[0]);
    }

    // ── Average: sirf un dino se divide karo jisme data aaya ──
    const monthMap = {}; // { [monthNumber]: { days, total } }

    rows.forEach((row) => {
      const m = row.month;
      if (!monthMap[m]) {
        monthMap[m] = { days: 0, total: 0 };
      }
      monthMap[m].days += 1;
      monthMap[m].total += Number(row.total);
    });

    const result = rows.map((row) => {
      const { days, total } = monthMap[row.month];
      const avg = days > 0 ? Math.round(total / days) : 0;
      return { ...row, avg };
    });

    return result;
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

export const getPreSalesLeadAssignmentReport = async (cityIds, month, year) => {
  month = month || new Date().getMonth() + 1;
  year = year || new Date().getFullYear();

  const totalDaysInMonth = new Date(year, month, 0).getDate();

  // Step 1 — City IDs directly req.user se

  if (!cityIds || cityIds.length === 0) {
    return { success: false, message: "No cities assigned to this user" };
  }

  const cityPlaceholders = cityIds.map(() => "?").join(",");

  // Step 2 — In cities ke travel advisers HRMS se nikalo
  const [advisorUsers] = await hrmsPool.execute(
    `SELECT 
     u.id,
     CONCAT_WS(' ', u.aliasName) AS adviser_name
   FROM users u
   INNER JOIN roles r ON u.role_id = r.id
   INNER JOIN access_control ac ON ac.employee_id = u.id
   INNER JOIN access_control_cities acc ON acc.access_control_id = ac.id
   WHERE r.role_name = 'Travel Advisor'
     AND acc.city_id IN (${cityPlaceholders})
     AND u.is_active = 1`,
    cityIds,
  );

  if (!advisorUsers.length) {
    return {
      success: true,
      month,
      year,
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
    [month, year, ...advisorIds],
  );

  // Step 4 — Har adviser ka base structure
  const adviserMap = {};
  advisorUsers.forEach((u) => {
    adviserMap[u.id] = {
      adviser_id: u.id,
      adviser_name: u.adviser_name,
      total_leads: 0,
      total_booked: 0,
      active_days: new Set(),
      days: Array.from({ length: totalDaysInMonth }, (_, i) => ({
        day: i + 1,
        leads: 0,
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
    adviser.days[dayIndex].leads = Number(row.total_leads);
    adviser.days[dayIndex].booked = Number(row.booked_leads);
    adviser.total_leads += Number(row.total_leads);
    adviser.total_booked += Number(row.booked_leads);
    adviser.active_days.add(row.day);
  });

  // Step 6 — Final format
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
        : "-",
    cntb_percentage:
      adviser.total_leads > 0
        ? parseFloat(
            ((adviser.total_booked / adviser.total_leads) * 100).toFixed(1),
          )
        : "-",
    days: adviser.days.map((d) => ({
      day: d.day,
      leads: d.leads === 0 ? "-" : d.leads,
      booked: d.booked === 0 ? "-" : d.booked,
    })),
  }));

  // Step 7 — Team total
  const teamTotal = {
    total_leads: data.reduce((s, a) => s + a.total_leads, 0),
    total_booked: data.reduce((s, a) => s + a.total_booked, 0),
    days: Array.from({ length: totalDaysInMonth }, (_, i) => ({
      day: i + 1,
      leads:
        data.reduce((s, a) => s + (Number(a.days[i].leads) || 0), 0) || "-",
      booked:
        data.reduce((s, a) => s + (Number(a.days[i].booked) || 0), 0) || "-",
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

export const getMonthlyStatusWiseReport = async (cityIds, month, year) => {
  month = month || new Date().getMonth() + 1;
  year = year || new Date().getFullYear();

  if (!cityIds || cityIds.length === 0) {
    return { success: false, message: "No cities assigned" };
  }

  const cityPlaceholders = cityIds.map(() => "?").join(",");

  // ---------------- ADVISORS ----------------
  const [advisors] = await hrmsPool.execute(
    `SELECT 
        u.id,
        CONCAT_WS(' ', u.aliasName) AS adviser_name
     FROM users u
     INNER JOIN roles r ON u.role_id = r.id
     INNER JOIN access_control ac ON ac.employee_id = u.id
     INNER JOIN access_control_cities acc ON acc.access_control_id = ac.id
     WHERE r.role_name = 'Travel Advisor'
       AND acc.city_id IN (${cityPlaceholders})
       AND u.is_active = 1`,
    cityIds,
  );

  if (!advisors.length) {
    return { success: true, data: [], teamTotal: {} };
  }

  const advisorIds = advisors.map((a) => a.id);
  const advisorPlaceholders = advisorIds.map(() => "?").join(",");

  // ---------------- STATUS WISE LEADS ----------------
  const [rows] = await pool.execute(
    `SELECT 
        l.advisor_id,
        l.status,
        COUNT(l.id) AS total
     FROM leads l
     WHERE 
        MONTH(l.enquiryTime) = ?
        AND YEAR(l.enquiryTime) = ?
        AND l.advisor_id IN (${advisorPlaceholders})
     GROUP BY l.advisor_id, l.status`,
    [month, year, ...advisorIds],
  );

  // ---------------- STRUCTURE ----------------
  const map = {};

  advisors.forEach((a) => {
    map[a.id] = {
      adviser_id: a.id,
      adviser_name: a.adviser_name,

      // ✅ All 7 statuses from statusList
      new: 0,
      kyc: 0,
      rfq: 0,
      hot: 0,
      vehn: 0, // VEH-N
      lost: 0,
      book: 0,
      blank: 0,

      total: 0,
    };
  });

  // ---------------- FILL DATA ----------------
  rows.forEach((r) => {
    const a = map[r.advisor_id];
    if (!a) return;

    const status = r.status?.toUpperCase().trim();
    const count = Number(r.total);

    if (status === "NEW") a.new += count;
    else if (status === "KYC") a.kyc += count;
    else if (status === "RFQ") a.rfq += count;
    else if (status === "HOT") a.hot += count;
    else if (status === "VEH-N" || status === "VEHN") a.vehn += count;
    else if (status === "LOST") a.lost += count;
    else if (status === "BOOK") a.book += count;
    else if (status === "BLANK") a.blank += count;

    a.total += count;
  });

  // ---------------- FINAL FORMAT ----------------
  const data = Object.values(map).map((a) => ({
    ...a,
    // con = conversion % based on BOOK / total
    con: a.total ? ((a.book / a.total) * 100).toFixed(0) + "%" : "0%",
  }));

  // ---------------- TEAM TOTAL ----------------
  const teamTotal = {
    new: data.reduce((s, r) => s + r.new, 0),
    kyc: data.reduce((s, r) => s + r.kyc, 0),
    rfq: data.reduce((s, r) => s + r.rfq, 0),
    hot: data.reduce((s, r) => s + r.hot, 0),
    vehn: data.reduce((s, r) => s + r.vehn, 0),
    lost: data.reduce((s, r) => s + r.lost, 0),
    book: data.reduce((s, r) => s + r.book, 0),
    blank: data.reduce((s, r) => s + r.blank, 0),
    total: data.reduce((s, r) => s + r.total, 0),
  };

  return { success: true, month, year, data, teamTotal };
};

export const getTimeEnquiryReport = async (year) => {
  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'leads'");
    if (tables.length === 0) {
      return [];
    }

    const query = `
      SELECT 
        MONTH(enquiryTime) AS month,
        DAY(enquiryTime) AS day,
        HOUR(enquiryTime) AS hour,
        COUNT(id) AS total
      FROM leads
      WHERE YEAR(enquiryTime) = ?
      GROUP BY MONTH(enquiryTime), DAY(enquiryTime), HOUR(enquiryTime)
      ORDER BY month, day, hour
    `;

    const [rows] = await pool.execute(query, [year]);

    if (rows.length > 0) {
      console.log("⏰ Time Enquiry Sample:", rows[0]);
    }

    return rows;
  } catch (error) {
    console.error("❌ Time Enquiry Error:", error.message);
    throw error;
  }
};

export const getMonthlyDateWiseStatusReport = async (cityIds, month, year) => {
  month = month || new Date().getMonth() + 1;
  year = year || new Date().getFullYear();

  const totalDaysInMonth = new Date(year, month, 0).getDate();

  if (!cityIds || cityIds.length === 0) {
    return {
      success: false,
      message: "No cities assigned",
    };
  }

  const cityPlaceholders = cityIds.map(() => "?").join(",");

  // ---------------- GET TRAVEL ADVISORS ----------------
  const [advisors] = await hrmsPool.execute(
    `SELECT
        u.id,
        u.aliasName AS adviser_name
     FROM users u
     INNER JOIN roles r
        ON u.role_id = r.id
     INNER JOIN access_control ac
        ON ac.employee_id = u.id
     INNER JOIN access_control_cities acc
        ON acc.access_control_id = ac.id
     WHERE r.role_name = 'Travel Advisor'
       AND acc.city_id IN (${cityPlaceholders})
       AND u.is_active = 1`,
    cityIds,
  );

  if (!advisors.length) {
    return {
      success: true,
      month,
      year,
      data: [],
      teamTotal: {},
    };
  }

  const advisorIds = advisors.map((a) => a.id);
  const advisorPlaceholders = advisorIds.map(() => "?").join(",");

  // ---------------- DATE + STATUS + ADVISOR QUERY ----------------
  const [rows] = await pool.execute(
    `SELECT
        l.advisor_id,
        DAY(l.enquiryTime) AS day,
        l.status,
        COUNT(l.id) AS total
     FROM leads l
     WHERE MONTH(l.enquiryTime) = ?
       AND YEAR(l.enquiryTime) = ?
       AND l.advisor_id IN (${advisorPlaceholders})
     GROUP BY
       l.advisor_id,
       DAY(l.enquiryTime),
       l.status
     ORDER BY
       l.advisor_id ASC,
       DAY(l.enquiryTime) ASC`,
    [month, year, ...advisorIds],
  );

  // ---------------- CREATE ADVISOR STRUCTURE ----------------
  const adviserMap = {};

  advisors.forEach((advisor) => {
    adviserMap[advisor.id] = {
      adviser_id: advisor.id,
      adviser_name: advisor.adviser_name,

      totals: {
        new: 0,
        kyc: 0,
        rfq: 0,
        hot: 0,
        vehn: 0,
        lost: 0,
        book: 0,
        blank: 0,
        total: 0,
      },

      days: Array.from({ length: totalDaysInMonth }, (_, i) => ({
        day: i + 1,
        new: 0,
        kyc: 0,
        rfq: 0,
        hot: 0,
        vehn: 0,
        lost: 0,
        book: 0,
        blank: 0,
        total: 0,
      })),
    };
  });

  // ---------------- FILL DATA ----------------
  rows.forEach((r) => {
    const adviser = adviserMap[r.advisor_id];

    if (!adviser) return;

    const dayIndex = r.day - 1;
    const dayData = adviser.days[dayIndex];

    const status = r.status?.toUpperCase()?.trim();

    const count = Number(r.total);

    if (status === "NEW") {
      dayData.new += count;
      adviser.totals.new += count;
    } else if (status === "KYC") {
      dayData.kyc += count;
      adviser.totals.kyc += count;
    } else if (status === "RFQ") {
      dayData.rfq += count;
      adviser.totals.rfq += count;
    } else if (status === "HOT") {
      dayData.hot += count;
      adviser.totals.hot += count;
    } else if (status === "VEH-N" || status === "VEHN") {
      dayData.vehn += count;
      adviser.totals.vehn += count;
    } else if (status === "LOST") {
      dayData.lost += count;
      adviser.totals.lost += count;
    } else if (status === "BOOK") {
      dayData.book += count;
      adviser.totals.book += count;
    } else {
      dayData.blank += count;
      adviser.totals.blank += count;
    }

    dayData.total += count;
    adviser.totals.total += count;
  });

  // ---------------- FINAL DATA ----------------
  const data = Object.values(adviserMap);

  // ---------------- TEAM TOTAL ----------------
  const teamTotal = {
    new: 0,
    kyc: 0,
    rfq: 0,
    hot: 0,
    vehn: 0,
    lost: 0,
    book: 0,
    blank: 0,
    total: 0,
  };

  data.forEach((emp) => {
    Object.keys(teamTotal).forEach((key) => {
      teamTotal[key] += emp.totals[key] || 0;
    });
  });

  return {
    success: true,
    month,
    year,
    totalDaysInMonth,
    data,
    teamTotal,
  };
};
