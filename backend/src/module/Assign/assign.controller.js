import emitToHierarchy from "../../socket/EmitHelpers/socketEmitHelper.js";
import { getIO } from "../../socket/socket.js";
import { hrmsPool } from "../../config/mySqlDB.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getLeadById } from "../Leads/lead.model.js";

import {
  assignTravelAdvisorToLead,
  findTravelAdvisorsByCityId,
  getLeadsByAdvisorId,
  getLeadStatusCountByPresalesId,
  swapTravelAdvisorForLead,
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

  const fullLead = await getLeadById(leadId);

  try {
    const io = getIO();

    emitToHierarchy({
      io,
      eventName: "leadUpdated",
      lead: fullLead ?? result,
      userIdKey: "advisor_id",
    });

    // ✅ Advisor — adviserLeadAssigned (naya row add)
    if (fullLead?.advisor_id) {
      io.to(`user_${fullLead.advisor_id}`).emit(
        "adviserLeadAssigned",
        fullLead,
      );
      console.log(
        `📡 adviserLeadAssigned emitted to user_${fullLead.advisor_id}`,
      );
    }
  } catch (err) {
    console.error("⚠️ Socket emit failed:", err.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Travel Advisor assigned successfully"));
});

const getMyAssignedLeads = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 50;

  const cityIds = req.query.cityIds
    ? req.query.cityIds.split(",").map(Number)
    : [];
  const search = req.query.search || "";
  const month = req.query.month || null;
  const year = req.query.year || null;
  const status = req.query.status || null; // ✅ already tha

  const roleName = req.user.role_name?.toLowerCase();
  let advisorId = null;
  let zoneAdvisors = [];

  if (roleName === "travel advisor") {
    advisorId = req.user.id;
  } else if (roleName === "city manager") {
    const paramAdvisorId = req.query.advisorId
      ? parseInt(req.query.advisorId, 10)
      : null;

    const zoneIds = req.user.zone_ids;
    let zoneAdvisorIds = [];

    if (zoneIds && zoneIds.length > 0) {
      try {
        const placeholders = zoneIds.map(() => "?").join(",");

        const [acRows] = await hrmsPool.query(
          `SELECT DISTINCT access_control_id
           FROM access_control_zones
           WHERE zone_id IN (${placeholders})`,
          zoneIds,
        );

        const accessControlIds = acRows.map((r) => r.access_control_id);

        if (accessControlIds.length > 0) {
          const acPlaceholders = accessControlIds.map(() => "?").join(",");

          const [empRows] = await hrmsPool.query(
            `SELECT DISTINCT ac.employee_id
             FROM access_control ac
             INNER JOIN users u ON u.id = ac.employee_id
             WHERE ac.id IN (${acPlaceholders})
               AND u.role_id = 34`,
            accessControlIds,
          );

          zoneAdvisorIds = empRows.map((r) => r.employee_id);
        }

        if (zoneAdvisorIds.length > 0) {
          const namePlaceholders = zoneAdvisorIds.map(() => "?").join(",");
          const [advisorUsers] = await hrmsPool.query(
            `SELECT id, aliasName, firstName, middleName, lastName
             FROM users
             WHERE id IN (${namePlaceholders})
               AND role_id = 34`,
            zoneAdvisorIds,
          );

          zoneAdvisors = advisorUsers.map((u) => ({
            id: u.id,
            name: `${u.aliasName || u.firstName || ""} ${u.middleName || ""} ${u.lastName || ""}`.trim(),
          }));
        }
      } catch (err) {
        console.error("Zone advisor fetch failed:", err.message);
      }
    }

    if (paramAdvisorId) {
      if (!zoneAdvisorIds.includes(paramAdvisorId)) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              null,
              "Access denied: Advisor is not in your zone",
            ),
          );
      }
      advisorId = paramAdvisorId;
    } else {
      advisorId = zoneAdvisorIds;
    }
  }

  const {
    leads,
    total,
    totalPages,
    selectedMonth,
    selectedYear,
    selectedStatus, // ✅ add kiya
    statusCounts,
    totalLeads,
    monthlyStats,
  } = await getLeadsByAdvisorId(
    advisorId,
    page,
    limit,
    cityIds,
    search,
    month,
    year,
    status,
  ); // ✅ status pass kiya

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
        selectedStatus, // ✅ add kiya
        statusCounts,
        totalLeads,
        leads,
        monthlyStats,
        zoneAdvisors,
      },
      leads.length
        ? "Assigned leads fetched successfully"
        : "No assigned leads found",
    ),
  );
});

