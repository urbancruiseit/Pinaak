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


// ─── GET All Trip Bookings ─────────────────────────────────────────────
export const getAllTripBookings = async () => {
  try {
    // Check if table exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'trip_booking'");
    if (tables.length === 0) {
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
        vehicle_model,
        city,
        created_at
      FROM trip_booking
      ORDER BY created_at DESC`,
    );

    if (rows.length > 0) {
      console.log("📝 Sample record:", rows[0]);
    }

    return rows;
  } catch (error) {
    console.error("❌ Model Error (getAllTripBookings):", error.message);
    throw error;
  }
};

// ─── GET Single Trip Booking By ID ─────────────────────────────────────
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
        vehicle_model,
        city,
        created_at
      FROM trip_booking
      WHERE id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    console.error("❌ Model Error (getTripBookingById):", error.message);
    throw error;
  }
};
