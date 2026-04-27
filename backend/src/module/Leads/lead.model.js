import { hrmsPool, pool } from "../../config/mySqlDB.js";
import { generateUUID } from "../../utils/uuid.js";

export const LEAD_TABLE = "leads";
const safe = (value) => (value === undefined ? null : value);

export const LEAD_COLUMNS = {
  ID: "id",
  UUID: "uuid",
  CUSTOMER_ID: "customer_id", // ✅ ADDED
  DATE: "date",
  ENQUIRY_TIME: "enquiryTime",
  FIRST_NAME: "firstName",
  MIDDLE_NAME: "middleName",
  LAST_NAME: "lastName",
  PHONE: "customerPhone",
  EMAIL: "customerEmail",
  COMPANY_NAME: "companyName",
  SOURCE: "source",
  PRESALES_ID: "presales_id",
  STATUS: "status",
  CUSTOMER_TYPE: "customerType",
  CUSTOMER_CATEGORY_TYPE: "customerCategoryType",
  SERVICE_TYPE: "serviceType",
  VEHICLE_vehicle2: "vehicle2",
  VEHICLE_TYPE: "vehicles",
  VEHICLE_vehicle3: "vehicle3",
  REQUIREMENT_VEHICLE: "requirementVehicle",
  OCCASION_TYPE: "occasion",
  PICKUP_DATETIME: "pickupDateTime",
  DROP_DATETIME: "dropDateTime",
  DAYS: "days",
  PICKUP_ADDRESS: "pickupAddress",
  DROP_ADDRESS: "dropAddress",
  MULTIPLE_PICKUP: "multiplepickup",
  MULTIPLE_DROP: "multipledrop",
  PASSENGER_TOTAL: "passengerTotal",
  PETS_NUMBER: "petsNumber",
  PETS_NAMES: "petsNames",
  KM: "km",
  SMALL_BAGGAGE: "smallBaggage",
  MEDIUM_BAGGAGE: "mediumBaggage",
  LARGE_BAGGAGE: "largeBaggage",
  AIRPORT_BAGGAGE: "airportBaggage",
  TOTAL_BAGGAGE: "totalBaggage",
  ITINERARY: "itinerary",
  TRIP_TYPE: "tripType",
  REMARKS: "remarks",
  MESSAGE: "message",
  DROP_CITY: "dropcity",
  PICKUP_CITY: "pickupcity",
  LOST_REASON: "lost_reason",
  ALTERNATE_PHONE: "alternatePhone",
  COUNTRY_NAME: "countryName",
  CITY_ID: "city_id",
  CITY: "city",
  CUSTOMER_CITY: "customerCity",
  VEHICLE1QUANTITY: "vehicle1Quantity",
  VEHICLE2QUANTITY: "vehicle2Quantity",
  VEHICLE3QUANTITY: "vehicle3Quantity",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

export const insertLead = async (data) => {
  try {
    const {
      customer_id,
      date,
      enquiryTime,

      source,
      presales_id,
      status,
      serviceType,
      vehicle2,
      vehicles,
      vehicle3,
      requirementVehicle,
      occasion,
      pickupDateTime,
      dropDateTime,
      days,
      pickupAddress,
      dropAddress,
      multiplepickup,
      multipledrop,
      passengerTotal,
      petsNumber,
      petsNames,
      km,
      smallBaggage,
      mediumBaggage,
      largeBaggage,
      airportBaggage,
      totalBaggage,
      itinerary,
      tripType,
      remarks,
      message,
      dropcity,
      pickupcity,
      lost_reason,
      city_id,
      city,
      vehicle1Quantity,
      vehicle2Quantity,
      vehicle3Quantity,
    } = data;

    const leadUuid = generateUUID();

    // STRING SAFE
    const safe = (v) => (v === "" || v === undefined ? null : v);

    // INTEGER SAFE
    const int = (v) => Number(v) || 0;

    const values = [
      leadUuid,
      int(customer_id),
      safe(date),
      safe(enquiryTime),
      safe(source),
      safe(presales_id),
      safe(status),
      safe(serviceType),
      safe(vehicle2),
      safe(vehicles),
      safe(vehicle3),
      safe(requirementVehicle),
      safe(occasion),
      safe(pickupDateTime),
      safe(dropDateTime),
      int(days),
      safe(pickupAddress),
      safe(dropAddress),
      safe(multiplepickup),
      safe(multipledrop),
      int(passengerTotal),
      int(petsNumber),
      safe(petsNames),
      int(km),
      int(smallBaggage),
      int(mediumBaggage),
      int(largeBaggage),
      int(airportBaggage),
      int(totalBaggage),
      itinerary && Array.isArray(itinerary) ? JSON.stringify(itinerary) : null,
      safe(tripType),
      safe(remarks),
      safe(message),
      safe(dropcity),
      safe(pickupcity),
      safe(lost_reason),
      safe(city_id),
      safe(city),
      int(vehicle1Quantity),
      int(vehicle2Quantity),
      int(vehicle3Quantity),
    ];

    const sql = `
      INSERT INTO ${LEAD_TABLE} (
        ${LEAD_COLUMNS.UUID},
        ${LEAD_COLUMNS.CUSTOMER_ID},
        ${LEAD_COLUMNS.DATE},
        ${LEAD_COLUMNS.ENQUIRY_TIME},
        ${LEAD_COLUMNS.SOURCE},
        ${LEAD_COLUMNS.PRESALES_ID},
        ${LEAD_COLUMNS.STATUS},
        ${LEAD_COLUMNS.SERVICE_TYPE},
        ${LEAD_COLUMNS.VEHICLE_vehicle2},
        ${LEAD_COLUMNS.VEHICLE_TYPE},
        ${LEAD_COLUMNS.VEHICLE_vehicle3},
        ${LEAD_COLUMNS.REQUIREMENT_VEHICLE},
        ${LEAD_COLUMNS.OCCASION_TYPE},
        ${LEAD_COLUMNS.PICKUP_DATETIME},
        ${LEAD_COLUMNS.DROP_DATETIME},
        ${LEAD_COLUMNS.DAYS},
        ${LEAD_COLUMNS.PICKUP_ADDRESS},
        ${LEAD_COLUMNS.DROP_ADDRESS},
         ${LEAD_COLUMNS.MULTIPLE_PICKUP},
          ${LEAD_COLUMNS.MULTIPLE_DROP},
        ${LEAD_COLUMNS.PASSENGER_TOTAL},
        ${LEAD_COLUMNS.PETS_NUMBER},
        ${LEAD_COLUMNS.PETS_NAMES},
        ${LEAD_COLUMNS.KM},
        ${LEAD_COLUMNS.SMALL_BAGGAGE},
        ${LEAD_COLUMNS.MEDIUM_BAGGAGE},
        ${LEAD_COLUMNS.LARGE_BAGGAGE},
        ${LEAD_COLUMNS.AIRPORT_BAGGAGE},
        ${LEAD_COLUMNS.TOTAL_BAGGAGE},
        ${LEAD_COLUMNS.ITINERARY},
        ${LEAD_COLUMNS.TRIP_TYPE},
        ${LEAD_COLUMNS.REMARKS},
        ${LEAD_COLUMNS.MESSAGE},
        ${LEAD_COLUMNS.DROP_CITY},
        ${LEAD_COLUMNS.PICKUP_CITY},
        ${LEAD_COLUMNS.LOST_REASON},
        ${LEAD_COLUMNS.CITY_ID},
         ${LEAD_COLUMNS.CITY},
        ${LEAD_COLUMNS.VEHICLE1QUANTITY},
        ${LEAD_COLUMNS.VEHICLE2QUANTITY},
        ${LEAD_COLUMNS.VEHICLE3QUANTITY}
      )
      VALUES (${values.map(() => "?").join(", ")})
    `;

    const [result] = await pool.execute(sql, values);

    return {
      success: true,
      id: result.insertId,
      uuid: leadUuid,
      customer_id,
      status,
      serviceType,
    };
  } catch (error) {
    console.error("Insert Lead Error:", error);
    throw error;
  }
};

export const createCustomers = async (data) => {
  try {
    // Dynamic duplicate check
    let checkSql = `
      SELECT id, uuid, customerPhone, customerEmail
      FROM customers
      WHERE customerPhone = ?
    `;
    const params = [data.customerPhone];
    if (data.customerEmail) {
      checkSql += ` OR customerEmail = ?`;
      params.push(data.customerEmail);
    }
    checkSql += ` LIMIT 1`;

    const [existing] = await pool.execute(checkSql, params);

    // If customer already exists
    if (existing.length > 0) {
      return {
        success: true,
        isExisting: true,
        message: "Customer already exists",
        customerId: existing[0].id,
        uuid: existing[0].uuid,
        existingCustomer: existing[0],
      };
    }

    // Create new customer
    const customerUuid = generateUUID();
    const insertSql = `
      INSERT INTO customers (
        uuid,
        firstName,
        middleName,
        lastName,
        customerPhone,
        customerEmail,
        companyName,
        customerType,
        customerCategoryType,
        alternatePhone,
        countryName,
        customerCity,
        address,
        date_of_birth,
        anniversary,
        gender,
        state,
        pincode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      customerUuid,
      data.firstName || null,
      data.middleName || null,
      data.lastName || null,
      data.customerPhone || null,
      data.customerEmail || null,
      data.companyName || null,
      data.customerType || null,
      data.customerCategoryType || null,
      data.alternatePhone || null,
      data.countryName || null,
      data.customerCity || null,
      data.address || null,
      data.date_of_birth || null,
      data.anniversary || null,
      data.gender || null,
      data.state || null,
      data.pincode || null,
    ];

    const [result] = await pool.execute(insertSql, values);

    return {
      success: true,
      isExisting: false,
      message: "Customer created successfully",
      customerId: result.insertId,
      uuid: customerUuid,
    };
  } catch (error) {
    console.error("Create Customer Error:", error);
    throw error;
  }
};
export const findLeadByUUID = async (uuid) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM ${LEAD_TABLE} WHERE ${LEAD_COLUMNS.UUID} = ?`,
      [uuid],
    );

    return rows[0] || null;
  } catch (error) {
    console.error("Find Lead Error:", error);
    throw error;
  }
};

