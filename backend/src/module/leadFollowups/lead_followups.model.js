import { hrmsPool, pool } from "../../config/mySqlDB.js"; // apna pool import path adjust kar lena

export const insertMultipleLeadFollowups = async (followupsArray) => {
  if (!Array.isArray(followupsArray) || followupsArray.length === 0) {
    return null;
  }

  const values = followupsArray.map((f) => [
    f.leads_id,
    f.adviser_id,
    f.followup_date,
    f.remark,
  ]);

  const [result] = await pool.query(
    `INSERT INTO lead_followups
     (leads_id, adviser_id, followup_date, remark)
     VALUES ?`,
    [values],
  );

  return result;
};
