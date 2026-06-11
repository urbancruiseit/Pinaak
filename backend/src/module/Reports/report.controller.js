import {
  getLeadCountByDateForYear,
  getLongWeekendReport,
  getMonthlyDateWiseStatusReport,
  getMonthlyEnquiry,
  getMonthlyReportTwo,
  getMonthlyStatusWiseReport,
  getPreSalesLeadAssignmentReport,
  getTimeEnquiryReport,
} from "./report.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { hrmsPool } from "../../config/mySqlDB.js";

export const monthlyEnquiryReport = asyncHandler(async (req, res) => {
  const year = req.query.year ? parseInt(req.query.year) : null; // ✅ null = all years

  if (year !== null && (isNaN(year) || year < 2000 || year > 2100)) {
    throw new ApiError(400, "Invalid year parameter");
  }

  // ✅ req.user se city_ids lo
  const cityIds = req.user?.city_ids || [];

  const data = await getMonthlyEnquiry(year, cityIds);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { year: year ?? "all", data: data || [] },
        "Monthly enquiry report fetched successfully",
      ),
    );
});

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
      preSalesUser.role === "City Manager" // ✅ FIXED
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
        zoneIds,
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

export const getMonthlyStatusWiseReportController = asyncHandler(
  async (req, res) => {
    const { month, year } = req.query;
    const user = req.user;

    let cityIds = [];
    let advisorId = null; // ✅ add kiya

    // ---------------- CITY FILTER ----------------
    if (user.role === "Travel Advisor") {
      // ✅ sirf khud ka data
      advisorId = user.id;
    } else if (
      user.subDepartment === "Tele-Sales" &&
      user.role === "City Manager"
    ) {
      const zoneIds = user.zone_ids ?? [];

      if (!zoneIds.length) {
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Zone IDs not found"));
      }

      const placeholders = zoneIds.map(() => "?").join(",");
      const [cities] = await hrmsPool.query(
        `SELECT id FROM city WHERE zone_id IN (${placeholders})`,
        zoneIds,
      );

      cityIds = cities.map((c) => c.id);

      if (!cityIds.length) {
        return res
          .status(200)
          .json(new ApiResponse(200, [], "No cities found"));
      }
    } else {
      cityIds = user.city_ids ?? [];
    }

    const result = await getMonthlyStatusWiseReport(
      cityIds,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
      advisorId, // ✅ pass kiya
    );

    return res.status(200).json(new ApiResponse(200, result, "Success"));
  },
);

export const timeEnquiryReport = async (req, res) => {
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

    const data = await getTimeEnquiryReport(year);

    res.json({
      success: true,
      year,
      data: data || [],
    });
  } catch (error) {
    console.error("❌ Time Enquiry Controller Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

export const getMonthlyDateWiseStatusReportController = asyncHandler(
  async (req, res) => {
    const { month, year } = req.query;
    const user = req.user;

    let cityIds = [];

    if (user.subDepartment === "Tele-Sales" && user.role === "City Manager") {
      const zoneIds = user.zone_ids ?? [];

      if (!zoneIds.length) {
        return res.status(400).json({
          message: "Zone IDs not found",
        });
      }

      const placeholders = zoneIds.map(() => "?").join(",");

      const [cities] = await hrmsPool.query(
        `SELECT id 
         FROM city 
         WHERE zone_id IN (${placeholders})`,
        zoneIds,
      );

      cityIds = cities.map((c) => c.id);
    } else {
      cityIds = user.city_ids ?? [];
    }

    const result = await getMonthlyDateWiseStatusReport(
      cityIds,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  },
);

export const longWeekendReport = asyncHandler(async (req, res) => {
  const year = req.query.year
    ? parseInt(req.query.year)
    : new Date().getFullYear();

  if (isNaN(year) || year < 2000 || year > 2100) {
    throw new ApiError(400, "Invalid year parameter");
  }

  // ✅ req.user se city_ids lo
  const cityIds = req.user?.city_ids || [];

  const data = await getLongWeekendReport(year, cityIds);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { year, data: data || [] },
        "Long weekend report fetched successfully",
      ),
    );
});

export const monthlyreporttwo = asyncHandler(async (req, res) => {
  const year = req.query.year ? parseInt(req.query.year) : null;

  if (year !== null && (isNaN(year) || year < 2000 || year > 2100)) {
    throw new ApiError(400, "Invalid year parameter");
  }

  // req.user se city_ids lo
  const cityIds = req.user?.city_ids || [];
  console.log(
    "📊 Fetching Monthly Report Two for year:",
    year,
    "and cityIds:",
    cityIds,
  );
  const data = await getMonthlyReportTwo(year, cityIds);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { year: year ?? "all", data: data || [] },
        "Monthly report two fetched successfully",
      ),
    );
});
