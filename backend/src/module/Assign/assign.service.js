import { hrmsPool } from "../../config/mySqlDB.js";

export const findZoneCityRegion = async (req) => {
  const roleName = req.user.role_name?.toLowerCase();
  const sub_department = req.user.subDepartment_name?.toLowerCase();

  let result = {
    advisorId: null,
    zoneAdvisors: [],
    zoneAdvisorIds: [],
    cityIds: [],
    accessDenied: false,
  };
  if (sub_department === "pre-sales") {
    if (roleName === "pre-sales executive") {
      let cityIds = req.user.city_ids || [];
      const paramCityId = req.query.cityId
        ? parseInt(req.query.cityId, 10)
        : null;

      if (paramCityId) {
        cityIds = [paramCityId];
      }

      result.cityIds = cityIds;

      return result;
    }
  } else if (roleName === "travel advisor") {
    result.advisorId = req.user.id;

    const paramCityId = req.query.cityId
      ? parseInt(req.query.cityId, 10)
      : null;

    if (paramCityId) {
      result.cityIds = [paramCityId];
    }

    return result;
  } else if (
    ["city manager", "seo executive"].includes(roleName?.toLowerCase())
  ) {
    let zoneIds = req.user.zone_ids;

    const paramZoneId = req.query.zoneId
      ? parseInt(req.query.zoneId, 10)
      : null;

    if (paramZoneId) {
      const allowedZones = Array.isArray(req.user.zone_ids)
        ? req.user.zone_ids
        : [req.user.zone_ids];

      if (!allowedZones.includes(paramZoneId)) {
        result.accessDenied = true;
        return result;
      }

      zoneIds = [paramZoneId];
    }

    const { zoneAdvisorIds, zoneAdvisors } =
      await findAdvisorsByZoneIds(zoneIds);

    // Zone ki cities
    let cityIds = await findCitiesByZoneId(zoneIds);

    // Frontend se city filter
    const paramCityId = req.query.cityId
      ? parseInt(req.query.cityId, 10)
      : null;

    if (paramCityId) {
      cityIds = [paramCityId];
    }

    result.zoneIds = zoneIds;
    result.zoneAdvisorIds = zoneAdvisorIds;
    result.zoneAdvisors = zoneAdvisors;
    result.cityIds = cityIds;

    // Default sab advisors
    result.advisorId = zoneAdvisorIds;

    // Frontend se advisor filter
    const paramAdvisorId = req.query.advisorId
      ? parseInt(req.query.advisorId, 10)
      : null;

    if (paramAdvisorId) {
      if (!zoneAdvisorIds.includes(paramAdvisorId)) {
        result.accessDenied = true;
        return result;
      }

      result.advisorId = paramAdvisorId;
    }

    return result;
  }
  return result;
};

export const findCitiesByZoneId = async (zoneIds) => {
  try {
    const ids = Array.isArray(zoneIds) ? zoneIds : [zoneIds];

    const [rows] = await hrmsPool.query(
      `SELECT id FROM city WHERE zone_id IN (?)`,
      [ids],
    );

    return rows.map((row) => row.id);
  } catch (error) {
    throw error;
  }
};

export const findAdvisorsByZoneIds = async (zoneIds) => {
  try {
    if (!zoneIds || zoneIds.length === 0) {
      return { zoneAdvisorIds: [], zoneAdvisors: [] };
    }

    // Step 1: Zone -> Access Control IDs
    const placeholders = zoneIds.map(() => "?").join(",");
    const [acRows] = await hrmsPool.query(
      `SELECT DISTINCT access_control_id
       FROM access_control_zones
       WHERE zone_id IN (${placeholders})`,
      zoneIds,
    );

    const accessControlIds = acRows.map((r) => r.access_control_id);

    if (accessControlIds.length === 0) {
      return { zoneAdvisorIds: [], zoneAdvisors: [] };
    }

    // Step 2: Access Control IDs -> Employee IDs (only role 34 = Travel Advisor)
    const acPlaceholders = accessControlIds.map(() => "?").join(",");
    const [empRows] = await hrmsPool.query(
      `SELECT DISTINCT ac.employee_id
       FROM access_control ac
       INNER JOIN users u ON u.id = ac.employee_id
       WHERE ac.id IN (${acPlaceholders})
         AND u.role_id = 34`,
      accessControlIds,
    );

    const zoneAdvisorIds = empRows.map((r) => r.employee_id);

    if (zoneAdvisorIds.length === 0) {
      return { zoneAdvisorIds: [], zoneAdvisors: [] };
    }

    // Step 3: Employee IDs -> Advisor Details (name etc.)
    const namePlaceholders = zoneAdvisorIds.map(() => "?").join(",");
    const [advisorUsers] = await hrmsPool.query(
      `SELECT id, aliasName, firstName, middleName, lastName
       FROM users
       WHERE id IN (${namePlaceholders})
         AND role_id = 34`,
      zoneAdvisorIds,
    );

    const zoneAdvisors = advisorUsers.map((u) => ({
      id: u.id,
      name: `${u.aliasName || ""}`.trim(),
    }));

    return { zoneAdvisorIds, zoneAdvisors };
  } catch (error) {
    console.error("findAdvisorsByZoneIds failed:", error.message);
    return { zoneAdvisorIds: [], zoneAdvisors: [] };
  }
};
