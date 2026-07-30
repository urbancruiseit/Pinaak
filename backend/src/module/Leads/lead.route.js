import { Router } from "express";
import {
  createLeads,
  listLeads,
  updateLeadByIdController,
  updateLeadUnwantedStatusController,
  getAllUnwantedLeadsController,
  createReminderController,
  getDueRemindersController,
  markReminderAsShownController,
  checkCustomerPhoneController,
  getAdvisorReminderStatsController,
  getAdvisorReminderDetailsController,
  getAdvisorFollowupDetailsController,
  getAdvisorFollowupStatsController,
} from "./lead.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
const router = Router();

router.route("/").post(verifyJWT, createLeads);
router.route("/").get(verifyJWT, listLeads);
router.route("/unwanted/:id").patch(updateLeadUnwantedStatusController);
router.route("/unwanted/all").get(getAllUnwantedLeadsController);
router.route("/updatelead/:leadId").put(updateLeadByIdController);
router.post("/reminder", createReminderController);
router.get("/reminders/due", verifyJWT, getDueRemindersController);
router.patch("/reminders/:id/shown", verifyJWT, markReminderAsShownController);
router.post("/check-phone", checkCustomerPhoneController);
router.get(
  "/reminders/advisor-stats",
  verifyJWT,
  getAdvisorReminderStatsController,
);
router.get(
  "/reminders/advisor-stats/:advisorId/details",
  verifyJWT,
  getAdvisorReminderDetailsController,
);
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
export default router;
