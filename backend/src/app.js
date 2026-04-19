import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import userRouter from "../src/module/user/user.route.js";
import leadRouter from "../src/module/Leads/lead.route.js";
import countryRoutes from "../src/module/countrycode/country.route.js";
import vehicaleCodeRouter from "../src/module/vehiclemaster/vehiclemaster.route.js";
import travelcityRouter from "../src/module/travelCitys/travelCity.route.js";
import reportsRouter from "./module/Reports/report.route.js";
import firebaseRoutes from "./module/Leads/firebase.route.js";
import annualReportRoutes from "./module/AnnualReport/annualReport.route.js";
import hoursReportRoutes from "./module/HoursReport/hoursreport.route.js";
import stateRouter from "./module/State/state.route.js";
import AssignRoutes from "./module/Assign/assign.route.js";
import NewCustomerRouter from "./module/NewCustomer/newCustomer.route.js";
import vendorRouter from "./module/Vendors/vendor.route.js";
import driverRouter from "./module/Driver/driver.route.js";

dotenv.config();
const app = express();

app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalized)) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(express.static("public"));

app.use(cookieParser());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/lead", leadRouter);
app.use("/api/v1/country", countryRoutes);
app.use("/api/v1/vehicle", vehicaleCodeRouter);
app.use("/api/v1/travelcity", travelcityRouter);
app.use("/api/v1/reports", reportsRouter);
app.use("/api/v1/firebase", firebaseRoutes);
app.use("/api/v1/annualreport", annualReportRoutes);
app.use("/api/v1/hoursreport", hoursReportRoutes);
app.use("/api/v1/state", stateRouter);
app.use("/api/v1/state", stateRouter);
app.use("/api/v1/assign", AssignRoutes);
app.use("/api/v1/newcustomer", NewCustomerRouter);
app.use("/api/v1/vendor", vendorRouter);
app.use("/api/v1/driver", driverRouter);

export { app };
