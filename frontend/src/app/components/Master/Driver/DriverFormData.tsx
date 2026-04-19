"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { AppDispatch, RootState } from "@/app/redux/store";
import { createDriverThunk } from "@/app/features/Driver/driverSlice";
import {
  fetchAllCities,
  fetchStatesByCity,
  resetStatesForCity,
} from "@/app/features/State/stateSlice";

// ── Types (Vendor form jaise) ─────────────────────────────────────────────────
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

type AppRootState = RootState & {
  stateCity: StateCitySlice;
};

// ─────────────────────────────────────────────────────────────────────────────

interface DriverFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    email: string;
    phone: string;
    emergencyContact: string;
    emergencyPhone: string;
    bloodGroup: string;
    vendor: string;
    vendorState: string;
    vendorCity: string;
  };
  addressInfo: {
    permanentAddress: string;
    currentAddress: string;
    city: string;
    state: string;
    pincode: string;
  };
  licenseInfo: {
    licenseNumber: string;
    licenseType: string;
    issuingAuthority: string;
    issueDate: string;
    experienceDetails: string;
    expiryDate: string;
    dlFront: string;
    dlBack: string;
  };
  employmentInfo: {
    employeeId: string;
  };
  documents: {
    aadharCard: string;
    panCard: string;
  };
}

const licenseTypes = [
  "MCWG",
  "MCWOG",
  "LMV",
  "LMV-NT",
  "LMV-TR",
  "HMV",
  "HMV-TR",
  "HMV-NT",
  "International",
];

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const sampleVendors = [
  { name: "Vendor A", state: "Maharashtra", city: "Mumbai" },
  { name: "Vendor B", state: "Delhi", city: "New Delhi" },
  { name: "Vendor C", state: "Karnataka", city: "Bengaluru" },
  { name: "Vendor D", state: "Tamil Nadu", city: "Chennai" },
  { name: "Vendor E", state: "Uttar Pradesh", city: "Lucknow" },
];

const initialFormState: DriverFormData = {
  personalInfo: {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    emergencyContact: "",
    emergencyPhone: "",
    bloodGroup: "",
    vendor: "",
    vendorState: "",
    vendorCity: "",
  },
  addressInfo: {
    permanentAddress: "",
    currentAddress: "",
    city: "",
    state: "",
    pincode: "",
  },
  licenseInfo: {
    licenseNumber: "",
    licenseType: "",
    issuingAuthority: "",
    issueDate: "",
    experienceDetails: "",
    expiryDate: "",
    dlFront: "",
    dlBack: "",
  },
  employmentInfo: {
    employeeId: "",
  },
  documents: {
    aadharCard: "",
    panCard: "",
  },
};

const DriverForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState<DriverFormData>(initialFormState);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sameAsPermanent, setSameAsPermanent] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Redux state — Vendor form jaise stateCity slice se ───────────────────
  const stateSlice = useSelector((state: AppRootState) => state.stateCity);
  const {
    cities = [],
    statesForCity = [],
    loading: stateLoading = false,
  } = stateSlice || {};

  // Unique cities (duplicate hata do)
  const uniqueCities = React.useMemo(() => {
    if (!cities || !Array.isArray(cities)) return [];
    return [...new Map(cities.map((c) => [c?.cityName, c])).values()];
  }, [cities]);

  // ── Address section ke liye alag states (personal se independent) ─────────
  // addressInfo city/state → Redux statesForCity use karega
  // (Vendor form ke companyinfo jaise)

  // ── File state ────────────────────────────────────────────────────────────
  const [fileState, setFileState] = useState<{
    dlFront: File | null;
    dlBack: File | null;
    aadharCard: File | null;
    panCard: File | null;
  }>({
    dlFront: null,
    dlBack: null,
    aadharCard: null,
    panCard: null,
  });

  // ── Load all cities on mount ──────────────────────────────────────────────
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

  // ── Handlers ──────────────────────────────────────────────────────────────
  const markFieldTouched = useCallback((fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const getInputClass = useCallback((fieldName: string, hasIcon = false) => {
    const base = `w-full p-2.5 border rounded-lg ${hasIcon ? "pl-10" : ""}`;
    return `${base} border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`;
  }, []);

  const getMaxLength = useCallback((fieldName: string): number | undefined => {
    const limits: Record<string, number> = {
      phone: 10,
      emergencyPhone: 10,
      pincode: 6,
      licenseNumber: 20,
      experienceDetails: 2,
    };
    return limits[fieldName];
  }, []);

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value } = e.target;
      const parts = name.split(".");
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof DriverFormData] as Record<string, string>),
            [child]: value,
          },
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    },
    [],
  );

  // ✅ Address City change → fetchStatesByCity (Vendor form jaise)
  const handleCityChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedCity = e.target.value;

      dispatch(resetStatesForCity());

      setFormData((prev) => ({
        ...prev,
        addressInfo: {
          ...prev.addressInfo,
          city: selectedCity,
          state: "", // city badli to state reset
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
    [dispatch],
  );

  // ✅ Address State change
  const handleStateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedStateName = e.target.value;
      setFormData((prev) => ({
        ...prev,
        addressInfo: {
          ...prev.addressInfo,
          state: selectedStateName,
        },
      }));
      setErrors((prev) => ({ ...prev, state: "" }));
    },
    [],
  );

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

  const handleAddressSame = useCallback(() => {
    if (!sameAsPermanent) {
      setFormData((prev) => ({
        ...prev,
        addressInfo: {
          ...prev.addressInfo,
          currentAddress: prev.addressInfo.permanentAddress,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        addressInfo: { ...prev.addressInfo, currentAddress: "" },
      }));
    }
    setSameAsPermanent(!sameAsPermanent);
  }, [sameAsPermanent]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSavingProfile(true);
      setError(null);
      setSuccessMessage(null);

      try {
        await dispatch(createDriverThunk(formData)).unwrap();
        setSuccessMessage("Driver Created Successfully ✅");
        setFormData(initialFormState);
        setFileState({
          dlFront: null,
          dlBack: null,
          aadharCard: null,
          panCard: null,
        });
        setTouchedFields({});
        setSameAsPermanent(false);
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
          <div>
            <h2 className="text-2xl font-bold text-center text-orange-600">
              Driver Registration Form
            </h2>
            <p className="mt-2 text-center text-orange-700">
              Complete all sections to register a new driver
            </p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ── Section 1: Personal Information ──────────────────────────── */}
          <div className="p-6 border rounded-xl bg-blue-50">
            <h3 className="pb-3 mb-6 text-xl font-semibold text-blue-800 border-b">
              <span className="px-3 py-1 mr-2 text-white bg-blue-600 rounded-md">
                1
              </span>
              Personal Information
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Employee ID
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="employmentInfo.employeeId"
                    value={formData.employmentInfo.employeeId}
                    onChange={handleInputChange}
                    onBlur={() => markFieldTouched("employeeId")}
                    placeholder="EMP-001"
                    className={getInputClass("employeeId", true)}
                  />
                  <User
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Vendor Under
                </label>
                <select
                  name="personalInfo.vendor"
                  value={formData.personalInfo.vendor}
                  onChange={(e) => {
                    handleInputChange(e);
                    const selectedVendor = sampleVendors.find(
                      (v) => v.name === e.target.value,
                    );
                    if (selectedVendor) {
                      setFormData((prev) => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          vendorState: selectedVendor.state,
                          vendorCity: selectedVendor.city,
                        },
                      }));
                    }
                  }}
                  className={getInputClass("vendor", false)}
                >
                  <option value="">Select Vendor</option>
                  {sampleVendors.map((vendor) => (
                    <option key={vendor.name} value={vendor.name}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1 font-extrabold text-gray-700">
                    Vendor City
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.vendorCity}
                    readOnly
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-extrabold text-gray-700">
                    Vendor State
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.vendorState}
                    readOnly
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  First Name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="personalInfo.firstName"
                    value={formData.personalInfo.firstName}
                    onChange={handleInputChange}
                    onBlur={() => markFieldTouched("firstName")}
                    placeholder="Enter first name"
                    className={getInputClass("firstName", true)}
                  />
                  <User
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Last Name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="personalInfo.lastName"
                    value={formData.personalInfo.lastName}
                    onChange={handleInputChange}
                    onBlur={() => markFieldTouched("lastName")}
                    placeholder="Enter last name"
                    className={getInputClass("lastName", true)}
                  />
                  <User
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Date of Birth
                </label>
                <div className="relative group">
                  <input
                    type="date"
                    name="personalInfo.dateOfBirth"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={handleInputChange}
                    onBlur={() => markFieldTouched("dateOfBirth")}
                    className={getInputClass("dateOfBirth", true)}
                  />
                  <Calendar
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Gender
                </label>
                <select
                  name="personalInfo.gender"
                  value={formData.personalInfo.gender}
                  onChange={handleInputChange}
                  className={getInputClass("gender", false)}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Mobile Number
                </label>
                <div className="relative group">
                  <input
                    name="personalInfo.phone"
                    type="tel"
                    value={formData.personalInfo.phone}
                    onChange={handleInputChange}
                    onBlur={() => markFieldTouched("phone")}
                    className={getInputClass("phone", true)}
                    placeholder="Enter WhatsApp number"
                    maxLength={getMaxLength("phone")}
                  />
                  <Phone
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Relative Name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="personalInfo.emergencyContact"
                    value={formData.personalInfo.emergencyContact}
                    onChange={handleInputChange}
                    onBlur={() => markFieldTouched("emergencyContact")}
                    placeholder="Enter relative name"
                    className={getInputClass("emergencyContact", true)}
                  />
                  <User
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Relative Mobile Number
                </label>
                <div className="relative group">
                  <input
                    name="personalInfo.emergencyPhone"
                    type="tel"
                    value={formData.personalInfo.emergencyPhone}
                    onChange={handleInputChange}
                    onBlur={() => markFieldTouched("emergencyPhone")}
                    className={getInputClass("emergencyPhone", true)}
                    placeholder="Enter relative Mobile Number"
                    maxLength={getMaxLength("emergencyPhone")}
                  />
                  <Phone
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Email
                </label>
                <div className="relative group">
                  <input
                    name="personalInfo.email"
                    type="email"
                    value={formData.personalInfo.email}
                    onChange={handleInputChange}
                    onBlur={() => markFieldTouched("email")}
                    className={getInputClass("email", true)}
                    placeholder="Enter email address"
                  />
                  <Mail
                    className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Blood Group
                </label>
                <select
                  name="personalInfo.bloodGroup"
                  value={formData.personalInfo.bloodGroup}
                  onChange={handleInputChange}
                  className={getInputClass("bloodGroup", false)}
                >
                  <option value="">Select</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Section 2: Address Information ───────────────────────────── */}
          <div className="p-6 border rounded-xl bg-green-50">
            <h3 className="pb-3 mb-6 text-xl font-semibold text-green-800 border-b">
              <span className="px-3 py-1 mr-2 text-white bg-green-600 rounded-md">
                2
              </span>
              Address Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Permanent Address
                </label>
                <div className="relative group">
                  <input
                    name="addressInfo.permanentAddress"
                    value={formData.addressInfo.permanentAddress}
                    onChange={handleInputChange}
                    onBlur={() => markFieldTouched("permanentAddress")}
                    placeholder="Enter permanent address"
                    className={getInputClass("permanentAddress", true)}
                  />
                  <MapPin
                    className="absolute text-green-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="sameAddress"
                  checked={sameAsPermanent}
                  onChange={handleAddressSame}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label
                  htmlFor="sameAddress"
                  className="ml-2 text-sm text-gray-700"
                >
                  Same as Permanent Address
                </label>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Current Address
                </label>
                <div className="relative group">
                  <input
                    name="addressInfo.currentAddress"
                    value={formData.addressInfo.currentAddress}
                    onChange={handleInputChange}
                    onBlur={() => markFieldTouched("currentAddress")}
                    placeholder="Enter current address"
                    className={getInputClass("currentAddress", true)}
                    disabled={sameAsPermanent}
                  />
                  <MapPin
                    className="absolute text-green-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* ✅ City Dropdown — Redux cities (Vendor form jaise) */}
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
                      name="addressInfo.city"
                      value={formData.addressInfo.city}
                      onChange={handleCityChange}
                      onBlur={() => markFieldTouched("city")}
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
                  {touchedFields.city && errors.city && (
                    <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                  )}
                </div>

                {/* ✅ State Dropdown — city select hone ke baad enable (Vendor form jaise) */}
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
                      name="addressInfo.state"
                      value={formData.addressInfo.state}
                      onChange={handleStateChange}
                      onBlur={() => markFieldTouched("state")}
                      className="w-full p-2.5 pl-10 border rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      disabled={
                        !formData.addressInfo.city ||
                        stateLoading ||
                        statesForCity.length === 0
                      }
                    >
                      <option value="">
                        {stateLoading
                          ? "Loading states..."
                          : !formData.addressInfo.city
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
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="addressInfo.pincode"
                    value={formData.addressInfo.pincode}
                    onChange={handleInputChange}
                    onBlur={() => markFieldTouched("pincode")}
                    placeholder="Enter 6-digit pincode"
                    className={getInputClass("pincode", false)}
                    maxLength={getMaxLength("pincode")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 3: License Information ───────────────────────────── */}
          <div className="p-6 border rounded-xl bg-orange-100/50">
            <h3 className="pb-3 mb-6 text-xl font-semibold text-orange-600 border-b border-orange-800">
              <span className="px-3 py-1 mr-2 text-white bg-orange-600 rounded-md">
                3
              </span>
              Driving License Information
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  License Number
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="licenseInfo.licenseNumber"
                    value={formData.licenseInfo.licenseNumber}
                    onChange={handleInputChange}
                    onBlur={() => markFieldTouched("licenseNumber")}
                    placeholder="Enter license number"
                    className={getInputClass("licenseNumber", true)}
                    maxLength={getMaxLength("licenseNumber")}
                  />
                  <FileText
                    className="absolute text-orange-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  License Type
                </label>
                <div className="relative group">
                  <select
                    name="licenseInfo.licenseType"
                    value={formData.licenseInfo.licenseType}
                    onChange={handleInputChange}
                    className={getInputClass("licenseType", true)}
                  >
                    <option value="">Select Type</option>
                    {licenseTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <FileText
                    className="absolute text-orange-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Issuing Authority
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="licenseInfo.issuingAuthority"
                    value={formData.licenseInfo.issuingAuthority}
                    onChange={handleInputChange}
                    onBlur={() => markFieldTouched("issuingAuthority")}
                    placeholder="Enter issuing authority"
                    className={getInputClass("issuingAuthority", true)}
                  />
                  <FileText
                    className="absolute text-orange-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Issue Date
                </label>
                <div className="relative group">
                  <input
                    type="date"
                    name="licenseInfo.issueDate"
                    value={formData.licenseInfo.issueDate}
                    onChange={handleInputChange}
                    onBlur={() => markFieldTouched("issueDate")}
                    className={getInputClass("issueDate", true)}
                  />
                  <Calendar
                    className="absolute text-orange-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Expiry Date
                </label>
                <div className="relative group">
                  <input
                    type="date"
                    name="licenseInfo.expiryDate"
                    value={formData.licenseInfo.expiryDate}
                    onChange={handleInputChange}
                    onBlur={() => markFieldTouched("expiryDate")}
                    className={getInputClass("expiryDate", true)}
                  />
                  <Calendar
                    className="absolute text-orange-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  Experience Year
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="licenseInfo.experienceDetails"
                    value={formData.licenseInfo.experienceDetails}
                    onChange={handleInputChange}
                    onBlur={() => markFieldTouched("experienceDetails")}
                    placeholder="Enter years of experience"
                    className={getInputClass("experienceDetails", true)}
                    maxLength={getMaxLength("experienceDetails")}
                  />
                  <Calendar
                    className="absolute text-orange-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 4: Documents Upload ───────────────────────────────── */}
          <div className="p-6 border rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50">
            <h3 className="pb-3 mb-4 text-xl font-semibold text-yellow-800 border-b">
              <span className="px-3 py-1 mr-2 text-white bg-yellow-600 rounded-md">
                4
              </span>
              Documents Upload
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {(
                [
                  { key: "dlFront", label: "License Front Photo" },
                  { key: "dlBack", label: "License Back Photo" },
                  { key: "aadharCard", label: "Aadhar Card" },
                  { key: "panCard", label: "Pan Card" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key}>
                  <label className="block mb-1 font-extrabold text-gray-700">
                    {label}
                  </label>
                  <div className="flex items-center gap-2 p-3 rounded-md bg-blue-50">
                    <input
                      type="file"
                      id={key}
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, key)}
                      className="hidden"
                    />
                    <label
                      htmlFor={key}
                      className="px-4 py-2 font-extrabold text-white bg-yellow-700 rounded-md cursor-pointer hover:bg-yellow-500"
                    >
                      Choose File
                    </label>
                    {fileState[key] && (
                      <span className="text-sm text-gray-600">
                        {fileState[key]!.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={savingProfile}
              className="h-16 px-8 py-3 text-xl font-semibold text-white bg-orange-600 border-2 border-gray-200 rounded-full shadow-xl hover:bg-orange-700 w-88 disabled:bg-orange-300"
            >
              {savingProfile ? "Submitting..." : "Submit Driver Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverForm;