const LeadStatusCountByPresalesId = asyncHandler(async (req, res) => {
  const presaleId = req.user.id;

  const data = await getLeadStatusCountByPresalesId(presaleId);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Lead status count fetched successfully"));
});

export const swapTravelAdvisor = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  const { travelAdvisorId } = req.body;
  if (!travelAdvisorId) {
    throw new ApiError(400, "travelAdvisorId is required");
  }
  const result = await swapTravelAdvisorForLead(leadId, travelAdvisorId);
  if (!result.success) {
    throw new ApiError(404, "Lead not found");
  }
  const fullLead = await getLeadById(leadId);
  try {
    const io = getIO();
    emitToHierarchy({
      io,
      eventName: "leadUpdated",
      lead: fullLead ?? result,
      userIdKey: "advisor_id",
    });
    if (fullLead?.advisor_id) {
      io.to(`user_${fullLead.advisor_id}`).emit("adviserLeadswapped", fullLead);
    }
  } catch (err) {
    console.error("⚠️ Socket emit failed:", err.message);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Travel Advisor swapped successfully"));
});

const getMySwapLeads = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 50;
  const cityIds = req.query.cityIds
    ? req.query.cityIds.split(",").map(Number)
    : [];
  const search = req.query.search || "";
  const month = req.query.month || null;
  const year = req.query.year || null;
  const status = req.query.status || null;
  const roleName = req.user.role_name?.toLowerCase();
  let advisorId = null;
  let zoneAdvisors = [];
  if (roleName === "travel advisor") {
    advisorId = req.user.id;
  } else if (roleName === "city manager") {
    const paramAdvisorId = req.query.advisorId
      ? parseInt(req.query.advisorId, 10)
      : null;

    const zoneIds = req.user.zone_ids;
    let zoneAdvisorIds = [];

    if (zoneIds && zoneIds.length > 0) {
      try {
        const placeholders = zoneIds.map(() => "?").join(",");
        const [acRows] = await hrmsPool.query(
          `SELECT DISTINCT access_control_id
           FROM access_control_zones
           WHERE zone_id IN (${placeholders})`,
          zoneIds,
        );

        const accessControlIds = acRows.map((r) => r.access_control_id);

        if (accessControlIds.length > 0) {
          const acPlaceholders = accessControlIds.map(() => "?").join(",");

          const [empRows] = await hrmsPool.query(
            `SELECT DISTINCT ac.employee_id
             FROM access_control ac
             INNER JOIN users u ON u.id = ac.employee_id
             WHERE ac.id IN (${acPlaceholders})
               AND u.role_id = 34`,
            accessControlIds,
          );

          zoneAdvisorIds = empRows.map((r) => r.employee_id);
        }

        if (zoneAdvisorIds.length > 0) {
          const namePlaceholders = zoneAdvisorIds.map(() => "?").join(",");
          const [advisorUsers] = await hrmsPool.query(
            `SELECT id, aliasName, firstName, middleName, lastName
             FROM users
             WHERE id IN (${namePlaceholders})
               AND role_id = 34`,
            zoneAdvisorIds,
          );

          zoneAdvisors = advisorUsers.map((u) => ({
            id: u.id,
            name: `${u.aliasName || u.firstName || ""} ${u.middleName || ""} ${u.lastName || ""}`.trim(),
          }));
        }
      } catch (err) {
        console.error("Zone advisor fetch failed:", err.message);
      }
    }

    if (paramAdvisorId) {
      if (!zoneAdvisorIds.includes(paramAdvisorId)) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              null,
              "Access denied: Advisor is not in your zone",
            ),
          );
      }
      advisorId = paramAdvisorId;
    } else {
      advisorId = zoneAdvisorIds;
    }
  }

  const {
    leads,
    total,
    totalPages,
    selectedMonth,
    selectedYear,
    selectedStatus, // ✅ add kiya
    statusCounts,
    totalLeads,
    monthlyStats,
  } = await getLeadsByAdvisorId(
    advisorId,
    page,
    limit,
    cityIds,
    search,
    month,
    year,
    status,
  ); // ✅ status pass kiya

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
        selectedStatus, // ✅ add kiya
        statusCounts,
        totalLeads,
        leads,
        monthlyStats,
        zoneAdvisors,
      },
      leads.length ? "swap leads fetched successfully" : "No swap leads found",
    ),
  );
});

export {
  getTravelAdvisorsByCityId,
  assignTravelAdvisor,
  getMySwapLeads,
  getMyAssignedLeads,
  LeadStatusCountByPresalesId,
  swapTravelAdvisorForLead,
};
