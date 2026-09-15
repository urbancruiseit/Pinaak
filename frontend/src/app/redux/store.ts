import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import leadReducer from "../features/lead/leadSlice";
import countryReducer from "../features/countrycode/countrycodeSlice";
import vehicleReducer from "../features/vehicle/vehicleSlice";
import travelcityReducer from "../features/travelcity/travelcitySlice";
import stateCityReducer from "../features/State/stateSlice";
import travelAdvisorReducer from "../features/access/accessSlice";
import NewcustomerReducer from "../features/NewCustomer/NewCustomerSlice";
import vendorReducer from "../features/vendor/vendorSlice";
import driverReducer from "../features/Driver/driverSlice";
import monthlyReducer from "../features/Reports/monthlyReport/monthlyReportSlice";
import websiteGacReducer from "../features/Website/WebsiteSlice";
import dsrReducer from "../features/Dsr/dsrSlice";
import downloadReducer from "../features/Download/downloadSlice";
import rateReducer from "../features/Rate/rateSlice";
import ruleReducer from "../features/Rules/rulesSlice";
import navigationReducer from "../features/Navigation/navigationSlice";
import vehicleManagerReducer from "../features/vehicleManager/vehicleManagerSlice"; // Import the vehicleManager reducer
import followUpReducer from "../features/leadsFollowups/lead_followupsSlice";
import locationReducer from "../features/RegionZoneCity/regiononecity.slice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    lead: leadReducer,
    country: countryReducer,
    vehicle: vehicleReducer,
    travelcity: travelcityReducer,
    stateCity: stateCityReducer,
    travelAdvisor: travelAdvisorReducer,
    newCustomer: NewcustomerReducer,
    vendor: vendorReducer,
    driver: driverReducer,
    report: monthlyReducer,
    websiteGac: websiteGacReducer,
    dsr: dsrReducer,
    download: downloadReducer,
    rate: rateReducer,
    rule: ruleReducer,
    navigation: navigationReducer,
    vehicleManager: vehicleManagerReducer,
    followUp: followUpReducer,
    location: locationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
