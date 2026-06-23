import { hrmsPool, pool } from "../../config/mySqlDB.js";

export const findTravelAdvisorsByCityId = async (cityId) => {
  if (!cityId) throw new Error("City ID is required");

  try {
    const [rows] = await hrmsPool.execute(
      `SELECT 
         u.id,
         u.aliasName,
         u.middleName,
         u.lastName,
         u.is_online
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       INNER JOIN sub_department sd ON u.subDepartment_id = sd.id
       INNER JOIN access_control ac ON ac.employee_id = u.id
       INNER JOIN access_control_cities acc ON acc.access_control_id = ac.id
       WHERE acc.city_id = ?
       AND LOWER(sd.subDepartment_name) = 'tele-sales'
       AND LOWER(r.role_name) = 'travel advisor'
       AND u.is_active = 1`,
      [cityId],
    );

    return rows.map((user) => ({
      id: user.id,
      fullName: [user.aliasName].filter(Boolean).join(" "),
      is_online: user.is_online,
    }));
  } catch (error) {
    console.error("findTravelAdvisorsByCityId error:", error);
    throw error;
  }
};

export const assignTravelAdvisorToLead = async (leadId, travelAdvisorId) => {
  if (!leadId) throw new Error("Lead ID is required");
  if (!travelAdvisorId) throw new Error("Travel Advisor ID is required");

  try {
    const [result] = await pool.execute(
      `UPDATE leads SET advisor_id = ? WHERE id = ?`,
      [travelAdvisorId, leadId],
    );

    if (result.affectedRows === 0) {
      throw new Error("Lead not found");
    }

    return { success: true, leadId, travelAdvisorId };
  } catch (error) {
    console.error("assignTravelAdvisorToLead error:", error);
    throw error;
  }
};

