"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Users,
  Car,
  FileText,
  BarChart3,
  Settings,
  UserCircle,
  Calendar,
  MapPin,
  Building2,
  Shield,
} from "lucide-react";
import Image from "next/image";
import userAvatar from "../../assets/user-pic.png";
import pinaak from "../../assets/pinnak.png";
import { AppDispatch, RootState } from "@/app/redux/store";

import {
  currentUserThunk,
  logoutEmployeeThunk,
} from "@/app/features/user/userSlice";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type MenuItem = {
  label: string;
  value: string;
};

type MenuSection = {
  key: string;
  label: string;
  items: MenuItem[];
};

const MASTER_MENU_SECTIONS: MenuSection[] = [
  {
    key: "customers",
    label: "CUSTOMERS",
    items: [
      { label: "New Customer Form", value: "customer-personal" },
      { label: "Existing Customer Search", value: "customer-table" },
    ],
  },
  {
    key: "master",
    label: "UC",
    items: [
      { label: "Corporate Form", value: "corporate-form" },
      { label: "Corporate Event", value: "corporate-event" },
      { label: "Employee Form Data", value: "employee" },
      { label: "HR Form Data", value: "hr" },
      { label: "Quotation PDF", value: "quotation-pdf" },
      { label: "Rate Quotation", value: "rate-quotation" },
      { label: "City Form", value: "city" },
      { label: "Card Reel", value: "card-reel" },
      { label: "Country Code", value: "country-code" },
      { label: "Add Zone", value: "zone" },
      { label: "Add Region", value: "region" },
    ],
  },
  {
    key: "vendor",
    label: "VENDOR",
    items: [
      { label: "Vendor Registration Form", value: "vendor" },
      { label: "Vendor Search", value: "vendor-table" },
    ],
  },
  {
    key: "vehicles",
    label: "VEHICLES",
    items: [
      { label: "Vehicle Registration Form", value: "vehicle-registration" },
      { label: "Vehicles Master", value: "vehicles" },
      { label: "Vehicle Options", value: "vehicle-category" },

      { label: "Vehicle Add Form", value: "vehicle-add" },
    ],
  },
  {
    key: "drivers",
    label: "DRIVER",
    items: [
      { label: "Driver Registration Form", value: "driver" },
      { label: "Driver Search", value: "driver-table" },
    ],
  },
];

const LEADS_MENU: MenuSection = {
  key: "leads-menu",
  label: "Leads List",
  items: [{ label: "Lead Manager", value: "lead-table" }],
};

const ACCESS_MENU: MenuSection = {
  key: "access-menu",
  label: "Access Level",
  items: [
    { label: "City Access", value: "city-manager" },
    { label: "Team Access", value: "team-leader" },
    { label: "Sales Access", value: "sales-member" },
    { label: "BDM Access", value: "bdm" },
  ],
};

const LEADS_TRACK: MenuSection = {
  key: "lead-track",
  label: "Lead Track",
  items: [{ label: "Lead Track", value: "lead-track" }],
};

const YEAR_MENU: MenuSection = {
  key: "year-menu",
  label: "Year",
  items: [
    { label: "FY 26", value: "2026" },
    { label: "FY 27", value: "2027" },
  ],
};

const SALES_MENU: MenuSection = {
  key: "sales-menu",
  label: "SALES",
  items: [{ label: "Sales Lead Manager", value: "sales-lead-table" }],
};

// Fallback static data (used only when user data not available)
const FALLBACK_REGIONS = ["North", "South", "East", "West"];
const FALLBACK_ZONES = ["DL-NCR", "MH-West", "KA-South", "WB-East"];
const FALLBACK_CITIES_BY_REGION: Record<string, string[]> = {
  North: ["Delhi", "Jaipur", "Chandigarh"],
  South: ["Bengaluru", "Chennai", "Hyderabad"],
  East: ["Kolkata", "Patna", "Bhubaneswar"],
  West: ["Mumbai", "Pune", "Ahmedabad"],
};

