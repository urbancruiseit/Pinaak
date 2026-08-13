import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Vehicle } from "@/types/types";

import {
  createVehiclesManagerApi,
  getVehicleManagersApi,
  GetVehicleManagersParams,
  GetVehicleManagersResponse,
  getVehicleMasterCodesApi,
  getVehicleManagerVendorsApi,
  getVehicleMasterAmenitiesApi,
  VehicleMasterCode,
  VehicleManagerVendor,
  VehicleMasterAmenity,
} from "./vehicleManagerApi";


// =====================================================
// CREATE PAYLOAD
// =====================================================

type CreateVehicleManagerPayload = Omit<
  Vehicle,
  "id"
>;


// =====================================================
// STATE
// =====================================================

interface VehicleManagerState {
  // Vehicle Manager Table
  vehicles: Vehicle[];

  // Loading / Error
  loading: boolean;
  error: string | null;

  // Pagination
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  // Dropdowns
  vehicleMasterCodes: VehicleMasterCode[];
  vendors: VehicleManagerVendor[];
  vehicleMasterAmenities: VehicleMasterAmenity[];

  // Dropdown loading
  codesLoading: boolean;
  vendorsLoading: boolean;
  amenitiesLoading: boolean;
}


// =====================================================
// INITIAL STATE
// =====================================================

const initialState: VehicleManagerState = {
  vehicles: [],

  loading: false,
  error: null,

  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,

  vehicleMasterCodes: [],
  vendors: [],
  vehicleMasterAmenities: [],

  codesLoading: false,
  vendorsLoading: false,
  amenitiesLoading: false,
};


// =====================================================
// CREATE VEHICLE MANAGER
// =====================================================

export const createVehicleManager =
  createAsyncThunk<
    Vehicle,
    CreateVehicleManagerPayload,
    { rejectValue: string }
  >(
    "vehicleManager/createVehicleManager",

    async (
      vehicleData,
      { rejectWithValue },
    ) => {
      try {
        const response =
          await createVehiclesManagerApi(
            vehicleData,
          );

        return response;
      } catch (error: any) {
        return rejectWithValue(
          error?.message ||
            "Failed to create vehicle manager",
        );
      }
    },
  );


// =====================================================
// GET ALL VEHICLE MANAGERS
// =====================================================

export const getVehicleManagers =
  createAsyncThunk<
    GetVehicleManagersResponse,
    GetVehicleManagersParams | undefined,
    { rejectValue: string }
  >(
    "vehicleManager/getVehicleManagers",

    async (
      params,
      { rejectWithValue },
    ) => {
      try {
        const response =
          await getVehicleManagersApi(
            params,
          );

        return response;
      } catch (error: any) {
        return rejectWithValue(
          error?.message ||
            "Failed to fetch vehicle managers",
        );
      }
    },
  );


// =====================================================
// GET VEHICLE MASTER CODES
// =====================================================

export const getVehicleMasterCodes =
  createAsyncThunk<
    VehicleMasterCode[],
    void,
    { rejectValue: string }
  >(
    "vehicleManager/getVehicleMasterCodes",

    async (
      _,
      { rejectWithValue },
    ) => {
      try {
        const response =
          await getVehicleMasterCodesApi();

        return response;
      } catch (error: any) {
        return rejectWithValue(
          error?.message ||
            "Failed to fetch vehicle master codes",
        );
      }
    },
  );


// =====================================================
// GET VEHICLE MASTER AMENITIES
// =====================================================

export const getVehicleMasterAmenities =
  createAsyncThunk<
    VehicleMasterAmenity[],
    void,
    { rejectValue: string }
  >(
    "vehicleManager/getVehicleMasterAmenities",

    async (
      _,
      { rejectWithValue },
    ) => {
      try {
        const response =
          await getVehicleMasterAmenitiesApi();

        return response;
      } catch (error: any) {
        return rejectWithValue(
          error?.message ||
            "Failed to fetch vehicle master amenities",
        );
      }
    },
  );


// =====================================================
// GET VENDORS
// =====================================================

