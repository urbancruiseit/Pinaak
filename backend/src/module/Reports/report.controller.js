import {
  getLeadCountByDateForYear,
  getMonthlyEnquiry,
  getPreSalesLeadAssignmentReport,
} from "./report.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { hrmsPool } from "../../config/mySqlDB.js";

export const monthlyEnquiryReport = async (req, res) => {
  try {
    const year = req.query.year
      ? parseInt(req.query.year)
      : new Date().getFullYear();

    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({
        success: false,
        message: "Invalid year parameter",
      });
    }

    const data = await getMonthlyEnquiry(year);

    res.json({
      success: true,
      year,
      data: data || [],
    });
  } catch (error) {
    console.error("❌ Report Controller Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

export const getLeadCountByDateForYearController = asyncHandler(
  async (req, res) => {
    const { year } = req.query;

    const result = await getLeadCountByDateForYear(
      year ? parseInt(year) : undefined,
    );

    res
      .status(200)
      .json(new ApiResponse(200, result, "Lead count fetched successfully"));
  },
);

export const getLeadCountByAdviserForMonthController = asyncHandler(
  async (req, res) => {
    const { month, year } = req.query;
    const preSalesUser = req.user;

    let cityIds = [];

    if (
      preSalesUser.subDepartment === "Tele-Sales" &&
      preSalesUser.role === "City Manager"  // ✅ FIXED
    ) {
      const zoneIds = preSalesUser.zone_ids ?? [];

  

      if (zoneIds.length === 0) {
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Zone IDs not found for this user"));
      }

      const placeholders = zoneIds.map(() => "?").join(",");
      const [cities] = await hrmsPool.query(
        `SELECT id FROM city WHERE zone_id IN (${placeholders})`,
        zoneIds
      );

      cityIds = cities.map((c) => c.id);

 

      if (cityIds.length === 0) {
        return res
          .status(200)
          .json(new ApiResponse(200, [], "No cities found in these zones"));
      }
    } else {
      cityIds = preSalesUser.city_ids ?? [];
    }



    const data = await getPreSalesLeadAssignmentReport(
      cityIds,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );

   

    return res.status(200).json(new ApiResponse(200, data, "Success"));
  },
);