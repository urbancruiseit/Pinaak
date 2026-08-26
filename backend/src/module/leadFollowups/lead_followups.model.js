import { hrmsPool, pool } from "../../config/mySqlDB.js";

/**
 * Insert only NEW follow-ups.
 *
 * Agar same:
 *   leads_id
 *   adviser_id
 *   followup_date
 *   remark
 *
 * already database mein exist karta hai,
 * to usko dobara insert nahi karega.
 */
export const insertMultipleLeadFollowups = async (followupsArray) => {
  if (!Array.isArray(followupsArray) || followupsArray.length === 0) {
    return null;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const insertedRows = [];
    const skippedRows = [];

    for (const f of followupsArray) {
      if (!f.leads_id) {
        continue;
      }

      const leadsId = f.leads_id;
      const adviserId = f.adviser_id || null;
      const followupDate = f.followup_date || null;
      const remark = f.remark ? String(f.remark).trim() : "";

      // Required data validation
      if (!followupDate && !remark) {
        continue;
      }

      /**
       * Check whether exactly same follow-up already exists.
       */
      const [existingRows] = await connection.query(
        `
        SELECT id
        FROM lead_followups
        WHERE leads_id = ?
          AND (
            adviser_id = ?
            OR (adviser_id IS NULL AND ? IS NULL)
          )
          AND followup_date = ?
          AND TRIM(COALESCE(remark, '')) = ?
        LIMIT 1
        `,
        [leadsId, adviserId, adviserId, followupDate, remark],
      );

      /**
       * Already exists
       * => DO NOT INSERT AGAIN
       */
      if (existingRows.length > 0) {
        skippedRows.push({
          id: existingRows[0].id,
          leads_id: leadsId,
          followup_date: followupDate,
          remark,
          reason: "Already exists",
        });

        continue;
      }

      /**
       * New follow-up
       * => INSERT
       */
      const [result] = await connection.query(
        `
        INSERT INTO lead_followups
        (
          leads_id,
          adviser_id,
          followup_date,
          remark
        )
        VALUES (?, ?, ?, ?)
        `,
        [leadsId, adviserId, followupDate, remark],
      );

      insertedRows.push({
        id: result.insertId,
        leads_id: leadsId,
        adviser_id: adviserId,
        followup_date: followupDate,
        remark,
      });
    }

    await connection.commit();

    return {
      insertedCount: insertedRows.length,
      skippedCount: skippedRows.length,
      insertedRows,
      skippedRows,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Get all leads
 */
export const getAllLeads = async () => {
  const [leads] = await pool.query(
    `
    SELECT
      leads.id,
      leads.uuid,
      leads.customer_id,

      TRIM(
        CONCAT(
          COALESCE(customers.firstName, ''),
          ' ',
          COALESCE(customers.middleName, ''),
          ' ',
          COALESCE(customers.lastName, '')
        )
      ) AS customer_name,

      leads.advisor_id,
      leads.source,
      leads.status,
      leads.serviceType,
      leads.city_id

    FROM leads

    LEFT JOIN customers
      ON customers.id = leads.customer_id
    `,
  );

  if (leads.length === 0) {
    return [];
  }

  // Advisor IDs
  const advisorIds = [
    ...new Set(leads.map((l) => l.advisor_id).filter(Boolean)),
  ];

  // City IDs
  const cityIds = [...new Set(leads.map((l) => l.city_id).filter(Boolean))];

  let users = [];
  let cities = [];

  /**
   * Get advisors
   */
  if (advisorIds.length > 0) {
    const [rows] = await hrmsPool.query(
      `
      SELECT
        id,
        TRIM(
          CONCAT(
            COALESCE(firstName, ''),
            ' ',
            COALESCE(lastName, '')
          )
        ) AS name

      FROM users

      WHERE id IN (?)
      `,
      [advisorIds],
    );

    users = rows;
  }

  /**
   * Get cities
   */
  if (cityIds.length > 0) {
    const [rows] = await hrmsPool.query(
      `
      SELECT
        id,
        city_name

      FROM city

      WHERE id IN (?)
      `,
      [cityIds],
    );

    cities = rows;
  }

  /**
   * Maps
   */
  const userMap = new Map(users.map((u) => [u.id, u.name]));

  const cityMap = new Map(cities.map((c) => [c.id, c.city_name]));

  /**
   * Merge advisor + city
   */
  return leads.map((lead) => ({
    ...lead,

    advisor_name: userMap.get(lead.advisor_id) || null,

    city_name: cityMap.get(lead.city_id) || null,
  }));
};

/**
 * Get follow-ups of a particular lead
 */
export const getFollowupsByLeadId = async (leads_id) => {
  const [rows] = await pool.query(
    `SELECT 
        lf.followup_date, 
        lf.remark,
        l.status,
        l.lost_reason,
        l.lostReasonDetails
     FROM lead_followups lf
     JOIN leads l ON l.id = lf.leads_id
     WHERE lf.leads_id = ?`,
    [leads_id],
  );

  return rows;
};
