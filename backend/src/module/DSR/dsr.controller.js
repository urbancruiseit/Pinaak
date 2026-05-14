import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createDsr as createDsrModel,
  getDsrByLeadId,
} from "../DSR/dsr.model.js";

const createDsr = asyncHandler(async (req, res) => {
  console.log("🔥 createDsr hit!");
  const payload = req.body;

  const { leadId, customerId, dsrDate } = payload;

  if (!leadId || !customerId || !dsrDate) {
    throw new ApiError(400, "leadId, customerId, dsrDate are required");
  }

  const existingDsr = await getDsrByLeadId(leadId);
  if (existingDsr) {
    throw new ApiError(409, "DSR already exists for this lead");
  }

  const result = await createDsrModel(payload);

  return res
    .status(201)
    .json(new ApiResponse(201, result, "DSR created successfully"));
});

export { createDsr };
