import { hrmsPool, pool } from "../../config/mySqlDB.js";

export const findTravelAdvisorsByCityId = async (cityId) => {
  if (!cityId) throw new Error("City ID is required");

  try {
    const [rows] = await hrmsPool.execute(
      `SELECT 
         u.id,
         u.aliasName,
         u.middleName,
         u.lastName
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
      fullName: [user.aliasName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" "),
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

// export const getLeadsByAdvisorId = async (advisorId, limit, offset) => {
//   try {
//     const [rows] = await pool.query(
//       `
//       SELECT
//         l.*,
//         c.uuid AS customer_uuid,
//         CONCAT_WS(' ', c.firstName, c.middleName, c.lastName) AS fullName,
//         c.firstName,
//         c.middleName,
//         c.lastName,
//         c.customerPhone,
//         c.customerEmail,
//         c.companyName,
//         c.customerType,
//         c.customerCategoryType,
//         c.alternatePhone,
//         c.countryName,
//         c.customerCity,
//         c.address,
//         c.date_of_birth,
//         c.anniversary,
//         c.gender,
//         c.state,
//         c.pincode
//       FROM leads l
//       LEFT JOIN customers c ON l.customer_id = c.id

//       WHERE l.advisor_id = ?
//       ORDER BY l.id DESC
//       LIMIT ? OFFSET ?
//       `,
//       [Number(advisorId), Number(limit), Number(offset)],
//     );

//     const [[{ totalCount }]] = await pool.query(
//       `SELECT COUNT(*) AS totalCount FROM leads WHERE advisor_id = ?`,
//       [Number(advisorId)],
//     );

//     return { leads: rows, totalCount: Number(totalCount) };
//   } catch (error) {
//     console.error("getLeadsByAdvisorId error:", error);
//     throw error;
//   }
// };
export const getLeadsByAdvisorId = async (advisorId, limit, offset) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        l.*,
        c.uuid AS customer_uuid,
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
      WHERE l.advisor_id = ?
      ORDER BY l.id DESC
      LIMIT ? OFFSET ?
      `,
      [Number(advisorId), Number(limit), Number(offset)],
    );

    const [[{ totalCount }]] = await pool.query(
      `SELECT COUNT(*) AS totalCount FROM leads WHERE advisor_id = ?`,
      [Number(advisorId)],
    );

    const [monthlyStats] = await pool.query(
      `
      SELECT 
        DATE_FORMAT(pickupDateTime, '%Y-%m') AS month,
        MONTHNAME(pickupDateTime) AS monthName,
        YEAR(pickupDateTime) AS year,
        COUNT(*) AS leadCount
      FROM leads
      WHERE advisor_id = ?
        AND pickupDateTime IS NOT NULL
      GROUP BY DATE_FORMAT(pickupDateTime, '%Y-%m'), MONTHNAME(pickupDateTime), YEAR(pickupDateTime)
      ORDER BY month DESC
      `,
      [Number(advisorId)],
    );

    // ── Advisor + Presales names from hrmsPool ─────
    const advisorIds = rows
      .map((l) => l.advisor_id)
      .filter((id) => id !== null && id !== undefined);

    const presalesIds = rows
      .map((l) => l.presales_id)
      .filter((id) => id !== null && id !== undefined);

    const allUserIds = [...new Set([...advisorIds, ...presalesIds])];

    let userMap = {};

    if (allUserIds.length > 0) {
      try {
        const placeholders = allUserIds.map(() => "?").join(",");
        const [users] = await hrmsPool.query(
          `SELECT id, CONCAT_WS(' ', aliasName, middleName, lastName) AS fullName
           FROM users
           WHERE id IN (${placeholders})`,
          allUserIds,
        );
        users.forEach((u) => {
          userMap[u.id] = u.fullName;
        });
      } catch (err) {
        console.error("hrmsPool user fetch failed:", err.message);
      }
    }

    // Har lead mein advisorFullName + presalesFullName attach karo
    const leadsWithNames = rows.map((lead) => ({
      ...lead,
      advisorFullName: userMap[lead.advisor_id] || null,
      presalesFullName: userMap[lead.presales_id] || null,
    }));

    return {
      leads: leadsWithNames,
      totalCount: Number(totalCount),
      monthlyStats,
    };
  } catch (error) {
    console.error("getLeadsByAdvisorId error:", error);
    throw error;
  }
};

export const getLeadStatusCountByAdvisorId = async (advisorId) => {
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
    WHERE advisor_id = ?`,
    [advisorId],
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
