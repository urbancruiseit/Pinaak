// vendor.model.js - Complete working version
import { pool } from "../../config/mySqlDB.js";

const toNull = (val) => (val === "" || val === undefined ? null : val);

export const createVendorModel = async (data) => {
  try {
    // First, let's see what columns we have
    const [columns] = await pool.execute("SHOW COLUMNS FROM vendors");
    const columnNames = columns.map((c) => c.Field);

    // Build dynamic query based on existing columns
    const fields = [];
    const placeholders = [];
    const values = [];

    // Map your data fields to database columns
    const fieldMapping = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      owner_name: data.ownerName,
      owner_phone: data.ownerPhone,
      owner_email: data.ownerEmail,
      company_name: data.companyName,
      company_type: data.companyType,
      company_pan_number: data.companyPanNumber,
      company_registered_number: data.companyRegisteredNumber,
      gst_number: data.gstNumber,
      business_number: data.businessNumber,
      company_state: data?.companyinfo?.companyState,
      company_city: data?.companyinfo?.companyCity,
      registered_address: data.registeredAddress,
      garage_address: data.garageAddress,
      garage_phone: data.garagePhone,
      manager_name1: data.managerName1,
      manager_phone1: data.managerPhone1,
      manager_email1: data.managerEmail1,
      manager_name2: data.managerName2,
      manager_phone2: data.managerPhone2,
      manager_email2: data.managerEmail2,
      short_name: data.shortName,
      cooperative_name: data.cooperativeName,
      cooperative_number: data.cooperativeNumber,
      address: data.address,
      pan_number: data.panNumber, // Only if column exists
      aadhaar_number: data.aadhaarNumber, // Only if column exists
      personal_address: data?.personalInfo?.personalAddress,
      personal_city: data?.personalInfo?.personalCity,
      personal_state: data?.personalInfo?.personalState,
    };

    // Only include fields that exist in database
    for (const [dbField, value] of Object.entries(fieldMapping)) {
      if (
        columnNames.includes(dbField) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        fields.push(dbField);
        placeholders.push("?");
        values.push(toNull(value));
      }
    }

    if (fields.length === 0) {
      throw new Error("No valid fields to insert");
    }

    const query = `INSERT INTO vendors (${fields.join(", ")}) VALUES (${placeholders.join(", ")})`;
  
    const [result] = await pool.execute(query, values);
    return result;
  } catch (error) {
    console.error("Error in createVendorModel:", error);
    throw error;
  }
};

export const updateVendorModel = async (id, data) => {
  try {
    const [columns] = await pool.execute("SHOW COLUMNS FROM vendors");
    const columnNames = columns.map((c) => c.Field);

    const updates = [];
    const values = [];

    const fieldMapping = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      owner_name: data.ownerName,
      owner_phone: data.ownerPhone,
      owner_email: data.ownerEmail,
      company_name: data.companyName,
      company_type: data.companyType,
      company_pan_number: data.companyPanNumber,
      company_registered_number: data.companyRegisteredNumber,
      gst_number: data.gstNumber,
      business_number: data.businessNumber,
      company_state: data?.companyinfo?.companyState,
      company_city: data?.companyinfo?.companyCity,
      registered_address: data.registeredAddress,
      garage_address: data.garageAddress,
      garage_phone: data.garagePhone,
      manager_name1: data.managerName1,
      manager_phone1: data.managerPhone1,
      manager_email1: data.managerEmail1,
      manager_name2: data.managerName2,
      manager_phone2: data.managerPhone2,
      manager_email2: data.managerEmail2,
      short_name: data.shortName,
      cooperative_name: data.cooperativeName,
      cooperative_number: data.cooperativeNumber,
      address: data.address,
      pan_number: data.panNumber,
      aadhaar_number: data.aadhaarNumber,
      personal_address: data?.personalInfo?.personalAddress,
      personal_city: data?.personalInfo?.personalCity,
      personal_state: data?.personalInfo?.personalState,
    };

    for (const [dbField, value] of Object.entries(fieldMapping)) {
      if (
        columnNames.includes(dbField) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        updates.push(`${dbField} = ?`);
        values.push(toNull(value));
      }
    }

    if (updates.length === 0) {
      throw new Error("No valid fields to update");
    }

    values.push(id);
    const query = `UPDATE vendors SET ${updates.join(", ")} WHERE id = ?`;

    const [result] = await pool.execute(query, values);
    return result;
  } catch (error) {
    console.error("Error in updateVendorModel:", error);
    throw error;
  }
};
export const getAllVendorsModel = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        company_name, 
        company_type, 
        gst_number,
        owner_name,
        personal_city,
        personal_state,
        short_name,
     
        created_at,
        updated_at
      FROM vendors 
      ORDER BY id DESC
    `);
    return rows;
  } catch (error) {
    console.error("Error in getAllVendorsModel:", error);
    throw error;
  }
};

// ✅ ADD THIS - Get vendor by ID
export const getVendorByIdModel = async (id) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        company_name, 
        company_type, 
        gst_number,
        owner_name,
        owner_phone,
        owner_email,
        personal_address,
        personal_city,
        personal_state,
        company_state,
        company_city,
        registered_address,
        garage_address,
        garage_phone,
        manager_name1,
        manager_phone1,
        manager_email1,
        manager_name2,
        manager_phone2,
        manager_email2,
        short_name,
        cooperative_name,
        cooperative_number,
        pan_number,
        aadhaar_number,
        status,
        created_at,
        updated_at
      FROM vendors 
      WHERE id = ?
    `,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    // Format the response to match frontend expectations
    const vendor = rows[0];
    return {
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      shortName: vendor.short_name,
      companyName: vendor.company_name,
      companyType: vendor.company_type,
      gstNumber: vendor.gst_number,
      ownerName: vendor.owner_name,
      ownerPhone: vendor.owner_phone,
      ownerEmail: vendor.owner_email,
      status: vendor.status,
      personalInfo: {
        personalAddress: vendor.personal_address,
        personalCity: vendor.personal_city,
        personalState: vendor.personal_state,
      },
      companyinfo: {
        companyState: vendor.company_state,
        companyCity: vendor.company_city,
      },
      registeredAddress: vendor.registered_address,
      garageAddress: vendor.garage_address,
      garagePhone: vendor.garage_phone,
      managerName1: vendor.manager_name1,
      managerPhone1: vendor.manager_phone1,
      managerEmail1: vendor.manager_email1,
      managerName2: vendor.manager_name2,
      managerPhone2: vendor.manager_phone2,
      managerEmail2: vendor.manager_email2,
      cooperativeName: vendor.cooperative_name,
      cooperativeNumber: vendor.cooperative_number,
      panNumber: vendor.pan_number,
      aadhaarNumber: vendor.aadhaar_number,
    };
  } catch (error) {
    console.error("Error in getVendorByIdModel:", error);
    throw error;
  }
};
