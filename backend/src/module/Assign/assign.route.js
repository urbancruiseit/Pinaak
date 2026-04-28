import { Router } from "express";
import {
  getTravelAdvisorsByCityId,
  assignTravelAdvisor,
  getMyAssignedLeads,
  getLeadStatusCount,
  LeadStatusCountByPresalesId,
} from "../Assign/assign.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
const router = Router();

router.route("/travel-advisors/:cityId").get(getTravelAdvisorsByCityId);
router.route("/assign-travel-advisor/:leadId").patch(assignTravelAdvisor);
router.route("/myleads").get(verifyJWT, getMyAssignedLeads);
router.get("/leads/status-count/:advisorId", verifyJWT, getLeadStatusCount);
router.get("/leads/status-count", verifyJWT, getLeadStatusCount);
router.get(
  "/leads/status-count-by-presales",
  verifyJWT,
  LeadStatusCountByPresalesId,
);
export default router;
