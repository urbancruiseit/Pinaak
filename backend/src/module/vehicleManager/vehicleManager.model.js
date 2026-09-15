import { hrmsPool, pool } from "../../config/mySqlDB.js";

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

export const getVehicleManagerById = async (id) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT
        vm.id,
        vm.code,
        vm.vendor,
        vm.model,
        vm.veh_no,
        vm.garage,
        vm.city,
        vm.reg_date,
        vm.aging,
        vm.amenities,
        vm.status,

        vmst.seat,
        vmst.variant,
        vmst.category,
        vmst.config

      FROM vehicle_manager vm

      LEFT JOIN vehicle_master vmst
        ON vm.code = vmst.code

      WHERE vm.id = ?

      LIMIT 1
      `,
      [id],
    );

    if (!rows[0]) {
      return null;
    }

    const vehicle = rows[0];

    // =================================================
    // GET CITY NAME FROM HRMS DB
    // =================================================

    let cityName = null;

    if (
      vehicle.city !== null &&
      vehicle.city !== undefined &&
      vehicle.city !== ""
    ) {
      const [cityRows] = await hrmsPool.execute(
        `
        SELECT id, city_name
        FROM city
        WHERE id = ?
        LIMIT 1
        `,
        [vehicle.city],
      );

      cityName = cityRows[0]?.city_name ?? null;
    }

    // =================================================
    // RETURN SAME DATA NEEDED BY TABLE
    // =================================================

    return {
      id: vehicle.id,

      code: vehicle.code,

      seat: vehicle.seat ?? null,

      category: vehicle.category ?? null,

      variant: vehicle.variant ?? null,

      city: vehicle.city ?? null,

      city_name: cityName,

      vendor: vehicle.vendor ?? null,

      garage: vehicle.garage ?? null,

      veh_no: vehicle.veh_no ?? null,

      reg_date: vehicle.reg_date ?? null,

      aging: vehicle.aging ?? null,

      amenities: vehicle.amenities ?? null,

      status: vehicle.status ?? "Active",

      // Optional fields agar database mein hain
      config: vehicle.config ?? null,
      model: vehicle.model ?? null,
    };
  } catch (error) {
    console.error("getVehicleManagerById error:", error);
    throw error;
  }
};

export const createVehicleManagerModel = async (payload) => {
  try {
    const {
      code,
      vendor,
      model,
      veh_no,
      garage,
      city,
      reg_date,
      aging,
      amenities,
    } = payload;

    const [result] = await pool.execute(
      `INSERT INTO vehicle_manager
        (code, vendor, model, veh_no, garage, city, reg_date, aging, amenities)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        vendor || null,
        model || null,
        veh_no,
        garage || null,
        city || null,
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
      city: city || null,
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
  city = "",
  year = "",
  seat = "",
  variant = "",
  category = "",
  code = "",
  page = 1,
  limit = 20,
} = {}) => {
  try {
    const offset = (page - 1) * limit;

    let query = `
      SELECT vm.*, vmst.seat, vmst.variant, vmst.category, vmst.config
      FROM vehicle_manager vm
      LEFT JOIN vehicle_master vmst ON vm.code = vmst.code
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total
      FROM vehicle_manager vm
      LEFT JOIN vehicle_master vmst ON vm.code = vmst.code
      WHERE 1=1
    `;
    const params = [];
    const countParams = [];

    // Helper: comma-separated string ko clean array me convert karta hai
    const toArray = (val, isNumeric = false) =>
      String(val)
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v !== "")
        .map((v) => (isNumeric ? Number(v) : v))
        .filter((v) => !isNumeric || !isNaN(v));

    // Helper: dono query me IN (...) clause add karta hai
    const addInClause = (column, values) => {
      const placeholders = values.map(() => "?").join(",");
      query += ` AND ${column} IN (${placeholders})`;
      countQuery += ` AND ${column} IN (${placeholders})`;
      params.push(...values);
      countParams.push(...values);
    };

    if (search) {
      query += `
        AND (
          vm.code LIKE ?
          OR vm.vendor LIKE ?
          OR vm.model LIKE ?
          OR vm.veh_no LIKE ?
          OR vm.garage LIKE ?
          OR vm.reg_date LIKE ?
          OR vm.aging LIKE ?
        )
      `;
      countQuery += `
        AND (
          vm.code LIKE ?
          OR vm.vendor LIKE ?
          OR vm.model LIKE ?
          OR vm.veh_no LIKE ?
          OR vm.garage LIKE ?
          OR vm.reg_date LIKE ?
          OR vm.aging LIKE ?
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

    // ---- Multi-select filters (comma-separated values ke liye) ----

    if (vendor) {
      const vendors = toArray(vendor);
      if (vendors.length > 0) addInClause("vm.vendor", vendors);
    }

    if (garage) {
      const garages = toArray(garage);
      if (garages.length > 0) addInClause("vm.garage", garages);
    }

    if (city) {
      const cities = toArray(city, true); // numeric
      if (cities.length > 0) addInClause("vm.city", cities);
    }

    if (year) {
      const years = toArray(year, true); // numeric
      if (years.length > 0) addInClause("YEAR(vm.reg_date)", years);
    }

    if (code) {
      const codes = toArray(code);
      if (codes.length > 0) addInClause("vm.code", codes);
    }

    if (seat) {
      const seats = toArray(seat);
      if (seats.length > 0) addInClause("vmst.seat", seats);
    }

    if (variant) {
      const variants = toArray(variant);
      if (variants.length > 0) addInClause("vmst.variant", variants);
    }

    if (category) {
      const categories = toArray(category);
      if (categories.length > 0) addInClause("vmst.category", categories);
    }

    query += ` ORDER BY vm.id ASC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.execute(query, params);
    const [countRows] = await pool.execute(countQuery, countParams);

    // ---- City name doosre DB se fetch karo ----
    const cityIds = [
      ...new Set(
        rows.map((r) => r.city).filter((id) => id !== null && id !== undefined),
      ),
    ];

    let cityMap = {};

    if (cityIds.length > 0) {
      const placeholders = cityIds.map(() => "?").join(",");
      const [cityRows] = await hrmsPool.execute(
        `SELECT id, city_name FROM city WHERE id IN (${placeholders})`,
        cityIds,
      );

      cityMap = cityRows.reduce((acc, c) => {
        acc[c.id] = c.city_name;
        return acc;
      }, {});
    }

    const dataWithCityName = rows.map((r) => ({
      ...r,
      city_name: cityMap[r.city] ?? null,
    }));

    return {
      data: dataWithCityName,
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

export const getAllCitiesModel = async () => {
  try {
    const [rows] = await hrmsPool.execute(
      `SELECT id, city_name FROM city ORDER BY city_name ASC`,
    );

    return rows;
  } catch (error) {
    console.error("getAllCitiesModel error:", error);
    throw error;
  }
};

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

export const updateVehicleManagerStatusModel = async ({ id, status }) => {
  try {
    if (!id) {
      throw new Error("id is required");
    }

    if (!status) {
      throw new Error("status is required");
    }

    const query = `UPDATE vehicle_manager SET status = ? WHERE id = ?`;
    const [result] = await pool.execute(query, [status, id]);

    if (result.affectedRows === 0) {
      return null; // record not found
    }

    const [rows] = await pool.execute(
      `SELECT * FROM vehicle_manager WHERE id = ?`,
      [id],
    );

    return rows[0];
  } catch (error) {
    console.error("updateVehicleManagerStatusModel error:", error);
    throw error;
  }
};

export const getVehicleVariantByCodeModel = async (code) => {
  try {
    console.log(" code.........", code);
    const [rows] = await pool.execute(
      `
        SELECT code, variant
        FROM vehicle_master
        WHERE code = ?
        LIMIT 1
      `,
      [code],
    );

    if (rows.length === 0) {
      return null;
    }

    let variant = rows[0].variant;

    // JSON string ko actual JSON me convert karo
    if (typeof variant === "string") {
      try {
        variant = JSON.parse(variant);
      } catch (error) {
        variant = [];
      }
    }

    return {
      code: rows[0].code,
      variant: variant || [],
    };
  } catch (error) {
    console.error("getVehicleVariantByCodeModel error:", error);
    throw error;
  }
};