const getDashboardMenu = (userRole?: string): MenuSection => {
  const allItems: MenuItem[] = [
    { label: "Leads Dashboard", value: "leads-dashboard" },
    { label: "Pre-Sales Team Dashboard", value: "presales-dashboard" },
    { label: "City Manager Dashboard", value: "citymanager-dashboard" },
    { label: "BDM Dashboard", value: "bdm-dashboard" },
    { label: "Sales Team Dashboard", value: "salesteam-dashboard" },
    { label: "Team Leader Dashboard", value: "teamleader-dashboard" },
  ];

  let allowedItems: MenuItem[] = [];
  const normalizedRole = userRole?.toLowerCase().trim();

  if (normalizedRole === "admin") {
    allowedItems = allItems;
  } else if (normalizedRole === "presales" || normalizedRole === "presale") {
    allowedItems = [
      { label: "Pre-Sales Team Dashboard", value: "presales-dashboard" },
    ];
  } else if (normalizedRole === "bdm") {
    allowedItems = [{ label: "BDM Dashboard", value: "bdm-dashboard" }];
  } else if (normalizedRole === "sales") {
    allowedItems = [
      { label: "Sales Team Dashboard", value: "salesteam-dashboard" },
    ];
  } else if (
    normalizedRole === "city manager" ||
    normalizedRole === "citymanager"
  ) {
    allowedItems = [
      { label: "City Manager Dashboard", value: "citymanager-dashboard" },
    ];
  } else if (
    normalizedRole === "team leader" ||
    normalizedRole === "teamleader" ||
    normalizedRole === "team_leader"
  ) {
    allowedItems = [
      { label: "Team Leader Dashboard", value: "teamleader-dashboard" },
    ];
  }

  return {
    key: "dashboard-menu",
    label: "Dashboards",
    items: allowedItems,
  };
};

interface NavbarProps {
  showAccess?: boolean;
  showMaster?: boolean;
  showLeadsMenu?: boolean;
  showDashboardMenu?: boolean;
  showSalesMenu?: boolean;
  showYearMenu?: boolean;
  activeSection?: string | null;
  activeMasterKey?: string | null;
  activeLeadKey?: string | null;
  activeDashboardKey?: string | null;
  activeYearKey?: string | null;
  activeAccessKey?: string | null;
  onMasterSelect?: (key: string) => void;
  onLeadSelect?: (key: string) => void;
  onDashboardSelect?: (key: string) => void;
  onSalesLeadSelect?: (key: string) => void;
  onSalesEditFormSelect?: (key: string) => void;
  onTlTablesSelect?: (key: string) => void;
  onYearSelect?: (key: string) => void;
  onAccessSelect?: (key: string) => void;
  permittedMasterKeys?: string[] | null;
  selectedRegion?: string;
  selectedCity?: string;
  selectedZone?: string;
  onRegionChange?: (region: string) => void;
  onCityChange?: (cityId: string) => void;
  onZoneChange?: (zone: string) => void;
  userName?: string;
  roleLabel?: string;
  userRole?: string;
  onLogout?: () => void;
  onMonthlyEnquiry?: () => void;
  onMonthlyDistribution?: () => void;

  // ℹ️ Region/Zone/City ab Redux se directly lete hain — props ki zarurat nahi
}

const getMenuIcon = (menuKey: string, label: string) => {
  if (menuKey.includes("customer"))
    return <Users size={16} className="mr-1.5" />;
  if (menuKey.includes("master") || menuKey.includes("UC"))
    return <Building2 size={16} className="mr-1.5" />;
  if (menuKey.includes("vendor"))
    return <FileText size={16} className="mr-1.5" />;
  if (menuKey.includes("vehicle")) return <Car size={16} className="mr-1.5" />;
  if (menuKey.includes("driver"))
    return <UserCircle size={16} className="mr-1.5" />;
  if (menuKey.includes("access"))
    return <Shield size={16} className="mr-1.5" />;
  if (label === "New Lead Form" || label === "Lead Manager")
    return <FileText size={16} className="mr-1.5" />;
  if (label === "Dashboards")
    return <LayoutDashboard size={16} className="mr-1.5" />;
  if (label === "Sales Lead Manager")
    return <Users size={16} className="mr-1.5" />;
  return null;
};

