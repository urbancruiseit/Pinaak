import { pool } from "../../config/mySqlDB.js";
export const getVehicleManagerByVehNo = async (veh_no) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id FROM vehicle_manager WHERE veh_no = ? LIMIT 1`,
      [veh_no],
    );
    return rows[0] ?? null;
  } catch (error) {
    console.error("getVehicleManagerByveh_no error:", error);
    throw error;
  }
};

// Get vehicle manager entry by id
export const getVehicleManagerById = async (id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM vehicle_manager WHERE id = ? LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  } catch (error) {
    console.error("getVehicleManagerById error:", error);
    throw error;
  }
};

export const createVehicleManagerModel = async (payload) => {
  try {
    const { code, vendor, model, veh_no, garage, reg_date, aging, amenities } =
      payload;

    const [result] = await pool.execute(
      `INSERT INTO vehicle_manager
        (code, vendor, model, veh_no, garage, reg_date, aging, amenities)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        vendor || null,
        model || null,
        veh_no,
        garage || null,
        reg_date || null,
        aging ?? null,
        amenities || null,
      ],
    );

    return {
      id: result.insertId,
      code,
      vendor: vendor || null,
      model: model || null,
      veh_no,
      garage: garage || null,
      reg_date: reg_date || null,
      aging: aging ?? null,
      amenities: amenities || null,
    };
  } catch (error) {
    console.error("createVehicleManagerModel error:", error);
    throw error;
  }
};
export const getAllVehicleManagersModel = async ({
  search = "",
  vendor = "",
  garage = "",
  page = 1,
  limit = 20,
} = {}) => {
  try {
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM vehicle_manager WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) as total FROM vehicle_manager WHERE 1=1`;
    const params = [];
    const countParams = [];

    if (search) {
      query += `
    AND (
      code LIKE ?
      OR vendor LIKE ?
      OR model LIKE ?
      OR veh_no LIKE ?
      OR garage LIKE ?
      OR reg_date LIKE ?
      OR aging LIKE ?
    )
  `;

      countQuery += `
    AND (
      code LIKE ?
      OR vendor LIKE ?
      OR model LIKE ?
      OR veh_no LIKE ?
      OR garage LIKE ?
      OR reg_date LIKE ?
      OR aging LIKE ?
    )
  `;

      const likeSearch = `%${search}%`;

      params.push(
        likeSearch,
        likeSearch,
        likeSearch,
        likeSearch,
        likeSearch,
        likeSearch,
        likeSearch,
      );

      countParams.push(
        likeSearch,
        likeSearch,
        likeSearch,
        likeSearch,
        likeSearch,
        likeSearch,
        likeSearch,
      );
    }

    if (vendor) {
      query += ` AND vendor = ?`;
      countQuery += ` AND vendor = ?`;
      params.push(vendor);
      countParams.push(vendor);
    }

    if (garage) {
      query += ` AND garage = ?`;
      countQuery += ` AND garage = ?`;
      params.push(garage);
      countParams.push(garage);
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
    console.error("getAllVehicleManagersModel error:", error);
    throw error;
  }
};

// =====================================================
// GET VEHICLE MASTER CODES (ab amenities bhi sath aayenge,
// taaki jab code select ho, uske amenities pata chal sake)
// =====================================================

export const getVehicleMasterCodesModel = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT code, amenities
      FROM vehicle_master
      WHERE code IS NOT NULL
        AND code != ''
      ORDER BY code ASC
    `);

    return rows;
  } catch (error) {
    console.error("getVehicleMasterCodesModel error:", error);

    throw error;
  }
};

// =====================================================
// GET UNIQUE AMENITIES LIST (checkboxes ke liye)
// vehicle_master.amenities column me comma-separated
// values hoti hain (e.g. "AC,Music System,Charging Port")
// isliye sab rows le kar, split kar ke, unique nikaal rahe hain
// =====================================================

export const getVehicleMasterAmenitiesModel = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT amenities
      FROM vehicle_master
      WHERE amenities IS NOT NULL
        AND amenities != ''
    `);

    const amenitiesSet = new Set();

    rows.forEach((row) => {
      if (row.amenities) {
        row.amenities
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a.length > 0)
          .forEach((a) => amenitiesSet.add(a));
      }
    });

    const uniqueAmenities = Array.from(amenitiesSet)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ name }));

    return uniqueAmenities;
  } catch (error) {
    console.error("getVehicleMasterAmenitiesModel error:", error);

    throw error;
  }
};

// =====================================================
// GET VENDORS
// =====================================================

export const getVehicleManagerVendorsModel = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT name
      FROM vendors
      WHERE name IS NOT NULL
        AND name != ''
      ORDER BY name ASC
    `);

    return rows;
  } catch (error) {
    console.error("getVehicleManagerVendorsModel error:", error);

    throw error;
  }
};
