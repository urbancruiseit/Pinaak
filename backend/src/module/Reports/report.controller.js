import { getLeadCountByDateForYear, getMonthlyEnquiry } from "./report.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const monthlyEnquiryReport = async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    

    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({
        success: false,
        message: "Invalid year parameter"
      });
    }

  
    const data = await getMonthlyEnquiry(year);
    

    res.json({
      success: true,
      year,
      data: data || []
    });

  } catch (error) {
    console.error("❌ Report Controller Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message
    });
  }
};






export const getLeadCountByDateForYearController = asyncHandler(async (req, res) => {
  const { year } = req.query;

  const result = await getLeadCountByDateForYear(
    year ? parseInt(year) : undefined
  );

  res
    .status(200)
    .json(new ApiResponse(200, result, "Lead count fetched successfully"));
});