"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SubmitHandler } from "react-hook-form";
import { getAllCitiesThunk } from "@/app/features/travelcity/travelcitySlice";
import {
  fetchAllCities,
  fetchStatesByCity,
  resetStatesForCity,
} from "@/app/features/State/stateSlice";
import { useRouter } from "next/navigation";
import {
  searchCustomersThunk,
  clearSearchResults,
} from "@/app/features/NewCustomer/NewCustomerSlice";
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
  Building,
} from "lucide-react";
import { createLead, fetchLeads } from "@/app/features/lead/leadSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import { getCountriesThunk } from "@/app/features/countrycode/countrycodeSlice";
import { fetchVehicles } from "@/app/features/vehicle/vehicleSlice";

import {
  SOURCE_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  OCCASION_OPTIONS,
  TRIP_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  DEFAULT_VALUES,
} from "../../../../../types/Editleads/editleaddata";
import { currentUserThunk } from "@/app/features/user/userSlice";

// ==================== SCHEMA DEFINITION ====================
// ✅ FIX 1: presales_id optional in schema — we validate manually in onSubmit
const schema = z.object({
  date: z.string().min(1, "Date is required"),
  source: z.string().min(1, "Source is required"),
  presales_id: z.number().min(1).optional(), // ✅ optional here, enforced in onSubmit
  status: z.string().min(1, "Status is required"),
  customerType: z.string().min(1, "Customer category is required"),
  customerCategoryType: z.string().optional(),
  countryName: z.string().min(1, "Country is required"),
  customerCity: z.string().optional(),
  customerState: z.string().optional(),
  customerAddress: z.string().optional(),
  serviceType: z.string().optional(),
  tripType: z.string().optional(),
  occasion: z.string().optional(),
  pickupDateTime: z.string().optional(),
  dropDateTime: z.string().optional(),
  days: z.number().optional(),
  pickupAddress: z.string().optional(),
  multiplepickup: z.string().optional(),
  multipledrop: z.string().optional(),
  dropAddress: z.string().optional(),
  pickupcity: z.string().optional(),
  dropcity: z.string().optional(),
  city: z.string().optional(),
  passengerTotal: z.number().optional(),
  petsNumber: z.number().optional(),
  petsNames: z.string().optional(),
  vehicle2: z.string().optional(),
  vehicles: z.string().optional(),
  vehicle3: z.string().optional(),
  vehicle3Quantity: z.string().optional(),
  vehicle2Quantity: z.string().optional(),
  vehicle1Quantity: z.string().optional(),
  requirementVehicle: z.string().optional(),
  km: z.union([z.string(), z.number()]).optional(),
  smallbaggage: z.number().optional(),
  mediumbaggage: z.number().optional(),
  largebaggage: z.number().optional(),
  airportbaggage: z.number().optional(),
  totalbaggage: z.number().optional(),
  itinerary: z.array(z.string()).optional(),
  remarks: z.string().optional(),
  lost_reason: z.string().optional(),
  lostReasonDetails: z.string().optional(),
  followUp: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  city_id: z.number().optional(),
});

type FormData = z.infer<typeof schema>;

const LeadsForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { countries } = useSelector((state: RootState) => state.country);
  const { vehicleCodes } = useSelector((state: RootState) => state.vehicle);
  const { travelcity, loading } = useSelector(
    (state: RootState) => state.travelcity,
  );
  const { cities, statesForCity, citiesLoading, statesLoading } = useSelector(
    (state: RootState) => state.stateCity,
  );
  const { searchResults, searching, searchError } = useSelector(
    (state: RootState) => state.newCustomer,
  );

  const { currentUser } = useSelector((state: RootState) => state.user);

  // ✅ FIX 2: Use a ref to always have latest currentUser in onSubmit
  const currentUserRef = React.useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Fetch current user if not available
  useEffect(() => {
    if (!currentUser) {
      dispatch(currentUserThunk());
    }
  }, [dispatch, currentUser]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
    reset,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "-",
      pickupDateTime: new Date().toISOString().slice(0, 16),
      customerType: "Personal",
      date: new Date().toISOString().slice(0, 16),
      days: DEFAULT_VALUES.days,
      smallbaggage: DEFAULT_VALUES.smallbaggage,
      mediumbaggage: DEFAULT_VALUES.mediumbaggage,
      largebaggage: DEFAULT_VALUES.largebaggage,
      airportbaggage: DEFAULT_VALUES.airportbaggage,
      totalbaggage: DEFAULT_VALUES.totalbaggage,
      petsNumber: DEFAULT_VALUES.petsNumber,
      vehicles: "",
      vehicle2: "",
      vehicle3: "",
      vehicle1Quantity: "",
      vehicle2Quantity: "",
      vehicle3Quantity: "",
      requirementVehicle: "",
      serviceType: "",
      pickupAddress: "",
      pickupcity: "",
      passengerTotal: 0,
      km: "",
      presales_id: undefined,
    },
    mode: "onChange",
  });

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    alternatePhone: "",
    email: "",
    companyName: "",
  });

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState("");
  const [itineraryList, setItineraryList] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [customerCategoryTypeValue, setCustomerCategoryTypeValue] =
    useState("");
  const [alternateCountryCode, setAlternateCountryCode] = useState("+91");

  const pickupDateTime = watch("pickupDateTime");
  const dropDateTime = watch("dropDateTime");
  const smallbaggage = watch("smallbaggage");
  const mediumbaggage = watch("mediumbaggage");
  const largebaggage = watch("largebaggage");
  const airportbaggage = watch("airportbaggage");
  const customerType = watch("customerType");
  const customerCity = watch("customerCity");
  const serviceType = watch("serviceType");
  const countryName = watch("countryName");
  const vehicle1 = watch("vehicles");
  const vehicle2 = watch("vehicle2");
  const vehicle3 = watch("vehicle3");
  const qty1 = watch("vehicle1Quantity");
  const qty2 = watch("vehicle2Quantity");
  const qty3 = watch("vehicle3Quantity");

  // Fetch initial data
  useEffect(() => {
    dispatch(getCountriesThunk());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllCitiesThunk());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAllCities());
  }, [dispatch]);

  // ✅ FIX 3: Set presales_id with shouldValidate + shouldDirty flags
  useEffect(() => {
    if (currentUser?.id) {
      const userId = Number(currentUser.id);
      setValue("presales_id", userId, {
        shouldValidate: true, // ✅ triggers validation immediately
        shouldDirty: true, // ✅ marks field as dirty so RHF tracks it
      });
    }
  }, [currentUser, setValue]);

  // Fetch states when city changes
  useEffect(() => {
    if (customerCity && customerCity !== "") {
      dispatch(fetchStatesByCity(customerCity));
    } else {
      dispatch(resetStatesForCity());
      setValue("customerState", "");
    }
  }, [customerCity, dispatch, setValue]);

  // Set default country to India
  useEffect(() => {
    if (countries.length > 0) {
      const currentCountry = watch("countryName");
      if (!currentCountry) {
        const india = countries.find((c) => c.country_name === "India");
        if (india) setValue("countryName", "India");
      }
    }
  }, [countries, setValue, watch]);

  // Calculate total baggage
  useEffect(() => {
    const total =
      (Number(smallbaggage) || 0) +
      (Number(mediumbaggage) || 0) +
      (Number(largebaggage) || 0) +
      (Number(airportbaggage) || 0);
    setValue("totalbaggage", total);
  }, [smallbaggage, mediumbaggage, largebaggage, airportbaggage, setValue]);

  // Calculate days based on service type and dates
  useEffect(() => {
    if (serviceType === "Pick & Drop") {
      setValue("days", 2);
      return;
    }
    if (serviceType === "One Way") {
      setValue("days", 1);
      setValue("dropcity", "");
      setValue("dropAddress", "");
      return;
    }
    if (pickupDateTime && dropDateTime) {
      const pickup = new Date(pickupDateTime.split("T")[0]);
      const drop = new Date(dropDateTime.split("T")[0]);
      const diffDays =
        (drop.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24);
      const totalDays = diffDays + 1;
      setValue("days", totalDays > 0 ? totalDays : 1);
    } else {
      setValue("days", 0);
    }
  }, [serviceType, pickupDateTime, dropDateTime, setValue]);

  // Combine vehicle requirements
  useEffect(() => {
    const vehiclesList: string[] = [];
    if (vehicle1 && vehicle1.trim() !== "" && qty1 && qty1.trim() !== "")
      vehiclesList.push(`${vehicle1} x ${qty1}`);
    if (vehicle2 && vehicle2.trim() !== "" && qty2 && qty2.trim() !== "")
      vehiclesList.push(`${vehicle2} x ${qty2}`);
    if (vehicle3 && vehicle3.trim() !== "" && qty3 && qty3.trim() !== "")
      vehiclesList.push(`${vehicle3} x ${qty3}`);
    setValue("requirementVehicle", vehiclesList.join(", "));
  }, [vehicle1, vehicle2, vehicle3, qty1, qty2, qty3, setValue]);

  // Set initial date
  useEffect(() => {
    const now = new Date();
    setValue("date", now.toISOString().slice(0, 16));
  }, [setValue]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search customers when debounced term changes
  useEffect(() => {
    if (debouncedTerm.length >= 2) {
      dispatch(searchCustomersThunk(debouncedTerm));
      setShowDropdown(true);
    } else if (debouncedTerm.length === 0) {
      dispatch(clearSearchResults());
      setShowDropdown(false);
    }
  }, [debouncedTerm, dispatch]);

  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedTerm("");
    dispatch(clearSearchResults());
    setShowDropdown(false);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const markFieldTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
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

  const showToastMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      setTimeout(() => setSuccessMessage(""), 300);
    }, 3000);
  };

  const resetFormFields = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      phone: "",
      alternatePhone: "",
      email: "",
      companyName: "",
    });
    setItineraryList([]);
    setCurrentItinerary("");
    setCustomerCategoryTypeValue("");
    setAlternateCountryCode("+91");
    setSearchTerm("");
    setShowDropdown(false);

    // ✅ FIX 4: Always include presales_id from currentUser when resetting
    const currentUserId = currentUserRef.current?.id
      ? Number(currentUserRef.current.id)
      : undefined;

    reset({
      status: "-",
      pickupDateTime: new Date().toISOString().slice(0, 16),
      customerType: "Personal",
      date: new Date().toISOString().slice(0, 16),
      source: "",
      presales_id: currentUserId,
      countryName: "India",
      serviceType: "",
      vehicle2: "",
      vehicles: "",
      vehicle3: "",
      vehicle3Quantity: "",
      vehicle2Quantity: "",
      vehicle1Quantity: "",
      occasion: "",
      dropDateTime: "",
      pickupAddress: "",
      multiplepickup: "",
      multipledrop: "",
      dropAddress: "",
      customerAddress: "",
      dropcity: "",
      pickupcity: "",
      passengerTotal: 0,
      days: 0,
      km: "",
      petsNumber: 0,
      petsNames: "",
      smallbaggage: 0,
      mediumbaggage: 0,
      largebaggage: 0,
      airportbaggage: 0,
      totalbaggage: 0,
      requirementVehicle: "",
      remarks: "",
      itinerary: [],
      tripType: "",
      city: "",
      customerCity: "",
      customerState: "",
      city_id: undefined,
    });
  };

  const handleSelectCustomer = (customer: any) => {
    const nameParts = customer.customerName?.split(" ") || [];
    setFormData({
      firstName: nameParts[0] || "",
      middleName: nameParts.slice(1, -1).join(" ") || "",
      lastName: nameParts[nameParts.length - 1] || "",
      phone: customer.customerPhone?.replace(/\D/g, "").slice(-10) || "",
      alternatePhone: customer.alternatePhone?.replace(/\D/g, "") || "",
      email: customer.customerEmail || "",
      companyName: customer.companyName || "",
    });

    if (customer.customerCity) setValue("customerCity", customer.customerCity);
    if (customer.state) setValue("customerState", customer.state);
    if (customer.address) setValue("customerAddress", customer.address);
    if (customer.countryName) setValue("countryName", customer.countryName);
    if (customer.customerType) setValue("customerType", customer.customerType);
    if (customer.customerCategoryType) {
      setValue("customerCategoryType", customer.customerCategoryType);
      setCustomerCategoryTypeValue(customer.customerCategoryType);
    }

    dispatch(clearSearchResults());
    setSearchTerm("");
    setShowDropdown(false);
  };

  // ==================== SUBMIT HANDLER ====================
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);

    const latestUser = currentUserRef.current;

    // Check for id, _id, uuid, userId, or any other identifier field
    const userId =
      latestUser?.id || latestUser?._id || latestUser?.uuid || latestUser?.id;

    const finalPresalesId = userId
      ? Number(userId)
      : data.presales_id && !isNaN(Number(data.presales_id))
        ? Number(data.presales_id)
        : null;

    if (!finalPresalesId || isNaN(finalPresalesId)) {
      console.error(
        "presales_id is missing. currentUser:",
        latestUser,
        "form value:",
        data.presales_id,
      );
      showToastMessage(
        "Error: Presales user not assigned. Please refresh the page and try again.",
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: any = {
        date: data.date
          ? data.date.split("T")[0]
          : new Date().toISOString().split("T")[0],
        enquiryTime: data.date ? `${data.date}:00` : new Date().toISOString(),
        source: data.source || "",
        status: data.status || "-",
        presales_id: finalPresalesId, // ✅ ALWAYS a valid number here
        firstName: formData.firstName || "",
        middleName: formData.middleName || "",
        lastName: formData.lastName || "",
        customerPhone: formData.phone ? `+91 ${formData.phone}` : "",
        alternatePhone: formData.alternatePhone
          ? `${alternateCountryCode} ${formData.alternatePhone}`
          : "",
        customerEmail: formData.email || "",
        companyName:
          formData.companyName === "C" ? "" : formData.companyName || "",
        customerType: data.customerType || "Personal",
        customerCategoryType: data.customerCategoryType || "",
        serviceType: data.serviceType || "",
        occasion: data.occasion || "",
        tripType: data.tripType || "",
        pickupDateTime: data.pickupDateTime
          ? `${data.pickupDateTime}:00`
          : null,
        dropDateTime: data.dropDateTime ? `${data.dropDateTime}:00` : null,
        pickupAddress: data.pickupAddress || "",
       multiplepickup:data.multiplepickup ||"",
        multipledrop:data.multipledrop ||"",

        dropAddress: data.dropAddress || "",
        customerAddress: data.customerAddress || "",
        pickupcity: data.pickupcity || "",
        dropcity: data.dropcity || "",
        itinerary: itineraryList || [],
        vehicles: data.vehicles || "",
        vehicle2: data.vehicle2 || "",
        vehicle3: data.vehicle3 || "",
        vehicle3Quantity: data.vehicle3Quantity || "",
        vehicle2Quantity: data.vehicle2Quantity || "",
        vehicle1Quantity: data.vehicle1Quantity || "",
        requirementVehicle: data.requirementVehicle || "",
        passengerTotal: data.passengerTotal || 0,
        days: Number(data.days) || 0,
        km: data.km
          ? typeof data.km === "string"
            ? parseInt(data.km) || 0
            : data.km
          : 0,
        petsNumber: Number(data.petsNumber) || 0,
        petsNames: data.petsNames || "",
        smallBaggage: Number(data.smallbaggage) || 0,
        mediumBaggage: Number(data.mediumbaggage) || 0,
        largeBaggage: Number(data.largebaggage) || 0,
        airportBaggage: Number(data.airportbaggage) || 0,
        totalBaggage: Number(data.totalbaggage) || 0,
        remarks: data.remarks || "",
        countryName: data.countryName || "",
        customerCity: data.customerCity || "",
        customerState: data.customerState || "",
        city: data.city || "",
        city_id: data.city_id || null,
        message: "",
        lost_reason: data.lost_reason || "",
        lostReasonDetails: data.lostReasonDetails || "",
        followUp: data.followUp || "",
      };

      const result = await dispatch(createLead(payload)).unwrap();

      showToastMessage("Lead created successfully!");
      resetFormFields();

      dispatch(fetchLeads(1));
      window.dispatchEvent(new CustomEvent("leadSubmitted"));
      window.dispatchEvent(new CustomEvent("navigateToLeadTable"));
    } catch (error: any) {
      console.error("❌ Submit Error:", error);
      let errorMessage = "Failed to save lead. Please try again.";
      if (error?.message) errorMessage = error.message;
      else if (error?.payload) errorMessage = error.payload;
      else if (error?.data?.message) errorMessage = error.data.message;
      showToastMessage(errorMessage);
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

  return (
    <div>
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed right-4 top-4 animate-slide-in-right z-50">
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[320px]">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
            <button
              onClick={() => {
                setShowSuccessToast(false);
                setTimeout(() => setSuccessMessage(""), 300);
              }}
              className="text-green-600 hover:text-green-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-orange-100 p-3 rounded-md">
        <div className="flex justify-between items-center">
          <div className="pl-4 border-l-8 border-orange-500 bg-white px-3 rounded-md shadow-md">
            <h2 className="text-4xl font-bold text-left py-4 text-orange-600">
              New Leads Form
            </h2>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 mx-auto bg-white shadow-xl rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* SECTION 1: Enquiry Information */}
          <div className="border rounded-xl p-6 bg-blue-50">
            <h3 className="text-xl font-semibold text-blue-800 mb-6 pb-3 border-b relative">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-md mr-2">
                1
              </span>
              Enquiry Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date */}
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
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Source */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Source
                </label>
                <div className="relative group">
                  <Info
                    size={15}
                    className="absolute -top-4 right-0 text-blue-500 cursor-help"
                  />
                  <select
                    {...register("source")}
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Source Type</option>
                    {SOURCE_OPTIONS.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                    size={20}
                  />
                </div>
                {errors.source && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.source.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Presales
                </label>
                <div className="relative">
                  <div className="w-full py-2 px-12 border bg-gray-100 border-gray-300 rounded-md text-gray-700 min-h-[40px] flex items-center">
                    {currentUser ? (
                      <span className="font-medium text-gray-800">
                        {currentUser.fullName ||
                          currentUser.name ||
                          `User #${currentUser.id}`}
                      </span>
                    ) : (
                      <span className="text-gray-400 animate-pulse">
                        Loading...
                      </span>
                    )}
                  </div>
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                    size={20}
                  />
                </div>
                {/* Show warning if user not loaded */}
                {!currentUser && (
                  <p className="text-amber-600 text-xs mt-1">
                    ⚠ Waiting for user session...
                  </p>
                )}
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
                    {...register("city_id", { valueAsNumber: true })}
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select City</option>
                    {Array.isArray(currentUser?.city_ids) &&
                    currentUser.city_ids.length > 0 ? (
                      currentUser.city_ids.map((id: number, index: number) => (
                        <option key={id} value={id}>
                          {Array.isArray(currentUser?.city_names) &&
                          currentUser.city_names[index]
                            ? currentUser.city_names[index]
                            : `City ${id}`}
                        </option>
                      ))
                    ) : (
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

          {/* SECTION 2: Customer Information */}
          <div className="border rounded-xl p-6 bg-green-50">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
              <h3 className="text-xl font-semibold text-green-800 flex items-center">
                <span className="bg-green-600 text-white px-3 py-1 rounded-md mr-2">
                  2
                </span>
                Customer Information
              </h3>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search customers by name, email or phone..."
                  className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() =>
                    searchResults.length > 0 && setShowDropdown(true)
                  }
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}

                {searching && (
                  <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50 p-4 text-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mx-auto"></div>
                    <span className="text-sm text-gray-500 ml-2">
                      Searching...
                    </span>
                  </div>
                )}

                {showDropdown && !searching && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {searchResults.map((customer) => (
                      <div
                        key={customer.uuid}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b transition-colors"
                        onMouseDown={() => handleSelectCustomer(customer)}
                      >
                        <div className="font-semibold text-gray-800">
                          {customer.customerName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {customer.customerEmail && (
                            <span>{customer.customerEmail} | </span>
                          )}
                          {customer.customerPhone}
                        </div>
                        {customer.companyName && (
                          <div className="text-xs text-gray-500 mt-1">
                            {customer.companyName}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {showDropdown &&
                  !searching &&
                  searchTerm.length >= 2 &&
                  searchResults.length === 0 &&
                  !searchError && (
                    <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50 p-4 text-center text-gray-500">
                      No customers found for "{searchTerm}"
                    </div>
                  )}

                {searchError && (
                  <div className="absolute top-full mt-2 w-full bg-red-50 border border-red-200 rounded-lg shadow-lg z-50 p-3 text-center">
                    <p className="text-red-600 text-sm">{searchError}</p>
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="mt-2 text-sm text-red-700 hover:text-red-900"
                    >
                      Clear and try again
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* First Name */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Info
                    size={15}
                    className="absolute -top-4 right-0 text-blue-500 cursor-help"
                  />
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("firstName")}
                    className="w-full py-2 border bg-white pl-10 pr-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={50}
                    placeholder="Enter Customer first name"
                    required
                  />
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Middle Name */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Middle Name
                </label>
                <div className="relative group">
                  <Info
                    size={15}
                    className="absolute -top-4 right-0 text-blue-500 cursor-help"
                  />
                  <input
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("middleName")}
                    className="w-full py-2 border bg-white pl-10 pr-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={50}
                    placeholder="Enter Customer middle name"
                  />
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Info
                    size={15}
                    className="absolute -top-4 right-0 text-blue-500 cursor-help"
                  />
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("lastName")}
                    className="w-full py-2 border bg-white pl-10 pr-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={50}
                    placeholder="Enter Customer last name"
                    required
                  />
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Phone No. (India) */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Phone No. (India) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <div className="bg-gray-100 px-3 py-2 text-sm font-medium min-w-[80px] text-center">
                    +91 IND
                  </div>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(
                        /[^0-9]/g,
                        "",
                      );
                      handleFieldChange({
                        ...e,
                        target: {
                          ...e.target,
                          name: "phone",
                          value: numericValue,
                        },
                      });
                    }}
                    placeholder="Enter 10 digit number"
                    className="w-full py-2 px-3 outline-none"
                    maxLength={10}
                    inputMode="numeric"
                    required
                  />
                  <Phone
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Alternate Phone */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Phone No. (Other)
                </label>
                <div className="relative flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <select
                    value={alternateCountryCode}
                    onChange={(e) => setAlternateCountryCode(e.target.value)}
                    className="bg-gray-100 px-2 py-2 outline-none text-sm cursor-pointer min-w-[100px]"
                  >
                    <option value="">Select Code</option>
                    {countries.map((code) => (
                      <option key={code.id} value={code.country_code}>
                        {code.country_code} {code.phone_code}
                      </option>
                    ))}
                  </select>
                  <input
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(
                        /[^0-9]/g,
                        "",
                      );
                      handleFieldChange({
                        ...e,
                        target: {
                          ...e.target,
                          name: "alternatePhone",
                          value: numericValue,
                        },
                      });
                    }}
                    placeholder="Enter phone number"
                    className="w-full py-2 px-3 outline-none"
                    maxLength={15}
                    inputMode="numeric"
                  />
                  <Phone
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative group">
                  <Info
                    size={15}
                    className="absolute -top-4 right-0 text-blue-500 cursor-help"
                  />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("email")}
                    placeholder="Enter email address"
                    className="w-full py-2 border bg-white pl-10 pr-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={100}
                  />
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
              </div>

              {/* Customer Category */}
              <div className="w-full">
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Customer Category <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Info
                    size={15}
                    className="absolute -top-4 right-0 text-blue-500 cursor-help"
                  />
                  <select
                    {...register("customerType")}
                    onChange={(e) => {
                      const value = e.target.value;
                      register("customerType").onChange(e);
                      if (value === "Personal") {
                        setFormData((prev) => ({ ...prev, companyName: "C" }));
                      } else if (formData.companyName === "C") {
                        setFormData((prev) => ({ ...prev, companyName: "" }));
                      }
                    }}
                    className="w-full py-2 border bg-white pl-10 pr-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Customer Type */}
              <div className="w-full">
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Customer Type
                </label>
                <div className="relative group">
                  <select
                    {...register("customerCategoryType")}
                    value={customerCategoryTypeValue}
                    onChange={(e) => {
                      register("customerCategoryType").onChange(e);
                      setCustomerCategoryTypeValue(e.target.value);
                    }}
                    className="w-full py-2 border bg-white pl-10 pr-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Company Name (Conditional) */}
              {customerType !== "Personal" && (
                <div className="w-full">
                  <label className="block text-md font-extrabold text-gray-700 mb-1">
                    Company Name
                  </label>
                  <div className="relative group">
                    <Info
                      size={15}
                      className="absolute -top-4 right-0 text-blue-500 cursor-help"
                    />
                    <input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleFieldChange}
                      onBlur={() => markFieldTouched("companyName")}
                      className="w-full pl-10 pr-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={100}
                      placeholder="Enter company name"
                    />
                    <Building
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                      size={20}
                    />
                  </div>
                </div>
              )}

              {/* Country Name */}
              <div className="w-full">
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Country Name
                </label>
                <div className="relative group">
                  <Info
                    size={15}
                    className="absolute -top-4 right-0 text-blue-500 cursor-help z-10"
                  />
                  <select
                    {...register("countryName")}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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

              {/* Customer City - Only show for India */}
              {countryName === "India" && (
                <div className="w-full">
                  <label className="block text-md font-extrabold text-gray-700 mb-1">
                    Customer City
                  </label>
                  <div className="relative group">
                    <Info
                      size={15}
                      className="absolute -top-4 right-0 text-blue-500 cursor-help z-10"
                    />
                    <select
                      {...register("customerCity")}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      disabled={citiesLoading}
                    >
                      <option value="">
                        {citiesLoading
                          ? "Loading cities..."
                          : "Select Customer City"}
                      </option>
                      {cities?.map((city) => (
                        <option
                          key={city.id || city.uuid}
                          value={city.cityName}
                        >
                          {city.cityName}
                        </option>
                      ))}
                    </select>
                    <Globe
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                      size={20}
                    />
                  </div>
                </div>
              )}

              {/* Customer State - Only show for India */}
              {countryName === "India" && (
                <div className="w-full">
                  <label className="block text-md font-extrabold text-gray-700 mb-1">
                    Customer State
                  </label>
                  <div className="relative group">
                    <Info
                      size={15}
                      className="absolute -top-4 right-0 text-blue-500 cursor-help z-10"
                    />
                    <select
                      {...register("customerState")}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      disabled={!customerCity || statesLoading}
                    >
                      <option value="">
                        {!customerCity
                          ? "Please select a city first"
                          : statesLoading
                            ? "Loading states..."
                            : "Select Customer State"}
                      </option>
                      {statesForCity?.map((state) => (
                        <option key={state.id} value={state.stateName}>
                          {state.stateName}
                        </option>
                      ))}
                    </select>
                    <Globe
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                      size={20}
                    />
                  </div>
                </div>
              )}

              {/* Customer Address */}
              <div className="w-full">
                <label className="block mb-1 font-extrabold text-gray-700 text-md">
                  Customer Address
                </label>
                <textarea
                  {...register("customerAddress")}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter complete customer address"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Travel Requirements */}
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
                    {/* Pickup Date */}
                    <div className="w-full md:w-[20%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Pickup Date & Time
                      </label>
                      <div className="relative group">
                        <Info
                          size={15}
                          className="absolute -top-6 right-0 text-blue-500 cursor-help"
                        />
                        <input
                          type="datetime-local"
                          {...register("pickupDateTime")}
                          min={minDate}
                          max={maxDate}
                          className="w-full bg-white py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Pickup City */}
                    <div className="w-full md:w-[20%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Pickup City
                      </label>
                      <div className="relative">
                        <select
                          {...register("pickupcity")}
                          className="w-full py-2 pl-10 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
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
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                      {errors.pickupcity && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.pickupcity.message}
                        </p>
                      )}
                    </div>

                    

                    {/* Pickup Address */}
                    <div className="w-full md:w-[40%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        Pickup Address
                      </label>
                      <div className="relative group">
                        <Info
                          size={15}
                          className="absolute -top-6 right-0 text-blue-500 cursor-help"
                        />
                        <input
                          {...register("pickupAddress")}
                          className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Multiple Pickup City */}
                    <div className="w-full md:w-[30%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                          Additional Pickup Addresses
                      </label>
                      <div className="relative group">
                        <Info
                          size={15}
                          className="absolute -top-6 right-0 text-blue-500 cursor-help"
                        />
                        <input
                          {...register("multiplepickup")}
                          className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="multiple pickup city"
                        />
                        <MapPin
                          className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                          size={20}
                        />
                      </div>
                      {errors.multiplepickup && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.multiplepickup.message}
                        </p>
                      )}
                    </div>

                    {/* No. of Days */}
                    <div className="w-full md:w-[10%]">
                      <label className="block mb-1 font-extrabold text-gray-700 text-md">
                        No. of Days
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          {...register("days", { valueAsNumber: true })}
                          readOnly={serviceType === "Pick & Drop"}
                          className={`w-full ${serviceType === "Pick & Drop" ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600"} text-white placeholder:text-white/80 font-extrabold text-2xl py-2 pl-8 pr-8 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Total Days"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold pointer-events-none">
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
                    {/* Drop Date */}
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
                          className="w-full bg-white py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Calendar
                          className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                          size={20}
                        />
                      </div>
                    </div>

                    {watch("serviceType") !== "One Way" && (
                      <>
                        <div className="w-full md:w-[15%]">
                          <label className="block mb-1 font-extrabold text-gray-700 text-md">
                            Drop City
                          </label>
                          <div className="relative">
                            {loading ? (
                              <div className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md bg-gray-50 animate-pulse">
                                Loading cities...
                              </div>
                            ) : (
                              <select
                                {...register("dropcity")}
                                className="w-full py-2 pl-10 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                              >
                                <option value="">Select Drop City</option>
                                {travelcity?.length > 0 ? (
                                  travelcity.map((city) => (
                                    <option
                                      key={city.id || city.uuid}
                                      value={city.cityName}
                                    >
                                      {city.cityName}
                                    </option>
                                  ))
                                ) : (
                                  <option disabled>No cities available</option>
                                )}
                              </select>
                            )}
                            <MapPin
                              className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                              size={20}
                            />
                            {!loading && (
                              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg
                                  className="w-4 h-4 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            )}
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
                            className="w-full py-2 pl-3 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Address"
                          />
                        </div>

                         {/* Multiple Drop City */}
                        <div className="w-full md:w-[30%]">
                          <label className="block mb-1 font-extrabold text-gray-700 text-md">
                            Additional Drop Addresses
                          </label>
                          <div className="relative group">
                            <Info
                              size={15}
                              className="absolute -top-6 right-0 text-blue-500 cursor-help"
                            />
                            <input
                              {...register("multipledrop")}
                              className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="multiple pickup city"
                            />
                            <MapPin
                              className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                              size={20}
                            />
                          </div>
                          {errors.multipledrop && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.multipledrop.message}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Service Type */}
                    <div className="w-full md:w-[15%]">
                      <label className="block text-md font-extrabold text-gray-700 mb-1">
                        Service
                      </label>
                      <select
                        {...register("serviceType")}
                        onChange={(e) => {
                          const value = e.target.value;
                          register("serviceType").onChange(e);
                          if (value === "Pick & Drop") setValue("days", 2);
                        }}
                        className="w-full py-2 border bg-white px-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        {SERVICE_TYPE_OPTIONS.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>

                    {(serviceType === "Round Trip" ||
                      serviceType === "Round Trip Drop") && (
                      <div className="w-full md:w-[20%]">
                        <label className="block text-md font-extrabold text-gray-700 mb-1">
                          Trip Type
                        </label>
                        <div className="flex items-center gap-6 mt-2">
                          {TRIP_TYPE_OPTIONS.map((type) => (
                            <label
                              key={type}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="radio"
                                value={type}
                                {...register("tripType")}
                                className="accent-blue-500"
                              />
                              <span className="text-sm font-semibold">
                                {type}
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
              <div>
                <div className="grid grid-cols-1 gap-4 mt-2 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 mt-6 font-extrabold text-gray-700 text-md">
                      Add Itinerary
                    </label>
                    <div className="relative group">
                      <input
                        value={currentItinerary}
                        onChange={(e) => setCurrentItinerary(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addItinerary();
                          }
                        }}
                        className="w-full px-3 py-2 pl-10 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            if (draggedIdx !== idx) {
                              const newList = [...itineraryList];
                              const [removed] = newList.splice(draggedIdx, 1);
                              newList.splice(idx, 0, removed);
                              setItineraryList(newList);
                              setValue("itinerary", newList);
                            }
                          }}
                        >
                          <GripVertical size={14} className="text-purple-600" />
                          <span>{item}</span>
                          <button
                            type="button"
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
                      Actual KM
                    </label>
                    <div className="relative max-w-[180px]">
                      <input
                        type="number"
                        {...register("km")}
                        className="w-full placeholder:text-white/80 bg-purple-600 text-white font-extrabold text-2xl py-2 pl-6 text-center pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Total KM"
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white pointer-events-none">
                        📍
                      </span>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold pointer-events-none">
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
                        className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Occasion Type</option>
                        {OCCASION_OPTIONS.map((occasion) => (
                          <option key={occasion} value={occasion}>
                            {occasion}
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
            </div>

            {/* Passenger Details */}
            <div className="p-6 mt-6 bg-white border rounded-xl">
              <span className="mb-3 font-extrabold text-purple-900 text-md">
                Passenger Details
              </span>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Total Passengers
                  </label>
                  <div className="relative max-w-[180px]">
                    <input
                      type="number"
                      {...register("passengerTotal", { valueAsNumber: true })}
                      className="w-full bg-purple-600 placeholder:text-white/80 text-white font-extrabold text-2xl py-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Total Pax"
                      min="1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold pointer-events-none">
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
                      className="w-full bg-red-600 placeholder:text-white/80 text-white font-extrabold text-2xl py-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="No. of pets"
                      min="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold pointer-events-none">
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
                      className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Small Baggage
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      {...register("smallbaggage", { valueAsNumber: true })}
                      className="w-full py-2 bg-white pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Small Baggage"
                    />
                    <Luggage
                      className="absolute text-purple-800 -translate-y-1/2 left-3 top-1/2"
                      size={16}
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Medium Baggage
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      {...register("mediumbaggage", { valueAsNumber: true })}
                      className="w-full py-2 bg-white pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Medium Baggage"
                    />
                    <Luggage
                      className="absolute text-purple-800 -translate-y-1/2 left-3 top-1/2"
                      size={20}
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Large Baggage
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      {...register("largebaggage", { valueAsNumber: true })}
                      className="w-full py-2 bg-white pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Large Baggage"
                    />
                    <Luggage
                      className="absolute text-purple-800 -translate-y-1/2 left-3 top-1/2"
                      size={20}
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Airport Baggage
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      {...register("airportbaggage", { valueAsNumber: true })}
                      className="w-full py-2 bg-white pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Airport Baggage"
                    />
                    <Luggage
                      className="absolute text-purple-800 -translate-y-1/2 left-3 top-1/2"
                      size={20}
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-extrabold text-gray-700 text-md">
                    Total Baggage
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      {...register("totalbaggage", { valueAsNumber: true })}
                      readOnly
                      className="w-full bg-purple-600 text-white font-extrabold text-2xl py-2 pl-8 text-center pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Vehicle Details */}
            <div className="p-6 bg-white border rounded-xl mt-4">
              <span className="mb-3 font-extrabold text-purple-900 text-md">
                Vehicle Details (Optional)
              </span>
              <div className="flex flex-wrap gap-4 mt-4">
                {/* Vehicle 1 */}
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
                        {[...vehicleCodes]
                          .sort((a, b) => {
                            const numA = parseInt(
                              a.code.match(/\d+/)?.[0] || "0",
                            );
                            const numB = parseInt(
                              b.code.match(/\d+/)?.[0] || "0",
                            );
                            if (numA !== numB) return numA - numB;
                            return a.code.localeCompare(b.code);
                          })
                          .map(
                            (
                              vehicle: { code: string; name: string },
                              index,
                            ) => (
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
                      {...register("vehicle1Quantity")}
                    />
                  </div>
                </div>

                {/* Vehicle 2 */}
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
                        {[...vehicleCodes]
                          .sort((a, b) => {
                            const numA = parseInt(
                              a.code.match(/\d+/)?.[0] || "0",
                            );
                            const numB = parseInt(
                              b.code.match(/\d+/)?.[0] || "0",
                            );
                            if (numA !== numB) return numA - numB;
                            return a.code.localeCompare(b.code);
                          })
                          .map(
                            (
                              vehicle: { code: string; name: string },
                              index,
                            ) => (
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
                      {...register("vehicle2Quantity")}
                    />
                  </div>
                </div>

                {/* Vehicle 3 */}
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
                        {[...vehicleCodes]
                          .sort((a, b) => {
                            const numA = parseInt(
                              a.code.match(/\d+/)?.[0] || "0",
                            );
                            const numB = parseInt(
                              b.code.match(/\d+/)?.[0] || "0",
                            );
                            if (numA !== numB) return numA - numB;
                            return a.code.localeCompare(b.code);
                          })
                          .map(
                            (
                              vehicle: { code: string; name: string },
                              index,
                            ) => (
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
                      {...register("vehicle3Quantity")}
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
                      className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                      <li key={key}>
                        <span className="font-semibold">{key}</span>:{" "}
                        {error?.message || "is invalid"}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* ✅ FIX 8: Disable submit button if currentUser is not yet loaded */}
            {!currentUser && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-300 text-amber-700 rounded-md text-sm">
                ⚠ Loading user session... Please wait before submitting.
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !currentUser}
              className={`w-full px-6 py-3 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSubmitting || !currentUser
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-900 text-white hover:bg-blue-500"
              }`}
            >
              {isSubmitting
                ? "Submitting..."
                : !currentUser
                  ? "Loading user..."
                  : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadsForm;
