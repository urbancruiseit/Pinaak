"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, FileText } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

// ⚠️ Path apne project ke structure ke hisab se sahi karo
import SearchableSelect from "../SearchableSelect";

import type { AppDispatch, RootState } from "../../../../redux/store";

import {
  createVehicleManager,
  getVehicleMasterCodes,
  getVehicleManagerVendors,
  getAllCities,
} from "../../../../features/vehicleManager/vehicleManagerSlice";

import { Vehicle } from "@/types/types";
import { AMENITIES_OPTIONS } from "../VehiclesMaster/vehicleMasterDropdown";

type VehicleFormData = Omit<Vehicle, "id" | "amenities"> & {
  amenities: string;
  city: string;
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
  city: "",
};

const VehicleForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    vehicleMasterCodes,
    vendors,
    codesLoading,
    vendorsLoading,
    cities,
    citiesLoading,
  } = useSelector((state: RootState) => state.vehicleManager);

  const [formData, setFormData] = useState<VehicleFormData>(initialFormState);

  // Checkbox selections ke liye alag array state (codes store honge)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getVehicleMasterCodes());
    dispatch(getVehicleManagerVendors());
    dispatch(getAllCities());
  }, [dispatch]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      amenities: selectedAmenities.join(","),
    }));
  }, [selectedAmenities]);

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
    // amenities (CODES, comma-separated) stored hain unhe
    // checkbox me pre-check kar do (user baad me toggle kar sakta hai)
    if (name === "code") {
      const matchedCode = vehicleMasterCodes.find(
        (item) => item.code === value,
      );

      if (matchedCode?.amenities) {
        const amenityCodesFromMaster = matchedCode.amenities
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a.length > 0);

        setSelectedAmenities(amenityCodesFromMaster);
      } else {
        setSelectedAmenities([]);
      }
    }
  };

  // =====================================================
  // AMENITY CHECKBOX TOGGLE (code ke basis par)
  // =====================================================

  const handleAmenityToggle = (amenityCode: string) => {
    setSelectedAmenities(
      (prev) =>
        prev.includes(amenityCode)
          ? prev.filter((a) => a !== amenityCode) // uncheck -> remove
          : [...prev, amenityCode], // check -> add
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
      {isSuccess && (
        <div className="fixed right-5 top-5 z-[9999] flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-5 py-4 shadow-lg">
          <CheckCircle2 className="text-green-600" size={22} />

          <span className="font-semibold text-green-700">
            Vehicle registered successfully!
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed right-5 top-5 z-[9999] flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 shadow-lg">
          <XCircle className="text-red-600" size={22} />

          <span className="font-semibold text-red-700">{errorMsg}</span>
        </div>
      )}

      <div className="mb-6 rounded-md bg-orange-100 p-3 shadow-sm">
        <div className="flex items-center">
          <div className="rounded-md border-l-8 border-orange-500 bg-white px-3 shadow-md">
            <h2 className="py-4 text-3xl font-bold text-orange-600 md:text-4xl">
              Add Vehicles Manager Details
            </h2>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-12 space-y-14">
        <div className="rounded-xl border bg-blue-50 p-6">
          <h3 className="mb-6 border-b border-blue-200 pb-3 text-xl font-semibold text-blue-800">
            <span className="mr-2 rounded-md bg-blue-600 px-3 py-1 text-white">
              1
            </span>
            Basic Vehicle Information
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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

            {/* City */}
            <div>
              <label className="block text-md font-extrabold text-gray-700 mb-1">
                City
              </label>
              <div className="relative group">
                <Info
                  size={15}
                  className="absolute -top-4 right-0 text-blue-500 cursor-help"
                />
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={citiesLoading}
                  className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {citiesLoading ? "Loading cities..." : "Select City"}
                  </option>
                  {cities.length > 0
                    ? cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))
                    : !citiesLoading && (
                        <option disabled>No cities available</option>
                      )}
                </select>
                <FileText
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                  size={20}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h3 className="mb-6 border-b border-green-200 pb-3 text-xl font-semibold text-green-800">
            <span className="mr-2 rounded-md bg-green-600 px-3 py-1 text-white">
              2
            </span>
            Amenities
          </h3>

          <div className="space-y-4">
            {AMENITIES_OPTIONS.map((category) => (
              <div
                key={category.label}
                className="overflow-hidden rounded-lg border border-green-200 bg-white"
              >
                {/* Category Header */}
                <div className="border-b border-green-200 bg-green-100 px-4 py-3">
                  <h4 className="text-base font-bold text-green-800">
                    {category.label}
                  </h4>
                </div>

                {/* Options */}
                <div className="bg-green-50/50 p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {category.options.map((item, index) => {
                      const isChecked = selectedAmenities.includes(item.code);

                      return (
                        <label
                          key={`${item.code}-${index}`}
                          className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-3 transition-all ${
                            isChecked
                              ? "border-green-600 bg-green-200 font-semibold text-green-900 shadow-sm"
                              : "border-green-200 bg-white text-gray-800 hover:border-green-400 hover:bg-green-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleAmenityToggle(item.code)}
                            className="h-5 w-5 shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />

                          <span className="truncate text-base font-medium">
                            {item.code} - {item.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
