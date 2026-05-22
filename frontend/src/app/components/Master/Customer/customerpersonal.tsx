"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Home,
  Building,
  Globe,
  Info,
  FileText,
} from "lucide-react";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  fetchAllCities,
  fetchStatesByCity,
  resetStatesForCity,
} from "../../../features/State/stateSlice";
import {
  searchCustomersThunk,
  clearSearchResults,
  createCustomerThunk,
  updateCustomerThunk,
} from "../../../features/NewCustomer/NewCustomerSlice";
import { getCountriesThunk } from "../../../features/countrycode/countrycodeSlice";

interface CustomerPersonalProps {
  mode?: "edit" | "view" | "create";
  onBack?: () => void;
}

interface CustomerRecord {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  dateOfBirth: string;
  anniversary: string;
  gender: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  stateId?: number;
  cityId?: number;
  companyName: string;
  customerType: string;
  customerCategoryType: string;
  countryName: string;
  customerCity: string;
  customerAddress: string;
}

const initialFormState: CustomerRecord = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  alternatePhone: "",
  dateOfBirth: "",
  anniversary: "",
  gender: "",
  address: "",
  state: "",
  city: "",
  pincode: "",
  companyName: "",
  customerType: "",
  customerCategoryType: "",
  countryName: "",
  customerCity: "",
  customerAddress: "",
};

const CATEGORY_OPTIONS: Record<string, string[]> = {
  Personal: ["Individual", "Family", "Senior Citizen", "Student"],
  Corporate: ["Small Business", "Enterprise", "Startup", "Partnership"],
  "Travel Agent": ["Tour Operator", "Travel Agency", "DMC", "Online Travel"],
};