export const getLeadsByAdvisorId = async (
  advisorId,
  page,
  limit,
  cityIds,
  search,
  month,
  year,
  status, // ✅ add kiya
  ageFilter,
  daysFilter,
  paxFilter,
  liveorexpiry,
) => {
  try {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    const now = new Date();
    const selectedMonth = month ? parseInt(month, 10) : null;
    const selectedYear = year ? parseInt(year, 10) : now.getFullYear();

    let whereClause = `WHERE (l.unwanted_status IS NULL OR l.unwanted_status != 'unwanted')`;
    let values = [];

    // ── Advisor filter ────────────────────────────────────────────────────
    if (Array.isArray(advisorId)) {
      if (advisorId.length > 0) {
        const placeholders = advisorId.map(() => "?").join(",");
        whereClause += ` AND l.advisor_id IN (${placeholders})`;
        values.push(...advisorId);
      } else {
        whereClause += ` AND 1 = 0`;
      }
    } else if (advisorId) {
      whereClause += ` AND l.advisor_id = ?`;
      values.push(Number(advisorId));
    } else {
      whereClause += ` AND l.advisor_id IS NOT NULL`;
    }

    if (ageFilter) {
      switch (ageFilter) {
        case "0-5":
          whereClause += ` AND DATEDIFF(CURDATE(), l.date) BETWEEN 0 AND 5`;
          break;

        case "6-10":
          whereClause += ` AND DATEDIFF(CURDATE(), l.date) BETWEEN 6 AND 10`;
          break;
        case "6-10":
          whereClause += ` AND DATEDIFF(CURDATE(), l.date) BETWEEN 6 AND 10`;
          break;
        case "11-15":
          whereClause += ` AND DATEDIFF(CURDATE(), l.date) BETWEEN 11 AND 15`;
          break;
        case "16-30":
          whereClause += ` AND DATEDIFF(CURDATE(), l.date) BETWEEN 16 AND 30`;
          break;
        case "31-60":
          whereClause += ` AND DATEDIFF(CURDATE(), l.date) BETWEEN 31 AND 60`;
          break;

        case "60+":
          whereClause += ` AND DATEDIFF(CURDATE(), l.date) >= 60`;
          break;
      }
    }

    if (daysFilter) {
      if (
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].includes(daysFilter)
      ) {
        whereClause += ` AND l.days = ${Number(daysFilter)}`;
      } else if (daysFilter === "11-15") {
        whereClause += ` AND l.days BETWEEN 11 AND 15`;
      } else if (daysFilter === "16-30") {
        whereClause += ` AND l.days BETWEEN 16 AND 30`;
      } else if (daysFilter === "31-60") {
        whereClause += ` AND l.days BETWEEN 31 AND 60`;
      } else if (daysFilter === "60+") {
        whereClause += ` AND l.days > 60`;
      }
    }

    if (paxFilter) {
      switch (paxFilter) {
        case "1-4":
          whereClause += ` AND l.passengerTotal BETWEEN 1 AND 4`;
          break;

        case "5-7":
          whereClause += ` AND l.passengerTotal BETWEEN 5 AND 7`;
          break;

        case "8-13":
          whereClause += ` AND l.passengerTotal BETWEEN 8 AND 13`;
          break;
        case "14-20":
          whereClause += ` AND l.passengerTotal BETWEEN 14 AND 20`;
          break;
        case "21-30":
          whereClause += ` AND l.passengerTotal BETWEEN 21 AND 30`;
          break;
        case "31-40":
          whereClause += ` AND l.passengerTotal BETWEEN 31 AND 40`;
          break;
        case "41-50":
          whereClause += ` AND l.passengerTotal BETWEEN 41 AND 50`;
          break;
        case "51-60":
          whereClause += ` AND l.passengerTotal BETWEEN 51 AND 60`;
          break;

        case "60+":
          whereClause += ` AND l.passengerTotal > 60`;
          break;
      }
    }

    // ── Year filter ───────────────────────────────────────────────────────
    if (selectedMonth) {
      whereClause += ` AND MONTH(l.pickupDateTime) = ? AND YEAR(l.pickupDateTime) = ?`;
      values.push(selectedMonth, selectedYear);
    } else {
      whereClause += ` AND YEAR(l.pickupDateTime) = ?`;
      values.push(selectedYear);
    }

    // ── City filter ───────────────────────────────────────────────────────
    if (cityIds && cityIds.length > 0) {
      const placeholders = cityIds.map(() => "?").join(",");
      whereClause += ` AND l.city_id IN (${placeholders})`;
      values.push(...cityIds);
    }

    // ── Search filter ─────────────────────────────────────────────────────
    if (search && search.trim()) {
      const like = `%${search.trim()}%`;
      whereClause += ` AND (
        CONCAT_WS(' ', c.firstName, c.middleName, c.lastName) LIKE ?
        OR c.customerEmail LIKE ?
        OR c.customerPhone LIKE ?
        OR c.alternatePhone LIKE ?
      )`;
      values.push(like, like, like, like);
    }

    // ── Status filter ─────────────────────────────────────────────────────
    if (status && status.trim()) {
      whereClause += ` AND UPPER(l.status) = ?`;
      values.push(status.trim().toUpperCase());
    }

    // ✅ Live/Expiry filter — YAHAN lagao
    if (liveorexpiry && liveorexpiry.trim() && liveorexpiry !== "All") {
      if (liveorexpiry.trim().toUpperCase() === "LIVE") {
        whereClause += ` AND l.pickupDateTime > NOW()`;
      } else if (liveorexpiry.trim().toUpperCase() === "EXPIRY") {
        whereClause += ` AND l.pickupDateTime <= NOW()`;
      }
    }

    // ── Main query ────────────────────────────────────────────────────────
    const query = `
      SELECT 
        l.*,
        c.uuid AS customer_uuid,
          DATEDIFF(CURDATE(), l.date) AS aged,
          CASE
  WHEN l.pickupDateTime <= NOW()
  THEN 'EXPIRY'
  ELSE 'LIVE'
END AS liveorexpiry,
        CONCAT_WS(' ', c.firstName, c.middleName, c.lastName) AS fullName,
        c.firstName,
        c.middleName,
        c.lastName,
        c.customerPhone,
        c.customerEmail,
        c.companyName,
        c.customerType,
        c.customerCategoryType,
        c.alternatePhone,
        c.countryName,
        c.customerCity,
        c.address,
        c.date_of_birth,
        c.anniversary,
        c.gender,
        c.state,
        c.pincode
      FROM leads l
      LEFT JOIN customers c ON l.customer_id = c.id
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [leads] = await pool.query(query, [...values, limitNumber, offset]);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM leads l
      LEFT JOIN customers c ON l.customer_id = c.id
      ${whereClause}
    `;
    const [countResult] = await pool.query(countQuery, values);

    // ── Status wise count — status filter ke bina (pure counts) ──────────
    const statusList = ["NEW", "RFQ", "KYC", "HOT", "VEH-N", "LOST", "BOOK"];

    // ✅ statusCounts hamesha bina status filter ke aayega
    const statusCountWhereClause =
      status && status.trim()
        ? whereClause.replace(` AND UPPER(l.status) = ?`, "")
        : whereClause;
    const statusCountValues =
      status && status.trim() ? values.slice(0, -1) : values;

    const statusQuery = `
      SELECT l.status, COUNT(*) as count
      FROM leads l
      LEFT JOIN customers c ON l.customer_id = c.id
      ${statusCountWhereClause}
      GROUP BY l.status
    `;
    const [statusResult] = await pool.query(statusQuery, statusCountValues);

    const statusCounts = {};
    statusList.forEach((s) => {
      statusCounts[s] = 0;
    });
    statusResult.forEach((s) => {
      const key = (s.status || "").toUpperCase();
      if (statusCounts.hasOwnProperty(key)) {
        statusCounts[key] = parseInt(s.count, 10);
      }
    });

    const totalLeads = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    // ── Monthly stats ─────────────────────────────────────────────────────
    let monthlyStatsWhereClause = `WHERE pickupDateTime IS NOT NULL
      AND (unwanted_status IS NULL OR unwanted_status != 'unwanted')`;
    let monthlyStatsValues = [];

    if (Array.isArray(advisorId)) {
      if (advisorId.length > 0) {
        const placeholders = advisorId.map(() => "?").join(",");
        monthlyStatsWhereClause += ` AND advisor_id IN (${placeholders})`;
        monthlyStatsValues.push(...advisorId);
      } else {
        monthlyStatsWhereClause += ` AND 1 = 0`;
      }
    } else if (advisorId) {
      monthlyStatsWhereClause += ` AND advisor_id = ?`;
      monthlyStatsValues.push(Number(advisorId));
    } else {
      monthlyStatsWhereClause += ` AND advisor_id IS NOT NULL`;
    }

    monthlyStatsWhereClause += ` AND YEAR(pickupDateTime) = ?`;
    monthlyStatsValues.push(selectedYear);

    const [monthlyStats] = await pool.query(
      `
      SELECT 
        DATE_FORMAT(pickupDateTime, '%Y-%m') AS month,
        MONTHNAME(pickupDateTime) AS monthName,
        YEAR(pickupDateTime) AS year,
        COUNT(*) AS leadCount
      FROM leads
      ${monthlyStatsWhereClause}
      GROUP BY DATE_FORMAT(pickupDateTime, '%Y-%m'), MONTHNAME(pickupDateTime), YEAR(pickupDateTime)
      ORDER BY month ASC
      `,
      monthlyStatsValues,
    );

    // ── Advisor + Presales names ──────────────────────────────────────────
    const advisorIds = leads
      .map((l) => l.advisor_id)
      .filter((id) => id != null);
    const presalesIds = leads
      .map((l) => l.presales_id)
      .filter((id) => id != null);
    const allUserIds = [...new Set([...advisorIds, ...presalesIds])];
    let userMap = {};

    if (allUserIds.length > 0) {
      try {
        const placeholders = allUserIds.map(() => "?").join(",");
        const [users] = await hrmsPool.query(
          `SELECT id, aliasName, firstName, middleName, lastName, shortName FROM users WHERE id IN (${placeholders})`,
          allUserIds,
        );
        users.forEach((u) => {
          userMap[u.id] = u;
        });
      } catch (err) {
        console.error("hrmsPool user fetch failed:", err.message);
      }
    }

    const getName = (userId, type) => {
      const user = userMap[userId];
      if (!user) return null;
      const first =
        type === "advisor" ? user.aliasName || "" : user.shortName || "";
      return `${first} `.trim() || null;
    };

    const leadsWithNames = leads.map((lead) => ({
      ...lead,
      advisorFullName: getName(lead.advisor_id, "advisor"),
      presalesFullName: getName(lead.presales_id, "presales"),
    }));

    return {
      leads: leadsWithNames,
      total: countResult[0].total,
      page: pageNumber,
      totalPages: Math.ceil(countResult[0].total / limitNumber),
      hasNextPage: pageNumber < Math.ceil(countResult[0].total / limitNumber),
      selectedMonth,
      selectedYear,
      selectedStatus: status ? status.trim().toUpperCase() : null, // ✅ add kiya
      statusCounts,
      totalLeads,
      monthlyStats,
    };
  } catch (error) {
    console.error("getLeadsByAdvisorId error:", error);
    throw error;
  }
};

