import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { createDsr, getAllDsr } from "./dsr.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/create").post(verifyJWT, createDsr);
router.route("/getAll").get(verifyJWT, getAllDsr);

export default router;
