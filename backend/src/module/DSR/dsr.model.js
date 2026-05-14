import { pool } from "../../config/mySqlDB.js";

export const createDsr = async (payload) => {
  const {
    leadId,
    customerId,
    advisorId,
    telesales,
    dsrDate,
    fullName,
    bookingId,
    dsrVehicles,
    dsrCategory,
    vehNo,
    driver,
    vendorName,
    customerRate,
    customerToll,
    parkTax,
    gstAmt,
    total,
    bookingAmount,
    otherAmount,
    bankName,
    amountReceived,
    tds,
    remainingAmount,
    vendorRate,
    vendorToll,
    vendorParkTax,
    customerToVendor,
    outstanding,
    paymentStatus,
    balanceAmount,
    rate,
    pay,
    finalBalance,
    before,
    final,
    gst,
    remarksTS,
    remarksMIS,
  } = payload;

  if (!leadId) throw new Error("Lead ID is required");
  if (!customerId) throw new Error("Customer ID is required");
  if (!dsrDate) throw new Error("DSR Date is required");

  try {
    const [result] = await pool.execute(
      `INSERT INTO dsrs (
        lead_id, customer_id, advisor_id, telesales, dsr_date, full_name,
        booking_id, dsr_vehicles, dsr_category, veh_no, driver, vendor_name,
        customer_rate, customer_toll, park_tax, gst_amt, total,
        booking_amount, other_amount, bank_name, amount_received, tds,
        remaining_amount, vendor_rate, vendor_toll, vendor_park_tax,
        customer_to_vendor, outstanding, payment_status, balance_amount,
        rate, pay, final_balance, before_amt, final_amt, gst,
        remarks_ts, remarks_mis, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, NOW()
      )`,
      [
        leadId, customerId, advisorId ?? null, telesales ?? null,
        dsrDate, fullName ?? null, bookingId ?? null,
        dsrVehicles ?? null, dsrCategory ?? null, vehNo ?? null,
        driver ?? null, vendorName ?? null, customerRate ?? null,
        customerToll ?? null, parkTax ?? null, gstAmt ?? null,
        total ?? null, bookingAmount ?? null, otherAmount ?? null,
        bankName ?? null, amountReceived ?? null, tds ?? null,
        remainingAmount ?? null, vendorRate ?? null, vendorToll ?? null,
        vendorParkTax ?? null, customerToVendor ?? null, outstanding ?? null,
        paymentStatus ?? null, balanceAmount ?? null, rate ?? null,
        pay ?? null, finalBalance ?? null, before ?? null,
        final ?? null, gst ?? null, remarksTS ?? null, remarksMIS ?? null,
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error("DSR creation failed");
    }

    return { success: true, dsrId: result.insertId };
  } catch (error) {
    console.error("createDsr error:", error);
    throw error;
  }
};

export const getDsrByLeadId = async (leadId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id FROM dsrs WHERE lead_id = ? LIMIT 1`,
      [leadId]
    );
    return rows[0] ?? null;
  } catch (error) {
    console.error("getDsrByLeadId error:", error);
    throw error;
  }
};