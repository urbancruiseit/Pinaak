import { Router } from "express";
import {
  createLeads,
  listLeads,
  updateLeadByIdController,
  updateLeadUnwantedStatusController,
  getAllUnwantedLeadsController,
} from "./lead.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
const router = Router();

router.route("/").post(verifyJWT, createLeads);
router.route("/").get(verifyJWT, listLeads);
router.route("/unwanted/:id").patch(verifyJWT, updateLeadUnwantedStatusController);
router.route("/unwanted/all").get(verifyJWT, getAllUnwantedLeadsController);
router.route("/:id").put(verifyJWT, updateLeadByIdController);
export default router;
