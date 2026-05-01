import { hrmsPool } from "../../config/mySqlDB.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  assignTravelAdvisorToLead,
  findTravelAdvisorsByCityId,
  getLeadsByAdvisorId,

  getLeadStatusCountByPresalesId,
} from "./assign.model.js";

const getTravelAdvisorsByCityId = asyncHandler(async (req, res) => {
  const { cityId } = req.params;
  if (!cityId) {
    throw new ApiError(400, "cityId is required");
  }

  const users = await findTravelAdvisorsByCityId(cityId);

  if (!users || users.length === 0) {
    throw new ApiError(404, "No Travel Advisors found for this city");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Travel Advisors fetched successfully"));
});

const assignTravelAdvisor = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  const { travelAdvisorId } = req.body;

  if (!travelAdvisorId) {
    throw new ApiError(400, "travelAdvisorId is required");
  }

  const result = await assignTravelAdvisorToLead(leadId, travelAdvisorId);

  if (!result.success) {
    throw new ApiError(404, "Lead not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Travel Advisor assigned successfully"));
});

const getMyAssignedLeads = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 13;

  const cityIds = req.query.cityIds
    ? req.query.cityIds.split(",").map(Number)
    : [];
  const search = req.query.search || "";
  const month = req.query.month || null;
  const year = req.query.year || null;

  const roleName = req.user.role_name?.toLowerCase();
  let advisorId = null;
  let zoneAdvisors = []; // ── advisor id + name list for response

  if (roleName === "travel advisor") {
    // ── Travel Advisor: sirf apne leads ──────────────────────────────────
    advisorId = req.user.id;

  } else if (roleName === "city manager") {
    const paramAdvisorId = req.query.advisorId
      ? parseInt(req.query.advisorId, 10)
      : null;

    // ── Step 1: Zone ke saare advisors nikalo (har case me) ───────────────
    const zoneIds = req.user.zone_ids; // e.g. [1, 2, 3]
    let zoneAdvisorIds = [];

    if (zoneIds && zoneIds.length > 0) {
      try {
        const placeholders = zoneIds.map(() => "?").join(",");

        // zone_ids se access_control_ids nikalo
        const [acRows] = await hrmsPool.query(
          `SELECT DISTINCT access_control_id
           FROM access_control_zones
           WHERE zone_id IN (${placeholders})`,
          zoneIds
        );

        const accessControlIds = acRows.map((r) => r.access_control_id);

        if (accessControlIds.length > 0) {
          const acPlaceholders = accessControlIds.map(() => "?").join(",");

          // access_control_ids se sirf Travel Advisor (role_id = 34) wale employee_ids nikalo
          const [empRows] = await hrmsPool.query(
            `SELECT DISTINCT ac.employee_id
             FROM access_control ac
             INNER JOIN users u ON u.id = ac.employee_id
             WHERE ac.id IN (${acPlaceholders})
               AND u.role_id = 34`,
            accessControlIds
          );

          zoneAdvisorIds = empRows.map((r) => r.employee_id);
        }

        // ── Step 2: Advisor names nikalo HRMS se ─────────────────────────
        if (zoneAdvisorIds.length > 0) {
          const namePlaceholders = zoneAdvisorIds.map(() => "?").join(",");
          const [advisorUsers] = await hrmsPool.query(
            `SELECT id, aliasName, firstName, middleName, lastName
             FROM users
             WHERE id IN (${namePlaceholders})
               AND role_id = 34`,
            zoneAdvisorIds
          );

          zoneAdvisors = advisorUsers.map((u) => ({
            id: u.id,
            name: (
              `${u.aliasName || u.firstName || ""} ${u.middleName || ""} ${u.lastName || ""}`
            ).trim(),
          }));
        }
      } catch (err) {
        console.error("Zone advisor fetch failed:", err.message);
      }
    }

    // ── Step 3: advisorId set karo ────────────────────────────────────────
    if (paramAdvisorId) {
      // Verify: param wala advisor city manager ke zone me hai?
      if (!zoneAdvisorIds.includes(paramAdvisorId)) {
        return res.status(403).json(
          new ApiResponse(403, null, "Access denied: Advisor is not in your zone")
        );
      }
      advisorId = paramAdvisorId; // specific advisor ke leads
    } else {
      advisorId = zoneAdvisorIds; // zone ke saare advisors ke leads
    }
  }

  const {
    leads,
    total,
    totalPages,
    selectedMonth,
    selectedYear,
    statusCounts,
    totalLeads,
    monthlyStats,
  } = await getLeadsByAdvisorId(advisorId, page, limit, cityIds, search, month, year);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        selectedMonth,
        selectedYear,
        statusCounts,
        totalLeads,
        leads,
        monthlyStats,
        zoneAdvisors, // [{id, name}, ...] — city manager ke liye, travel advisor ke liye []
      },
      leads.length
        ? "Assigned leads fetched successfully"
        : "No assigned leads found",
    ),
  );
});



const LeadStatusCountByPresalesId = asyncHandler(async (req, res) => {
  const presaleId = req.user.id;

  // if (req.user.role_name === "Travel Advisor") {
  //   advisorId = req.user.id; // ✅ Current user ka id
  // } else {
  //   advisorId = req.params.advisorId; // ✅ Params se
  // }
  const data = await getLeadStatusCountByPresalesId(presaleId);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Lead status count fetched successfully"));
});

export {
  getTravelAdvisorsByCityId,
  assignTravelAdvisor,
  getMyAssignedLeads,
  
  LeadStatusCountByPresalesId,
};