export function Navbar({
  showAccess = false,
  showMaster = false,
  showLeadsMenu = false,
  showDashboardMenu = false,
  showSalesMenu = false,
  showYearMenu = false,
  activeSection,
  activeMasterKey,
  activeLeadKey,
  activeDashboardKey,
  activeYearKey,
  activeAccessKey,
  onMasterSelect,
  onLeadSelect,
  onDashboardSelect,
  onSalesLeadSelect,
  onSalesEditFormSelect,
  onTlTablesSelect,
  onYearSelect,
  onAccessSelect,
  permittedMasterKeys,
  selectedRegion = "",
  selectedCity = "",
  selectedZone = "",
  onRegionChange,
  onCityChange,
  onZoneChange,
  userName,
  roleLabel,
  userRole,
  onLogout,
  onMonthlyEnquiry,
  onMonthlyDistribution,
}: NavbarProps) {
  // ✅ Redux se currentUser lo
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      dispatch(currentUserThunk());
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      console.log("Current User Data:", JSON.stringify(currentUser, null, 2));
    }
  }, [currentUser]);

  // ✅ currentUser se region, zone, city nikalo
  const userRegionNames = (currentUser as any)?.region_names ?? [];
  const userZoneNames = (currentUser as any)?.zone_names ?? [];
  const userCityNames = (currentUser as any)?.city_names ?? [];
  const userCityIds = (currentUser as any)?.city_ids ?? [];

  // ✅ currentUser se email, department, subDepartment nikalo
  const rawUser = (currentUser as any) ?? {};
  const userData = rawUser?.data ?? rawUser;
  const userEmail =
    rawUser?.personalEmail ??
    userData?.personalEmail ??
    rawUser?.user_email ??
    "";
  const userAliasName =
    rawUser?.aliasName ??
    userData?.aliasName ??
    rawUser?.alias_name ??
    userData?.alias_name ??
    "";

  const userDepartment =
    rawUser?.department ??
    userData?.department ??
    rawUser?.dept_name ??
    userData?.dept_name ??
    "";
  const userSubDepartment =
    rawUser?.subDepartment_name ??
    userData?.subDepartment_name ??
    rawUser?.sub_department ??
    userData?.sub_department ??
    rawUser?.subdept_name ??
    userData?.subdept_name ??
    "";
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  const masterKeySet = useMemo(
    () => (permittedMasterKeys ? new Set(permittedMasterKeys) : null),
    [permittedMasterKeys],
  );

  // ✅ Fallback city options (used only when userCityNames not provided)
  const fallbackCityOptions = useMemo(() => {
    if (!selectedRegion) {
      return Object.values(FALLBACK_CITIES_BY_REGION).reduce<string[]>(
        (acc, group) => acc.concat(group),
        [],
      );
    }
    return FALLBACK_CITIES_BY_REGION[selectedRegion] ?? [];
  }, [selectedRegion]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  const handleMasterSelect = (value: string) => {
    onMasterSelect?.(value);
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const handleLeadSelect = (value: string) => {
    onLeadSelect?.(value);
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const handleDashboardSelect = (value: string) => {
    onDashboardSelect?.(value);
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const handleYearSelect = (value: string) => {
    onYearSelect?.(value);
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const handleSalesLeadSelect = (value: string) => {
    onSalesLeadSelect?.(value);
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const handleSalesEditFormSelect = (value: string) => {
    onSalesEditFormSelect?.(value);
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const handleTlTablesSelect = (value: string) => {
    onTlTablesSelect?.(value);
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const handleAccessSelect = (value: string) => {
    onAccessSelect?.(value);
    setOpenMenu(null);
    setMobileOpen(false);
  };
  const handleMonthlyEnquiry = () => {
    onMonthlyEnquiry?.();
    setOpenMenu(null);
    setMobileOpen(false);
  };
  const handleMonthlyDistribution = () => {
    onMonthlyDistribution?.();
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutEmployeeThunk()).unwrap();
      toast.success("Logout successfully");

      setTimeout(() => {
        router.push("/"); // ✅ Next.js navigation
      }, 500);
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <nav
      ref={navbarRef}
      className="w-full h-16 z-50 flex flex-col border-b border-gray-200 shadow-sm bg-orange-50 relative"
    >
      {/* Mobile top bar */}
      <div className="flex items-center h-16 w-full px-4 justify-between md:hidden">
        <button
          type="button"
          className="flex items-center justify-center p-2 text-orange-600 transition border border-orange-200 rounded-full bg-white/80 hover:bg-white hover:shadow-md"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center">
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm border border-orange-100">
            <Image
              src={userAvatar}
              alt="User"
              width={28}
              height={28}
              className="object-cover border-2 border-orange-500 rounded-full"
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">
                {userAliasName ?? "Guest"}
              </p>
              <p className="text-[11px] uppercase text-gray-500">{roleLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div
        className={`${mobileOpen ? "block" : "hidden"} w-full px-4 pb-4 md:block md:pb-0`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:h-16">
          {/* Left Section */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap md:gap-2 lg:gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0 h-full">
              <Image
                src={pinaak}
                alt="logo"
                width={150}
                priority
                className="rounded-xl hidden sm:block flex-shrink-0"
              />
            </div>

            {/* MASTER SECTION */}
            {showMaster && (
              <>
                {MASTER_MENU_SECTIONS.map((menu) => {
                  const visibleItems = masterKeySet
                    ? menu.items.filter((item) => masterKeySet.has(item.value))
                    : menu.items;
                  if (visibleItems.length === 0) return null;

                  const isOpen = openMenu === menu.key;
                  const menuIcon = getMenuIcon(menu.key, menu.label);

                  return (
                    <div key={menu.key} className="relative w-full md:w-auto">
                      <button
                        type="button"
                        className={`w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 
                          ${
                            isOpen
                              ? "bg-orange-600 text-white shadow-lg md:scale-105"
                              : "bg-white text-orange-700 border-2 border-orange-300 hover:border-orange-500 hover:shadow-md hover:scale-[1.02]"
                          } md:min-w-[100px] md:h-9 md:py-2`}
                        onClick={() =>
                          setOpenMenu((prev) =>
                            prev === menu.key ? null : menu.key,
                          )
                        }
                        aria-expanded={openMenu === menu.key}
                      >
                        <span className="flex items-center truncate">
                          {menuIcon}
                          {menu.label}
                        </span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {openMenu === menu.key && (
                        <ul className="w-full md:absolute md:left-0 z-50 py-1 mt-1 bg-white border-2 border-orange-300 rounded-lg shadow-xl md:top-full md:w-56 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                          {visibleItems.map((item) => {
                            const isActive = item.value === activeMasterKey;
                            return (
                              <li
                                key={item.value}
                                onClick={() => handleMasterSelect(item.value)}
                                className={`px-3 py-2.5 md:py-2 text-sm transition-all cursor-pointer flex items-center gap-2
                                  ${
                                    isActive
                                      ? "bg-orange-600 text-white font-semibold"
                                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-700 hover:pl-4"
                                  }`}
                              >
                                <span
                                  className={`w-1 h-1 rounded-full ${isActive ? "bg-white" : "bg-orange-300"} transition-all`}
                                ></span>
                                {item.label}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {showLeadsMenu && (
              <>
                {/* Existing New Lead, Lead Manager, TL Tables, Sales Lead Manager buttons... */}

                {/* Existing New Lead button */}
                {userRole?.toLowerCase() !== "sales" &&
                  !roleLabel?.toLowerCase().includes("travel") &&
                  !roleLabel?.toLowerCase().includes("advisor") && (
                    <div className="relative w-full md:w-auto">
                      <button
                        type="button"
                        className="w-full md:w-auto flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 bg-white text-emerald-700 border-2 border-emerald-300 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] md:min-w-[100px] md:h-9 md:py-2"
                        onClick={() => onLeadSelect?.("lead-form")}
                      >
                        <FileText size={16} className="mr-1.5 flex-shrink-0" />
                        <span className="truncate">New Lead</span>
                      </button>
                    </div>
                  )}

                {/* Existing Lead Manager button */}
                {userRole?.toLowerCase() !== "sales" &&
                  !roleLabel?.toLowerCase().includes("travel") &&
                  !roleLabel?.toLowerCase().includes("advisor") && (
                    <div className="relative w-full md:w-auto">
                      <button
                        type="button"
                        className="w-full md:w-auto flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 bg-white text-emerald-700 border-2 border-emerald-300 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] md:min-w-[100px] md:h-9 md:py-2"
                        onClick={() => onLeadSelect?.("lead-table")}
                      >
                        <FileText size={16} className="mr-1.5 flex-shrink-0" />
                        <span className="truncate">Lead Manager</span>
                      </button>
                    </div>
                  )}

                {/* Existing TL Tables button */}
                {(userRole?.toLowerCase() === "team leader" ||
                  userRole?.toLowerCase() === "teamleader" ||
                  userRole?.toLowerCase() === "admin") && (
                  <div className="relative w-full md:w-auto">
                    <button
                      type="button"
                      className="w-full md:w-auto flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 bg-white text-emerald-700 border-2 border-emerald-300 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] md:min-w-[100px] md:h-9 md:py-2"
                      onClick={() => handleTlTablesSelect("tl-tables")}
                    >
                      <FileText size={16} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">TL Tables</span>
                    </button>
                  </div>
                )}

                {/* Existing Sales Lead Manager button */}
                {(userRole?.toLowerCase() === "sales" ||
                  userRole?.toLowerCase() === "admin" ||
                  userRole?.toLowerCase() === "travel advisor" ||
                  userRole?.toLowerCase() === "travel" ||
                  roleLabel?.toLowerCase().includes("travel") ||
                  roleLabel?.toLowerCase().includes("advisor")) && (
                  <div className="relative w-full md:w-auto">
                    <button
                      type="button"
                      className="w-full md:w-auto flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 bg-white text-emerald-700 border-2 border-emerald-300 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] md:min-w-[100px] md:h-9 md:py-2"
                      onClick={() => onSalesLeadSelect?.("sales-lead-table")}
                    >
                      <FileText size={16} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">Sales Lead Manager</span>
                    </button>
                  </div>
                )}

                {/* ✅ TRACKING MENU - HIDDEN FOR TRAVEL ADVISOR */}
                {userRole?.toLowerCase() !== "travel advisor" &&
                  userRole?.toLowerCase() !== "travel" &&
                  !roleLabel?.toLowerCase().includes("travel") &&
                  !roleLabel?.toLowerCase().includes("advisor") && (
                    <div className="relative w-full md:w-auto">
                      {(() => {
                        const isOpen = openMenu === "lead-track-menu";
                        return (
                          <>
                            <button
                              type="button"
                              className={`w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200
                  ${
                    isOpen
                      ? "bg-green-600 text-white shadow-lg md:scale-105"
                      : "bg-white text-green-700 border-2 border-green-300 hover:border-green-500 hover:shadow-md hover:scale-[1.02] hover:bg-green-50"
                  } md:min-w-[100px] md:h-9 md:py-2`}
                              onClick={() => {
                                setOpenMenu((prev) =>
                                  prev === "lead-track-menu"
                                    ? null
                                    : "lead-track-menu",
                                );
                              }}
                              aria-expanded={openMenu === "lead-track-menu"}
                            >
                              <span className="flex z-50 items-center truncate">
                                <MapPin
                                  size={16}
                                  className="mr-1.5 flex-shrink-0"
                                />
                                Tracking
                              </span>
                              <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                              />
                            </button>

                            {openMenu === "lead-track-menu" && (
                              <ul className="w-full md:absolute md:left-0 z-50 py-1 mt-1 bg-white border-2 border-green-300 rounded-lg shadow-xl md:top-full md:w-56 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                <li
                                  onClick={() => {
                                    onMonthlyEnquiry?.();
                                    setOpenMenu(null);
                                    setMobileOpen(false);
                                  }}
                                  className="px-3 py-2.5 md:py-2 text-sm transition-all hover:bg-green-50 hover:text-green-700 hover:pl-4 cursor-pointer text-gray-700 flex items-center gap-2"
                                >
                                  <span className="w-1 h-1 rounded-full bg-green-300"></span>
                                  Monthly Enquiry (MER)
                                </li>

                                <li
                                  onClick={() => {
                                    onMonthlyDistribution?.();
                                    setOpenMenu(null);
                                    setMobileOpen(false);
                                  }}
                                  className="px-3 py-2.5 md:py-2 text-sm transition-all hover:bg-green-50 hover:text-green-700 hover:pl-4 cursor-pointer text-gray-700 flex items-center gap-2"
                                >
                                  <span className="w-1 h-1 rounded-full bg-green-300"></span>
                                  Lead Distribution (LDR)
                                </li>
                              </ul>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
              </>
            )}

            {/* DASHBOARD MENU */}
            {showDashboardMenu &&
              (() => {
                const dashboardMenu = getDashboardMenu(userRole);
                if (dashboardMenu.items.length === 0) return null;
                const isOpen = openMenu === dashboardMenu.key;

                return (
                  <div className="relative w-full md:w-auto">
                    <button
                      type="button"
                      className={`w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200
                        ${
                          isOpen
                            ? "bg-green-600 text-white shadow-lg md:scale-105"
                            : "bg-white text-green-700 border-2 border-green-300 hover:border-green-500 hover:shadow-md hover:scale-[1.02] hover:bg-green-50"
                        } md:min-w-[100px] md:h-9 md:py-2`}
                      onClick={() =>
                        setOpenMenu((prev) =>
                          prev === dashboardMenu.key ? null : dashboardMenu.key,
                        )
                      }
                      aria-expanded={openMenu === dashboardMenu.key}
                    >
                      <span className="flex items-center truncate">
                        <LayoutDashboard
                          size={16}
                          className="mr-1.5 flex-shrink-0"
                        />
                        {dashboardMenu.label}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {openMenu === dashboardMenu.key && (
                      <ul className="w-full md:absolute md:left-0 z-50 py-1 mt-1 bg-white border-2 border-green-300 rounded-lg shadow-xl md:top-full md:w-60 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                        {dashboardMenu.items.map((item) => {
                          const isActive = item.value === activeDashboardKey;
                          return (
                            <li
                              key={item.value}
                              onClick={() => handleDashboardSelect(item.value)}
                              className={`px-3 py-2.5 md:py-2 text-sm transition-all cursor-pointer flex items-center gap-2
                                ${
                                  isActive
                                    ? "bg-green-600 text-white font-semibold"
                                    : "text-gray-700 hover:bg-green-50 hover:text-green-700 hover:pl-4"
                                }`}
                            >
                              <span
                                className={`w-1 h-1 rounded-full ${isActive ? "bg-white" : "bg-green-300"} transition-all`}
                              ></span>
                              {item.label}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })()}

            {/* ACCESS MENU */}
            {showAccess && (
              <div className="relative w-full md:w-auto">
                {(() => {
                  const isOpen = openMenu === ACCESS_MENU.key;
                  const menuIcon = getMenuIcon(
                    ACCESS_MENU.key,
                    ACCESS_MENU.label,
                  );
                  return (
                    <>
                      <button
                        type="button"
                        className={`w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200
                          ${
                            isOpen
                              ? "bg-yellow-600 text-white shadow-lg md:scale-105"
                              : "bg-white text-yellow-700 border-2 border-yellow-300 hover:border-yellow-500 hover:shadow-md hover:scale-[1.02] hover:bg-yellow-50"
                          } md:min-w-[100px] md:h-9 md:py-2`}
                        onClick={() =>
                          setOpenMenu((prev) =>
                            prev === ACCESS_MENU.key ? null : ACCESS_MENU.key,
                          )
                        }
                        aria-expanded={openMenu === ACCESS_MENU.key}
                      >
                        <span className="flex items-center truncate">
                          {menuIcon}
                          {ACCESS_MENU.label}
                        </span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {openMenu === ACCESS_MENU.key && (
                        <ul className="w-full md:absolute md:left-0 z-50 py-1 mt-1 bg-white border-2 border-yellow-300 rounded-lg shadow-xl md:top-full md:w-56 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                          {ACCESS_MENU.items.map((item) => {
                            const isActive = item.value === activeAccessKey;
                            return (
                              <li
                                key={item.value}
                                onClick={() => handleAccessSelect(item.value)}
                                className={`px-3 py-2.5 md:py-2 text-sm transition-all cursor-pointer flex items-center gap-2
                                  ${
                                    isActive
                                      ? "bg-yellow-600 text-white font-semibold"
                                      : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 hover:pl-4"
                                  }`}
                              >
                                <span
                                  className={`w-1 h-1 rounded-full ${isActive ? "bg-white" : "bg-yellow-300"} transition-all`}
                                ></span>
                                {item.label}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:ml-auto md:gap-2 lg:gap-3">
            <div className="relative group w-full md:w-28 lg:w-32">
              <select
                value={selectedRegion}
                onChange={(e) => onRegionChange?.(e.target.value)}
                className="w-full px-3 py-2.5 pr-8 text-sm font-semibold text-gray-700 bg-white border border-orange-500 rounded-full focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-200 appearance-none cursor-pointer hover:border-orange-300 transition-all md:h-9 md:py-2"
              >
                <option value="">Region</option>

                {userRegionNames?.length > 0 ? (
                  userRegionNames.map((region: string) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))
                ) : (
                  <option disabled>No Region Assigned</option>
                )}
              </select>

              <MapPin
                size={14}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-orange-500 transition-colors"
              />
            </div>

            <div className="relative group w-full md:w-28 lg:w-32">
              <select
                value={selectedZone}
                onChange={(e) => onZoneChange?.(e.target.value)}
                className="w-full px-3 py-2.5 pr-8 text-sm font-semibold text-gray-700 bg-white border border-orange-500 rounded-full focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-200 appearance-none cursor-pointer hover:border-orange-300 transition-all md:h-9 md:py-2"
              >
                <option value="">Zone</option>
                {(userZoneNames && userZoneNames.length > 0
                  ? userZoneNames
                  : FALLBACK_ZONES
                ).map((zone: string) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
              <MapPin
                size={14}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-orange-500 transition-colors"
              />
            </div>

            <div className="relative group w-full md:w-28 lg:w-32">
              <select
                value={selectedCity}
                onChange={(e) => onCityChange?.(e.target.value)}
                className="w-full px-3 py-2.5 pr-8 text-sm font-semibold text-gray-700 bg-white border border-orange-500 rounded-full focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-200 appearance-none cursor-pointer hover:border-orange-300 transition-all md:h-9 md:py-2"
              >
                <option value="">City</option>
                {userCityNames && userCityNames.length > 0
                  ? userCityNames.map((city: string, index: number) => (
                      <option
                        key={userCityIds?.[index] ?? city}
                        value={String(userCityIds?.[index] ?? city)}
                      >
                        {city}
                      </option>
                    ))
                  : fallbackCityOptions.map((city: string) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
              </select>
              <Building2
                size={14}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-orange-500 transition-colors"
              />
            </div>

            {showYearMenu && (
              <div className="relative group w-full md:w-24 lg:w-28">
                <select
                  value={activeYearKey || ""}
                  onChange={(e) => handleYearSelect(e.target.value)}
                  className="w-full px-3 py-2.5 pr-8 text-sm font-semibold text-gray-700 bg-white border border-orange-500 rounded-full focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-200 appearance-none cursor-pointer hover:border-orange-300 transition-all md:h-9 md:py-2"
                >
                  <option value="">Year</option>
                  {YEAR_MENU.items.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <Calendar
                  size={14}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-orange-500 transition-colors"
                />
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === "user" ? null : "user")}
                className={`flex items-center gap-2 rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm border-2 transition-all duration-200 hover:shadow-md hover:scale-[1.02]
                    ${openMenu === "user" ? "border-orange-500 shadow-md" : "border-orange-300 hover:border-orange-500"}`}
              >
                <Image
                  src={userAvatar}
                  alt="User"
                  width={28}
                  height={28}
                  className="object-cover border-2 border-orange-500 rounded-full flex-shrink-0"
                />
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-gray-800">
                    {userAliasName || userName || "Guest"}
                  </p>
                  <p className="text-[11px] uppercase text-gray-500">
                    {roleLabel}
                  </p>
                </div>
                <ChevronDown
                  size={14}
                  className={`ml-1 transition-transform duration-200 flex-shrink-0 ${openMenu === "user" ? "rotate-180" : ""}`}
                />
              </button>

              {openMenu === "user" && (
                <div className="absolute right-0 z-50 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {userAliasName ?? "Guest"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {userEmail || "guest@email.com"}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {userDepartment && (
                          <span className="text-[11px] px-2 py-[2px] bg-blue-100 text-blue-700 rounded-full">
                            {userDepartment}
                          </span>
                        )}
                        {userSubDepartment && (
                          <span className="text-[11px] px-2 py-[2px] bg-purple-100 text-purple-700 rounded-full">
                            {userSubDepartment}
                          </span>
                        )}

                        {roleLabel && (
                          <span className="text-[11px] px-2 py-[2px] bg-green-100 text-green-700 rounded-full">
                            {roleLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Role</span>
                      <span className="text-gray-800 font-medium">
                        {roleLabel || "-"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Department</span>
                      <span className="text-gray-800 font-medium">
                        {userDepartment || "-"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Sub Dept</span>
                      <span className="text-gray-800 font-medium">
                        {userSubDepartment || "-"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Region</span>
                      <span className="text-gray-800 font-medium">
                        {userRegionNames || "-"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Zone</span>
                      <span className="text-gray-800 font-medium">
                        {userZoneNames?.length ? userZoneNames.join(", ") : "-"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">City : </span>
                      <span className="text-gray-800 font-medium">
                        {userCityNames?.length ? userCityNames.join(", ") : "-"}
                      </span>
                    </div>
                  </div>
                  {onLogout && (
                    <button
                      onClick={() => {
                        handleLogout();
                        setOpenMenu(null);
                      }}
                      className="w-full px-4 py-2.5 md:py-2 text-sm text-left text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all hover:pl-6 flex items-center gap-2"
                    >
                      {" "}
                      <span className="w-1 h-1 rounded-full bg-orange-300"></span>{" "}
                      Sign out{" "}
                    </button>
                  )}{" "}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