// export const getLeads = async (page, limit, cityIds) => {
//   const pageNumber = parseInt(page, 10);
//   const limitNumber = parseInt(limit, 10);
//   const offset = (pageNumber - 1) * limitNumber;

//   // City filter clause
//   let whereClause = `WHERE (l.unwanted_status IS NULL OR l.unwanted_status != 'unwanted')`;
//   let cityValues = [];

//   if (cityIds && cityIds.length > 0) {
//     const placeholders = cityIds.map(() => "?").join(",");
//     whereClause += ` AND l.city_id IN (${placeholders})`;
//     cityValues = [...cityIds];
//   }

//   // Main query with customer JOIN
//   const query = `
//     SELECT
//       l.*,

//       c.uuid AS customer_uuid,
//       CONCAT_WS(' ', c.firstName, c.middleName, c.lastName) AS fullName,
//       c.firstName,
//       c.middleName,
//       c.lastName,
//       c.customerPhone,
//       c.customerEmail,
//       c.companyName,
//       c.customerType,
//       c.customerCategoryType,
//       c.alternatePhone,
//       c.countryName,
//       c.customerCity,
//       c.address,
//       c.date_of_birth,
//       c.anniversary,
//       c.gender,
//       c.state,
//       c.pincode

//     FROM leads l
//     LEFT JOIN customers c ON l.customer_id = c.id
//     ${whereClause}
//     ORDER BY l.created_at DESC
//     LIMIT ? OFFSET ?
//   `;

