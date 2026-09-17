"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { AppDispatch, RootState } from "../../../../redux/store";
import { createVehicle } from "../../../../features/vehicle/vehicleSlice";
import { Vehicle } from "@/types/types";

// ⚠️ Path apne project ke structure ke hisab se sahi karo
import SearchableSelect from "../../Vehicles/SearchableSelect";
import MultiSelectFilter, {
  FilterOption,
} from "../../Vehicles/MultiSelectFilter";

import {
  MAKE_OPTIONS,
  CATEGORY_OPTIONS,
  MODEL_OPTIONS,
  VARIANT_OPTIONS,
} from "./vehicleMasterDropdown";

type VehicleFormState = Omit<Vehicle, "id">;

const emptyForm: VehicleFormState = {
  code: "",
  seat: "",
  category: "",
  make: "",
  variant: "",
  description: "",
  amenities: "",
  config: "",
  model: "",
};

interface VehicleFormProps {
  onSuccess?: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { creating, createError } = useSelector(
    (state: RootState) => state.vehicle,
  );

  const [formData, setFormData] = useState<VehicleFormState>(emptyForm);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // ✅ Variant ab multi-select — array of codes
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  // ✅ Variant options (code/label) — same pattern jo table filters me use hota hai
  const variantOptions: FilterOption[] = VARIANT_OPTIONS.map((variant) => ({
    code: variant.code,
    label: variant.code,
  }));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (selectedVariants.length === 0) {
      setValidationError("Please select at least one variant.");
      return;
    }

    const payload: Vehicle = {
      code: formData.code,
      seat: formData.seat,
      category: formData.category,
      make: formData.make,
      variant: selectedVariants.join(","), // ✅ multiple variants comma-separated
      description: formData.description,
      amenities: formData.amenities,
      config: formData.config,
      model: formData.model,
    } as Vehicle;

    try {
      await dispatch(createVehicle(payload)).unwrap();

      setFormData(emptyForm);
      setSelectedVariants([]);
      setIsSuccess(true);
    } catch (err) {
      console.error("❌ Failed to save vehicle:", err);
    }
  };

  useEffect(() => {
    if (!isSuccess) return;

    const timer = setTimeout(() => {
      setIsSuccess(false);
      onSuccess?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isSuccess, onSuccess]);

  return (
    <div className="w-full ">
      {/* Success Toast */}
      {isSuccess && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-5 py-4 shadow-lg">
          <CheckCircle2 className="text-green-600" size={22} />
          <span className="font-semibold text-green-700">
            Vehicle registered successfully!
          </span>
        </div>
      )}

      {/* Error */}
      {(validationError || createError) && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={20} />
          <span className="font-medium">{validationError || createError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="rounded-xl border bg-blue-50 p-5 md:p-6">
          <h3 className="mb-6 flex items-center border-b border-blue-200 pb-3 text-xl font-semibold text-blue-800">
            <span className="mr-2 rounded-md bg-blue-600 px-3 py-1 text-white">
              1
            </span>
            Add New Vehicle Type{" "}
          </h3>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Seat */}
            <div>
              <label className="mb-1 block text-sm font-extrabold text-gray-700">
                Seat
              </label>
              <input
                type="text"
                name="seat"
                value={formData.seat}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="💺 e.g., 9"
              />
            </div>

            {/* Config */}
            <div>
              <label className="mb-1 block text-sm font-extrabold text-gray-700">
                Config
              </label>
              <input
                type="text"
                name="config"
                value={formData.config}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="💺 e.g., 9"
              />
            </div>

            <SearchableSelect
              label="Category"
              name="category"
              value={formData.category}
              options={CATEGORY_OPTIONS}
              onChange={handleSelectChange}
              placeholder="Select Category"
            />
            <SearchableSelect
              label="Make"
              name="make"
              value={formData.make}
              options={MAKE_OPTIONS}
              onChange={handleSelectChange}
              placeholder="Select Make"
            />
            <SearchableSelect
              label="Model"
              name="model"
              value={formData.model}
              options={MODEL_OPTIONS}
              onChange={handleSelectChange}
              placeholder="Select Model"
            />

            {/* ✅ Variant — Multi Select */}
            <div>
              <label className="mb-1 block text-sm font-extrabold text-gray-700">
                Variant
              </label>
              <MultiSelectFilter
                title="Select Variant"
                options={variantOptions}
                selected={selectedVariants}
                onChange={setSelectedVariants}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-sm font-extrabold text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="📝 e.g., FORCE TRAVELLER - RYL VIP 1x1"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-sm font-extrabold text-gray-700">
                Heightlights{" "}
              </label>
              <textarea
                name="amenities"
                value={formData.amenities}
                onChange={handleInputChange}
                rows={2}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="✨ e.g., With Cleaner Seat, Fridge, Washroom"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end pt-6">
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-blue-600 px-8 py-3 font-extrabold text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Saving..." : "Register Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