const CustomerPersonal: React.FC<CustomerPersonalProps> = ({
  mode: propMode = "create",
  onBack,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const isEditMode = propMode === "edit";
  const isViewMode = propMode === "view";

  const stateSlice = useSelector((state: RootState) => state.stateCity);
  const newCustomerSlice = useSelector((state: RootState) => state.newCustomer);
  const countrycodeSlice = useSelector((state: RootState) => state.country);

  const selectedCustomer = useSelector(
    (state: RootState) => state.newCustomer.selectedCustomer,
  );

  const {
    cities = [],
    statesForCity = [],
    loading: stateLoading = false,
  } = stateSlice || {};

  const {
    searchResults = [],
    loading: customerLoading = false,
    error: customerError = null,
  } = newCustomerSlice || {};

  const { countries = [], loading: countriesLoading = false } =
    countrycodeSlice || {};

  const [formData, setFormData] = useState<CustomerRecord>(initialFormState);
  const [editCustomerId, setEditCustomerId] = useState<number | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);

  const [fileState, setFileState] = useState<{
    passportPhoto: File | null;
    panDoc: File | null;
    gstDoc: File | null;
    adhar: File | null;
  }>({
    passportPhoto: null,
    panDoc: null,
    gstDoc: null,
    adhar: null,
  });

  // Load cities on mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoadingCities(true);
        await dispatch(fetchAllCities()).unwrap();
      } catch (err) {
        console.error("Cities fetch error:", err);
      } finally {
        setIsLoadingCities(false);
      }
    };
    loadCities();
  }, [dispatch]);

  // Load countries
  useEffect(() => {
    dispatch(getCountriesThunk());
  }, [dispatch]);

  // For edit mode - populate form and fetch states
  useEffect(() => {
    if (!selectedCustomer) return;

    const selectedCity = selectedCustomer.customerCity || selectedCustomer.city;

    setFormData({
      firstName: selectedCustomer.firstName || "",
      middleName: selectedCustomer.middleName || "",
      lastName: selectedCustomer.lastName || "",
      email: selectedCustomer.customerEmail || "",
      phone: selectedCustomer.customerPhone || "",
      alternatePhone: selectedCustomer.alternatePhone || "",
      dateOfBirth: selectedCustomer.date_of_birth || "",
      anniversary: selectedCustomer.anniversary || "",
      gender: selectedCustomer.gender || "",
      address: selectedCustomer.address || "",
      city: selectedCity || "",
      customerCity: selectedCity || "",
      state: selectedCustomer.state || "",
      pincode: selectedCustomer.pincode || "",
      stateId: selectedCustomer.stateId,
      cityId: selectedCustomer.cityId,
      companyName: selectedCustomer.companyName || "",
      customerType: selectedCustomer.customerType || "",
      customerCategoryType: selectedCustomer.customerCategoryType || "",
      countryName: selectedCustomer.countryName || "",
      customerAddress: selectedCustomer.address || "",
    });

    setEditCustomerId(selectedCustomer.id || null);

    // Fetch states for the city in edit mode
    if (selectedCity) {
      dispatch(fetchStatesByCity(selectedCity));
    }
  }, [selectedCustomer, dispatch]);

  // For create mode - fetch states when city changes
  useEffect(() => {
    if (!isEditMode && !isViewMode && formData.city) {
      dispatch(fetchStatesByCity(formData.city));
    } else if (!formData.city) {
      dispatch(resetStatesForCity());
    }
  }, [dispatch, formData.city, isEditMode, isViewMode]);

  // Handle city change
  const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value;
    const selectedCityObj = cities.find(
      (c: any) => c?.cityName === selectedCity,
    );

    // Reset state when city changes
    dispatch(resetStatesForCity());

    setFormData((prev) => ({
      ...prev,
      city: selectedCity,
      customerCity: selectedCity,
      cityId: selectedCityObj?.id,
      state: "",
      stateId: undefined,
    }));

    if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
    if (!selectedCity) return;

    try {
      await dispatch(fetchStatesByCity(selectedCity)).unwrap();
    } catch (err) {
      console.error("States fetch error:", err);
    }
  };

  // Handle state change
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStateName = e.target.value;
    const selectedState = statesForCity.find(
      (s: any) => s?.stateName === selectedStateName,
    );

    setFormData((prev) => ({
      ...prev,
      state: selectedStateName,
      stateId: selectedState?.id,
    }));

    if (errors.state) setErrors((prev) => ({ ...prev, state: "" }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof typeof fileState,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFileState((prev) => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      setSearching(true);
      await dispatch(searchCustomersThunk(searchTerm)).unwrap();
      setShowDropdown(searchResults.length > 0);
    } catch (err) {
      console.error("Search error:", err);
      setShowDropdown(false);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCustomer = (customer: any) => {
    const nameParts = (customer.customerName || "").split(" ");
    setFormData((prev) => ({
      ...prev,
      firstName: nameParts[0] || "",
      middleName: "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: customer.customerEmail || "",
      phone: customer.customerPhone || "",
      companyName: customer.companyName || "",
    }));
    setSearchTerm("");
    setShowDropdown(false);
    dispatch(clearSearchResults());
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    dispatch(clearSearchResults());
    setShowDropdown(false);
  };

  const handleFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "customerType") {
        return { ...prev, customerType: value, customerCategoryType: "" };
      }
      return { ...prev, [name]: value };
    });

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const markFieldTouched = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    requiredFields.forEach((field) => {
      const value = formData[field as keyof CustomerRecord];
      if (!value || (typeof value === "string" && !value.trim())) {
        const label =
          field === "firstName"
            ? "First name"
            : field === "lastName"
              ? "Last name"
              : field.charAt(0).toUpperCase() + field.slice(1);
        newErrors[field] = `${label} is required`;
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter valid email";
    if (formData.phone && !/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone must be 10 digits";
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = "Pincode must be 6 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/dashboard?tab=customer-table");
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Touch all fields for validation UI
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach((k) => (allTouched[k] = true));
    setTouchedFields(allTouched);

    if (!validateForm()) return;

    // Debug: Check what data is being sent
    console.log("Submitting customer data:", JSON.stringify(formData, null, 2));
    console.log("State value being sent:", formData.state);
    console.log("City value being sent:", formData.city);

    try {
      setIsLoading(true);
      setSubmitError(null);

      // Prepare payload - make sure state and city are included
      const payload = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        alternatePhone: formData.alternatePhone,
        date_of_birth: formData.dateOfBirth,
        anniversary: formData.anniversary,
        gender: formData.gender,
        address: formData.address,
        state: formData.state, // Explicitly include state
        city: formData.city, // Explicitly include city
        customerCity: formData.city,
        pincode: formData.pincode,
        stateId: formData.stateId,
        cityId: formData.cityId,
        companyName: formData.companyName,
        customerType: formData.customerType,
        customerCategoryType: formData.customerCategoryType,
        countryName: formData.countryName,
      };

      console.log("Final payload:", payload);

      if (isEditMode && editCustomerId) {
        await dispatch(
          updateCustomerThunk({ id: editCustomerId, data: payload }),
        ).unwrap();
      } else {
        await dispatch(createCustomerThunk(payload)).unwrap();
        setFormData(initialFormState);
        setTouchedFields({});
        setErrors({});
        dispatch(resetStatesForCity());
      }

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        setIsSuccess(false);
        if (isEditMode) handleBack();
      }, 2500);
    } catch (err: any) {
      console.error("Submit error details:", err);
      setSubmitError(err?.message || "Operation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================================================================
     HELPERS
  ================================================================ */
  const getInputClass = (field: string, icon = true) => {
    const base = `w-full ${icon ? "pl-10" : "px-4"} pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors`;
    if (touchedFields[field] && errors[field])
      return `${base} border-red-500 bg-red-50 focus:ring-red-200`;
    return `${base} border-gray-300 focus:ring-blue-200 focus:border-blue-400`;
  };

  const uniqueCities = useMemo(() => {
    if (!cities || !Array.isArray(cities)) return [];
    return [...new Map(cities.map((c: any) => [c?.cityName, c])).values()];
  }, [cities]);

  /* ================================================================
     RENDER
  ================================================================ */
  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-orange-100 p-3 rounded-md shadow-sm">
        <div className="flex justify-between items-center">
          <div className="pl-4 border-l-8 border-orange-500 bg-white px-3 rounded-md shadow-md">
            <h2 className="text-4xl font-bold text-left py-4 text-orange-600">
              {isViewMode
                ? "View Customer"
                : isEditMode
                  ? "Edit Customer"
                  : "Customer Registration Form"}
            </h2>
          </div>

          {(isEditMode || isViewMode) && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              ← Back to Table
            </button>
          )}
        </div>
      </div>

      <div className="p-6 w-full mx-auto bg-white shadow-xl rounded-lg my-6">
        {/* ── Error Banner ── */}
        {(submitError || customerError) && (
          <div className="flex items-center gap-2 p-4 mb-6 text-red-700 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle size={20} />
            <span className="font-medium">{submitError || customerError}</span>
          </div>
        )}

        {/* ── Success Toast ── */}
        {isSuccess && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 text-green-700 bg-green-50 border border-green-300 rounded-lg shadow-lg">
            <CheckCircle2 size={20} />
            <span className="font-medium">
              Customer {isEditMode ? "updated" : "registered"} successfully!
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ════════════════════════════════════════════════
              SECTION 1 — Customer Information
          ════════════════════════════════════════════════ */}
          <div className="border rounded-xl p-6 bg-green-50">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
              <h3 className="text-xl font-semibold text-green-800 flex items-center">
                <span className="bg-green-600 text-white px-3 py-1 rounded-md mr-2">
                  1
                </span>
                Customer Information
              </h3>

              {/* Search — only in create mode */}
              {!isEditMode && !isViewMode && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search customers by name, email or phone..."
                    className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-80"
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
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mx-auto" />
                    </div>
                  )}
                  {showDropdown && !searching && searchResults.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                      {searchResults.map((customer: any) => (
                        <div
                          key={customer.uuid}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                          onMouseDown={() => handleSelectCustomer(customer)}
                        >
                          <div className="font-semibold text-gray-800">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {customer.customerEmail && (
                              <span>{customer.customerEmail} | </span>
                            )}
                            {customer.customerPhone}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("firstName")}
                    className="w-full py-2 border bg-white pl-10 pr-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={50}
                    placeholder="Enter first name"
                    disabled={isViewMode}
                  />
                </div>
                {touchedFields.firstName && errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Middle Name */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Middle Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                  <input
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleFieldChange}
                    className="w-full py-2 border bg-white pl-10 pr-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={50}
                    placeholder="Enter middle name"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("lastName")}
                    className="w-full py-2 border bg-white pl-10 pr-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={50}
                    placeholder="Enter last name"
                    disabled={isViewMode}
                  />
                </div>
                {touchedFields.lastName && errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              {/* Phone */}
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
                    className="w-full py-2 px-3 outline-none bg-white"
                    maxLength={10}
                    disabled={isViewMode}
                  />
                  <Phone
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>
                {touchedFields.phone && errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
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
                    disabled={isViewMode}
                  />
                </div>
                {touchedFields.email && errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Country
                </label>
                <div className="relative">
                  <Globe
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                  <select
                    name="countryName"
                    value={formData.countryName}
                    onChange={handleFieldChange}
                    className="w-full py-2 border bg-white pl-10 pr-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={countriesLoading || isViewMode}
                  >
                    <option value="">Select Country</option>
                    {countries.map((country: any) => (
                      <option key={country.id} value={country.country_name}>
                        {country.country_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Category */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Customer Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Info
                    size={15}
                    className="absolute -top-4 right-0 text-blue-500 cursor-help"
                  />
                  <select
                    name="customerType"
                    value={formData.customerType}
                    onChange={handleFieldChange}
                    className="w-full py-2 border bg-white pl-4 pr-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isViewMode}
                  >
                    <option value="">Select Customer Type</option>
                    <option value="Personal">Personal</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Travel Agent">Travel Agent</option>
                  </select>
                </div>
                {touchedFields.customerType && errors.customerType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerType}
                  </p>
                )}
              </div>

              {/* Customer Type (sub-category) */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Customer Type
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                  <select
                    name="customerCategoryType"
                    value={formData.customerCategoryType}
                    onChange={handleFieldChange}
                    className="w-full py-2 border bg-white pl-10 pr-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.customerType || isViewMode}
                  >
                    <option value="">Select Customer Type</option>
                    {formData.customerType &&
                      CATEGORY_OPTIONS[formData.customerType]?.map(
                        (item, index) => (
                          <option key={index} value={item}>
                            {item}
                          </option>
                        ),
                      )}
                  </select>
                </div>
              </div>

              {/* Company Name — only for non-Personal */}
              {formData.customerType !== "Personal" &&
                formData.customerType !== "" && (
                  <div>
                    <label className="block text-md font-extrabold text-gray-700 mb-1">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                        size={20}
                      />
                      <input
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleFieldChange}
                        onBlur={() => markFieldTouched("companyName")}
                        className="w-full pl-10 pr-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={100}
                        placeholder="Enter company name"
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              SECTION 2 — Address Information
          ════════════════════════════════════════════════ */}
          <div className="p-6 border rounded-xl bg-green-50">
            <h3 className="mb-4 text-xl font-semibold text-green-800 flex items-center gap-2">
              <Home size={20} /> Address Information
            </h3>

            <div className="mb-4">
              <label className="block text-md font-extrabold text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={handleFieldChange}
                onBlur={() => markFieldTouched("address")}
                className={getInputClass("address", false)}
                rows={3}
                disabled={isViewMode}
              />
              {touchedFields.address && errors.address && (
                <p className="text-sm text-red-600 mt-1">{errors.address}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* City */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3 text-gray-400 z-10"
                    size={18}
                  />
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleCityChange}
                    onBlur={() => markFieldTouched("city")}
                    className={getInputClass("city")}
                    disabled={isLoadingCities || isViewMode}
                  >
                    <option value="">
                      {isLoadingCities ? "Loading cities..." : "Select City"}
                    </option>
                    {(uniqueCities as any[]).map((city: any) => (
                      <option key={city.id} value={city.cityName}>
                        {city.cityName}
                      </option>
                    ))}
                  </select>
                </div>
                {touchedFields.city && errors.city && (
                  <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3 text-gray-400 z-10"
                    size={18}
                  />
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleStateChange}
                    onBlur={() => markFieldTouched("state")}
                    className={getInputClass("state")}
                    disabled={
                      !formData.city ||
                      stateLoading ||
                      statesForCity.length === 0 ||
                      isViewMode
                    }
                  >
                    <option value="">
                      {stateLoading
                        ? "Loading states..."
                        : !formData.city
                          ? "First select city"
                          : "Select State"}
                    </option>
                    {statesForCity.map((state: any) => (
                      <option key={state.id} value={state.stateName}>
                        {state.stateName}
                      </option>
                    ))}
                  </select>
                  {stateLoading && (
                    <div className="absolute right-3 top-3">
                      <svg
                        className="animate-spin h-5 w-5 text-blue-500"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {touchedFields.state && errors.state && (
                  <p className="text-sm text-red-600 mt-1">{errors.state}</p>
                )}
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  name="pincode"
                  type="text"
                  placeholder="6-digit pincode"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleFieldChange}
                  onBlur={() => markFieldTouched("pincode")}
                  className={getInputClass("pincode", false)}
                  disabled={isViewMode}
                />
                {touchedFields.pincode && errors.pincode && (
                  <p className="text-sm text-red-600 mt-1">{errors.pincode}</p>
                )}
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              SECTION 3 — Document Uploads
          ════════════════════════════════════════════════ */}
          <div className="p-6 border rounded-xl bg-yellow-50">
            <h3 className="pb-3 mb-6 text-xl font-semibold text-yellow-800 border-b">
              <span className="px-3 py-1 mr-2 text-white bg-yellow-600 rounded-md">
                3
              </span>
              Document Uploads
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  { key: "passportPhoto", label: "Passport Photo" },
                  { key: "adhar", label: "Aadhaar Document" },
                  { key: "panDoc", label: "PAN Document" },
                  { key: "gstDoc", label: "GST Document" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key}>
                  <label className="block mb-1 font-extrabold text-gray-700">
                    {label}
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, key)}
                    className="w-full p-2 border rounded-lg bg-white"
                    disabled={isViewMode}
                  />
                  {fileState[key] && (
                    <p className="mt-1 text-xs text-gray-500">
                      {fileState[key]!.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          {!isViewMode && (
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={
                  isLoading ||
                  isLoadingCities ||
                  stateLoading ||
                  customerLoading
                }
                className="px-10 py-3 text-white bg-orange-600 rounded-full hover:bg-orange-700
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all
                           font-semibold text-lg shadow-md hover:shadow-lg"
              >
                {isLoading || customerLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : isEditMode ? (
                  "Update Customer"
                ) : (
                  "Register Customer"
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CustomerPersonal;
