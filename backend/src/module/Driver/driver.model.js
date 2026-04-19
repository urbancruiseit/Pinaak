import { pool } from "../../config/mySqlDB.js";

const toNull = (val) => (val === "" || val === undefined ? null : val);

export const createDriverModel = async (data) => {
  try {
    const [columns] = await pool.execute("SHOW COLUMNS FROM drivers");
    const columnNames = columns.map((c) => c.Field);

    console.log("Available columns:", columnNames);
    console.log("Incoming data:", data);

    // helper to support both flat + nested
    const getValue = (path1, path2) => {
      return path1 ?? path2 ?? null;
    };

    const fieldMapping = {
      // Personal Info
      first_name: getValue(data.firstName, data?.personalInfo?.firstName),
      last_name: getValue(data.lastName, data?.personalInfo?.lastName),
      date_of_birth: getValue(
        data.dateOfBirth,
        data?.personalInfo?.dateOfBirth,
      ),
      gender: getValue(data.gender, data?.personalInfo?.gender),
      email: getValue(data.email, data?.personalInfo?.email),
      phone: getValue(data.phone, data?.personalInfo?.phone),
      emergency_contact: getValue(
        data.emergencyContact,
        data?.personalInfo?.emergencyContact,
      ),
      blood_group: getValue(data.bloodGroup, data?.personalInfo?.bloodGroup),
      vendor: getValue(data.vendor, data?.personalInfo?.vendor),
      vendor_state: getValue(data.vendorState, data?.personalInfo?.vendorState),
      vendor_city: getValue(data.vendorCity, data?.personalInfo?.vendorCity),
      relative_name: getValue(
        data.relativeName,
        data?.personalInfo?.relativeName,
      ),

      // Address Info
      permanent_address: getValue(
        data.permanentAddress,
        data?.addressInfo?.permanentAddress,
      ),
      current_address: getValue(
        data.currentAddress,
        data?.addressInfo?.currentAddress,
      ),
      city: getValue(data.city, data?.addressInfo?.city),
      state: getValue(data.state, data?.addressInfo?.state),
      pincode: getValue(data.pincode, data?.addressInfo?.pincode),

      // License Info
      license_number: getValue(
        data.licenseNumber,
        data?.licenseInfo?.licenseNumber,
      ),
      license_type: getValue(data.licenseType, data?.licenseInfo?.licenseType),
      issuing_authority: getValue(
        data.issuingAuthority,
        data?.licenseInfo?.issuingAuthority,
      ),
      issue_date: getValue(data.issueDate, data?.licenseInfo?.issueDate),
      expiry_date: getValue(data.expiryDate, data?.licenseInfo?.expiryDate),
      experience_details: getValue(
        data.experienceDetails,
        data?.licenseInfo?.experienceDetails,
      ),
      dl_front: getValue(data.dlFront, data?.licenseInfo?.dlFront),
      dl_back: getValue(data.dlBack, data?.licenseInfo?.dlBack),

      // Employment
      employee_id: getValue(data.employeeId, data?.employmentInfo?.employeeId),

      // Documents
      aadhar_card: getValue(data.aadharCard, data?.documents?.aadharCard),
      pan_card: getValue(data.panCard, data?.documents?.panCard),
    };

    const fields = [];
    const placeholders = [];
    const values = [];

    for (const [dbField, value] of Object.entries(fieldMapping)) {
      if (
        columnNames.includes(dbField) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        fields.push(dbField);
        placeholders.push("?");
        values.push(value);
      }
    }

    if (fields.length === 0) {
      console.error("❌ No fields matched. Check mapping.");
      throw new Error("No valid fields to insert into drivers table");
    }

    const query = `
      INSERT INTO drivers (${fields.join(", ")})
      VALUES (${placeholders.join(", ")})
    `;

    console.log("✅ Query:", query);
    console.log("✅ Values:", values);

    const [result] = await pool.execute(query, values);
    return result;
  } catch (error) {
    console.error("❌ Error in createDriverModel:", error);
    throw error;
  }
};

// Optional: Get all drivers
export const getAllDriversModel = async () => {
  try {
    const [rows] = await pool.execute("SELECT * FROM drivers ORDER BY id DESC");
    return rows;
  } catch (error) {
    console.error("Error in getAllDriversModel:", error);
    throw error;
  }
};

// Optional: Get driver by ID
export const getDriverByIdModel = async (id) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM drivers WHERE id = ?", [
      id,
    ]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error in getDriverByIdModel:", error);
    throw error;
  }
};

// Optional: Update driver
export const updateDriverModel = async (id, data) => {
  try {
    const [columns] = await pool.execute("SHOW COLUMNS FROM drivers");
    const columnNames = columns.map((c) => c.Field);

    const updates = [];
    const values = [];

    const fieldMapping = {
      // Personal Information
      first_name: data?.personalInfo?.firstName,
      last_name: data?.personalInfo?.lastName,
      date_of_birth: data?.personalInfo?.dateOfBirth,
      gender: data?.personalInfo?.gender,
      email: data?.personalInfo?.email,
      phone: data?.personalInfo?.phone,
      emergency_contact: data?.personalInfo?.emergencyContact,
      blood_group: data?.personalInfo?.bloodGroup,
      vendor: data?.personalInfo?.vendor,
      vendor_state: data?.personalInfo?.vendorState,
      vendor_city: data?.personalInfo?.vendorCity,

      // Address Information
      permanent_address: data?.addressInfo?.permanentAddress,
      current_address: data?.addressInfo?.currentAddress,
      city: data?.addressInfo?.city,
      state: data?.addressInfo?.state,
      pincode: data?.addressInfo?.pincode,

      // License Information
      license_number: data?.licenseInfo?.licenseNumber,
      license_type: data?.licenseInfo?.licenseType,
      issuing_authority: data?.licenseInfo?.issuingAuthority,
      issue_date: data?.licenseInfo?.issueDate,
      experience_details: data?.licenseInfo?.experienceDetails,
      expiry_date: data?.licenseInfo?.expiryDate,
      dl_front: data?.licenseInfo?.dlFront,
      dl_back: data?.licenseInfo?.dlBack,

      // Employment Information
      employee_id: data?.employmentInfo?.employeeId,

      // Documents
      aadhar_card: data?.documents?.aadharCard,
      pan_card: data?.documents?.panCard,
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
    const query = `UPDATE drivers SET ${updates.join(", ")} WHERE id = ?`;
    console.log("Update Query:", query);

    const [result] = await pool.execute(query, values);
    return result;
  } catch (error) {
    console.error("Error in updateDriverModel:", error);
    throw error;
  }
};

// Optional: Delete driver
export const deleteDriverModel = async (id) => {
  try {
    const [result] = await pool.execute("DELETE FROM drivers WHERE id = ?", [
      id,
    ]);
    return result;
  } catch (error) {
    console.error("Error in deleteDriverModel:", error);
    throw error;
  }
};
