"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import FormPageHeader from "../../ui/PageHeader/FormPageHeader";

/* ============================================================
   TYPES
============================================================ */

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
  address: string;
  state: string;
  city: string;
  pincode: string;
  alternateCountryCode?: string;
  stateId?: number;
  cityId?: number;

  companyName: string;
  customerType: string;
  customerCategoryType: string;

  countryName: string;
  customerCity: string;
  customerAddress: string;
}

interface Country {
  id: number;
  country_name: string;
  country_code: string;
  phone_code: string;
}

interface City {
  id: number;
  cityName: string;
}

interface StateItem {
  id: number;
  stateName: string;
}

/* ============================================================
   INITIAL STATE
============================================================ */

const initialFormState: CustomerRecord = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  alternatePhone: "",
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
  Personal: ["Personal"],
  Corporate: [
    "Company",
    "NGO",
    "Educational Institution",
    "Sporting Company",
    "Government Organization",
    "Other",
  ],
  "Travel Agent": [
    "Travel Agenct",
    "Tour Operator",
    "Hotel",
    "Wedding Planner",
    "DMC",
  ],
};

const CustomerPersonal: React.FC<CustomerPersonalProps> = ({
  mode: propMode = "create",
  onBack,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const isEditMode = propMode === "edit";
  const isViewMode = propMode === "view";
  const isCreateMode = propMode === "create";

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
  const [alternateCountryCode, setAlternateCountryCode] = useState("+91");
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

  useEffect(() => {
    let mounted = true;
    const loadCities = async () => {
      try {
        if (mounted) {
          setIsLoadingCities(true);
        }

        await dispatch(fetchAllCities()).unwrap();
      } catch (error) {
        console.error("Cities fetch error:", error);
      } finally {
        if (mounted) {
          setIsLoadingCities(false);
        }
      }
    };

    loadCities();
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCountriesThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!countries || !Array.isArray(countries)) return;

    const india = countries.find(
      (country: Country) =>
        country?.phone_code === "+91" || country?.country_code === "IN",
    );

    if (india) {
      setAlternateCountryCode(india.phone_code || "+91");
    }
  }, [countries]);

  useEffect(() => {
    if (!selectedCustomer) return;
    const selectedCity =
      selectedCustomer.customerCity || selectedCustomer.city || "";
    const selectedState = selectedCustomer.state || "";

    setFormData({
      firstName: selectedCustomer.firstName || "",
      middleName: selectedCustomer.middleName || "",
      lastName: selectedCustomer.lastName || "",
      email: selectedCustomer.customerEmail || selectedCustomer.email || "",
      phone: selectedCustomer.customerPhone || selectedCustomer.phone || "",
      alternatePhone: selectedCustomer.alternatePhone || "",
      address: selectedCustomer.address || "",
      state: selectedState,
      city: selectedCity,
      customerCity: selectedCity,
      pincode: selectedCustomer.pincode || "",
      stateId: selectedCustomer.stateId
        ? Number(selectedCustomer.stateId)
        : undefined,
      cityId: selectedCustomer.cityId
        ? Number(selectedCustomer.cityId)
        : undefined,
      companyName: selectedCustomer.companyName || "",
      customerType: selectedCustomer.customerType || "",
      customerCategoryType: selectedCustomer.customerCategoryType || "",
      countryName: selectedCustomer.countryName || "",
      customerAddress:
        selectedCustomer.customerAddress || selectedCustomer.address || "",
    });

    setEditCustomerId(selectedCustomer.id ? Number(selectedCustomer.id) : null);

    const customerAlternateCode =
      selectedCustomer.alternateCountryCode ||
      selectedCustomer.alternate_country_code ||
      selectedCustomer.alternatePhoneCode ||
      selectedCustomer.alternate_phone_code;

    if (customerAlternateCode) {
      setAlternateCountryCode(customerAlternateCode);
    }
    if (selectedCity) {
      dispatch(fetchStatesByCity(selectedCity));
    }
  }, [selectedCustomer, dispatch]);
  useEffect(() => {
    if (!isCreateMode) return;
    if (formData.city) {
      dispatch(fetchStatesByCity(formData.city));
    } else {
      dispatch(resetStatesForCity());
    }
  }, [dispatch, formData.city, isCreateMode]);

  const uniqueCities = useMemo(() => {
    if (!Array.isArray(cities)) return [];
    const cityMap = new Map<string, City>();
    cities.forEach((city: City) => {
      if (city?.cityName) {
        cityMap.set(city.cityName, city);
      }
    });
    return Array.from(cityMap.values());
  }, [cities]);

  const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value;

    const selectedCityObj = uniqueCities.find(
      (city: City) => city?.cityName === selectedCity,
    );

    dispatch(resetStatesForCity());

    setFormData((prev) => ({
      ...prev,
      city: selectedCity,
      customerCity: selectedCity,
      cityId: selectedCityObj?.id ? Number(selectedCityObj.id) : undefined,
      state: "",
      stateId: undefined,
    }));
    setErrors((prev) => ({
      ...prev,
      city: "",
      state: "",
    }));

    if (!selectedCity) {
      return;
    }

    try {
      await dispatch(fetchStatesByCity(selectedCity)).unwrap();
    } catch (error) {
      console.error("States fetch error:", error);
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStateName = e.target.value;
    const selectedState = (statesForCity as StateItem[]).find(
      (state) => state?.stateName === selectedStateName,
    );

    setFormData((prev) => ({
      ...prev,
      state: selectedStateName,
      stateId: selectedState?.id ? Number(selectedState.id) : undefined,
    }));

    setErrors((prev) => ({
      ...prev,
      state: "",
    }));
  };

  /* ============================================================
     FILE CHANGE
  ============================================================ */

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof typeof fileState,
  ) => {
    const file = e.target.files?.[0] || null;

    setFileState((prev) => ({
      ...prev,
      [key]: file,
    }));
  };

  /* ============================================================
     SEARCH CUSTOMER
  ============================================================ */

  const handleSearch = async () => {
    const trimmedSearch = searchTerm.trim();

    if (!trimmedSearch) {
      setShowDropdown(false);
      return;
    }

    try {
      setSearching(true);

      /*
        Clear old results before new search.
      */
      dispatch(clearSearchResults());

      const result = await dispatch(
        searchCustomersThunk(trimmedSearch),
      ).unwrap();

      /*
        Use fresh API result instead of stale Redux
        searchResults immediately after dispatch.
      */
      const results = Array.isArray(result) ? result : result?.data || [];

      setShowDropdown(Array.isArray(results) && results.length > 0);
    } catch (error) {
      console.error("Search error:", error);

      setShowDropdown(false);
    } finally {
      setSearching(false);
    }
  };

  /* ============================================================
     SEARCH ON ENTER
  ============================================================ */

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  /* ============================================================
     SELECT SEARCH CUSTOMER
  ============================================================ */

  const handleSelectCustomer = (customer: any) => {
    const fullName =
      customer.customerName ||
      `${customer.firstName || ""} ${customer.lastName || ""}`.trim();

    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);

    const firstName = customer.firstName || nameParts[0] || "";

    const lastName = customer.lastName || nameParts.slice(1).join(" ") || "";

    setFormData((prev) => ({
      ...prev,
      firstName,
      middleName: customer.middleName || "",
      lastName,
      email: customer.customerEmail || customer.email || "",
      phone: customer.customerPhone || customer.phone || "",
      alternatePhone: customer.alternatePhone || "",
      companyName: customer.companyName || "",
      address: customer.address || "",
      countryName: customer.countryName || "",
      customerType: customer.customerType || "",
      customerCategoryType: customer.customerCategoryType || "",
      pincode: customer.pincode || "",
      city: customer.customerCity || customer.city || "",
      customerCity: customer.customerCity || customer.city || "",
      state: customer.state || "",
      customerAddress: customer.customerAddress || customer.address || "",
      stateId: customer.stateId ? Number(customer.stateId) : undefined,
      cityId: customer.cityId ? Number(customer.cityId) : undefined,
    }));
    if (customer.alternateCountryCode || customer.alternate_country_code) {
      setAlternateCountryCode(
        customer.alternateCountryCode || customer.alternate_country_code,
      );
    }
    const customerCity = customer.customerCity || customer.city;
    if (customerCity) {
      dispatch(fetchStatesByCity(customerCity));
    }
    setSearchTerm("");
    setShowDropdown(false);

    dispatch(clearSearchResults());
  };

  const handleClearSearch = () => {
    setSearchTerm("");

    dispatch(clearSearchResults());

    setShowDropdown(false);
  };

  /* ============================================================
     GENERIC FIELD CHANGE
  ============================================================ */

  const handleFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      /*
        Changing customer category resets
        customer sub-category.
      */
      if (name === "customerType") {
        return {
          ...prev,

          customerType: value,
          customerCategoryType: "",
          companyName: value === "Personal" ? "" : prev.companyName,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* ============================================================
     MARK FIELD TOUCHED
  ============================================================ */

  const markFieldTouched = (fieldName: string) => {
    setTouchedFields((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  };

  /* ============================================================
     VALIDATION
  ============================================================ */

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    /* ----------------------------------------------------------
       REQUIRED FIELDS
    ---------------------------------------------------------- */

    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
      "customerType",
    ];

    requiredFields.forEach((field) => {
      const value = formData[field as keyof CustomerRecord];

      if (!value || (typeof value === "string" && !value.trim())) {
        let label = field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (char) => char.toUpperCase());

        if (field === "firstName") {
          label = "First name";
        }

        if (field === "lastName") {
          label = "Last name";
        }

        if (field === "customerType") {
          label = "Customer category";
        }

        newErrors[field] = `${label} is required`;
      }
    });

    /* ----------------------------------------------------------
       EMAIL
    ---------------------------------------------------------- */

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Enter a valid email address";
      }
    }

    /* ----------------------------------------------------------
       PHONE
    ---------------------------------------------------------- */

    if (formData.phone.trim()) {
      if (!/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = "Phone must be exactly 10 digits";
      }
    }

    /* ----------------------------------------------------------
       ALTERNATE PHONE
    ---------------------------------------------------------- */

    if (formData.alternatePhone.trim()) {
      if (!/^\d{6,15}$/.test(formData.alternatePhone)) {
        newErrors.alternatePhone = "Enter a valid alternate phone number";
      }
    }

    /* ----------------------------------------------------------
       PINCODE
    ---------------------------------------------------------- */

    if (formData.pincode.trim()) {
      if (!/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = "Pincode must be exactly 6 digits";
      }
    }

    /* ----------------------------------------------------------
       CUSTOMER CATEGORY TYPE
    ---------------------------------------------------------- */

    if (formData.customerType && !formData.customerCategoryType) {
      newErrors.customerCategoryType = "Customer type is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ============================================================
     HANDLE BACK
  ============================================================ */

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    router.push("/dashboard?tab=customer-table");
  };

  /* ============================================================
     RESET FORM
  ============================================================ */

  const resetForm = () => {
    setFormData({
      ...initialFormState,
    });

    setTouchedFields({});

    setErrors({});

    setSubmitError(null);

    setEditCustomerId(null);

    setFileState({
      passportPhoto: null,
      panDoc: null,
      gstDoc: null,
      adhar: null,
    });

    setAlternateCountryCode("+91");

    dispatch(resetStatesForCity());

    dispatch(clearSearchResults());
  };

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    /* ----------------------------------------------------------
       TOUCH ALL FIELDS
    ---------------------------------------------------------- */

    const allTouched: Record<string, boolean> = {};

    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });

    setTouchedFields(allTouched);

    /* ----------------------------------------------------------
       VALIDATE
    ---------------------------------------------------------- */

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setIsLoading(true);

      setSubmitError(null);

      /* --------------------------------------------------------
         PAYLOAD
      -------------------------------------------------------- */

      const payload = {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim(),
        alternatePhone: formData.alternatePhone.trim(),
        alternateCountryCode: alternateCountryCode,
        alternate_country_code: alternateCountryCode,
        address: formData.address.trim(),
        customerAddress: formData.address.trim(),
        state: formData.state,
        city: formData.city,
        customerCity: formData.city,
        pincode: formData.pincode.trim(),
        stateId: formData.stateId || null,
        cityId: formData.cityId || null,
        companyName: formData.companyName.trim(),
        customerType: formData.customerType,
        customerCategoryType: formData.customerCategoryType,
        countryName: formData.countryName,
      };
      if (isEditMode && editCustomerId) {
        await dispatch(
          updateCustomerThunk({
            id: editCustomerId,
            data: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(createCustomerThunk(payload)).unwrap();
      }
      setIsSuccess(true);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      /* --------------------------------------------------------
         CREATE MODE RESET
      -------------------------------------------------------- */

      if (isCreateMode) {
        resetForm();
      }

      /* --------------------------------------------------------
         AFTER SUCCESS
      -------------------------------------------------------- */

      setTimeout(() => {
        setIsSuccess(false);

        if (isEditMode) {
          handleBack();
        }
      }, 2500);
    } catch (error: any) {
      console.error("Submit error:", error);

      let errorMessage = "Operation failed. Please try again.";

      if (typeof error === "string") {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      }

      setSubmitError(errorMessage);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ============================================================
     INPUT CLASS
  ============================================================ */

  const getInputClass = (field: string, icon = true) => {
    const base = `w-full ${
      icon ? "pl-10" : "px-4"
    } pr-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 transition-colors`;

    if (touchedFields[field] && errors[field]) {
      return `${base} border-red-500 bg-red-50 focus:ring-red-200`;
    }

    return `${base} border-gray-300 focus:ring-blue-500 focus:border-blue-400`;
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="w-full min-h-screen bg-gray-50">
   

      <div className="sticky top-0 z-30">
        <FormPageHeader
          title={
            isViewMode
              ? "View Customer"
              : isEditMode
                ? "Edit Customer"
                : "Customer Registration Form"
          }
        />
      </div>

      <div className="p-4 md:p-6 w-full mx-auto bg-white shadow-xl rounded-lg my-6">
     
        {(submitError || customerError) && (
          <div className="flex items-start gap-2 p-4 mb-6 text-red-700 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <span className="font-medium">{submitError || customerError}</span>
          </div>
        )}

        {isSuccess && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 text-green-700 bg-green-50 border border-green-300 rounded-lg shadow-lg">
            <CheckCircle2 size={20} />

            <span className="font-medium">
              Customer {isEditMode ? "updated" : "registered"} successfully!
            </span>
          </div>
        )}

      

        <form onSubmit={handleSubmit} className="space-y-6">
      

          <div className="border rounded-xl p-6 bg-green-50">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 pb-3 border-b">
              <h3 className="text-xl font-semibold text-green-800 flex items-center">
                <span className="bg-green-600 text-white px-3 py-1 rounded-md mr-2">
                  1
                </span>
                Customer Information
              </h3>


              {isCreateMode && (
                <div className="relative w-full lg:w-96">
                  <input
                    type="text"
                    placeholder="Search customers by name, email or phone..."
                    className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0) {
                        setShowDropdown(true);
                      }
                    }}
                    onKeyDown={handleSearchKeyDown}
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

                  {/* SEARCH BUTTON */}

                  {searchTerm && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleSearch}
                      className="absolute right-10 top-2.5 text-green-600 hover:text-green-800 text-sm font-semibold"
                    >
                      Search
                    </button>
                  )}

                  {/* CLEAR */}

                  {searchTerm && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
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

                  {/* SEARCHING */}

                  {searching && (
                    <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50 p-4 text-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mx-auto" />
                    </div>
                  )}

                  {/* SEARCH RESULTS */}

                  {showDropdown && !searching && searchResults.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                      {searchResults.map((customer: any, index: number) => (
                        <div
                          key={customer.uuid || customer.id || index}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                          onMouseDown={() => handleSelectCustomer(customer)}
                        >
                          <div className="font-semibold text-gray-800">
                            {customer.firstName || customer.customerName || ""}{" "}
                            {customer.lastName || ""}
                          </div>

                          <div className="text-sm text-gray-600">
                            {customer.customerEmail && (
                              <span>{customer.customerEmail} | </span>
                            )}

                            {customer.customerPhone || ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* NO RESULT */}

                  {showDropdown &&
                    !searching &&
                    searchTerm.trim() &&
                    searchResults.length === 0 && (
                      <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50 p-4 text-center text-sm text-gray-500">
                        No customer found
                      </div>
                    )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* FIRST NAME */}

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
                    className={getInputClass("firstName")}
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
                    className={getInputClass("middleName")}
                    maxLength={50}
                    placeholder="Enter middle name"
                    disabled={isViewMode}
                  />
                </div>
              </div>


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
                    className={getInputClass("lastName")}
                    maxLength={50}
                    placeholder="Enter last name"
                    disabled={isViewMode}
                  />
                </div>

                {touchedFields.lastName && errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              {/* PHONE */}

              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Phone No. (India) <span className="text-red-500">*</span>
                </label>

                <div
                  className={`relative flex items-center border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 ${
                    touchedFields.phone && errors.phone
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
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

                      setFormData((prev) => ({
                        ...prev,
                        phone: numericValue,
                      }));

                      setErrors((prev) => ({
                        ...prev,
                        phone: "",
                      }));
                    }}
                    onBlur={() => markFieldTouched("phone")}
                    placeholder="Enter 10 digit number"
                    className="w-full py-2 px-3 outline-none bg-white"
                    maxLength={10}
                    inputMode="numeric"
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


              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Phone No. (Other)
                </label>

                <div
                  className={`relative flex items-center border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 ${
                    touchedFields.alternatePhone && errors.alternatePhone
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <select
                    value={alternateCountryCode}
                    onChange={(e) => setAlternateCountryCode(e.target.value)}
                    className="bg-gray-100 px-2 py-2 outline-none text-sm cursor-pointer min-w-[105px]"
                    disabled={isViewMode}
                  >
                    <option value="">Select Code</option>

                    {countries.map((country: Country) => (
                      <option key={country.id} value={country.phone_code}>
                        {country.phone_code} {country.country_code}
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

                      setFormData((prev) => ({
                        ...prev,
                        alternatePhone: numericValue,
                      }));

                      setErrors((prev) => ({
                        ...prev,
                        alternatePhone: "",
                      }));
                    }}
                    onBlur={() => markFieldTouched("alternatePhone")}
                    placeholder="Enter phone number"
                    className="w-full py-2 px-3 outline-none bg-white"
                    maxLength={15}
                    inputMode="numeric"
                    disabled={isViewMode}
                  />

                  <Phone
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
                    size={20}
                  />
                </div>

                {touchedFields.alternatePhone && errors.alternatePhone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.alternatePhone}
                  </p>
                )}
              </div>

              {/* EMAIL */}

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
                    className={getInputClass("email")}
                    maxLength={100}
                    disabled={isViewMode}
                  />
                </div>

                {touchedFields.email && errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* COUNTRY */}

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
                    className={getInputClass("countryName")}
                    disabled={countriesLoading || isViewMode}
                  >
                    <option value="">
                      {countriesLoading
                        ? "Loading countries..."
                        : "Select Country"}
                    </option>

                    {countries.map((country: Country) => (
                      <option key={country.id} value={country.country_name}>
                        {country.country_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Customer Category <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Info
                    size={15}
                    className="absolute -top-4 right-0 text-blue-500"
                  />

                  <select
                    name="customerType"
                    value={formData.customerType}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("customerType")}
                    className={getInputClass("customerType", false)}
                    disabled={isViewMode}
                  >
                    <option value="">Select Customer Category</option>

                    <option value="Personal">Personal</option>

                    <option value="Corporate">Corporate</option>

                    <option value="Travel Agent">Agent</option>
                  </select>
                </div>

                {touchedFields.customerType && errors.customerType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerType}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-md font-extrabold text-gray-700 mb-1">
                  Customer Type{" "}
                  {formData.customerType && (
                    <span className="text-red-500">*</span>
                  )}
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
                    onBlur={() => markFieldTouched("customerCategoryType")}
                    className={getInputClass("customerCategoryType")}
                    disabled={!formData.customerType || isViewMode}
                  >
                    <option value="">Select Customer Type</option>
                    {formData.customerType &&
                      CATEGORY_OPTIONS[formData.customerType]?.map(
                        (item, index) => (
                          <option key={`${item}-${index}`} value={item}>
                            {item}
                          </option>
                        ),
                      )}
                  </select>
                </div>
                {touchedFields.customerCategoryType &&
                  errors.customerCategoryType && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerCategoryType}
                    </p>
                  )}
              </div>
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
                        className={getInputClass("companyName")}
                        maxLength={100}
                        placeholder="Enter company name"
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>
          <div className="p-6 border rounded-xl bg-green-50">
            <h3 className="mb-4 text-xl font-semibold text-green-800 flex items-center gap-2">
              <Home size={20} />
              Address Information
            </h3>

            {/* ADDRESS */}

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

                    {uniqueCities.map((city: City) => (
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

                    {statesForCity.map((state: StateItem) => (
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
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");

                    setFormData((prev) => ({
                      ...prev,
                      pincode: value,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      pincode: "",
                    }));
                  }}
                  onBlur={() => markFieldTouched("pincode")}
                  className={getInputClass("pincode", false)}
                  inputMode="numeric"
                  disabled={isViewMode}
                />
                {touchedFields.pincode && errors.pincode && (
                  <p className="text-sm text-red-600 mt-1">{errors.pincode}</p>
                )}
              </div>
            </div>
          </div>
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
                  {
                    key: "passportPhoto",
                    label: "Passport Photo",
                  },
                  {
                    key: "adhar",
                    label: "Aadhaar Document",
                  },
                  {
                    key: "panDoc",
                    label: "PAN Document",
                  },
                  {
                    key: "gstDoc",
                    label: "GST Document",
                  },
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
                    <p className="mt-1 text-xs text-gray-500 truncate">
                      {fileState[key]!.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          {!isViewMode && (
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <button
                type="submit"
                disabled={
                  isLoading ||
                  isLoadingCities ||
                  stateLoading ||
                  customerLoading
                }
                className="px-10 py-3 text-white bg-orange-600 rounded-full hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-md hover:shadow-lg"
              >
                {isLoading || customerLoading ? (
                  <span className="flex items-center justify-center gap-2">
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

              {isEditMode && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="px-8 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 disabled:opacity-50 transition-all font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CustomerPersonal;
