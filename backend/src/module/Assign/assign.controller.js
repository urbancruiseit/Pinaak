import emitToHierarchy from "../../socket/EmitHelpers/socketEmitHelper.js";
import { getIO } from "../../socket/socket.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getLeadById } from "../Leads/lead.model.js";

import {
  assignTravelAdvisorToLead,
  findCitiesByZoneIds,
  findTravelAdvisorsByCityId,
  getLeadsByAdvisorId,
  getLeadStatusCountByPresalesId,
  getSwapLeadsByAdvisorId,
  swapTravelAdvisorForLead,
} from "./assign.model.js";
import { findZoneCityRegion } from "./assign.service.js";

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

  const search = req.query.search || "";
  const month = req.query.month || null;
  const year = req.query.year || null;
  const status = req.query.status || null;
  const ageFilter = req.query.ageFilter || null;
  const daysFilter = req.query.daysFilter || null;
  const paxFilter = req.query.paxFilter || null;

  const {
    advisorId: scopeAdvisorId,
    zoneAdvisors,
    zoneAdvisorIds,
    cityIds: scopedCityIds,
  } = await findZoneCityRegion(req);

  let cityIds = req.query.cityIds
    ? req.query.cityIds.split(",").map(Number)
    : scopedCityIds;
  let advisorId = scopeAdvisorId;

  const roleName = req.user.role_name?.toLowerCase();
  if (roleName === "city manager") {
    const paramAdvisorId = req.query.advisorId
      ? parseInt(req.query.advisorId, 10)
      : null;

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
    }
  }

  const {
    leads,
    total,
    totalPages,
    selectedMonth,
    selectedYear,
    selectedStatus,
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
    ageFilter,
    daysFilter,
    paxFilter,
  );

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
        selectedStatus,
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

  const result = await swapTravelAdvisorForLead(
    leadId,
    travelAdvisorId,
    req.user.id,
  );

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
    console.error("Socket emit failed:", err.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Travel Advisor swapped successfully"));
});

/**
 * Swap leads listing.
 * - Travel Advisor: sees only leads swapped ONTO them.
 * - City Manager: sees ALL swap leads in their assigned zone's cities
 *   (advisorId passed through as the zone's full advisor array),
 *   unless they explicitly pick one advisor via ?advisorId=.
 */
export const getMySwapLeads = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 50;

  const search = req.query.search || "";
  const month = req.query.month || null;
  const year = req.query.year || null;
  const status = req.query.status || null;
  const ageFilter = req.query.ageFilter || null;
  const daysFilter = req.query.daysFilter || null;
  const paxFilter = req.query.paxFilter || null;
  const liveorexpiry = req.query.liveorexpiry || null;

  const {
    advisorId: scopeAdvisorId,
    zoneAdvisors,
    zoneAdvisorIds,
    cityIds: scopedCityIds,
  } = await findZoneCityRegion(req);

  let cityIds = req.query.cityIds
    ? req.query.cityIds.split(",").map(Number)
    : scopedCityIds;

  let advisorId = scopeAdvisorId;

  const roleName = req.user.role_name?.toLowerCase();
  if (roleName === "city manager") {
    const paramAdvisorId = req.query.advisorId
      ? parseInt(req.query.advisorId, 10)
      : null;

    if (paramAdvisorId) {
      if (!zoneAdvisorIds.includes(paramAdvisorId)) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              null,
              "Access denied: Advisor not in your zone",
            ),
          );
      }
      advisorId = paramAdvisorId;
    }
    // else: advisorId stays as scopeAdvisorId (the zone's full advisor array) —
    // shows ALL swap leads across the zone's cities, same behaviour as /myleads
  }

  const data = await getSwapLeadsByAdvisorId(
    advisorId,
    page,
    limit,
    cityIds,
    search,
    month,
    year,
    status,
    ageFilter,
    daysFilter,
    paxFilter,
    liveorexpiry,
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...data,
        zoneAdvisors,
      },
      data.leads.length ? "Swap leads fetched" : "No swap leads found",
    ),
  );
});

export const getcityByZoneId = asyncHandler(async (req, res) => {
  const zoneId = Number(req.query.zoneId);

  if (!zoneId) {
    return res.status(400).json(new ApiError(400, "zoneId is required"));
  }

  const cities = await findCitiesByZoneIds(zoneId);

  const cityData = cities.map((city) => ({
    id: city.id,
    city_name: city.city_name,
  }));

  return res
    .status(201)
    .json(new ApiResponse(201, cityData, "get successfully citys"));
});

export {
  getTravelAdvisorsByCityId,
  assignTravelAdvisor,
  getMyAssignedLeads,
  LeadStatusCountByPresalesId,
};
