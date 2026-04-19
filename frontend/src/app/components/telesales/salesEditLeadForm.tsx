"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Mail,
  Phone,
  FileText,
  MapPin,
  Calendar,
  X,
  GripVertical,
  Info,
  Luggage,
  Globe,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { LeadRecord } from "../../../types/types";
import { updateLead, fetchLeads } from "@/app/features/lead/leadSlice";
import { AppDispatch, RootState } from "@/app/redux/store";
import { getCountriesThunk } from "@/app/features/countrycode/countrycodeSlice";
import { fetchVehicles } from "@/app/features/vehicle/vehicleSlice";
import { getAllCitiesThunk } from "@/app/features/travelcity/travelcitySlice";

// Import from our 4 files
import {
  SOURCE_OPTIONS,
  STATUS_OPTIONS,
  CITY_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  OCCASION_OPTIONS,
  LOST_REASON_OPTIONS,
  TRIP_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  DEFAULT_VALUES,
} from "../../../types/Editleads/editleaddata";
import {
  leadSchema,
  LeadFormData,
} from "../../../types/Editleads/editleadschema";
import {
  parsePhone,
  calculateDays,
  calculateTotalBaggage,
  prepareLeadPayload,
  mapInitialDataToForm,
  formatDateTimeForInput,
  formatDateTimeForSubmit,
  calculateTotalVehicles,
} from "../../../types/Editleads/editleadcalculations";

// Toast notification types
type ToastType = "success" | "error";




