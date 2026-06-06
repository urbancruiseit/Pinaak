// models/websiteGac.model.js

import { pool } from "../../config/mySqlDB.js";

// ─── GET All Records ───────────────────────────────────────────────────────────
export const getAllWebsiteGac = async () => {
  try {
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

    return rows;
  } catch (error) {
    throw new Error(`getAllWebsiteGac failed: ${error.message}`);
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

    if (rows.length === 0) return null;

    return rows[0];
  } catch (error) {
    throw new Error(`getWebsiteGacById failed: ${error.message}`);
  }
};

// ─── GET All Trip Bookings ─────────────────────────────────────────────────────
export const getAllTripBookings = async () => {
  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'trip_bookings'");
    if (tables.length === 0) {
      throw new Error("Table 'trip_bookings' does not exist");
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
      ORDER BY created_at DESC`,
    );

    return rows;
  } catch (error) {
    throw new Error(`getAllTripBookings failed: ${error.message}`);
  }
};

// ─── GET Single Trip Booking By ID ────────────────────────────────────────────
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
      WHERE id = ?`,
      [id],
    );

    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    throw new Error(`getTripBookingById failed: ${error.message}`);
  }
};