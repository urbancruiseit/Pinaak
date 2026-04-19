import { getMonthlyEnquiry } from "./report.model.js";

export const monthlyEnquiryReport = async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    
    console.log("📥 Report Controller - Year:", year);

    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({
        success: false,
        message: "Invalid year parameter"
      });
    }

  
    const data = await getMonthlyEnquiry(year);
    
    console.log("📊 Report Controller - Data count:", data.length);

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