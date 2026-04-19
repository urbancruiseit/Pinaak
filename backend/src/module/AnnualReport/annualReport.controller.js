// E:\Pinnak\PINAK_BACKEND\src\module\AnnualReport\annualReport.controller.js
import { getAnnualReportData } from "./annualReport.model.js";

export const getAnnualReport = async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    
    console.log("📥 Annual Report Controller - Year:", year);

    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({
        success: false,
        message: "Invalid year parameter"
      });
    }

    const data = await getAnnualReportData(year);
    
    console.log("📊 Annual Report Controller - Data received");

    res.json({
      success: true,
      year,
      ...data
    });

  } catch (error) {
    console.error("❌ Annual Report Controller Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message
    });
  }
};