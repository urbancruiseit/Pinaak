// models/websiteGac.model.js

import { pool } from "../../config/mySqlDB.js";

// ─── GET All Records ───────────────────────────────────────────────────────────
export const getAllWebsiteGac = async () => {
  try {
    // Check if table exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'website_gac'");
    if (tables.length === 0) {
      return [];
    }

    const [rows] = await pool.execute(
      `SELECT 
         id,
         name,
         country_code,
         phone,
         city,
         created_at
       FROM website_gac
       ORDER BY created_at DESC`,
    );

    if (rows.length > 0) {
      console.log("📝 Sample record:", rows[0]);
    }

    return rows;
  } catch (error) {
    console.error("❌ Model Error (getAll):", error.message);
    throw error;
  }
};

// ─── GET Single Record By ID ───────────────────────────────────────────────────
export const getWebsiteGacById = async (id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
         id,
         name,
         country_code,
         phone,
         city,
         created_at
       FROM website_gac
       WHERE id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    console.error("❌ Model Error (getById):", error.message);
    throw error;
  }
};

export const getAllTripBookings = async () => {
  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'trip_bookings'"); // ✅ s added
    if (tables.length === 0) {
      console.error("❌ Table 'trip_bookings' does not exist");
      return [];
    }

    const [rows] = await pool.execute(
      `SELECT 
        id,
        firstName,
        middleName,
        lastName,
        customerPhone,
        country_code,
        customerEmail,
        message,
        pickupAddress,
        pickup_date,
        dropAddress,
        drop_date,
        itinerary,
        passengerTotal,
        baggageTotal,
        vehicle_category,
        vehicle_model,
        city,
        created_at
      FROM trip_bookings
      ORDER BY created_at DESC`  // ✅ s added
    );

    console.log("📊 Total rows fetched:", rows.length);
    if (rows.length > 0) console.log("📝 Sample record:", rows[0]);

    return rows;
  } catch (error) {
    console.error("❌ Model Error (getAllTripBookings):", error.message);
    throw error;
  }
};

export const getTripBookingById = async (id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        id,
        firstName,
        middleName,
        lastName,
        customerPhone,
        country_code,
        customerEmail,
        message,
        pickupAddress,
        pickup_date,
        dropAddress,
        drop_date,
        itinerary,
        passengerTotal,
        baggageTotal,
        vehicle_category,
        vehicle_model,
        city,
        created_at
      FROM trip_bookings
      WHERE id = ?`,  // ✅ s added
      [id]
    );

    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error("❌ Model Error (getTripBookingById):", error.message);
    throw error;
  }
};