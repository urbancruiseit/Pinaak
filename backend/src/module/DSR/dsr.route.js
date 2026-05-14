import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { createDsr } from "./dsr.controller.js";

const router = Router();

// router.use(verifyJWT);

router.route("/create").post(createDsr);
export default router;
