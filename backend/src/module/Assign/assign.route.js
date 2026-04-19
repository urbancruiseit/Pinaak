import { Router } from "express";
import {
  getTravelAdvisorsByCityId,
  assignTravelAdvisor,
  getMyAssignedLeads,
} from "../Assign/assign.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
const router = Router();

router.route("/travel-advisors/:cityId").get(getTravelAdvisorsByCityId);
router.route("/assign-travel-advisor/:leadId").patch(assignTravelAdvisor);
router.route("/myleads").get(verifyJWT, getMyAssignedLeads);
export default router;
