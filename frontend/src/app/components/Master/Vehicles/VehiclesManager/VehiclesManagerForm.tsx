"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, XCircle, Info, FileText } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import SearchableSelect from "../SearchableSelect";
import type { AppDispatch, RootState } from "../../../../redux/store";
import {
  createVehicleManager,
  getVehicleMasterCodes,
  getVehicleMasterVariants,
  getVehicleManagerVendors,
  getAllCities,
} from "../../../../features/vehicleManager/vehicleManagerSlice";
import type { Vehicle } from "@/types/types";
import { AMENITIES_OPTIONS } from "../VehiclesMaster/vehicleMasterDropdown";
import FormPageHeader from "@/app/components/ui/PageHeader/FormPageHeader";

type VehicleFormData = Omit<
  Vehicle,
  "id" | "amenities" | "variant" | "city"
> & {
  amenities: string;
  city: string;
  variant: string;
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
  variant: "",
};

const VehicleForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    vehicleMasterCodes,
    vehicleMasterVariants,
    vendors,
    codesLoading,
    variantsLoading,
    vendorsLoading,
    cities,
    citiesLoading,
  } = useSelector((state: RootState) => state.vehicleManager);
  const [formData, setFormData] = useState<VehicleFormData>(initialFormState);
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

    if (errorMsg) {
      setErrorMsg(null);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMsg) {
      setErrorMsg(null);
    }

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
      setFormData((prev) => ({
        ...prev,
        code: value,
        variant: "",
      }));
      if (value) {
        dispatch(getVehicleMasterVariants(value));
      }
    }
  };

  const handleAmenityToggle = (amenityCode: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityCode)
        ? prev.filter((a) => a !== amenityCode)
        : [...prev, amenityCode],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!formData.code) {
      setErrorMsg("Please select a code first.");
      return;
    }

    if (!formData.variant) {
      setErrorMsg("Please select a variant.");
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(createVehicleManager(formData)).unwrap();
      setIsSuccess(true);
      setFormData(initialFormState);
      setSelectedAmenities([]);

      // Hide success message
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

      <div className="sticky top-0 z-30">
        <FormPageHeader title="Add Vehicles Manager Details" />
      </div>

      <form onSubmit={handleSubmit} className="mt-12 space-y-14">
        <div className="rounded-xl border bg-blue-50 p-6">
          <h3 className="mb-6 border-b border-blue-200 pb-3 text-xl font-semibold text-blue-800">
            <span className="mr-2 rounded-md bg-blue-600 px-3 py-1 text-white">
              1
            </span>
            Basic Vehicle Information
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <label className="mb-1 block text-md font-extrabold text-gray-700">
                Variant <span className="text-red-500">*</span>
              </label>

              <select
                name="variant"
                value={formData.variant}
                onChange={handleInputChange}
                disabled={!formData.code || variantsLoading}
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="">
                  {!formData.code
                    ? "Select Code First"
                    : variantsLoading
                      ? "Loading variants..."
                      : "Select Variant"}
                </option>

                {vehicleMasterVariants.map((item, index) => {
                  const cleanVariant = item.variant
                    ?.replace(/^"+|"+$/g, "")
                    .trim();

                  return (
                    <option
                      key={`${cleanVariant}-${index}`}
                      value={cleanVariant}
                    >
                      {cleanVariant}
                    </option>
                  );
                })}
              </select>
            </div>

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

            <div>
              <label className="mb-1 block text-md font-extrabold text-gray-700">
                City
              </label>

              <div className="group relative">
                <Info
                  size={15}
                  className="absolute -top-4 right-0 cursor-help text-blue-500"
                />

                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={citiesLoading}
                  className="w-full rounded-md border border-gray-300 bg-white py-2 pl-12 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="border-b border-green-200 bg-green-100 px-4 py-3">
                  <h4 className="text-base font-bold text-green-800">
                    {category.label}
                  </h4>
                </div>

                <div className="flex flex-col gap-4 bg-green-50/50 p-4 md:flex-row">
                  <div className="w-full shrink-0 md:w-48 lg:w-56">
                    <div className="relative flex h-full min-h-[170px] items-center justify-center overflow-hidden rounded-lg border border-green-300 bg-white">
                      <Image
                        src={category.image}
                        alt={category.label}
                        fill
                        sizes="(max-width: 768px) 100vw, 224px"
                        priority
                        className="object-contain p-6 drop-shadow-2xl"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

                            <span className="text-base font-medium">
                              {item.code} - {item.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
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
