import { pool } from "../../config/mySqlDB.js";

export const getLeadReport = async (month, year) => {
  try {
    const query = `
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
      LEFT JOIN customers c 
      ON l.customer_id = c.id
      WHERE MONTH(l.created_at) = ?
      AND YEAR(l.created_at) = ?
      ORDER BY l.id DESC
    `;

    const [rows] = await pool.execute(query, [month, year]);

    if (!rows.length) return [];

    // advisor & presales name fetch
    const userIds = [
      ...new Set(
        rows
          .flatMap((lead) => [lead.advisor_id, lead.presales_id])
          .filter(Boolean),
      ),
    ];

    let userMap = {};

    if (userIds.length > 0) {
      try {
        const placeholders = userIds.map(() => "?").join(",");

        const [users] = await hrmsPool.query(
          `
          SELECT 
            id,
            aliasName,
            firstName,
            middleName,
            lastName,
            shortName
          FROM users
          WHERE id IN (${placeholders})
          `,
          userIds,
        );

        users.forEach((u) => {
          userMap[u.id] = u;
        });
      } catch (err) {
        console.error("HRMS User Fetch Error:", err.message);
      }
    }

    const finalData = rows.map((lead) => {
      const advisor = userMap[lead.advisor_id];
      const presales = userMap[lead.presales_id];

      return {
        ...lead,

        advisorFullName: advisor?.aliasName?.trim() || null,

        presalesFullName: presales?.shortName?.trim() || null,
      };
    });

    return finalData;
  } catch (error) {
    console.error("getLeadReport Error:", error);
    return [];
  }
};
