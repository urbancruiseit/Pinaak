import { pool } from "../../config/mySqlDB.js";

export const VEHICLEMASTER_TABLE = "vehiclemaster"; // ✅ correct table name

export const VEHICLEMASTER_COLUMNS = {
  ID: "id",
  NAME: "name",
  CODE: "code",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

export const getVehicles = async () => {
  try {
    const query = `
      SELECT 
        ${VEHICLEMASTER_COLUMNS.CODE},
        ${VEHICLEMASTER_COLUMNS.NAME}
      FROM ${VEHICLEMASTER_TABLE}
      ORDER BY ${VEHICLEMASTER_COLUMNS.ID} DESC
    `;

    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("❌ Error in getVehicles:", error.message);
    throw error;
  }
};

export const getVehicleByCode = async (code) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id FROM vehicle_master WHERE code = ? LIMIT 1`,
      [code],
    );
    return rows[0] ?? null;
  } catch (error) {
    console.error("getVehicleByCode error:", error);
    throw error;
  }
};
// Get vehicle by id
export const getVehicleById = async (id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM vehicle_master WHERE id = ? LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  } catch (error) {
    console.error("getVehicleById error:", error);
    throw error;
  }
};
// Create vehicle
export const createVehicleModel = async (payload) => {
  try {
    const {
      code,
      seat,
      config,
      category,
      make,
      model,
      variant,
      description,
      amenities,
    } = payload;

    const [result] = await pool.execute(
      `INSERT INTO vehicle_master 
        (code, seat, config, category, make, model, variant, description, amenities) 
       VALUES (?, ?, ?, ?, ?, ?, ?,?,? )`,
      [
        code,
        seat,
        config,
        category,
        make,
        model,
        variant,
        description,
        amenities,
      ],
    );

    return { id: result.insertId, ...payload };
  } catch (error) {
    console.error("createVehicleModel error:", error);
    throw error;
  }
};

// Get all vehicles (with optional search/filter/pagination)
export const getAllVehiclesModel = async ({
  search = "",
  category = "",
  make = "",
  page = 1,
  limit = 20,
} = {}) => {
  try {
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM vehicle_master WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) as total FROM vehicle_master WHERE 1=1`;
    const params = [];
    const countParams = [];

    if (search) {
      query += ` AND (code LIKE ? OR description LIKE ? OR amenities LIKE ?)`;
      countQuery += ` AND (code LIKE ? OR description LIKE ? OR amenities LIKE ?)`;
      const likeSearch = `%${search}%`;
      params.push(likeSearch, likeSearch, likeSearch);
      countParams.push(likeSearch, likeSearch, likeSearch);
    }

    if (category) {
      query += ` AND category = ?`;
      countQuery += ` AND category = ?`;
      params.push(category);
      countParams.push(category);
    }

    if (make) {
      query += ` AND make = ?`;
      countQuery += ` AND make = ?`;
      params.push(make);
      countParams.push(make);
    }

    query += ` ORDER BY id ASC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.execute(query, params);
    const [countRows] = await pool.execute(countQuery, countParams);

    return {
      data: rows,
      total: countRows[0].total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(countRows[0].total / limit),
    };
  } catch (error) {
    console.error("getAllVehiclesModel error:", error);
    throw error;
  }
};
