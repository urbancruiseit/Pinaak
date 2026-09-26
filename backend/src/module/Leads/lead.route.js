import { Router } from "express";
import {
  createLeads,
  listLeads,
  updateLeadByIdController,
  updateLeadUnwantedStatusController,
  getAllUnwantedLeadsController,
  checkCustomerPhoneController,
  getAdvisorFollowupDetailsController,
  getAdvisorFollowupStatsController,
  getLeadRfqTimeController,
} from "./lead.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
const router = Router();

router.route("/").post(verifyJWT, createLeads);
router.route("/").get(verifyJWT, listLeads);
router
  .route("/unwanted/:id")
  .patch(verifyJWT, updateLeadUnwantedStatusController);
router.route("/unwanted/all").get(verifyJWT, getAllUnwantedLeadsController);
router.route("/updatelead/:leadId").put(verifyJWT, updateLeadByIdController);
router.post("/check-phone", verifyJWT, checkCustomerPhoneController);
router.get(
  "/followups/advisor-stats",
  verifyJWT,
  getAdvisorFollowupStatsController,
);
router.get(
  "/followups/advisor-stats/:advisorId/details",
  verifyJWT,
  getAdvisorFollowupDetailsController,
);
router.get("/leads/:leadId/rfq-time", verifyJWT, getLeadRfqTimeController);
export default router;
