// models/websiteGac.model.js

import { pool } from "../../config/mySqlDB.js";

// CREATE WEBSITE GAC
export const createWebsiteGac = async ({ name, country_code, phone, city }) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO website_gac
      (name, country_code, phone, city)
      VALUES (?, ?, ?, ?)`,
      [name, country_code, phone, city],
    );

    return {
      id: result.insertId,
      name,
      country_code,
      phone,
      city,
    };
  } catch (error) {
    throw new Error(`createWebsiteGac failed: ${error.message}`);
  }
};

export const getAllWebsiteGac = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT
  id,
  name,
  country_code,
  phone,
  city,
  created_at,
  is_read
FROM website_gac
ORDER BY id DESC
    `);

    return rows;
  } catch (error) {
    throw new Error(`getAllWebsiteGac failed: ${error.message}`);
  }
};

export const createTripBookingModel = async (data) => {
  const [result] = await pool.execute(
    `INSERT INTO trip_bookings
    (
      firstName,
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
      created_at
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`,
    [
      data.full_name,
      data.phone,
      data.country_code,
      data.email,
      data.trip_message,
      data.pickup_address,
      data.pickup_date,
      data.drop_address,
      data.drop_date,
      data.travel_itinerary,
      data.passengers,
      data.baggages,
      data.vehicle_category,
      data.vehicle_model,
    ],
  );

  return result.insertId;
};

// ================= GET ALL TRIP BOOKINGS =================

export const getAllTripBookings = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT
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
      ORDER BY id DESC
    `);

    return rows;
  } catch (error) {
    throw new Error(`getAllTripBookings failed: ${error.message}`);
  }
};

export const markWebsiteGacAsRead = async (id) => {
  try {
    const [result] = await pool.execute(
      `
      UPDATE website_gac
      SET is_read = 1
      WHERE id = ?
      `,
      [id],
    );

    return result;
  } catch (error) {
    throw new Error(`markWebsiteGacAsRead failed: ${error.message}`);
  }
};
