import express from "express";
import {
  getLeadCountByAdviserForMonthController,
  getLeadCountByDateForYearController,
  getMonthlyDateWiseStatusReportController,
  getMonthlyStatusWiseReportController,
  longWeekendReport,
  monthlyEnquiryReport,
  timeEnquiryReport,
} from "./report.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/monthly-enquiry", monthlyEnquiryReport);
router.get("/leads/count-by-date", getLeadCountByDateForYearController);
router.get(
  "/adviser-report",
  verifyJWT,
  getLeadCountByAdviserForMonthController,
);
router.get(
  "/status-wise-report",
  verifyJWT,
  getMonthlyStatusWiseReportController,
);

router.get(
  "/status-wise-date-report",
  verifyJWT,
  getMonthlyDateWiseStatusReportController,
);

router.get("/time-enquiry", timeEnquiryReport);
router.get("/longweekend", longWeekendReport);

export default router;