//   const queryValues = [...cityValues, limitNumber, offset];
//   const [leads] = await pool.query(query, queryValues);

//   // Count query
//   const countQuery = `
//     SELECT COUNT(*) as total
//     FROM leads l
//     LEFT JOIN customers c ON l.customer_id = c.id
//     ${whereClause}
//   `;

//   const [countResult] = await pool.query(countQuery, cityValues);

//   return {
//     leads,
//     total: countResult[0].total,
//     page: pageNumber,
//     totalPages: Math.ceil(countResult[0].total / limitNumber),
//   };
// };

export const getLeads = async (page, limit, cityIds) => {
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const offset = (pageNumber - 1) * limitNumber;

  // City filter clause
  let whereClause = `WHERE (l.unwanted_status IS NULL OR l.unwanted_status != 'unwanted')`;
  let cityValues = [];

  if (cityIds && cityIds.length > 0) {
    const placeholders = cityIds.map(() => "?").join(",");
    whereClause += ` AND l.city_id IN (${placeholders})`;
    cityValues = [...cityIds];
  }

  // Main query
  const query = `
    SELECT 
      l.*,

      c.uuid AS customer_uuid,
      CONCAT_WS(' ', c.firstName, c.middleName, c.lastName) AS fullName,
      c.firstName,
      c.middleName,
      c.lastName,
      c.customerPhone,
      c.customerEmail,
      c.companyName,
      c.customerType,
      c.customerCategoryType,
      c.alternatePhone,
      c.countryName,
      c.customerCity,
      c.address,
      c.date_of_birth,
      c.anniversary,
      c.gender,
      c.state,
      c.pincode

    FROM leads l
    LEFT JOIN customers c ON l.customer_id = c.id
    ${whereClause}
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const queryValues = [...cityValues, limitNumber, offset];
  const [leads] = await pool.query(query, queryValues);

  // Count query
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM leads l
    LEFT JOIN customers c ON l.customer_id = c.id
    ${whereClause}
  `;
  const [countResult] = await pool.query(countQuery, cityValues);

  // ── Advisor + Presales names from hrmsPool (ek hi query mein dono) ─────
  const advisorIds = leads
    .map((l) => l.advisor_id)
    .filter((id) => id !== null && id !== undefined);

  const presalesIds = leads
    .map((l) => l.presales_id)
    .filter((id) => id !== null && id !== undefined);

  // Dono ki unique IDs ek set mein
  const allUserIds = [...new Set([...advisorIds, ...presalesIds])];

  let userMap = {}; // { [user_id]: fullName }

  if (allUserIds.length > 0) {
    try {
      const placeholders = allUserIds.map(() => "?").join(",");
      const [users] = await hrmsPool.query(
        `SELECT id, CONCAT_WS(' ', firstName, middleName, lastName) AS fullName
         FROM users
         WHERE id IN (${placeholders})`,
        allUserIds,
      );

      users.forEach((u) => {
        userMap[u.id] = u.fullName;
      });
    } catch (err) {
      console.error("hrmsPool user fetch failed:", err.message);
    }
  }

  // Har lead mein advisorFullName + presalesFullName attach karo
  const leadsWithNames = leads.map((lead) => ({
    ...lead,
    advisorFullName: userMap[lead.advisor_id] || null,
    presalesFullName: userMap[lead.presales_id] || null,
  }));

  return {
    leads: leadsWithNames,
    total: countResult[0].total,
    page: pageNumber,
    totalPages: Math.ceil(countResult[0].total / limitNumber),
  };
};

