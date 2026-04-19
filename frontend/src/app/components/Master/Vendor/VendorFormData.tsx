"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Building,
  AlertCircle,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { AppDispatch, RootState } from "../../../redux/store";
import { createVendorThunk } from "@/app/features/vendor/vendorSlice";

import {
  fetchAllCities,
  fetchStatesByCity,
  resetStatesForCity,
} from "../../../features/State/stateSlice";

// ── stateSlice ke local types (CustomerForm jaise) ───────────────────────────
interface CityItem {
  id: number | string;
  cityName: string;
}

interface StateItem {
  id: number | string;
  stateName: string;
}

interface StateCitySlice {
  cities: CityItem[];
  statesForCity: StateItem[];
  loading: boolean;
  error: string | null;
}

// CustomerForm ki tarah stateCity key use karo
type AppRootState = RootState & {
  stateCity: StateCitySlice;
};

interface VendorFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  panNumber: string;
  aadhaarNumber: string;

  companyName: string;
  businessNumber: string;
  companyRegisteredNumber: string;
  gstNumber: string;
  registeredAddress: string;
  garageAddress: string;
  garagePhone: string;
  cooperativeName: string;
  cooperativeNumber: string;

  passportPhoto: string;
  panDoc: string;
  gstDoc: string;
  vendorProof: string;
  vehicleDoc: string;

  managerName2: string;
  managerName1: string;
  ownerName: string;
  managerPhone1: string;
  managerEmail1: string;
  managerPhone2: string;
  managerEmail2: string;

  shortName: string;
  companyType: string;
  companyPanNumber: string;

  ownerPhone: string;
  ownerEmail: string;

  personalInfo: {
    personalAddress: string;
    personalCity: string;
    personalState: string;
  };

  // Personal city/state ke liye alag Redux state
  personalCityId?: number | string;
  personalStateId?: number | string;

  companyinfo: {
    companyState: string;
    companyCity: string;
  };
}

const initialFormState: VendorFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  panNumber: "",
  aadhaarNumber: "",

  companyName: "",
  businessNumber: "",
  companyRegisteredNumber: "",
  gstNumber: "",
  registeredAddress: "",
  garageAddress: "",
  garagePhone: "",
  cooperativeName: "",
  cooperativeNumber: "",

  passportPhoto: "",
  panDoc: "",
  gstDoc: "",
  vendorProof: "",
  vehicleDoc: "",

  managerName2: "",
  managerName1: "",
  ownerName: "",
  managerPhone1: "",
  managerEmail1: "",
  managerPhone2: "",
  managerEmail2: "",

  shortName: "",
  companyType: "",
  companyPanNumber: "",

  ownerPhone: "",
  ownerEmail: "",

  personalInfo: {
    personalAddress: "",
    personalCity: "",
    personalState: "",
  },

  companyinfo: {
    companyState: "",
    companyCity: "",
  },
};

const companyTypes = [
  "Proprietorship",
  "Partnership",
  "LLP",
  "Pvt Ltd",
  "Public Ltd",
  "Other",
];

const VendorForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [formData, setFormData] = useState<VendorFormData>(initialFormState);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Personal section ke liye alag states ──────────────────────────────────
  const [personalStatesForCity, setPersonalStatesForCity] = useState<
    StateItem[]
  >([]);
  const [personalStateLoading, setPersonalStateLoading] = useState(false);

  // ── Redux state — CustomerForm jaise stateCity slice se ─────────────────────
  const stateSlice = useSelector((state: AppRootState) => state.stateCity);

  const {
    cities = [],
    statesForCity = [],
    loading: stateLoading = false,
  } = stateSlice || {};

  // Duplicate city names hata do (CustomerForm jaise)
  const uniqueCities = React.useMemo(() => {
    if (!cities || !Array.isArray(cities)) return [];
    const unique = [...new Map(cities.map((c) => [c?.cityName, c])).values()];
    return unique;
  }, [cities]);

  // ── File state ─────────────────────────────────────────────────────────────
  const [fileState, setFileState] = useState<{
    passportPhoto: File | null;
    panDoc: File | null;
    gstDoc: File | null;
    vendorProof: File | null;
    vehicleDoc: File | null;
  }>({
    passportPhoto: null,
    panDoc: null,
    gstDoc: null,
    vendorProof: null,
    vehicleDoc: null,
  });

  // ── Load all cities on mount ───────────────────────────────────────────────
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

  // ── When company city changes → fetch states (CustomerForm jaise) ───────────
  // handleCityChange mein directly dispatch hota hai, useEffect ki zaroorat nahi

  // ── Handlers ───────────────────────────────────────────────────────────────
  const markFieldTouched = useCallback((fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const getInputClass = useCallback((fieldName: string, hasIcon = false) => {
    const base = `w-full p-2.5 border rounded-lg ${hasIcon ? "pl-10" : ""}`;
    return `${base} border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`;
  }, []);

  const getMaxLength = useCallback((fieldName: string): number | undefined => {
    const limits: Record<string, number> = {
      name: 100,
      shortName: 30,
      panNumber: 10,
      aadhaarNumber: 12,
      gstNumber: 15,
      phone: 10,
      ownerPhone: 10,
      managerPhone1: 10,
      managerPhone2: 10,
      garagePhone: 10,
    };
    return limits[fieldName];
  }, []);

  // Flat fields ke liye
  const handleFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  // Nested fields (personalInfo.*, companyinfo.*) ke liye
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const parts = name.split(".");

      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof VendorFormData] as Record<string, string>),
            [child]: value,
          },
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    },
    [],
  );

  // ✅ Company City change — CustomerForm ke handleCityChange jaise
  const handleCityChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedCity = e.target.value;
      const selectedCityObj = cities.find((c) => c?.cityName === selectedCity);

      // State reset pehle
      dispatch(resetStatesForCity());

      setFormData((prev) => ({
        ...prev,
        companyinfo: {
          companyCity: selectedCity,
          companyState: "", // city badli to state reset
        },
      }));
      setErrors((prev) => ({ ...prev, city: "", state: "" }));

      if (!selectedCity) return;

      try {
        await dispatch(fetchStatesByCity(selectedCity)).unwrap();
      } catch (err) {
        console.error("States fetch error:", err);
      }
    },
    [dispatch, cities],
  );

  // ✅ Company State change — CustomerForm ke handleStateChange jaise
  const handleStateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedStateName = e.target.value;
      const selectedState = statesForCity.find(
        (s) => s?.stateName === selectedStateName,
      );

      setFormData((prev) => ({
        ...prev,
        companyinfo: {
          ...prev.companyinfo,
          companyState: selectedStateName,
        },
      }));
      setErrors((prev) => ({ ...prev, state: "" }));
    },
    [statesForCity],
  );

  // ✅ Personal City change — alag states fetch karta hai (company se independent)
  const handlePersonalCityChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedCity = e.target.value;

      // Personal state reset karo
      setPersonalStatesForCity([]);

      setFormData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          personalCity: selectedCity,
          personalState: "", // city badli to state reset
        },
        personalCityId: undefined,
        personalStateId: undefined,
      }));
      setErrors((prev) => ({ ...prev, personalCity: "", personalState: "" }));

      if (!selectedCity) return;

      try {
        setPersonalStateLoading(true);
        const result = await dispatch(fetchStatesByCity(selectedCity)).unwrap();
        // Result array ho sakta hai — directly set karo
        if (Array.isArray(result)) {
          setPersonalStatesForCity(result);
        }
      } catch (err) {
        console.error("Personal states fetch error:", err);
      } finally {
        setPersonalStateLoading(false);
      }
    },
    [dispatch],
  );

  // ✅ Personal State change
  const handlePersonalStateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedStateName = e.target.value;
      const selectedState = personalStatesForCity.find(
        (s) => s?.stateName === selectedStateName,
      );

      setFormData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          personalState: selectedStateName,
        },
        personalStateId: selectedState?.id,
      }));
      setErrors((prev) => ({ ...prev, personalState: "" }));
    },
    [personalStatesForCity],
  );

  // File handler
  const handleFileChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      fieldName: keyof typeof fileState,
    ) => {
      const file = e.target.files?.[0] || null;
      setFileState((prev) => ({ ...prev, [fieldName]: file }));
    },
    [],
  );

  // Submit
  const handleProfileSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSavingProfile(true);
      setError(null);
      setSuccessMessage(null);

      
      try {
        await dispatch(createVendorThunk(formData)).unwrap();
        setSuccessMessage("Vendor saved successfully!");
        setFormData(initialFormState);
        setFileState({
          passportPhoto: null,
          panDoc: null,
          gstDoc: null,
          vendorProof: null,
          vehicleDoc: null,
        });
        setTouchedFields({});
        dispatch(resetStatesForCity());
      } catch (err: any) {
        setError(err?.message || "Something went wrong. Please try again.");
      } finally {
        setSavingProfile(false);
      }
    },
    [formData, dispatch],
  );

  return (
    <div className="p-6 w-full mx-auto bg-white shadow-xl rounded-lg">
      <div className="p-6">
        <div className="p-4 mb-8 bg-orange-100 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-center text-orange-600">
                {isViewMode ? "View Vendor" : "Vendor Registration Form"}
              </h2>
              <p className="mt-2 text-center text-orange-700">
                All fields are optional - Fill as needed
              </p>
            </div>
            {isViewMode && (
              <button
                onClick={() =>
                  (window.location.href = "/dashboard?tab=vendortable")
                }
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Back to Table
              </button>
            )}
          </div>
        </div>

        {(error || successMessage) && (
          <div className="mb-6">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 text-red-700 border border-red-200 rounded-lg bg-red-50">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="flex items-center gap-2 px-4 py-3 mt-3 text-green-700 border border-green-200 rounded-lg bg-green-50">
                <CheckCircle2 className="w-5 h-5" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {/* ── Section 1: Vendor Detail ─────────────────────────────────── */}
          <div className="p-6 border rounded-xl bg-purple-50">
            <h3 className="pb-3 mb-6 text-xl font-semibold text-purple-800 border-b">
              <span className="px-3 py-1 mr-2 text-white bg-purple-600 rounded-md">
                1
              </span>
              Vendor Detail
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Vendor Name
                </label>
                <div className="relative group">
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("name")}
                    placeholder="Enter vendor name"
                    className={getInputClass("name", true)}
                    maxLength={getMaxLength("name")}
                  />
                  <User
                    className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Vendor Short Name
                </label>
                <div className="relative group">
                  <input
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("shortName")}
                    placeholder="Enter Short Name"
                    className={getInputClass("shortName", true)}
                    maxLength={getMaxLength("shortName")}
                  />
                  <User
                    className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Vendor Address
                </label>
                <input
                  type="text"
                  name="personalInfo.personalAddress"
                  value={formData.personalInfo.personalAddress}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              {/* ✅ Personal City Dropdown */}
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  City
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3 text-gray-400 z-10"
                    size={18}
                  />
                  <select
                    name="personalInfo.personalCity"
                    value={formData.personalInfo.personalCity}
                    onChange={handlePersonalCityChange}
                    onBlur={() => markFieldTouched("personalCity")}
                    className="w-full p-2.5 pl-10 border rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    disabled={isLoadingCities}
                  >
                    <option value="">
                      {isLoadingCities ? "Loading cities..." : "Select City"}
                    </option>
                    {uniqueCities.map((city) => (
                      <option key={city.id} value={city.cityName}>
                        {city.cityName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ✅ Personal State Dropdown — city select hone ke baad enable */}
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  State
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3 text-gray-400 z-10"
                    size={18}
                  />
                  <select
                    name="personalInfo.personalState"
                    value={formData.personalInfo.personalState}
                    onChange={handlePersonalStateChange}
                    onBlur={() => markFieldTouched("personalState")}
                    className="w-full p-2.5 pl-10 border rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    disabled={
                      !formData.personalInfo.personalCity ||
                      personalStateLoading ||
                      personalStatesForCity.length === 0
                    }
                  >
                    <option value="">
                      {personalStateLoading
                        ? "Loading states..."
                        : !formData.personalInfo.personalCity
                          ? "First select city"
                          : personalStatesForCity.length === 0
                            ? "No states found"
                            : "Select State"}
                    </option>
                    {personalStatesForCity.map((state) => (
                      <option key={state.id} value={state.stateName}>
                        {state.stateName}
                      </option>
                    ))}
                  </select>
                  {personalStateLoading && (
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
              </div>
            </div>
          </div>

          {/* ── Section 2: Contact Information ───────────────────────────── */}
          <div className="p-6 border rounded-xl bg-blue-50">
            <h3 className="pb-3 mb-6 text-xl font-semibold text-blue-800 border-b">
              <span className="px-3 py-1 mr-2 text-white bg-blue-600 rounded-md">
                2
              </span>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Owner */}
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Owner Name
                </label>
                <div className="relative group">
                  <input
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("ownerName")}
                    placeholder="Enter owner name"
                    className={getInputClass("ownerName", true)}
                  />
                  <User
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Owner Phone
                </label>
                <div className="relative group">
                  <input
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("ownerPhone")}
                    placeholder="Enter phone number"
                    className={getInputClass("ownerPhone", true)}
                    inputMode="numeric"
                    maxLength={getMaxLength("ownerPhone")}
                  />
                  <Phone
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Owner Email
                </label>
                <div className="relative group">
                  <input
                    name="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("ownerEmail")}
                    placeholder="Enter email"
                    className={getInputClass("ownerEmail", true)}
                  />
                  <Mail
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              {/* Manager 1 */}
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Manager 1 Name
                </label>
                <div className="relative group">
                  <input
                    name="managerName1"
                    value={formData.managerName1}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("managerName1")}
                    placeholder="Enter manager name"
                    className={getInputClass("managerName1", true)}
                  />
                  <User
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Manager 1 Phone
                </label>
                <div className="relative group">
                  <input
                    name="managerPhone1"
                    value={formData.managerPhone1}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("managerPhone1")}
                    placeholder="Enter phone number"
                    className={getInputClass("managerPhone1", true)}
                    inputMode="numeric"
                    maxLength={getMaxLength("managerPhone1")}
                  />
                  <Phone
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Manager 1 Email
                </label>
                <div className="relative group">
                  <input
                    name="managerEmail1"
                    type="email"
                    value={formData.managerEmail1}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("managerEmail1")}
                    placeholder="Enter email"
                    className={getInputClass("managerEmail1", true)}
                  />
                  <Mail
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              {/* Manager 2 */}
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Manager 2 Name
                </label>
                <div className="relative group">
                  <input
                    name="managerName2"
                    value={formData.managerName2}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("managerName2")}
                    placeholder="Enter manager name"
                    className={getInputClass("managerName2", true)}
                  />
                  <User
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Manager 2 Phone
                </label>
                <div className="relative group">
                  <input
                    name="managerPhone2"
                    value={formData.managerPhone2}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("managerPhone2")}
                    placeholder="Enter phone number"
                    className={getInputClass("managerPhone2", true)}
                    inputMode="numeric"
                    maxLength={getMaxLength("managerPhone2")}
                  />
                  <Phone
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Manager 2 Email
                </label>
                <div className="relative group">
                  <input
                    name="managerEmail2"
                    type="email"
                    value={formData.managerEmail2}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("managerEmail2")}
                    placeholder="Enter email"
                    className={getInputClass("managerEmail2", true)}
                  />
                  <Mail
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 3: Company Details ───────────────────────────────── */}
          <div className="p-6 border rounded-xl bg-green-50">
            <h3 className="pb-3 mb-6 text-xl font-semibold text-green-800 border-b">
              <span className="px-3 py-1 mr-2 text-white bg-green-600 rounded-md">
                3
              </span>
              Company / Firm Details
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Company Name
                </label>
                <div className="relative group">
                  <input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("companyName")}
                    placeholder="Enter company name"
                    className={getInputClass("companyName", true)}
                  />
                  <Building
                    className="absolute text-green-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Company Type
                </label>
                <select
                  name="companyType"
                  value={formData.companyType}
                  onChange={handleFieldChange}
                  className={getInputClass("companyType", false)}
                >
                  <option value="">Select type</option>
                  {companyTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Company PAN
                </label>
                <input
                  name="companyPanNumber"
                  value={formData.companyPanNumber}
                  onChange={handleFieldChange}
                  placeholder="Enter PAN number"
                  className={getInputClass("companyPanNumber", false)}
                />
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Registration Number
                </label>
                <input
                  name="companyRegisteredNumber"
                  value={formData.companyRegisteredNumber}
                  onChange={handleFieldChange}
                  placeholder="Enter registration number"
                  className={getInputClass("companyRegisteredNumber", false)}
                />
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  GST Number
                </label>
                <input
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleFieldChange}
                  placeholder="Enter GST number"
                  className={getInputClass("gstNumber", false)}
                />
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Business Number
                </label>
                <input
                  name="businessNumber"
                  value={formData.businessNumber}
                  onChange={handleFieldChange}
                  placeholder="Enter business number"
                  className={getInputClass("businessNumber", false)}
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Registered Address
                </label>
                <input
                  name="registeredAddress"
                  value={formData.registeredAddress}
                  onChange={handleFieldChange}
                  placeholder="Enter address"
                  className={getInputClass("registeredAddress", false)}
                />
              </div>

              {/* ✅ City Dropdown — Redux cities */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  City
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3 text-gray-400 z-10"
                    size={18}
                  />
                  <select
                    name="companyinfo.companyCity"
                    value={formData.companyinfo.companyCity}
                    onChange={handleCityChange}
                    onBlur={() => markFieldTouched("city")}
                    className={`w-full p-2.5 pl-10 border rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
                    disabled={isLoadingCities}
                  >
                    <option value="">
                      {isLoadingCities ? "Loading cities..." : "Select City"}
                    </option>
                    {uniqueCities.map((city) => (
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

              {/* ✅ State Dropdown — Redux statesForCity (city select hone ke baad enable hoga) */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  State
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3 text-gray-400 z-10"
                    size={18}
                  />
                  <select
                    name="companyinfo.companyState"
                    value={formData.companyinfo.companyState}
                    onChange={handleStateChange}
                    onBlur={() => markFieldTouched("state")}
                    className={`w-full p-2.5 pl-10 border rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
                    disabled={
                      !formData.companyinfo.companyCity ||
                      stateLoading ||
                      statesForCity.length === 0
                    }
                  >
                    <option value="">
                      {stateLoading
                        ? "Loading states..."
                        : !formData.companyinfo.companyCity
                          ? "First select city"
                          : statesForCity.length === 0
                            ? "No states found"
                            : "Select State"}
                    </option>
                    {statesForCity.map((state) => (
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
                <label className="block mb-1 font-extrabold text-gray-700">
                  Garage Address
                </label>
                <input
                  name="garageAddress"
                  value={formData.garageAddress}
                  onChange={handleFieldChange}
                  placeholder="Enter garage address"
                  className={getInputClass("garageAddress", false)}
                />
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Garage Phone
                </label>
                <input
                  name="garagePhone"
                  value={formData.garagePhone}
                  onChange={handleFieldChange}
                  placeholder="Enter phone number"
                  className={getInputClass("garagePhone", false)}
                  inputMode="numeric"
                  maxLength={getMaxLength("garagePhone")}
                />
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Cooperative Name
                </label>
                <input
                  name="cooperativeName"
                  value={formData.cooperativeName}
                  onChange={handleFieldChange}
                  placeholder="Enter name"
                  className={getInputClass("cooperativeName", false)}
                />
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Cooperative Number
                </label>
                <input
                  name="cooperativeNumber"
                  value={formData.cooperativeNumber}
                  onChange={handleFieldChange}
                  placeholder="Enter number"
                  className={getInputClass("cooperativeNumber", false)}
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          {/* ── Section 4: Document Uploads ──────────────────────────────── */}
          <div className="p-6 border rounded-xl bg-yellow-50">
            <h3 className="pb-3 mb-6 text-xl font-semibold text-yellow-800 border-b">
              <span className="px-3 py-1 mr-2 text-white bg-yellow-600 rounded-md">
                4
              </span>
              Document Uploads
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  { key: "passportPhoto", label: "Passport Photo" },
                  { key: "panDoc", label: "PAN Document" },
                  { key: "gstDoc", label: "GST Document" },
                  { key: "vendorProof", label: "Vendor Proof" },
                  { key: "vehicleDoc", label: "Vehicle Document" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key}>
                  <label className="block mb-1 font-extrabold text-gray-700">
                    {label}
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, key)}
                    className="w-full p-2 border rounded-lg"
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

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-300"
            >
              {savingProfile ? "Saving..." : "Save Vendor Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorForm;
