import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  assignTravelAdvisorToLead,
  findTravelAdvisorsByCityId,
  getLeadsByAdvisorId,
} from "./assign.model.js";

const getTravelAdvisorsByCityId = asyncHandler(async (req, res) => {
  const { cityId } = req.params;
  console.log("advisor city Idd", cityId);
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
  console.log(" leadId ", leadId);
  console.log(" travelAdvisorId ", travelAdvisorId);
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
  const offset = (page - 1) * limit;
  const userId = req.user.id;
  console.log(" page ", page);
  const { leads, totalCount } = await getLeadsByAdvisorId(
    userId,
    limit,
    offset,
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        leads,
      },
      leads.length
        ? "Assigned leads fetched successfully"
        : "No assigned leads found",
    ),
  );
});

export { getTravelAdvisorsByCityId, assignTravelAdvisor, getMyAssignedLeads };
