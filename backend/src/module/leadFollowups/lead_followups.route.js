import { Router } from "express";
import {
  getAllLeadsController,
  getFollowupsByLeadIdController,
} from "./lead_followups.controller.js";
const router = Router();
router.route("/").get(getAllLeadsController);
router.route("/:id").get(getFollowupsByLeadIdController);
export default router;
