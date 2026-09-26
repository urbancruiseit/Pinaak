import express from "express";
import {
  getAgingReportController,
  getLeadCountByAdviserForMonthController,
  getMonthlyDateWiseStatusReportController,
  getMonthlyStatusWiseReportController,
  getWebsiteToLeadAgingReportController,
  longWeekendReport,
  monthlyEnquiryReport,
  monthlyreporttwo,
  timeEnquiryReport,
} from "./report.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);
router.get("/monthly-enquiry", verifyJWT, monthlyEnquiryReport);

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

router.get("/time-enquiry", verifyJWT, timeEnquiryReport);
router.get("/longweekend", verifyJWT, longWeekendReport);
router.get("/monthlyreporttwo", verifyJWT, monthlyreporttwo);

router.get("/aging-report", verifyJWT, getAgingReportController);

router.get(
  "/website-to-lead-aging-report",
  verifyJWT,
  getWebsiteToLeadAgingReportController,
);
export default router;
