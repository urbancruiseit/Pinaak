import express from "express";
import {
  getLeadCountByAdviserForMonthController,
  getLeadCountByDateForYearController,
  monthlyEnquiryReport,
} from "./report.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/monthly-enquiry", monthlyEnquiryReport);
router.get("/leads/count-by-date", getLeadCountByDateForYearController);
router.get("/adviser-report", verifyJWT, getLeadCountByAdviserForMonthController);
export default router;
