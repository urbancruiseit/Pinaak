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
  Monitor,
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

  return { key: "dashboard-menu", label: "Dashboards", items: allowedItems };
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
  onDsrSelect?: (key: string) => void;
  permittedMasterKeys?: string[] | null;
  selectedRegion?: string;
  selectedCity?: string;
  selectedZone?: string;
  // onRegionChange?: (region: string) => void;
  // onCityChange?: (cityId: string) => void;
  // onZoneChange?: (zone: string) => void;
  userName?: string;
  roleLabel?: string;
  userRole?: string;
  onLogout?: () => void;
  onMonthlyEnquiry?: () => void;
  onMonthlyDistribution?: () => void;
  onUnwantedLeads?: () => void;
  onEmployeeReports?: () => void;
  onTimeEnquiryReports?: () => void;
  onDateEmployeeReports?: () => void;
  onMonthlyLeadsTwo?: () => void;
  onLongWeekendLeads?: () => void;
  showWebsiteMenu?: boolean;
  activeWebsiteKey?: string | null;
  onWebsiteMenuSelect?: (key: string) => void;
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
  showWebsiteMenu = false,
  activeWebsiteKey,
  onWebsiteMenuSelect,
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
  onDsrSelect,
  permittedMasterKeys,
  // selectedRegion = "",
  // selectedCity = "",
  // selectedZone = "",
  // onRegionChange,
  // onCityChange,
  // onZoneChange,
  userName,
  roleLabel,
  userRole,
  onLogout,
  onMonthlyEnquiry,
  onMonthlyDistribution,
  onUnwantedLeads,
  onEmployeeReports,
  onTimeEnquiryReports,
  onDateEmployeeReports,
  onMonthlyLeadsTwo,
  onLongWeekendLeads,
}: NavbarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  const userRegionNames = (currentUser as any)?.region_names ?? [];
  const userZoneNames = (currentUser as any)?.zone_names ?? [];
  const userCityNames = (currentUser as any)?.city_names ?? [];
  const userCityIds = (currentUser as any)?.city_ids ?? [];
  const rawUser = (currentUser as any) ?? {};
  const userData = rawUser?.data ?? rawUser;
  const userEmail = rawUser?.officeEmail ?? userData?.officeEmail ?? "";
  const userAliasName = rawUser?.aliasName ?? userData?.aliasName ?? "";
  const userDepartment = rawUser?.department ?? userData?.department ?? "";

  const userSubDepartment =
    rawUser?.subDepartment ?? userData?.subDepartment ?? "";

  const adminRole =
    rawUser?.access_role ??
    userData?.access_role ??
    rawUser?.role ??
    userData?.role ??
    "";

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);
  const masterKeySet = useMemo(
    () => (permittedMasterKeys ? new Set(permittedMasterKeys) : null),
    [permittedMasterKeys],
  );

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
  // const handleYearSelect = (value: string) => {
  //   onYearSelect?.(value);
  //   setOpenMenu(null);
  //   setMobileOpen(false);
  // };
  const handleSalesLeadSelect = (value: string) => {
    onSalesLeadSelect?.(value);
    setOpenMenu(null);
    setMobileOpen(false);
  };
  const handleDsrSelect = (value: string) => {
    onDsrSelect?.(value);
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
  const handleUnwantedLeads = () => {
    onUnwantedLeads?.();
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutEmployeeThunk()).unwrap();
      toast.success("Logout successfully");
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const shouldShowLeadManagerDropdown =
    adminRole?.toLowerCase() === "super_admin" ||
    adminRole?.toLowerCase() === "manager";

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
              {/* ✅ Guest hata diya — sirf actual name dikhega */}
              <p className="text-sm font-semibold text-gray-800">
                {userAliasName}
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
                          ${isOpen ? "bg-orange-600 text-white shadow-lg md:scale-105" : "bg-white text-orange-700 border-2 border-orange-300 hover:border-orange-500 hover:shadow-md hover:scale-[1.02]"}
                          md:min-w-[100px] md:h-9 md:py-2`}
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
                                  ${isActive ? "bg-orange-600 text-white font-semibold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-700 hover:pl-4"}`}
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

            {/* LEADS MENU */}
            {showLeadsMenu && (
              <>
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

                {userRole?.toLowerCase() !== "sales" &&
                  !roleLabel?.toLowerCase().includes("travel") &&
                  !roleLabel?.toLowerCase().includes("advisor") && (
                    <>
                      {shouldShowLeadManagerDropdown ? (
                        <div className="relative w-full md:w-auto">
                          <button
                            type="button"
                            className="w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 bg-white text-emerald-700 border-2 border-emerald-300 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] md:min-w-[100px] md:h-9 md:py-2"
                            onClick={() =>
                              setOpenMenu((prev) =>
                                prev === "lead-manager-superadmin"
                                  ? null
                                  : "lead-manager-superadmin",
                              )
                            }
                          >
                            <FileText
                              size={16}
                              className="mr-1.5 flex-shrink-0"
                            />
                            <span className="truncate">Lead Manager</span>
                            <ChevronDown
                              size={14}
                              className={`transition-transform duration-200 flex-shrink-0 ${openMenu === "lead-manager-superadmin" ? "rotate-180" : ""}`}
                            />
                          </button>
                          {openMenu === "lead-manager-superadmin" && (
                            <ul className="w-full md:absolute md:left-0 z-50 py-1 mt-1 bg-white border-2 border-emerald-300 rounded-lg shadow-xl md:top-full md:w-64 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                              <li
                                onClick={() => {
                                  handleLeadSelect("lead-table");
                                }}
                                className="px-3 py-2.5 md:py-2 text-sm transition-all cursor-pointer flex items-center gap-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:pl-4"
                              >
                                <span className="w-1 h-1 rounded-full bg-emerald-300"></span>
                                Presales Lead Manager
                              </li>
                              <li
                                onClick={() => {
                                  handleSalesLeadSelect("sales-lead-table");
                                }}
                                className="px-3 py-2.5 md:py-2 text-sm transition-all cursor-pointer flex items-center gap-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:pl-4"
                              >
                                <span className="w-1 h-1 rounded-full bg-emerald-300"></span>
                                Telesales Lead Manager
                              </li>
                            </ul>
                          )}
                        </div>
                      ) : (
                        <div className="relative w-full md:w-auto">
                          <button
                            type="button"
                            className="w-full md:w-auto flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 bg-white text-emerald-700 border-2 border-emerald-300 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] md:min-w-[100px] md:h-9 md:py-2"
                            onClick={() => handleLeadSelect("lead-table")}
                          >
                            <FileText
                              size={16}
                              className="mr-1.5 flex-shrink-0"
                            />
                            <span className="truncate">Lead Manager</span>
                          </button>
                        </div>
                      )}
                    </>
                  )}

                {userRole?.toLowerCase() === "team leader" && (
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

                {userRole?.toLowerCase() === "travel advisor" && (
                  <div className="relative flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <button
                      type="button"
                      className="w-full md:w-auto flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 bg-white text-emerald-700 border-2 border-emerald-300 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] md:min-w-[100px] md:h-9 md:py-2"
                      onClick={() => onSalesLeadSelect?.("sales-lead-table")}
                    >
                      <FileText size={16} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">Sales Lead Manager</span>
                    </button>
                    <button
                      type="button"
                      className="w-full md:w-auto flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 bg-white text-emerald-700 border-2 border-emerald-300 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] md:min-w-[100px] md:h-9 md:py-2"
                      onClick={() => onDsrSelect?.("dsr-lead-table")}
                    >
                      <FileText size={16} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">DSR Lead Manager</span>
                    </button>
                  </div>
                )}

                {/* TRACKING MENU */}
                <div className="relative w-full md:w-auto">
                  {(() => {
                    const isOpen = openMenu === "lead-track-menu";

                    const role = userRole?.toLowerCase().trim() ?? "";

                    const isPresalesExecutive = role === "pre-sales executive";
                    const isTravelAdvisor = role === "travel advisor";
                    const isTeamLeader = role === "team leader";
                    const isCityManager = role === "city manager";
                    const isSuperAdmin = role === "superadmin";

                    const trackingItems = [
                      {
                        label: "Monthly Enquiry PS (MER)",
                        fn: onMonthlyEnquiry,
                        show:
                          isSuperAdmin ||
                          isPresalesExecutive ||
                          isTeamLeader ||
                          isCityManager,
                      },
                      {
                        label: "Monthly Enquiry PS 2 (MER 2)",
                        fn: onMonthlyLeadsTwo,
                        show:
                          isSuperAdmin ||
                          isPresalesExecutive ||
                          isTeamLeader ||
                          isCityManager,
                      },
                      {
                        label: "Lead Distribution PS (LDR)",
                        fn: onMonthlyDistribution,
                        show:
                          isSuperAdmin || isPresalesExecutive || isCityManager,
                      },
                      {
                        label: "Long Weekend Distribution (LWD)",
                        fn: onLongWeekendLeads,
                        show:
                          isSuperAdmin ||
                          isTravelAdvisor ||
                          isTeamLeader ||
                          isCityManager,
                      },
                      {
                        label: "Employee Performance - TS (EP-TS)",
                        fn: onEmployeeReports,
                        show:
                          isSuperAdmin ||
                          isTravelAdvisor ||
                          isTeamLeader ||
                          isCityManager,
                      },
                      {
                        label: "Employee Performance - PS (EP-PS)",
                        fn: onDateEmployeeReports,
                        show:
                          isSuperAdmin || isPresalesExecutive || isCityManager,
                      },
                      // {
                      //   label: "Time Enquiry Reports - PS (TER)",
                      //   fn: onTimeEnquiryReports,
                      //   show: isSuperAdmin || isTeamLeader || isCityManager,
                      // },
                      {
                        label: "Unwanted Leads (ULR)",
                        fn: onUnwantedLeads,
                        show: isPresalesExecutive,
                      },
                    ].filter((item) => item.show);

                    if (trackingItems.length === 0) return null;

                    return (
                      <>
                        <button
                          type="button"
                          className={`w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200
            ${isOpen ? "bg-green-600 text-white shadow-lg md:scale-105" : "bg-white text-green-700 border-2 border-green-300 hover:border-green-500 hover:shadow-md hover:scale-[1.02] hover:bg-green-50"}
            md:min-w-[100px] md:h-9 md:py-2`}
                          onClick={() =>
                            setOpenMenu((prev) =>
                              prev === "lead-track-menu"
                                ? null
                                : "lead-track-menu",
                            )
                          }
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
                            {trackingItems.map(({ label, fn }) => (
                              <li
                                key={label}
                                onClick={() => {
                                  fn?.();
                                  setOpenMenu(null);
                                  setMobileOpen(false);
                                }}
                                className="px-3 py-2.5 md:py-2 text-sm transition-all hover:bg-green-50 hover:text-green-700 hover:pl-4 cursor-pointer text-gray-700 flex items-center gap-2"
                              >
                                <span className="w-1 h-1 rounded-full bg-green-300"></span>
                                {label}
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    );
                  })()}
                </div>
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
                      ${isOpen ? "bg-green-600 text-white shadow-lg md:scale-105" : "bg-white text-green-700 border-2 border-green-300 hover:border-green-500 hover:shadow-md hover:scale-[1.02] hover:bg-green-50"}
                      md:min-w-[100px] md:h-9 md:py-2`}
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
                              ${isActive ? "bg-green-600 text-white font-semibold" : "text-gray-700 hover:bg-green-50 hover:text-green-700 hover:pl-4"}`}
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
                          ${isOpen ? "bg-yellow-600 text-white shadow-lg md:scale-105" : "bg-white text-yellow-700 border-2 border-yellow-300 hover:border-yellow-500 hover:shadow-md hover:scale-[1.02] hover:bg-yellow-50"}
                          md:min-w-[100px] md:h-9 md:py-2`}
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
                                  ${isActive ? "bg-yellow-600 text-white font-semibold" : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 hover:pl-4"}`}
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

            {/* WEBSITE MENU */}
            {showWebsiteMenu && (
              <div className="relative w-full md:w-auto">
                {(() => {
                  const isOpen = openMenu === "website-menu";
                  return (
                    <>
                      <button
                        type="button"
                        className={`w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200
                          ${isOpen ? "bg-blue-600 text-white shadow-lg md:scale-105" : "bg-white text-blue-700 border-2 border-blue-300 hover:border-blue-500 hover:shadow-md hover:scale-[1.02] hover:bg-blue-50"}
                          md:min-w-[100px] md:h-9 md:py-2`}
                        onClick={() =>
                          setOpenMenu((prev) =>
                            prev === "website-menu" ? null : "website-menu",
                          )
                        }
                        aria-expanded={isOpen}
                      >
                        <span className="flex items-center truncate">
                          <Monitor size={16} className="mr-1.5 flex-shrink-0" />
                          Website
                        </span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {isOpen && (
                        <ul className="w-full md:absolute md:left-0 z-50 py-1 mt-1 bg-white border-2 border-blue-300 rounded-lg shadow-xl md:top-full md:w-56 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                          {[
                            { key: "gac", label: "GAC Table" },
                            { key: "gaq", label: "GAQ Table" },
                          ].map(({ key, label }) => (
                            <li
                              key={key}
                              onClick={() => {
                                onWebsiteMenuSelect?.(key);
                                setOpenMenu(null);
                                setMobileOpen(false);
                              }}
                              className={`px-3 py-2.5 md:py-2 text-sm transition-all cursor-pointer flex items-center gap-2
                                ${activeWebsiteKey === key ? "bg-blue-600 text-white font-semibold" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:pl-4"}`}
                            >
                              <span
                                className={`w-1 h-1 rounded-full ${activeWebsiteKey === key ? "bg-white" : "bg-blue-300"}`}
                              ></span>
                              {label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:ml-auto md:gap-2 lg:gap-3">
            {/* User Profile Dropdown */}
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
                  {/* ✅ "Guest" fallback hata diya */}
                  <p className="text-sm font-semibold text-gray-800">
                    {userAliasName || userName}
                  </p>
                  <p className="text-[11px] uppercase text-gray-500">
                    {roleLabel || adminRole || "-"}
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
                      {/* ✅ "Guest" fallback hata diya */}
                      <p className="text-sm font-semibold text-gray-900">
                        {userAliasName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {userEmail}
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
                            {roleLabel || adminRole || "-"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Role</span>
                      <span className="text-gray-800 font-medium">
                        {roleLabel || adminRole || "-"}
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
                      <span className="text-gray-500">City</span>
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
                      <span className="w-1 h-1 rounded-full bg-orange-300"></span>
                      Sign out
                    </button>
                  )}
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