export const getLeadStatusCountByPresalesId = async (presalesId) => {
  const [rows] = await pool.query(
    `SELECT 
      COUNT(*) AS totalLeads,
      SUM(status = 'NEW') AS new,
      SUM(status = 'KYC') AS kyc,
      SUM(status = 'RFQ') AS rfq,
      SUM(status = 'HOT') AS hot,
      SUM(status = 'VEH-N') AS veh_n,
      SUM(status = 'LOST') AS lost,
      SUM(status = 'BOOK') AS book
    FROM leads
    WHERE presales_id = ?`,
    [presalesId],
  );

  const data = rows[0];

  return {
    totalLeads: data.totalLeads,
    statusCount: {
      NEW: data.new || 0,
      KYC: data.kyc || 0,
      RFQ: data.rfq || 0,
      HOT: data.hot || 0,
      "VEH-N": data.veh_n || 0,
      LOST: data.lost || 0,
      BOOK: data.book || 0,
    },
  };
};

export const swapTravelAdvisorForLead = async (leadId, travelAdvisorId) => {
  if (!leadId) throw new Error("Lead ID is required");
  if (!travelAdvisorId) throw new Error("New Travel Advisor ID is required");

  try {
    const [result] = await pool.execute(
      `UPDATE leads SET advisor_id = ? WHERE id = ?`,
      [travelAdvisorId, leadId],
    );

    if (result.affectedRows === 0) {
      throw new Error("Lead not found");
    }

    return { success: true, leadId, travelAdvisorId };
  } catch (error) {
    console.error("swapTravelAdvisorForLead error:", error);
    throw error;
  }
};

export const findCitiesByZoneIds = async (zoneId) => {
  const [rows] = await hrmsPool.execute(
    `SELECT id, city_name FROM city WHERE zone_id = ?`,
    [zoneId],
  );

  return rows;
};