export const updateLeadUnwantedStatus = async (leadId, status) => {
  try {
    // validation
    if (!leadId) {
      throw new Error("leadId is required");
    }

    if (!["wanted", "unwanted"].includes(status)) {
      throw new Error("Invalid status value");
    }

    const [result] = await pool.execute(
      `UPDATE leads 
       SET unwanted_status = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, leadId],
    );

    return result;
  } catch (error) {
    console.error("updateLeadUnwantedStatus error:", error);
    throw error;
  }
};

export const getAllUnwantedLeadsModel = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        l.id AS leadId,
        l.unwanted_status,
        l.updated_at,

        c.id AS customerId,

        -- ✅ Full Name add kiya
        TRIM(CONCAT_WS(' ', c.firstName, c.middleName, c.lastName)) AS fullName,

        c.firstName,
        c.middleName,
        c.lastName,

        c.customerPhone,
        c.customerCity

      FROM leads l
      LEFT JOIN customers c 
        ON l.customer_id = c.id

      WHERE l.unwanted_status = 'unwanted'
      ORDER BY l.updated_at DESC
    `);

    return rows;
  } catch (error) {
    console.error("getAllUnwantedLeadsModel error:", error);
    throw error;
  }
};

export const updateLeadById = async (leadId, data) => {
  if (!leadId) throw new Error("Lead ID is required");

  const fields = Object.keys(data);
  if (fields.length === 0) return null;

  // ✅ Array/Object values ko JSON string mein convert karo
  const sanitizedData = {};
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
      sanitizedData[key] = JSON.stringify(value); // Array → '["jhv","hgg"]'
    } else {
      sanitizedData[key] = value;
    }
  }

  const sanitizedFields = Object.keys(sanitizedData);
  const setClause = sanitizedFields.map((key) => `\`${key}\` = ?`).join(", ");
  const values = [...Object.values(sanitizedData), leadId];

  const [result] = await pool.query(
    `UPDATE leads SET ${setClause} WHERE id = ?`,
    values,
  );

  if (result.affectedRows === 0) return null;

  const [rows] = await pool.query(`SELECT * FROM leads WHERE id = ?`, [leadId]);
  return rows[0];
};

// Customer ko id se update karo
export const updateCustomerById = async (customerId, data) => {
  if (!customerId) throw new Error("Customer ID is required");

  const fields = Object.keys(data);
  if (fields.length === 0) return null;

  // ✅ Same sanitization
  const sanitizedData = {};
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
      sanitizedData[key] = JSON.stringify(value);
    } else {
      sanitizedData[key] = value;
    }
  }

  const sanitizedFields = Object.keys(sanitizedData);
  const setClause = sanitizedFields.map((key) => `\`${key}\` = ?`).join(", ");
  const values = [...Object.values(sanitizedData), customerId];

  const [result] = await pool.query(
    `UPDATE customers SET ${setClause} WHERE id = ?`,
    values,
  );

  if (result.affectedRows === 0) return null;

  const [rows] = await pool.query(`SELECT * FROM customers WHERE id = ?`, [
    customerId,
  ]);
  return rows[0];
};

// Lead ko id se fetch karo
export const getLeadById = async (leadId) => {
  const [rows] = await pool.query(`SELECT * FROM leads WHERE id = ?`, [leadId]);
  return rows[0];
};
