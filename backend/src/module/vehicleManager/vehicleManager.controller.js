import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createVehicleManagerModel,
  getAllVehicleManagersModel,
  getVehicleManagerById,
  getVehicleManagerByVehNo,
  getVehicleManagerVendorsModel,
  getVehicleMasterCodesModel,
  getVehicleMasterAmenitiesModel,
} from "./vehicleManager.model.js";

const createVehicleManager = asyncHandler(async (req, res) => {
  const payload = req.body;

  const { code, vendor, model, veh_no, garage, reg_date, aging, amenities } =
    payload;

  // Required fields
  if (!code || !veh_no) {
    throw new ApiError(400, "code and veh_no are required");
  }

  // Check duplicate vehicle number
  const existingEntry = await getVehicleManagerByVehNo(veh_no);

  if (existingEntry) {
    throw new ApiError(
      409,
      "Vehicle manager entry already exists for this vehicle number",
    );
  }

  const result = await createVehicleManagerModel({
    code,
    vendor,
    model,
    veh_no,
    garage,
    reg_date,
    aging,
    amenities,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        result,
        "Vehicle manager entry created successfully",
      ),
    );
});

const getVehicleManagerByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "id is required");
  }

  const entry = await getVehicleManagerById(id);

  if (!entry) {
    throw new ApiError(404, "Vehicle manager entry not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, entry, "Vehicle manager entry fetched successfully"),
    );
});

const getAllVehicleManagers = asyncHandler(async (req, res) => {
  const { search, vendor, garage, page, limit } = req.query;

  const result = await getAllVehicleManagersModel({
    search,
    vendor,
    garage,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Vehicle manager entries fetched successfully",
      ),
    );
});

const getVehicleMasterCodes = asyncHandler(async (req, res) => {
  const result = await getVehicleMasterCodesModel();

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Vehicle master codes fetched successfully"),
    );
});

// =====================================================
// GET UNIQUE AMENITIES (vehicle_master se, checkbox ke liye)
// =====================================================

const getVehicleMasterAmenities = asyncHandler(async (req, res) => {
  const result = await getVehicleMasterAmenitiesModel();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Vehicle master amenities fetched successfully",
      ),
    );
});

const getVehicleManagerVendors = asyncHandler(async (req, res) => {
  const result = await getVehicleManagerVendorsModel();

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Vendors fetched successfully"));
});

export {
  getVehicleManagerByIdController,
  createVehicleManager,
  getAllVehicleManagers,
  getVehicleMasterCodes,
  getVehicleMasterAmenities,
  getVehicleManagerVendors,
};
