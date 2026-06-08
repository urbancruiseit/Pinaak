"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
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
import {
  createVendorThunk,
  updateVendorThunk,
  resetSuccess,
  clearError,
  getVendorByIdThunk,
} from "@/app/features/vendor/vendorSlice";
import {
  fetchAllCities,
  fetchStatesByCity,
  resetStatesForCity,
} from "../../../features/State/stateSlice";

/* ================================================================
   TYPES
================================================================ */
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

interface VendorFormData {
  id?: number;
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
  personalCityId?: number | string;
  personalStateId?: number | string;
  companyinfo: {
    companyState: string;
    companyCity: string;
  };
}

interface VendorFormProps {
  mode?: "edit" | "view" | "create";
  onBack?: () => void;
  vendorId?: number; // Add this prop to pass vendor ID
}

/* ================================================================
   CONSTANTS
================================================================ */
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

const FIELD_MAX_LENGTHS: Record<string, number> = {
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

/* ================================================================
   COMPONENT
================================================================ */
const VendorForm: React.FC<VendorFormProps> = ({
  mode: propMode = "create",
  onBack,
  vendorId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const isEditMode = propMode === "edit";
  const isViewMode = propMode === "view";

  /* ---------- Redux state ---------- */
  const stateSlice = useSelector((state: AppRootState) => state.stateCity);
  const selectedVendor = useSelector(
    (state: RootState) => state.vendor.selectedVendor,
  );
  const vendorStatus = useSelector((state: RootState) => state.vendor.status);

  // Debug: Log selectedVendor to see what's coming from Redux
  useEffect(() => {
  }, [selectedVendor, vendorStatus]);

  const { cities = [], loading: stateLoading = false } = stateSlice || {};

  /* ---------- Local state ---------- */
  const [formData, setFormData] = useState<VendorFormData>(initialFormState);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingVendor, setIsLoadingVendor] = useState(false);

  const [personalStatesForCity, setPersonalStatesForCity] = useState<
    StateItem[]
  >([]);
  const [personalStateLoading, setPersonalStateLoading] = useState(false);

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

  /* ================================================================
     EFFECTS
  ================================================================ */

  /* 1. Fetch vendor data if in edit/view mode and vendorId is provided */
  useEffect(() => {
    const loadVendorData = async () => {
      if ((isEditMode || isViewMode) && vendorId) {
        try {
          setIsLoadingVendor(true);
          await dispatch(getVendorByIdThunk(vendorId)).unwrap();
        } catch (err) {
          console.error("Failed to fetch vendor:", err);
          setSubmitError("Failed to load vendor data");
        } finally {
          setIsLoadingVendor(false);
        }
      }
    };
    loadVendorData();
  }, [dispatch, isEditMode, isViewMode, vendorId]);

  /* 2. Fetch all cities on mount */
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoadingCities(true);
        await dispatch(fetchAllCities()).unwrap();
      } catch (err) {
        console.error("Cities fetch error:", err);
      } finally {
        setIsLoadingCities(false);
      }
    };
    load();
  }, [dispatch]);

  /* 3. Populate form from Redux selectedVendor (edit/view mode) */
  useEffect(() => {
    if (!selectedVendor || propMode === "create") {
      console.log("No selected vendor or create mode");
      return;
    }

    // The selectedVendor might already be the vendor object or might have a nested structure
    const vendorData = selectedVendor.vendor || selectedVendor;

    const mapped: VendorFormData = {
      id: vendorData.id,
      name: vendorData.name || vendorData.vendor_name || "",
      email: vendorData.email || vendorData.vendor_email || "",
      phone:
        vendorData.phone || vendorData.mobile || vendorData.vendor_phone || "",
      address: vendorData.address || "",
      panNumber: vendorData.panNumber || vendorData.pan_number || "",
      aadhaarNumber:
        vendorData.aadhaarNumber || vendorData.aadhaar_number || "",
      companyName: vendorData.company_name || vendorData.companyName || "",
      businessNumber:
        vendorData.businessNumber || vendorData.business_number || "",
      companyRegisteredNumber:
        vendorData.companyRegisteredNumber ||
        vendorData.company_registered_number ||
        "",
      gstNumber:
        vendorData.gstNumber || vendorData.gst_number || vendorData.gst || "",
      registeredAddress:
        vendorData.registeredAddress || vendorData.registered_address || "",
      garageAddress:
        vendorData.garageAddress || vendorData.garage_address || "",
      garagePhone: vendorData.garagePhone || vendorData.garage_phone || "",
      cooperativeName:
        vendorData.cooperativeName || vendorData.cooperative_name || "",
      cooperativeNumber:
        vendorData.cooperativeNumber || vendorData.cooperative_number || "",
      passportPhoto:
        vendorData.passportPhoto || vendorData.passport_photo || "",
      panDoc: vendorData.panDoc || vendorData.pan_doc || "",
      gstDoc: vendorData.gstDoc || vendorData.gst_doc || "",
      vendorProof: vendorData.vendorProof || vendorData.vendor_proof || "",
      vehicleDoc: vendorData.vehicleDoc || vendorData.vehicle_doc || "",
      managerName1: vendorData.managerName1 || vendorData.manager_name1 || "",
      managerName2: vendorData.managerName2 || vendorData.manager_name2 || "",
      ownerName: vendorData.ownerName || vendorData.owner_name || "",
      managerPhone1:
        vendorData.managerPhone1 || vendorData.manager_phone1 || "",
      managerEmail1:
        vendorData.managerEmail1 || vendorData.manager_email1 || "",
      managerPhone2:
        vendorData.managerPhone2 || vendorData.manager_phone2 || "",
      managerEmail2:
        vendorData.managerEmail2 || vendorData.manager_email2 || "",
      shortName: vendorData.shortName || vendorData.short_name || "",
      companyType: vendorData.companyType || vendorData.company_type || "",
      companyPanNumber:
        vendorData.companyPanNumber || vendorData.company_pan_number || "",
      ownerPhone: vendorData.ownerPhone || vendorData.owner_phone || "",
      ownerEmail: vendorData.ownerEmail || vendorData.owner_email || "",
      personalInfo: {
        personalAddress:
          vendorData.personalInfo?.personalAddress ||
          vendorData.personal_address ||
          vendorData.address ||
          "",
        personalCity:
          vendorData.personalInfo?.personalCity ||
          vendorData.personal_city ||
          vendorData.city ||
          "",
        personalState:
          vendorData.personalInfo?.personalState ||
          vendorData.personal_state ||
          vendorData.state ||
          "",
      },
      companyinfo: {
        companyState:
          vendorData.companyinfo?.companyState ||
          vendorData.company_state ||
          "",
        companyCity:
          vendorData.companyinfo?.companyCity || vendorData.company_city || "",
      },
    };

    console.log("Mapped form data:", mapped);
    setFormData(mapped);

    // Fetch states for the city if city is selected
    const cityName = mapped.personalInfo.personalCity;
    if (cityName) {
      setPersonalStateLoading(true);
      dispatch(fetchStatesByCity(cityName))
        .unwrap()
        .then((result: any) => {
          if (Array.isArray(result)) setPersonalStatesForCity(result);
        })
        .catch((err: any) => console.error("States fetch error:", err))
        .finally(() => setPersonalStateLoading(false));
    }
  }, [selectedVendor, propMode, dispatch]);

  /* ================================================================
     HANDLERS
  ================================================================ */
  const markFieldTouched = useCallback((fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const getInputClass = useCallback(
    (fieldName: string, hasIcon = false) => {
      const base = `w-full p-2.5 border rounded-lg ${hasIcon ? "pl-10" : ""}`;
      return `${base} border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none ${
        isViewMode ? "bg-gray-50" : "bg-white"
      }`;
    },
    [isViewMode],
  );

  const handleFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

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

  const handlePersonalCityChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedCity = e.target.value;
      setPersonalStatesForCity([]);
      setFormData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          personalCity: selectedCity,
          personalState: "",
        },
        personalCityId: undefined,
        personalStateId: undefined,
      }));

      if (!selectedCity) return;

      try {
        setPersonalStateLoading(true);
        const result = await dispatch(fetchStatesByCity(selectedCity)).unwrap();
        if (Array.isArray(result)) setPersonalStatesForCity(result);
      } catch (err) {
        console.error("Personal states fetch error:", err);
      } finally {
        setPersonalStateLoading(false);
      }
    },
    [dispatch],
  );

  const handlePersonalStateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedStateName = e.target.value;
      setFormData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          personalState: selectedStateName,
        },
      }));
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

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      router.push("/dashboard?tab=vendortable");
    }
  }, [onBack, router]);

  /* ================================================================
     SUBMIT
  ================================================================ */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSavingProfile(true);
      setSubmitError(null);
      setSuccessMessage(null);

      try {
        if (isEditMode && formData.id) {
          await dispatch(
            updateVendorThunk({ id: formData.id, vendorData: formData }),
          ).unwrap();
          setSuccessMessage("Vendor updated successfully!");
        } else {
          await dispatch(createVendorThunk(formData)).unwrap();
          setSuccessMessage("Vendor created successfully!");

          // Reset form after successful creation
          setFormData(initialFormState);
          setFileState({
            passportPhoto: null,
            panDoc: null,
            gstDoc: null,
            vendorProof: null,
            vehicleDoc: null,
          });
          setTouchedFields({});
          setPersonalStatesForCity([]);
          dispatch(resetStatesForCity());
        }

        setTimeout(() => {
          setSuccessMessage(null);
          dispatch(resetSuccess());
          if (isEditMode) handleBack();
        }, 2500);
      } catch (err: any) {
        setSubmitError(
          err?.message || "Something went wrong. Please try again.",
        );
      } finally {
        setSavingProfile(false);
      }
    },
    [formData, dispatch, isEditMode, handleBack],
  );

  /* ================================================================
     MEMOS
  ================================================================ */
  const uniqueCities = useMemo(() => {
    if (!cities || !Array.isArray(cities)) return [];
    return [...new Map(cities.map((c) => [c?.cityName, c])).values()];
  }, [cities]);

  // Show loading state
  if ((isEditMode || isViewMode) && isLoadingVendor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor data...</p>
        </div>
      </div>
    );
  }

  /* ================================================================
     RENDER
  ================================================================ */
  return (
    <div className="p-6 w-full mx-auto bg-white shadow-xl rounded-lg">
      <div className="p-6">
        {/* ── Header ── */}
        <div className="p-4 mb-8 bg-orange-100 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-center text-orange-600">
                {isViewMode
                  ? "View Vendor"
                  : isEditMode
                    ? "Edit Vendor"
                    : "Vendor Registration Form"}
              </h2>
              <p className="mt-2 text-center text-orange-700">
                {"All fields are optional — Fill as needed"}
              </p>
            </div>
            {(isEditMode || isViewMode) && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                {"← Back to Table"}
              </button>
            )}
          </div>
        </div>

        {/* ── Alerts ── */}
        {submitError && (
          <div className="flex items-center gap-2 px-4 py-3 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
        {successMessage && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 text-green-700 bg-green-50 border border-green-300 rounded-lg shadow-lg">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SECTION 1 — Vendor Detail */}
          <div className="p-6 border rounded-xl bg-purple-50">
            <h3 className="pb-3 mb-6 text-xl font-semibold text-purple-800 border-b">
              <span className="px-3 py-1 mr-2 text-white bg-purple-600 rounded-md">
                {"1"}
              </span>
              {"Vendor Detail"}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Vendor Name */}
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  {"Vendor Name"}
                </label>
                <div className="relative">
                  <User
                    className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("name")}
                    placeholder="Enter vendor name"
                    className={getInputClass("name", true)}
                    maxLength={FIELD_MAX_LENGTHS["name"]}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Short Name */}
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  {"Vendor Short Name"}
                </label>
                <div className="relative">
                  <User
                    className="absolute text-purple-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                  <input
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("shortName")}
                    placeholder="Enter short name"
                    className={getInputClass("shortName", true)}
                    maxLength={FIELD_MAX_LENGTHS["shortName"]}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  {"Vendor Address"}
                </label>
                <input
                  type="text"
                  name="personalInfo.personalAddress"
                  value={formData.personalInfo.personalAddress}
                  onChange={handleInputChange}
                  className={getInputClass("personalAddress", false)}
                  placeholder="Enter address"
                  disabled={isViewMode}
                />
              </div>

              {/* City */}
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  {"City"}
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
                    className="w-full p-2.5 pl-10 border rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                    disabled={isLoadingCities || isViewMode}
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

              {/* State */}
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  {"State"}
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
                    className="w-full p-2.5 pl-10 border rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                    disabled={
                      !formData.personalInfo.personalCity ||
                      personalStateLoading ||
                      personalStatesForCity.length === 0 ||
                      isViewMode
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

          {/* SECTION 2 — Contact Information */}
          <div className="p-6 border rounded-xl bg-blue-50">
            <h3 className="pb-3 mb-6 text-xl font-semibold text-blue-800 border-b">
              <span className="px-3 py-1 mr-2 text-white bg-blue-600 rounded-md">
                {"2"}
              </span>
              {"Contact Information"}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "ownerName",
                  label: "Owner Name",
                  type: "text",
                  Icon: User,
                },
                {
                  name: "ownerPhone",
                  label: "Owner Phone",
                  type: "tel",
                  Icon: Phone,
                },
                {
                  name: "ownerEmail",
                  label: "Owner Email",
                  type: "email",
                  Icon: Mail,
                },
                {
                  name: "managerName1",
                  label: "Manager 1 Name",
                  type: "text",
                  Icon: User,
                },
                {
                  name: "managerPhone1",
                  label: "Manager 1 Phone",
                  type: "tel",
                  Icon: Phone,
                },
                {
                  name: "managerEmail1",
                  label: "Manager 1 Email",
                  type: "email",
                  Icon: Mail,
                },
                {
                  name: "managerName2",
                  label: "Manager 2 Name",
                  type: "text",
                  Icon: User,
                },
                {
                  name: "managerPhone2",
                  label: "Manager 2 Phone",
                  type: "tel",
                  Icon: Phone,
                },
                {
                  name: "managerEmail2",
                  label: "Manager 2 Email",
                  type: "email",
                  Icon: Mail,
                },
              ].map(({ name, label, type, Icon }) => (
                <div key={name}>
                  <label className="block mb-1 font-extrabold text-gray-700">
                    {label}
                  </label>
                  <div className="relative">
                    <Icon
                      className="absolute text-blue-600 -translate-y-1/2 left-3 top-1/2"
                      size={20}
                    />
                    <input
                      name={name}
                      type={type}
                      value={formData[name as keyof VendorFormData] as string}
                      onChange={handleFieldChange}
                      onBlur={() => markFieldTouched(name)}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      className={getInputClass(name, true)}
                      inputMode={type === "tel" ? "numeric" : undefined}
                      maxLength={FIELD_MAX_LENGTHS[name]}
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3 — Company / Firm Details */}
          <div className="p-6 border rounded-xl bg-green-50">
            <h3 className="pb-3 mb-6 text-xl font-semibold text-green-800 border-b">
              <span className="px-3 py-1 mr-2 text-white bg-green-600 rounded-md">
                {"3"}
              </span>
              {"Company / Firm Details"}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Company Name */}
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  {"Company Name"}
                </label>
                <div className="relative">
                  <Building
                    className="absolute text-green-600 -translate-y-1/2 left-3 top-1/2"
                    size={20}
                  />
                  <input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleFieldChange}
                    placeholder="Enter company name"
                    className={getInputClass("companyName", true)}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Company Type */}
              <div>
                <label className="block mb-1 font-extrabold text-gray-700">
                  {"Company Type"}
                </label>
                <select
                  name="companyType"
                  value={formData.companyType}
                  onChange={handleFieldChange}
                  className={getInputClass("companyType", false)}
                  disabled={isViewMode}
                >
                  <option value="">{"Select type"}</option>
                  {companyTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plain text fields */}
              {[
                { name: "companyPanNumber", label: "Company PAN" },
                {
                  name: "companyRegisteredNumber",
                  label: "Registration Number",
                },
                { name: "gstNumber", label: "GST Number" },
                { name: "businessNumber", label: "Business Number" },
                { name: "registeredAddress", label: "Registered Address" },
                { name: "garageAddress", label: "Garage Address" },
                { name: "garagePhone", label: "Garage Phone" },
                { name: "cooperativeName", label: "Cooperative Name" },
                { name: "cooperativeNumber", label: "Cooperative Number" },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="block mb-1 font-extrabold text-gray-700">
                    {label}
                  </label>
                  <input
                    name={name}
                    value={formData[name as keyof VendorFormData] as string}
                    onChange={handleFieldChange}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className={getInputClass(name, false)}
                    maxLength={FIELD_MAX_LENGTHS[name]}
                    disabled={isViewMode}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4 — Document Uploads */}
          <div className="p-6 border rounded-xl bg-yellow-50">
            <h3 className="pb-3 mb-6 text-xl font-semibold text-yellow-800 border-b">
              <span className="px-3 py-1 mr-2 text-white bg-yellow-600 rounded-md">
                {"4"}
              </span>
              {"Document Uploads"}
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
                    className="w-full p-2 border rounded-lg bg-white"
                    disabled={isViewMode}
                  />
                  {!fileState[key] && formData[key] && (
                    <p className="mt-1 text-xs text-blue-500 truncate">
                      {"Current: "}
                      <a
                        href={formData[key] as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {"View file"}
                      </a>
                    </p>
                  )}
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
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition"
              >
                {savingProfile
                  ? "Saving..."
                  : isEditMode
                    ? "Update Vendor Profile"
                    : "Save Vendor Profile"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default VendorForm;
