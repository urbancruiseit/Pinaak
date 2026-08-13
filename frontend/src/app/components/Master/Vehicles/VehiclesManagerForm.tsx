"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

// ⚠️ Path apne project ke structure ke hisab se sahi karo
import SearchableSelect from "../Vehicles/SearchableSelect";

import type { AppDispatch, RootState } from "../../../redux/store";

import {
  createVehicleManager,
  getVehicleMasterCodes,
  getVehicleManagerVendors,
  getVehicleMasterAmenities,
} from "../../../features/vehicleManager/vehicleManagerSlice";

import { Vehicle } from "@/types/types";

// amenities ab UI me array (checkbox selections) ke roop me handle
// hongi, submit karte waqt comma-separated string me convert honge
type VehicleFormData = Omit<Vehicle, "id" | "amenities"> & {
  amenities: string;
};

const initialFormState: VehicleFormData = {
  code: "",
  vendor: "",
  model: "",
  veh_no: "",
  reg_date: "",
  garage: "",
  aging: "",
  amenities: "",
};

const VehicleForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // =====================================================
  // REDUX DATA
  // =====================================================

  const {
    vehicleMasterCodes,
    vendors,
    vehicleMasterAmenities,
    codesLoading,
    vendorsLoading,
    amenitiesLoading,
  } = useSelector((state: RootState) => state.vehicleManager);

  // =====================================================
  // LOCAL STATE
  // =====================================================

  const [formData, setFormData] = useState<VehicleFormData>(initialFormState);

  // Checkbox selections ke liye alag array state (easy toggle ke liye)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // =====================================================
  // LOAD CODE + VENDOR + AMENITIES DROPDOWNS
  // =====================================================

  useEffect(() => {
    dispatch(getVehicleMasterCodes());
    dispatch(getVehicleManagerVendors());
    dispatch(getVehicleMasterAmenities());
  }, [dispatch]);

  // =====================================================
  // Jab bhi selectedAmenities change ho, formData.amenities
  // ko comma-separated string me sync kar do (submit ke liye)
  // =====================================================

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      amenities: selectedAmenities.join(","),
    }));
  }, [selectedAmenities]);

  // =====================================================
  // INPUT CHANGE (for text/date/textarea fields)
  // =====================================================

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // SELECT CHANGE (for SearchableSelect dropdowns)
  // =====================================================

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Jab CODE select ho, uske against vehicle_master me jo
    // amenities stored hain unhe dhoondo aur checkbox me
    // pre-check kar do (user baad me toggle kar sakta hai)
    if (name === "code") {
      const matchedCode = vehicleMasterCodes.find(
        (item) => item.code === value,
      );

      if (matchedCode?.amenities) {
        const amenitiesFromMaster = matchedCode.amenities
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a.length > 0);

        setSelectedAmenities(amenitiesFromMaster);
      } else {
        setSelectedAmenities([]);
      }
    }
  };

  // =====================================================
  // AMENITY CHECKBOX TOGGLE
  // =====================================================

  const handleAmenityToggle = (amenityName: string) => {
    setSelectedAmenities(
      (prev) =>
        prev.includes(amenityName)
          ? prev.filter((a) => a !== amenityName) // uncheck -> remove
          : [...prev, amenityName], // check -> add
    );
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await dispatch(createVehicleManager(formData)).unwrap();

      setIsSuccess(true);

      setFormData(initialFormState);
      setSelectedAmenities([]);

      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error: any) {
      setErrorMsg(
        typeof error === "string"
          ? error
          : error?.message || "Something went wrong while creating vehicle",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* =====================================================
          SUCCESS TOAST
      ===================================================== */}

      {isSuccess && (
        <div className="fixed right-5 top-5 z-[9999] flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-5 py-4 shadow-lg">
          <CheckCircle2 className="text-green-600" size={22} />

          <span className="font-semibold text-green-700">
            Vehicle registered successfully!
          </span>
        </div>
      )}

      {/* =====================================================
          ERROR TOAST
      ===================================================== */}

      {errorMsg && (
        <div className="fixed right-5 top-5 z-[9999] flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 shadow-lg">
          <XCircle className="text-red-600" size={22} />

          <span className="font-semibold text-red-700">{errorMsg}</span>
        </div>
      )}

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 rounded-md bg-orange-100 p-3 shadow-sm">
        <div className="flex items-center">
          <div className="rounded-md border-l-8 border-orange-500 bg-white px-3 shadow-md">
            <h2 className="py-4 text-3xl font-bold text-orange-600 md:text-4xl">
              Vehicles Manager Table
            </h2>
          </div>
        </div>
      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <form onSubmit={handleSubmit} className="mt-12 space-y-14">
        {/* =====================================================
            BASIC VEHICLE INFORMATION
        ===================================================== */}

        <div className="rounded-xl border bg-blue-50 p-6">
          <h3 className="mb-6 border-b border-blue-200 pb-3 text-xl font-semibold text-blue-800">
            <span className="mr-2 rounded-md bg-blue-600 px-3 py-1 text-white">
              1
            </span>
            Basic Vehicle Information
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* =================================================
                CODE DROPDOWN (Searchable)
            ================================================= */}

            <SearchableSelect
              label="Code"
              name="code"
              value={formData.code}
              options={vehicleMasterCodes.map((item) => item.code)}
              onChange={handleSelectChange}
              loading={codesLoading}
              placeholder="Select Code"
              required
            />

            {/* =================================================
                VENDOR DROPDOWN (Searchable)
            ================================================= */}

            <SearchableSelect
              label="Vendor Name"
              name="vendor"
              value={formData.vendor}
              options={vendors.map((item) => item.name)}
              onChange={handleSelectChange}
              loading={vendorsLoading}
              placeholder="Select Vendor"
              required
            />

            {/* =================================================
                MODEL
            ================================================= */}

            <div>
              <label className="mb-1 block text-sm font-extrabold text-gray-700">
                Model <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                required
                placeholder="🚙 e.g., Innova, XUV700, Safari"
              />
            </div>

            {/* =================================================
                VEHICLE NUMBER
            ================================================= */}

            <div>
              <label className="mb-1 block text-sm font-extrabold text-gray-700">
                Vehicle Number <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="veh_no"
                value={formData.veh_no}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                required
                placeholder="🚗 e.g., MH01AB1234"
              />
            </div>

            {/* =================================================
                REGISTRATION DATE
            ================================================= */}

            <div>
              <label className="mb-1 block text-sm font-extrabold text-gray-700">
                Registration Date <span className="text-red-500">*</span>
              </label>

              <input
                type="date"
                name="reg_date"
                value={formData.reg_date}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* =================================================
                GARAGE
            ================================================= */}

            <div>
              <label className="mb-1 block text-sm font-extrabold text-gray-700">
                Garage <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="garage"
                value={formData.garage}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                required
                placeholder="🏭 e.g., Tata, Mahindra, Toyota"
              />
            </div>

            {/* =================================================
                MANUFACTURING YEAR
            ================================================= */}

            <div>
              <label className="mb-1 block text-sm font-extrabold text-gray-700">
                Manufacturing Year <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="aging"
                value={formData.aging}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                required
                placeholder="📅 e.g., 2023"
              />
            </div>

            {/* =================================================
                AMENITIES (Checkboxes - vehicle_master se)
                Code select karte hi is code ke amenities
                auto-checked ho jaate hain. User inhe
                check/uncheck kar sakta hai.
            ================================================= */}

            <div className="md:col-span-2 lg:col-span-3">
              <label className="mb-2 block text-sm font-extrabold text-gray-700">
                Amenities
              </label>

              {amenitiesLoading ? (
                <p className="text-sm text-gray-400">Loading amenities...</p>
              ) : vehicleMasterAmenities.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No amenities found in vehicle master
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-300 bg-white p-4 sm:grid-cols-3 lg:grid-cols-4">
                  {vehicleMasterAmenities.map((item, index) => {
                    const isChecked = selectedAmenities.includes(item.name);

                    return (
                      <label
                        key={`${item.name}-${index}`}
                        className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm transition-colors ${
                          isChecked
                            ? "border-blue-500 bg-blue-50 font-semibold text-blue-700"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleAmenityToggle(item.name)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {item.name}
                      </label>
                    );
                  })}
                </div>
              )}

              {selectedAmenities.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Selected: {selectedAmenities.join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            SUBMIT
        ===================================================== */}

        <div className="flex flex-col justify-between gap-4 border-t pt-8 sm:flex-row">
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-8 py-3 font-extrabold text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Registering..." : "Register Vehicle"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
