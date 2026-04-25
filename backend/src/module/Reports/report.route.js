import express from "express";
import { getLeadCountByDateForYearController, monthlyEnquiryReport } from "./report.controller.js";

const router = express.Router();

router.get("/monthly-enquiry", monthlyEnquiryReport);
router.get("/leads/count-by-date", getLeadCountByDateForYearController);

export default router;