export const getVehicleManagerVendors =
  createAsyncThunk<
    VehicleManagerVendor[],
    void,
    { rejectValue: string }
  >(
    "vehicleManager/getVehicleManagerVendors",

    async (
      _,
      { rejectWithValue },
    ) => {
      try {
        const response =
          await getVehicleManagerVendorsApi();

        return response;
      } catch (error: any) {
        return rejectWithValue(
          error?.message ||
            "Failed to fetch vendors",
        );
      }
    },
  );


// =====================================================
// SLICE
// =====================================================

const vehicleManagerSlice =
  createSlice({
    name: "vehicleManager",

    initialState,

    reducers: {},

    extraReducers: (builder) => {

      // =================================================
      // CREATE VEHICLE MANAGER
      // =================================================

      builder

        .addCase(
          createVehicleManager.pending,
          (state) => {
            state.loading = true;
            state.error = null;
          },
        )

        .addCase(
          createVehicleManager.fulfilled,
          (
            state,
            action,
          ) => {
            state.loading = false;
            state.error = null;

            // Add newly created vehicle
            state.vehicles.unshift(
              action.payload,
            );

            // Update total
            state.total += 1;
          },
        )

        .addCase(
          createVehicleManager.rejected,
          (
            state,
            action,
          ) => {
            state.loading = false;

            state.error =
              action.payload ||
              "Failed to create vehicle manager";
          },
        );


      // =================================================
      // GET ALL VEHICLE MANAGERS
      // =================================================

      builder

        .addCase(
          getVehicleManagers.pending,
          (state) => {
            state.loading = true;
            state.error = null;
          },
        )

        .addCase(
          getVehicleManagers.fulfilled,
          (
            state,
            action,
          ) => {
            state.loading = false;
            state.error = null;

            state.vehicles =
              action.payload.data;

            state.total =
              action.payload.total;

            state.page =
              action.payload.page;

            state.limit =
              action.payload.limit;

            state.totalPages =
              action.payload.totalPages;
          },
        )

        .addCase(
          getVehicleManagers.rejected,
          (
            state,
            action,
          ) => {
            state.loading = false;

            state.error =
              action.payload ||
              "Failed to fetch vehicle managers";
          },
        );


      // =================================================
      // GET VEHICLE MASTER CODES
      // =================================================

      builder

        .addCase(
          getVehicleMasterCodes.pending,
          (state) => {
            state.codesLoading = true;
            state.error = null;
          },
        )

        .addCase(
          getVehicleMasterCodes.fulfilled,
          (
            state,
            action,
          ) => {
            state.codesLoading = false;

            state.vehicleMasterCodes =
              action.payload;
          },
        )

        .addCase(
          getVehicleMasterCodes.rejected,
          (
            state,
            action,
          ) => {
            state.codesLoading = false;

            state.error =
              action.payload ||
              "Failed to fetch vehicle master codes";
          },
        );


      // =================================================
      // GET VEHICLE MASTER AMENITIES
      // =================================================

      builder

        .addCase(
          getVehicleMasterAmenities.pending,
          (state) => {
            state.amenitiesLoading = true;
            state.error = null;
          },
        )

        .addCase(
          getVehicleMasterAmenities.fulfilled,
          (
            state,
            action,
          ) => {
            state.amenitiesLoading = false;

            state.vehicleMasterAmenities =
              action.payload;
          },
        )

        .addCase(
          getVehicleMasterAmenities.rejected,
          (
            state,
            action,
          ) => {
            state.amenitiesLoading = false;

            state.error =
              action.payload ||
              "Failed to fetch vehicle master amenities";
          },
        );


      // =================================================
      // GET VENDORS
      // =================================================

      builder

        .addCase(
          getVehicleManagerVendors.pending,
          (state) => {
            state.vendorsLoading = true;
            state.error = null;
          },
        )

        .addCase(
          getVehicleManagerVendors.fulfilled,
          (
            state,
            action,
          ) => {
            state.vendorsLoading = false;

            state.vendors =
              action.payload;
          },
        )

        .addCase(
          getVehicleManagerVendors.rejected,
          (
            state,
            action,
          ) => {
            state.vendorsLoading = false;

            state.error =
              action.payload ||
              "Failed to fetch vendors";
          },
        );
    },
  });


export default vehicleManagerSlice.reducer;