const SalesEditLeadForm: React.FC<{
  initialData: LeadRecord;
  isEditMode?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}> = ({ initialData, isEditMode, onSuccess, onCancel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { countries } = useSelector((state: RootState) => state.country);
  const { vehicleCodes } = useSelector((state: RootState) => state.vehicle);
  const { travelcity } = useSelector((state: RootState) => state.travelcity);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    alternatePhone: "",
    email: "",
    companyName: "",
  });
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState("");
  const [itineraryList, setItineraryList] = useState<string[]>([]);
  const [customerCategoryTypeValue, setCustomerCategoryTypeValue] =
    useState("");
  const [alternateCountryCode, setAlternateCountryCode] = useState("+91");

  // Refs for toast timer
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pickupDateTime = watch("pickupDateTime");
  const dropDateTime = watch("dropDateTime");
  const smallbaggage = watch("smallbaggage");
  const mediumbaggage = watch("mediumbaggage");
  const largebaggage = watch("largebaggage");
  const airportbaggage = watch("airportbaggage");
  const customerType = watch("customerType");
  const serviceType = watch("serviceType");

  // Watch vehicle fields
  const vehicles = watch("vehicles");
  const vehicle1Quantity = watch("vehicle1Quantity");
  const vehicle2 = watch("vehicle2");
  const vehicle2Quantity = watch("vehicle2Quantity");
  const vehicle3 = watch("vehicle3");
  const vehicle3Quantity = watch("vehicle3Quantity");

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Fetch data
  useEffect(() => {
    dispatch(getCountriesThunk());
    dispatch(getAllCitiesThunk());
    dispatch(fetchVehicles());
  }, [dispatch]);

  // Calculate total baggage
  useEffect(() => {
    const total = calculateTotalBaggage(
      Number(smallbaggage),
      Number(mediumbaggage),
      Number(largebaggage),
      Number(airportbaggage),
    );
    setValue("totalbaggage", total);
  }, [smallbaggage, mediumbaggage, largebaggage, airportbaggage, setValue]);

  // Calculate days
  useEffect(() => {
    const days = calculateDays(serviceType, pickupDateTime, dropDateTime);
    setValue("days", days);
  }, [serviceType, pickupDateTime, dropDateTime, setValue]);

  // Calculate total vehicle requirement
  useEffect(() => {
    const totalVehicles = calculateTotalVehicles(
      vehicles || "",
      vehicle1Quantity || 0,
      vehicle2 || "",
      vehicle2Quantity || 0,
      vehicle3 || "",
      vehicle3Quantity || 0,
    );
    setValue("requirementVehicle", totalVehicles);
  }, [
    vehicles,
    vehicle1Quantity,
    vehicle2,
    vehicle2Quantity,
    vehicle3,
    vehicle3Quantity,
    setValue,
  ]);

  // Initialize form with data
  useEffect(() => {
    if (initialData) {
      const mapped = mapInitialDataToForm(initialData);
      setAlternateCountryCode(mapped.alternateCountryCode);
      setFormData(mapped.formData);
      setCustomerCategoryTypeValue(mapped.customerCategoryTypeValue);
      setItineraryList(mapped.itineraryList);

      Object.entries(mapped.setValues).forEach(([key, value]) => {
        setValue(key as any, value);
      });
      setTimeout(() => trigger(), 100);
    }
  }, [initialData, setValue, trigger]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addItinerary = () => {
    if (currentItinerary.trim() && itineraryList.length < 25) {
      const newList = [...itineraryList, currentItinerary.trim()];
      setItineraryList(newList);
      setCurrentItinerary("");
      setValue("itinerary", newList);
    }
  };

  const removeItinerary = (index: number) => {
    const newList = itineraryList.filter((_, i) => i !== index);
    setItineraryList(newList);
    setValue("itinerary", newList);
  };

  const reorderItinerary = (from: number, to: number) => {
    const newList = [...itineraryList];
    const [removed] = newList.splice(from, 1);
    newList.splice(to, 0, removed);
    setItineraryList(newList);
    setValue("itinerary", newList);
  };

  // Updated toast function with proper timing
  const showToastMessage = useCallback(
    (message: string, type: ToastType = "success") => {
      // Clear any existing timers
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

      // Set toast message and show it
      setToastMessage(message);
      setToastType(type);
      setShowToast(true);

      // Set timer to hide toast after exactly 3 seconds
      toastTimerRef.current = setTimeout(() => {
        setShowToast(false);
        // Clear message after animation completes
        toastTimeoutRef.current = setTimeout(() => {
          setToastMessage("");
        }, 300); // 300ms for fade out animation
      }, 3000);
    },
    [],
  );

  // Manual close handler
  const handleCloseToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setShowToast(false);
    setTimeout(() => setToastMessage(""), 300);
  }, []);

  const onSubmit: SubmitHandler<LeadFormData> = async (data) => {
    if (!initialData.id) {
      showToastMessage("Lead ID not found", "error");
      return;
    }

    setIsSubmitting(true);
    const payload = prepareLeadPayload(
      data,
      formData,
      itineraryList,
      alternateCountryCode,
    );

    try {
      await dispatch(
        updateLead({ id: initialData.id, data: payload }),
      ).unwrap();
      showToastMessage("Lead updated successfully!", "success");
      await dispatch(fetchLeads(1));
      if (onSuccess) onSuccess();
    } catch (error: any) {
      showToastMessage(
        error?.message || "Failed to update lead. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() + 2,
    today.getMonth(),
    today.getDate(),
  )
    .toISOString()
    .slice(0, 16);
  const minDate = today.toISOString().slice(0, 16);

  // Sort vehicle codes function
  const sortVehicleCodes = (codes: any[]) => {
    return [...codes].sort((a, b) => {
      const numA = parseInt(a.code.match(/\d+/)?.[0] || "0");
      const numB = parseInt(b.code.match(/\d+/)?.[0] || "0");
      if (numA !== numB) {
        return numA - numB;
      }
      return a.code.localeCompare(b.code);
    });
  };

  return (
    <div>
      {/* Toast Notification - Updated with better styling and animation */}
      {showToast && (
        <div className="fixed right-4 top-4 z-50 animate-slide-in-right">
          <div
            className={`rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[320px] transition-all duration-300 ${
              toastType === "success"
                ? "bg-green-50 border-l-4 border-green-500"
                : "bg-red-50 border-l-4 border-red-500"
            }`}
          >
            {toastType === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`font-medium ${
                  toastType === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {toastMessage}
              </p>
            </div>
            <button
              onClick={handleCloseToast}
              className={`${
                toastType === "success"
                  ? "text-green-600 hover:text-green-800"
                  : "text-red-600 hover:text-red-800"
              } transition-colors`}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-orange-100 p-3 rounded-md">
        <div className="flex justify-between items-center">
          <div className="pl-4 border-l-8 border-orange-500 bg-white px-3 rounded-md shadow-md">
            <h2 className="text-4xl font-bold text-left py-4 text-orange-600">
              Sales Edit Lead
            </h2>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="p-6 mx-auto bg-white shadow-xl rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Enquiry Information */}
          <div className="border rounded-xl p-6 bg-blue-50">
            <h3 className="text-xl font-semibold text-blue-800 mb-6 pb-3 border-b relative">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-md mr-2">
                1
              </span>
              Enquiry Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Lead Date - DISABLED */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Lead Date & Time
                </label>
                <div className="relative group">
                  <Info
                    size={15}
                    className="absolute -top-4 right-0 text-blue-500 cursor-help"
                  />
                  <input
                    type="datetime-local"
                    {...register("date")}
                    max={minDate}
                    disabled
                    className="w-full py-2 border bg-gray-100 cursor-not-allowed px-12 border-gray-300 rounded-md opacity-70"
                  />
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-800"
                    size={20}
                  />
                </div>
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.date.message}
                  </p>
                )}
              </div>

              {/* Source - DISABLED */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Source
                </label>
                <div className="relative group">
                  <select
                    {...register("source")}
                    disabled
                    className="w-full py-2 border bg-gray-100 cursor-not-allowed px-12 border-gray-300 rounded-md opacity-70"
                  >
                    <option value="">Select Source Type</option>
                    {SOURCE_OPTIONS.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Status - ENABLED (not disabled) */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Status
                </label>
                <div className="relative group">
                  <select
                    {...register("status")}
                    className="w-full py-2 border bg-white px-10 border-gray-300 rounded-md"
                  >
                    <option value="">Select Status</option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* City - DISABLED */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  City
                </label>
                <div className="relative group">
                  <select
                    {...register("city")}
                    disabled
                    className="w-full py-2 border bg-gray-100 cursor-not-allowed px-12 border-gray-300 rounded-md opacity-70"
                  >
                    <option value="">Select City</option>
                    {CITY_OPTIONS.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                    size={20}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Customer Information */}
          <div className="border rounded-xl p-6 bg-green-50">
            <h3 className="text-xl font-semibold text-green-800 mb-6 pb-3 border-b relative">
              <span className="bg-green-600 text-white px-3 py-1 rounded-md mr-2">
                2
              </span>
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Name - DISABLED */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleFieldChange}
                    disabled
                    className="w-full py-2 border bg-gray-100 cursor-not-allowed px-12 border-gray-300 rounded-md opacity-70"
                    placeholder="Enter Customer name"
                    required
                  />
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Phone India - DISABLED */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Phone No. (India) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <div className="bg-gray-100 px-2 py-2 text-sm font-medium min-w-[100px]">
                    +91 IND
                  </div>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleFieldChange}
                    disabled
                    placeholder="Enter phone number"
                    className="w-full py-2 px-3 outline-none bg-gray-100 cursor-not-allowed opacity-70"
                    maxLength={10}
                    required
                  />
                  <Phone
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Phone Other - ENABLED */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Phone No. (Other)
                </label>
                <div className="relative flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <select
                    value={alternateCountryCode}
                    disabled
                    onChange={(e) => setAlternateCountryCode(e.target.value)}
                    className="bg-gray-100 px-2 py-2 outline-none text-sm cursor-pointer min-w-[100px]"
                  >
                    <option value="">Select</option>
                    {countries.map((code) => (
                      <option key={code.id} value={code.country_code}>
                        {code.country_code} {code.phone_code}
                      </option>
                    ))}
                  </select>
                  <input
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleFieldChange}
                    placeholder="Enter phone number"
                    className="w-full py-2 px-3 outline-none"
                  />
                  <Phone
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Email - ENABLED */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative group">
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFieldChange}
                    placeholder="Enter email address"
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md"
                  />
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Customer Category - DISABLED */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Customer Category <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <select
                    {...register("customerType")}
                    disabled
                    onChange={(e) => {
                      register("customerType").onChange(e);
                      if (e.target.value === "Personal")
                        setFormData((prev) => ({ ...prev, companyName: "C" }));
                      else if (formData.companyName === "C")
                        setFormData((prev) => ({ ...prev, companyName: "" }));
                    }}
                    className="w-full py-2 border bg-gray-100 cursor-not-allowed px-12 border-gray-300 rounded-md opacity-70"
                  >
                    <option value="">Select Customer Category</option>
                    <option value="Personal">Personal</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Travel Agent">Agent</option>
                  </select>
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
                {errors.customerType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerType.message}
                  </p>
                )}
              </div>

              {/* Customer Type - DISABLED */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Customer Type
                </label>
                <div className="relative group">
                  <select
                    {...register("customerCategoryType")}
                    value={customerCategoryTypeValue}
                    disabled
                    onChange={(e) => {
                      register("customerCategoryType").onChange(e);
                      setCustomerCategoryTypeValue(e.target.value);
                    }}
                    className="w-full py-2 border bg-gray-100 cursor-not-allowed px-12 border-gray-300 rounded-md opacity-70"
                  >
                    <option value="">Select Customer Type</option>
                    {customerType &&
                      CATEGORY_OPTIONS[customerType]?.map((item, index) => (
                        <option key={index} value={item}>
                          {item}
                        </option>
                      ))}
                  </select>
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Company Name (conditional) - ENABLED */}
              {customerType !== "Personal" && (
                <div>
                  <label className="block text-md font-extrabold text-gray-700 mb-1">
                    Company Name
                  </label>
                  <div className="relative group">
                    <input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleFieldChange}
                      className="w-full px-12 py-2 border bg-white border-gray-300 rounded-md"
                      placeholder="Enter company name"
                    />
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                      size={20}
                    />
                  </div>
                </div>
              )}

              {/* Country Name - ENABLED */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Country Name
                </label>
                <div className="relative group">
                  <select
                    {...register("countryName")}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="">Select Country</option>
                    {countries
                      .slice()
                      .sort((a, b) => {
                        if (a.country_name === "India") return -1;
                        if (b.country_name === "India") return 1;
                        return a.country_name.localeCompare(b.country_name);
                      })
                      .map((country) => (
                        <option key={country.id} value={country.country_name}>
                          {country.country_name}
                        </option>
                      ))}
                  </select>
                  <Globe
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                    size={20}
                  />
                </div>
                {errors.countryName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.countryName.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Travel Requirements */}
          <div className="p-6 border rounded-xl bg-purple-50">
            <h3 className="relative pb-3 mb-6 text-xl font-semibold text-purple-800 border-b">
              <span className="px-3 py-1 mr-2 text-white bg-purple-600 rounded-md">
                3
              </span>
              Travel Requirements
            </h3>

            {/* Travel Dates */}
            <div className="p-4 mb-6 bg-white border rounded-lg">
              <span className="mb-3 font-extrabold text-purple-600 text-md">
                Travel Dates
              </span>
              <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="w-full md:w-[20%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Pickup Date & Time{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <input
                          type="datetime-local"
                          {...register("pickupDateTime")}
                          min={minDate}
                          max={maxDate}
                          className="w-full bg-white py-2 pl-10 pr-3 border border-gray-300 rounded-md"
                        />
                        <Calendar
                          className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                          size={20}
                        />
                      </div>
                      {errors.pickupDateTime && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.pickupDateTime.message}
                        </p>
                      )}
                    </div>

                    <div className="w-full md:w-[20%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Pickup City <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          {...register("pickupcity")}
                          className="w-full py-2 pl-10 pr-8 border border-gray-300 rounded-md appearance-none bg-white"
                        >
                          <option value="">Select Pickup City</option>
                          {travelcity?.map((city) => (
                            <option
                              key={city.id || city.uuid}
                              value={city.cityName}
                            >
                              {city.cityName}
                            </option>
                          ))}
                        </select>
                        <MapPin
                          className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                          size={20}
                        />
                      </div>
                      {errors.pickupcity && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.pickupcity.message}
                        </p>
                      )}
                    </div>

                    <div className="w-full md:w-[50%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Pickup Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <input
                          {...register("pickupAddress")}
                          className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md"
                          placeholder="Enter pickup address"
                        />
                        <MapPin
                          className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                          size={20}
                        />
                      </div>
                      {errors.pickupAddress && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.pickupAddress.message}
                        </p>
                      )}
                    </div>

                    <div className="w-full md:w-[10%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        No. of Days <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          {...register("days", { valueAsNumber: true })}
                          readOnly={serviceType === "Pick & Drop"}
                          className={`w-full ${serviceType === "Pick & Drop" ? "bg-purple-400" : "bg-purple-600"} text-white font-extrabold text-2xl py-2 text-center border border-gray-300 rounded-md`}
                          placeholder="Total Days"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold">
                          days
                        </span>
                      </div>
                      {errors.days && (
                        <p className="mt-1 text-sm text-red-500 text-center">
                          {errors.days.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap md:flex-nowrap gap-4">
                    <div className="w-full md:w-[20%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Drop Date & Time
                      </label>
                      <div className="relative group">
                        <input
                          type="datetime-local"
                          {...register("dropDateTime")}
                          min={pickupDateTime || minDate}
                          max={maxDate}
                          className="w-full bg-white py-2 pl-10 pr-3 border border-gray-300 rounded-md"
                        />
                        <Calendar
                          className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                          size={20}
                        />
                      </div>
                    </div>

                    <div className="w-full md:w-[15%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Drop City <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          {...register("dropcity")}
                          className="w-full py-2 pl-10 pr-8 border border-gray-300 rounded-md appearance-none bg-white"
                        >
                          <option value="">Select Drop City</option>
                          {travelcity?.map((city) => (
                            <option
                              key={city.id || city.uuid}
                              value={city.cityName}
                            >
                              {city.cityName}
                            </option>
                          ))}
                        </select>
                        <MapPin
                          className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                          size={20}
                        />
                      </div>
                      {errors.dropcity && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.dropcity.message}
                        </p>
                      )}
                    </div>

                    <div className="w-full md:w-[30%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Drop Address
                      </label>
                      <input
                        {...register("dropAddress")}
                        className="w-full py-2 pl-3 pr-3 border border-gray-300 rounded-md"
                        placeholder="Address"
                      />
                    </div>

                    <div className="w-full md:w-[15%]">
                      <label className="block text-md font-extrabold text-gray-700 mb-1">
                        Service
                      </label>
                      <select
                        {...register("serviceType")}
                        onChange={(e) => {
                          register("serviceType").onChange(e);
                          if (e.target.value === "Pick & Drop")
                            setValue("days", 2);
                        }}
                        className="w-full py-2 border bg-white px-3 border-gray-300 rounded-md"
                      >
                        <option value="">Select</option>
                        {SERVICE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {serviceType === "Round Trip" && (
                      <div className="w-full md:w-[20%]">
                        <label className="block text-md font-extrabold text-gray-700 mb-1">
                          Trip Type
                        </label>
                        <div className="flex items-center gap-6 mt-2">
                          {TRIP_TYPE_OPTIONS.map((opt) => (
                            <label
                              key={opt}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="radio"
                                value={opt}
                                {...register("tripType")}
                                className="accent-blue-500"
                              />
                              <span className="text-sm font-semibold">
                                {opt}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Itinerary Details */}
            <div className="p-4 mb-6 bg-white border rounded-lg">
              <span className="mb-6 font-extrabold text-purple-600 text-md">
                Itinerary Details
              </span>
              <div className="grid grid-cols-1 gap-4 mt-2 md:grid-cols-2">
                <div>
                  <label className="block mb-1 mt-6 font-extrabold text-gray-700 text-md">
                    Add Itinerary
                  </label>
                  <div className="relative group">
                    <input
                      value={currentItinerary}
                      onChange={(e) => setCurrentItinerary(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addItinerary())
                      }
                      className="w-full px-3 py-2 pl-10 bg-white border border-gray-300 rounded-md"
                      placeholder="Enter itinerary item"
                    />
                    <FileText
                      className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                      size={20}
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Added Itineraries ({itineraryList.length}/25)
                  </label>
                  <div className="flex flex-wrap gap-2 overflow-y-auto max-h-32">
                    {itineraryList.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-purple-800 bg-purple-100 rounded cursor-move"
                        draggable
                        onDragStart={(e) =>
                          e.dataTransfer.setData("text/plain", idx.toString())
                        }
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          const draggedIdx = parseInt(
                            e.dataTransfer.getData("text/plain"),
                          );
                          if (draggedIdx !== idx)
                            reorderItinerary(draggedIdx, idx);
                        }}
                      >
                        <GripVertical size={14} className="text-purple-600" />
                        <span>{item}</span>
                        <button
                          onClick={() => removeItinerary(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-4">
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Actual KM <span className="text-red-500">*</span>
                  </label>
                  <div className="relative max-w-[180px]">
                    <input
                      type="number"
                      {...register("km")}
                      className="w-full bg-purple-600 text-white font-extrabold text-2xl py-2 pl-6 text-center pr-10 border border-gray-300 rounded-md"
                      placeholder="Total KM"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold">
                      KM
                    </span>
                  </div>
                  {errors.km && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.km.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-md font-extrabold text-gray-700 mb-1">
                    Occasion Type
                  </label>
                  <div className="relative group">
                    <select
                      {...register("occasion")}
                      className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md"
                    >
                      <option value="">Select Occasion Type</option>
                      {OCCASION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <FileText
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                      size={20}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Details */}
            <div className="p-6 mt-6 bg-white border rounded-xl">
              <span className="mb-3 font-extrabold text-purple-900 text-md">
                Passenger Details
              </span>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Total Passengers <span className="text-red-500">*</span>
                  </label>
                  <div className="relative max-w-[180px]">
                    <input
                      type="number"
                      {...register("passengerTotal", { valueAsNumber: true })}
                      className="w-full bg-purple-600 text-white font-extrabold text-2xl py-2 text-center border border-gray-300 rounded-md"
                      placeholder="Total Pax"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold">
                      Pax
                    </span>
                  </div>
                  {errors.passengerTotal && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.passengerTotal.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Number of Pets
                  </label>
                  <div className="relative max-w-[180px]">
                    <input
                      type="number"
                      {...register("petsNumber", { valueAsNumber: true })}
                      className="w-full bg-red-600 text-white font-extrabold text-2xl py-2 text-center border border-gray-300 rounded-md"
                      placeholder="No. of pets"
                      min="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold">
                      pets
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Pet Names
                  </label>
                  <div className="relative group">
                    <input
                      {...register("petsNames")}
                      className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md"
                      placeholder="Enter pet names"
                    />
                    <FileText
                      className="absolute text-purple-800 -translate-y-1/2 left-3 top-1/2"
                      size={20}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Baggage Details */}
            <div className="p-6 mt-6 bg-white border rounded-xl">
              <span className="mb-3 font-extrabold text-purple-900 text-md">
                Baggage Details
              </span>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5 mt-4">
                {[
                  "smallbaggage",
                  "mediumbaggage",
                  "largebaggage",
                  "airportbaggage",
                ].map((baggage, idx) => (
                  <div key={idx}>
                    <label className="block mb-1 font-extrabold text-gray-700 text-md">
                      {baggage.charAt(0).toUpperCase() +
                        baggage.slice(1).replace("baggage", " Baggage")}
                    </label>
                    <div className="relative group">
                      <input
                        type="number"
                        {...register(baggage as any, { valueAsNumber: true })}
                        className="w-full py-2 bg-white pl-10 pr-3 border border-gray-300 rounded-md"
                        placeholder={`${baggage.replace("baggage", "Baggage")}`}
                      />
                      <Luggage
                        className="absolute text-purple-800 -translate-y-1/2 left-3 top-1/2"
                        size={16}
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Total Baggage
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      {...register("totalbaggage", { valueAsNumber: true })}
                      readOnly
                      className="w-full bg-purple-600 text-white font-extrabold text-2xl py-2 pl-8 text-center pr-10 border border-gray-300 rounded-md"
                      placeholder="Total"
                    />
                    <Luggage
                      className="absolute text-white -translate-y-1/2 left-3 top-1/2"
                      size={20}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Details with Quantities */}
            <div className="p-6 bg-white border rounded-xl mt-4">
              <span className="mb-3 font-extrabold text-purple-900 text-md">
                Vehicle Details (Optional)
              </span>
              <div className="flex flex-wrap gap-4 mt-4">
                {/* Vehicle Type 1 */}
                <div className="w-full md:w-[20%]">
                  <label className="block text-md font-extrabold text-gray-700 mb-1">
                    Vehicle Type 1
                  </label>
                  <div className="flex gap-2">
                    <div className="relative group flex-1">
                      <select
                        {...register("vehicles")}
                        className="py-2 border bg-white px-12 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                      >
                        <option value="">Select Vehicle Type</option>
                        {sortVehicleCodes(vehicleCodes).map(
                          (vehicle: { code: string; name: string }, index) => (
                            <option
                              key={`${vehicle.code}-${index}`}
                              value={vehicle.code}
                            >
                              {vehicle.code}
                            </option>
                          ),
                        )}
                      </select>
                      <FileText
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                        size={20}
                      />
                    </div>
                    <input
                      type="number"
                      placeholder="Qty"
                      className="w-20 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      min="1"
                      {...register("vehicle1Quantity", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                {/* Vehicle Type 2 */}
                <div className="w-full md:w-[20%]">
                  <label className="block text-md font-extrabold text-gray-700 mb-1">
                    Vehicle Type 2
                  </label>
                  <div className="flex gap-2">
                    <div className="relative group flex-1">
                      <select
                        {...register("vehicle2")}
                        className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Vehicle Type 2</option>
                        {sortVehicleCodes(vehicleCodes).map(
                          (vehicle: { code: string; name: string }, index) => (
                            <option
                              key={`${vehicle.code}-type2-${index}`}
                              value={vehicle.code}
                            >
                              {vehicle.code}
                            </option>
                          ),
                        )}
                      </select>
                      <FileText
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                        size={20}
                      />
                    </div>
                    <input
                      type="number"
                      placeholder="Qty"
                      className="w-20 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      min="1"
                      {...register("vehicle2Quantity", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                {/* Vehicle Type 3 */}
                <div className="w-full md:w-[20%]">
                  <label className="block text-md font-extrabold text-gray-700 mb-1">
                    Vehicle Type 3
                  </label>
                  <div className="flex gap-2">
                    <div className="relative group flex-1">
                      <select
                        {...register("vehicle3")}
                        className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Vehicle Type 3</option>
                        {sortVehicleCodes(vehicleCodes).map(
                          (vehicle: { code: string; name: string }, index) => (
                            <option
                              key={`${vehicle.code}-type3-${index}`}
                              value={vehicle.code}
                            >
                              {vehicle.code}
                            </option>
                          ),
                        )}
                      </select>
                      <FileText
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                        size={20}
                      />
                    </div>
                    <input
                      type="number"
                      placeholder="Qty"
                      className="w-20 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      min="1"
                      {...register("vehicle3Quantity", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                {/* Total Vehicle Requirement */}
                <div className="w-full md:w-[35%]">
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Total Vehicle Requirement
                  </label>
                  <div className="relative group">
                    <input
                      {...register("requirementVehicle")}
                      className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      placeholder="Auto-filled when vehicles selected"
                      readOnly
                    />
                    <FileText
                      className="absolute text-purple-800 -translate-y-1/2 left-3 top-1/2"
                      size={20}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-1">
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Remark
                </label>
                <div className="relative group">
                  <textarea
                    {...register("remarks")}
                    rows={4}
                    placeholder="Enter your remark..."
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md resize-none"
                  />
                  <FileText
                    className="absolute left-3 top-3 text-green-600"
                    size={20}
                  />
                </div>
              </div>
            </div>

            {/* Lost Reason Section */}
            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3">
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  LOST REASON
                </label>
                <div className="relative group">
                  <select
                    {...register("lost_reason")}
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md"
                  >
                    <option value="">Select Lost Reason</option>
                    {LOST_REASON_OPTIONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                  <FileText
                    className="absolute left-3 top-3 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Lost Reason Details
                </label>
                <div className="relative group">
                  <textarea
                    {...register("lostReasonDetails")}
                    rows={4}
                    placeholder="Enter lost reason details..."
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md resize-none"
                  />
                  <FileText
                    className="absolute left-3 top-3 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Follow Up
                </label>
                <div className="relative group">
                  <textarea
                    {...register("followUp")}
                    rows={4}
                    placeholder="Enter follow up notes..."
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md resize-none"
                  />
                  <FileText
                    className="absolute left-3 top-3 text-green-600"
                    size={20}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            {!isValid && Object.keys(errors).length > 0 && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <p className="font-semibold mb-2">
                  Please fix the following errors:
                </p>
                <ul className="list-disc list-inside text-sm">
                  {Object.entries(errors)
                    .slice(0, 5)
                    .map(([key, error]: any) => (
                      <li key={key}>{error?.message || `${key} is invalid`}</li>
                    ))}
                </ul>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-6 py-3 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-900 text-white hover:bg-blue-500"
              }`}
            >
              {isSubmitting ? "Updating..." : "Update Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesEditLeadForm;
