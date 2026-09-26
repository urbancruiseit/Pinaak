import express from "express";

import { getDownloadReport } from "./download.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);
router.get("/download", verifyJWT, getDownloadReport);
export default router;
