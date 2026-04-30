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
  const userId = req.user.id;

  const cityIds = req.query.cityIds
    ? req.query.cityIds.split(",").map(Number)
    : [];
  const search = req.query.search || "";
  const month = req.query.month || null;
  const year = req.query.year || null;

  const {
    leads,
    total,
    totalPages,
    selectedMonth,
    selectedYear,
    statusCounts,
    totalLeads,
    monthlyStats,
  } = await getLeadsByAdvisorId(userId, page, limit, cityIds, search, month, year);

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
