import { pool } from "../../config/mySqlDB.js";

export const COUNTRY_TABLE = "countries";

export const COUNTRY_COLUMNS = {
  ID: "id",
  NAME: "country_name",
  CODE: "country_code",
  PHONE: "phone_code",
  CREATED_AT: "created_at",
};
export const insertCountry = async (data) => {
  const { country_name, country_code, phone_code } = data;

  const sql = `
    INSERT INTO ${COUNTRY_TABLE} 
    (${COUNTRY_COLUMNS.NAME}, ${COUNTRY_COLUMNS.CODE}, ${COUNTRY_COLUMNS.PHONE})
    VALUES (?, ?, ?)
  `;

  const [result] = await pool.execute(sql, [
    country_name,
    country_code,
    phone_code,
  ]);

  return { id: result.insertId, ...data, created_at: new Date() };
};
export const getCountries = async () => {
  const sql = `SELECT * FROM ${COUNTRY_TABLE} ORDER BY ${COUNTRY_COLUMNS.NAME} ASC`;
  const [rows] = await pool.execute(sql);
  return rows;
};

export const getCountryById = async (id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM ${COUNTRY_TABLE} WHERE ${COUNTRY_COLUMNS.ID} = ?`,
      [id],
    );

    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

export const findCountryByCode = async (countryCode) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM ${COUNTRY_TABLE} WHERE ${COUNTRY_COLUMNS.COUNTRY_CODE} = ?`,
      [countryCode],
    );

    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};
export const getAllCountryCodes = async () => {
  const [rows] = await pool.execute(
    `SELECT 
       ${COUNTRY_COLUMNS.COUNTRY_CODE},
       ${COUNTRY_COLUMNS.PHONE_CODE}
     FROM ${COUNTRY_TABLE}`
  );
  return rows;
};
