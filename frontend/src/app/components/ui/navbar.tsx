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
  UserCircle,
  MapPin,
  Building2,
  Monitor,
  Shield,
} from "lucide-react";
import Image from "next/image";
import userAvatar from "../../assets/user-pic.png";
import pinaak from "../../assets/pinnak.png";
import { AppDispatch, RootState } from "@/app/redux/store";
import { logoutEmployeeThunk } from "@/app/features/user/userSlice";
import {
  setActiveMaster,
  setActiveLeadView,
  setActiveDashboardView,
  setActiveWebsiteView,
  setActiveAccessKey,
  showReport,
  setActiveSection,
} from "../../features/Navigation/navigationSlice";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// ─── Static menu data ─────────────────────────────────────────────────────────

type MenuItem = { label: string; value: string };
type MenuSection = { key: string; label: string; items: MenuItem[] };

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

const DASHBOARD_ITEMS: Record<string, MenuItem[]> = {
  admin: [
    { label: "Leads Dashboard", value: "leads-dashboard" },
    { label: "Pre-Sales Team Dashboard", value: "presales-dashboard" },
    { label: "City Manager Dashboard", value: "citymanager-dashboard" },
    { label: "BDM Dashboard", value: "bdm-dashboard" },
    { label: "Sales Team Dashboard", value: "salesteam-dashboard" },
    { label: "Team Leader Dashboard", value: "teamleader-dashboard" },
  ],
  presales: [
    { label: "Pre-Sales Team Dashboard", value: "presales-dashboard" },
  ],
  presale: [{ label: "Pre-Sales Team Dashboard", value: "presales-dashboard" }],
  bdm: [{ label: "BDM Dashboard", value: "bdm-dashboard" }],
  sales: [{ label: "Sales Team Dashboard", value: "salesteam-dashboard" }],
  "city manager": [
    { label: "City Manager Dashboard", value: "citymanager-dashboard" },
  ],
  citymanager: [
    { label: "City Manager Dashboard", value: "citymanager-dashboard" },
  ],
  "team leader": [
    { label: "Team Leader Dashboard", value: "teamleader-dashboard" },
  ],
  teamleader: [
    { label: "Team Leader Dashboard", value: "teamleader-dashboard" },
  ],
  team_leader: [
    { label: "Team Leader Dashboard", value: "teamleader-dashboard" },
  ],
};

const getMenuIcon = (menuKey: string) => {
  if (menuKey.includes("customer"))
    return <Users size={16} className="mr-1.5" />;
  if (menuKey.includes("master"))
    return <Building2 size={16} className="mr-1.5" />;
  if (menuKey.includes("vendor"))
    return <FileText size={16} className="mr-1.5" />;
  if (menuKey.includes("vehicle")) return <Car size={16} className="mr-1.5" />;
  if (menuKey.includes("driver"))
    return <UserCircle size={16} className="mr-1.5" />;
  if (menuKey.includes("access"))
    return <Shield size={16} className="mr-1.5" />;
  return null;
};

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // ── Redux state ──────────────────────────────────────────────────────────
  const { currentUser } = useSelector((state: RootState) => state.user);
  const nav = useSelector((state: RootState) => state.navigation);

  const rawUser = (currentUser as any) ?? {};
  const userData = rawUser?.data ?? rawUser;

  const userEmail = rawUser?.officeEmail ?? userData?.officeEmail ?? "";
  const userAliasName = rawUser?.aliasName ?? userData?.aliasName ?? "";
  const userDepartment = rawUser?.department ?? userData?.department ?? "";
  const userSubDepartment =
    rawUser?.subDepartment ?? userData?.subDepartment ?? "";
  const userRegionNames = (currentUser as any)?.region_names ?? [];
  const userZoneNames = (currentUser as any)?.zone_names ?? [];
  const userCityNames = (currentUser as any)?.city_names ?? [];

  const adminRole = (rawUser?.role ??
    userData?.role ??
    rawUser?.role ??
    userData?.role ??
    "") as string;

  const normalizedRole = adminRole.toLowerCase().trim();

  const showMaster = nav.activeSection === "master";
  const showLeadsMenu =
    nav.activeSection === "leads" || nav.activeSection === "dsr-form";
  const showDashboardMenu = nav.activeSection === "dashboard";
  const showWebsiteMenu = nav.activeSection === "website";
  const showAccess =
    normalizedRole === "superadmin" || normalizedRole === "admin";

  const isSales = normalizedRole === "sales";
  const isTravelAdvisor = normalizedRole === "travel advisor";
  const isTeamLeader = normalizedRole === "team leader";
  const isSuperAdmin = normalizedRole === "superadmin";
  const isManager = normalizedRole === "manager";
  const isCityManager = normalizedRole === "city manager";

  // ✅ FIX 1: City Manager included in dropdown trigger
  const shouldShowLeadManagerDropdown =
    isSuperAdmin || isManager || isCityManager;

  // ✅ SEO Executive (Digital Marketing) special-case checks
  const isSeoExecutive = normalizedRole === "seo executive";
  const isDigitalMarketingDept =
    (userDepartment ?? "").toLowerCase().trim() === "digital marketing";

  const isSeoExecutiveDigitalMarketing =
    isSeoExecutive && isDigitalMarketingDept;

  // ✅ Allowlist for who can see the Leads menu (New Lead / Lead Manager)
  const leadsAllowedRoles = [
    "superadmin",
    "manager",
    "city manager",
    "team leader",
    "pre-sales executive",
    "seo executive",
  ];
  const canSeeLeadsMenu = leadsAllowedRoles.includes(normalizedRole);

  // ── Dashboard items for current role ─────────────────────────────────────
  const dashboardItems = DASHBOARD_ITEMS[normalizedRole] ?? [];

  // ── Local UI state ────────────────────────────────────────────────────────
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target as Node))
        setOpenMenu(null);
    };
    if (openMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  const close = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  // ── Handlers → dispatch to Redux ─────────────────────────────────────────
  const handleMasterSelect = (value: string) => {
    dispatch(setActiveMaster(value as any));
    close();
  };

  const handleLeadSelect = (value: string) => {
    dispatch(setActiveLeadView(value as any));
    close();
  };

  const handleSalesLeadSelect = (value: string) => {
    dispatch(setActiveLeadView(value as any));
    close();
  };

  const handleSwapLeadSelect = (value: string) => {
    dispatch(setActiveLeadView(value as any));
    close();
  };

  const handleDsrSelect = () => {
    dispatch(setActiveLeadView("dsr-lead-table"));
    close();
  };

  const handleDashboardSelect = (value: string) => {
    dispatch(setActiveDashboardView(value as any));
    close();
  };

  const handleAccessSelect = (value: string) => {
    dispatch(setActiveAccessKey(value));
    close();
  };

  const handleWebsiteSelect = (key: string) => {
    dispatch(setActiveWebsiteView(key as "gac" | "gaq"));
    close();
  };

  const handleTlTablesSelect = () => {
    dispatch(setActiveSection("leads" as any));
    close();
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutEmployeeThunk()).unwrap();
      toast.success("Logout successfully");
      setTimeout(() => router.push("/"), 500);
    } catch {
      toast.error("Logout failed");
    }
  };

  // ── Tracking menu items ───────────────────────────────────────────────────
  const isPresalesExecutive = normalizedRole === "pre-sales executive";

  const trackingItems = [
    {
      label: "Monthly Enquiry PS (MER)",
      key: "monthlyEnquiry",
      show:
        isSuperAdmin ||
        isPresalesExecutive ||
        isTeamLeader ||
        isCityManager ||
        isSeoExecutiveDigitalMarketing,
    },
    {
      label: "Monthly Enquiry PS 2 (MER 2)",
      key: "monthlyLeadsTwo",
      show:
        isSuperAdmin || isPresalesExecutive || isTeamLeader || isCityManager,
    },
    {
      label: "Lead Distribution PS (LDR)",
      key: "monthlyDistribution",
      show: isSuperAdmin || isPresalesExecutive || isCityManager,
    },
    {
      label: "Long Weekend Distribution (LWD)",
      key: "longWeekendLeads",
      show: isSuperAdmin || isTravelAdvisor || isTeamLeader || isCityManager,
    },
    {
      label: "Employee Performance - TS (EP-TS)",
      key: "employeeReports",
      show: isSuperAdmin || isTravelAdvisor || isTeamLeader || isCityManager,
    },
    {
      label: "Employee Performance - PS (EP-PS)",
      key: "dateEmployeeReports",
      show: isSuperAdmin || isPresalesExecutive || isCityManager,
    },
    {
      label: "Unwanted Leads (ULR)",
      key: "unwantedLeads",
      show: isPresalesExecutive,
    },
  ].filter((i) => i.show);

  // ── Render ────────────────────────────────────────────────────────────────
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
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
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
              {userAliasName}
            </p>
            <p className="text-[11px] uppercase text-gray-500">{adminRole}</p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div
        className={`${mobileOpen ? "block" : "hidden"} w-full px-4 pb-4 md:block md:pb-0`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:h-16">
          {/* ── Left section ── */}
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

            {/* MASTER */}
            {showMaster &&
              MASTER_MENU_SECTIONS.map((menu) => {
                const isOpen = openMenu === menu.key;
                return (
                  <div key={menu.key} className="relative w-full md:w-auto">
                    <button
                      type="button"
                      className={`w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200
                      ${isOpen ? "bg-orange-600 text-white shadow-lg md:scale-105" : "bg-white text-orange-700 border-2 border-orange-300 hover:border-orange-500 hover:shadow-md hover:scale-[1.02]"}
                      md:min-w-[100px] md:h-9 md:py-2`}
                      onClick={() =>
                        setOpenMenu((p) => (p === menu.key ? null : menu.key))
                      }
                    >
                      <span className="flex items-center truncate">
                        {getMenuIcon(menu.key)}
                        {menu.label}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <ul className="w-full md:absolute md:left-0 z-50 py-1 mt-1 bg-white border-2 border-orange-300 rounded-lg shadow-xl md:top-full md:w-56 max-h-80 overflow-y-auto">
                        {menu.items.map((item) => {
                          const isActive = item.value === nav.activeMaster;
                          return (
                            <li
                              key={item.value}
                              onClick={() => handleMasterSelect(item.value)}
                              className={`px-3 py-2.5 md:py-2 text-sm transition-all cursor-pointer flex items-center gap-2
                              ${isActive ? "bg-orange-600 text-white font-semibold" : "text-gray-700 hover:bg-orange-50 hover:text-orange-700 hover:pl-4"}`}
                            >
                              <span
                                className={`w-1 h-1 rounded-full ${isActive ? "bg-white" : "bg-orange-300"}`}
                              />
                              {item.label}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}

            {/* LEADS MENU */}
            {showLeadsMenu && (
              <>
                {/* New Lead button */}
                {canSeeLeadsMenu &&
                  !isSales &&
                  !isTravelAdvisor &&
                  !isSeoExecutiveDigitalMarketing && (
                    <div className="relative w-full md:w-auto">
                      <button
                        type="button"
                        className="w-full md:w-auto flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 bg-white text-emerald-700 border-2 border-emerald-300 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] md:min-w-[100px] md:h-9 md:py-2"
                        onClick={() => handleLeadSelect("lead-form")}
                      >
                        <FileText size={16} className="mr-1.5 flex-shrink-0" />
                        <span className="truncate">New Lead</span>
                      </button>
                    </div>
                  )}

                {/* Lead Manager */}
                {canSeeLeadsMenu &&
                  !isSales &&
                  !isTravelAdvisor &&
                  !isSeoExecutiveDigitalMarketing &&
                  (shouldShowLeadManagerDropdown ? (
                    <div className="relative w-full md:w-auto">
                      <button
                        type="button"
                        className="w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 bg-white text-emerald-700 border-2 border-emerald-300 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] md:min-w-[100px] md:h-9 md:py-2"
                        onClick={() =>
                          setOpenMenu((p) =>
                            p === "lead-manager-superadmin"
                              ? null
                              : "lead-manager-superadmin",
                          )
                        }
                      >
                        <FileText size={16} className="mr-1.5 flex-shrink-0" />
                        <span className="truncate">Lead Manager</span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 flex-shrink-0 ${openMenu === "lead-manager-superadmin" ? "rotate-180" : ""}`}
                        />
                      </button>

                      {/* ✅ FIX 2: Dropdown now shows for City Manager too */}
                      {openMenu === "lead-manager-superadmin" && (
                        <ul className="w-full md:absolute md:left-0 z-50 py-1 mt-1 bg-white border-2 border-emerald-300 rounded-lg shadow-xl md:top-full md:w-64 max-h-80 overflow-y-auto">
                          <li
                            onClick={() => handleLeadSelect("lead-table")}
                            className="px-3 py-2.5 md:py-2 text-sm cursor-pointer flex items-center gap-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:pl-4"
                          >
                            <span className="w-1 h-1 rounded-full bg-emerald-300" />
                            Presales Lead Manager
                          </li>

                          <li
                            onClick={() =>
                              handleSalesLeadSelect("sale-lead-table")
                            }
                            className="px-3 py-2.5 md:py-2 text-sm cursor-pointer flex items-center gap-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:pl-4"
                          >
                            <span className="w-1 h-1 rounded-full bg-emerald-300" />
                            Telesales Lead Manager
                          </li>

                          <li
                            onClick={() => handleLeadSelect("swap-lead-table")}
                            className="px-3 py-2.5 md:py-2 text-sm cursor-pointer flex items-center gap-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:pl-4"
                          >
                            <span className="w-1 h-1 rounded-full bg-emerald-300" />
                            Swap Lead Manager
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
                        <FileText size={16} className="mr-1.5 flex-shrink-0" />
                        <span className="truncate">Lead Manager</span>
                      </button>
                    </div>
                  ))}

                {/* TL Tables */}
                {isTeamLeader && (
                  <div className="relative w-full md:w-auto">
                    <button
                      type="button"
                      className="w-full md:w-auto flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 bg-white text-emerald-700 border-2 border-emerald-300 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] md:min-w-[100px] md:h-9 md:py-2"
                      onClick={handleTlTablesSelect}
                    >
                      <FileText size={16} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">TL Tables</span>
                    </button>
                  </div>
                )}

                {/* Travel Advisor buttons */}
                {isTravelAdvisor && (
                  <div className="relative flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <button
                      type="button"
                      className="w-full md:w-auto flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 bg-white text-emerald-700 border-2 border-emerald-300 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] md:min-w-[100px] md:h-9 md:py-2"
                      onClick={() => handleSalesLeadSelect("sale-lead-table")}
                    >
                      <FileText size={16} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">Sales Lead Manager</span>
                    </button>

                    <button
                      type="button"
                      className="w-full md:w-auto flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 bg-white text-emerald-700 border-2 border-emerald-300 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] md:min-w-[100px] md:h-9 md:py-2"
                      onClick={() => handleSwapLeadSelect("swap-lead-table")}
                    >
                      <FileText size={16} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">Swap Lead Manager</span>
                    </button>

                    <button
                      type="button"
                      className="w-full md:w-auto flex items-center justify-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 bg-white text-emerald-700 border-2 border-emerald-300 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] md:min-w-[100px] md:h-9 md:py-2"
                      onClick={handleDsrSelect}
                    >
                      <FileText size={16} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">DSR Lead Manager</span>
                    </button>
                  </div>
                )}

                {/* Tracking menu */}
                {trackingItems.length > 0 && (
                  <div className="relative w-full md:w-auto">
                    <button
                      type="button"
                      className={`w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200
                        ${openMenu === "lead-track-menu" ? "bg-green-600 text-white shadow-lg md:scale-105" : "bg-white text-green-700 border-2 border-green-300 hover:border-green-500 hover:shadow-md hover:scale-[1.02] hover:bg-green-50"}
                        md:min-w-[100px] md:h-9 md:py-2`}
                      onClick={() =>
                        setOpenMenu((p) =>
                          p === "lead-track-menu" ? null : "lead-track-menu",
                        )
                      }
                    >
                      <span className="flex items-center truncate">
                        <MapPin size={16} className="mr-1.5 flex-shrink-0" />
                        Tracking
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 flex-shrink-0 ${openMenu === "lead-track-menu" ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openMenu === "lead-track-menu" && (
                      <ul className="w-full md:absolute md:left-0 z-50 py-1 mt-1 bg-white border-2 border-green-300 rounded-lg shadow-xl md:top-full md:w-56 max-h-80 overflow-y-auto">
                        {trackingItems.map(({ label, key }) => (
                          <li
                            key={key}
                            onClick={() => {
                              dispatch(showReport(key as any));
                              close();
                            }}
                            className="px-3 py-2.5 md:py-2 text-sm cursor-pointer text-gray-700 hover:bg-green-50 hover:text-green-700 hover:pl-4 flex items-center gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-green-300" />
                            {label}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </>
            )}

            {/* DASHBOARD MENU */}
            {showDashboardMenu && dashboardItems.length > 0 && (
              <div className="relative w-full md:w-auto">
                <button
                  type="button"
                  className={`w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200
                    ${openMenu === "dashboard-menu" ? "bg-green-600 text-white shadow-lg md:scale-105" : "bg-white text-green-700 border-2 border-green-300 hover:border-green-500 hover:shadow-md hover:scale-[1.02] hover:bg-green-50"}
                    md:min-w-[100px] md:h-9 md:py-2`}
                  onClick={() =>
                    setOpenMenu((p) =>
                      p === "dashboard-menu" ? null : "dashboard-menu",
                    )
                  }
                >
                  <span className="flex items-center truncate">
                    <LayoutDashboard
                      size={16}
                      className="mr-1.5 flex-shrink-0"
                    />
                    Dashboards
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 flex-shrink-0 ${openMenu === "dashboard-menu" ? "rotate-180" : ""}`}
                  />
                </button>
                {openMenu === "dashboard-menu" && (
                  <ul className="w-full md:absolute md:left-0 z-50 py-1 mt-1 bg-white border-2 border-green-300 rounded-lg shadow-xl md:top-full md:w-60 max-h-80 overflow-y-auto">
                    {dashboardItems.map((item) => {
                      const isActive = item.value === nav.activeDashboardView;
                      return (
                        <li
                          key={item.value}
                          onClick={() => handleDashboardSelect(item.value)}
                          className={`px-3 py-2.5 md:py-2 text-sm cursor-pointer flex items-center gap-2
                            ${isActive ? "bg-green-600 text-white font-semibold" : "text-gray-700 hover:bg-green-50 hover:text-green-700 hover:pl-4"}`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${isActive ? "bg-white" : "bg-green-300"}`}
                          />
                          {item.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* ACCESS MENU */}
            {showAccess && (
              <div className="relative w-full md:w-auto">
                <button
                  type="button"
                  className={`w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200
                    ${openMenu === ACCESS_MENU.key ? "bg-yellow-600 text-white shadow-lg md:scale-105" : "bg-white text-yellow-700 border-2 border-yellow-300 hover:border-yellow-500 hover:shadow-md hover:scale-[1.02] hover:bg-yellow-50"}
                    md:min-w-[100px] md:h-9 md:py-2`}
                  onClick={() =>
                    setOpenMenu((p) =>
                      p === ACCESS_MENU.key ? null : ACCESS_MENU.key,
                    )
                  }
                >
                  <span className="flex items-center truncate">
                    <Shield size={16} className="mr-1.5" />
                    {ACCESS_MENU.label}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 flex-shrink-0 ${openMenu === ACCESS_MENU.key ? "rotate-180" : ""}`}
                  />
                </button>
                {openMenu === ACCESS_MENU.key && (
                  <ul className="w-full md:absolute md:left-0 z-50 py-1 mt-1 bg-white border-2 border-yellow-300 rounded-lg shadow-xl md:top-full md:w-56 max-h-80 overflow-y-auto">
                    {ACCESS_MENU.items.map((item) => {
                      const isActive = item.value === nav.activeAccessKey;
                      return (
                        <li
                          key={item.value}
                          onClick={() => handleAccessSelect(item.value)}
                          className={`px-3 py-2.5 md:py-2 text-sm cursor-pointer flex items-center gap-2
                            ${isActive ? "bg-yellow-600 text-white font-semibold" : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 hover:pl-4"}`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${isActive ? "bg-white" : "bg-yellow-300"}`}
                          />
                          {item.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* WEBSITE MENU */}
            {showWebsiteMenu && (
              <div className="relative w-full md:w-auto">
                <button
                  type="button"
                  className={`w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200
                    ${openMenu === "website-menu" ? "bg-blue-600 text-white shadow-lg md:scale-105" : "bg-white text-blue-700 border-2 border-blue-300 hover:border-blue-500 hover:shadow-md hover:scale-[1.02] hover:bg-blue-50"}
                    md:min-w-[100px] md:h-9 md:py-2`}
                  onClick={() =>
                    setOpenMenu((p) =>
                      p === "website-menu" ? null : "website-menu",
                    )
                  }
                >
                  <span className="flex items-center truncate">
                    <Monitor size={16} className="mr-1.5 flex-shrink-0" />
                    Website
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 flex-shrink-0 ${openMenu === "website-menu" ? "rotate-180" : ""}`}
                  />
                </button>
                {openMenu === "website-menu" && (
                  <ul className="w-full md:absolute md:left-0 z-50 py-1 mt-1 bg-white border-2 border-blue-300 rounded-lg shadow-xl md:top-full md:w-56 max-h-80 overflow-y-auto">
                    {[
                      { key: "gac", label: "GAC Table" },
                      { key: "gaq", label: "GAQ Table" },
                    ].map(({ key, label }) => (
                      <li
                        key={key}
                        onClick={() => handleWebsiteSelect(key)}
                        className={`px-3 py-2.5 md:py-2 text-sm cursor-pointer flex items-center gap-2
                          ${nav.activeWebsiteView === key ? "bg-blue-600 text-white font-semibold" : "text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:pl-4"}`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${nav.activeWebsiteView === key ? "bg-white" : "bg-blue-300"}`}
                        />
                        {label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* ── Right section: User profile ── */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:ml-auto md:gap-2 lg:gap-3">
            {/* Rules — city manager aur pre-sales executive ko dikhega */}
            {(normalizedRole === "city manager" ||
              normalizedRole === "pre-sales executive") && (
              <button
                type="button"
                onClick={() => dispatch(setActiveSection("rules"))}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide bg-white text-red-700 border-2 border-red-300 hover:border-red-500 hover:shadow-md hover:scale-[1.02] transition-all duration-200 md:h-9"
              >
                <FileText size={16} className="flex-shrink-0" />
                Rules
              </button>
            )}

            <div className="relative">
              <button
                onClick={() =>
                  setOpenMenu((p) => (p === "user" ? null : "user"))
                }
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
                  <p className="text-sm font-semibold text-gray-900">
                    {userAliasName ||
                      (rawUser?.shortName ?? userData?.shortName) ||
                      "-"}
                  </p>
                  <p className="text-[11px] uppercase text-gray-500">
                    {adminRole || "-"}
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
                    <p className="text-sm font-semibold text-gray-900">
                      {userAliasName ||
                        (rawUser?.shortName ?? userData?.shortName) ||
                        "-"}
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
                      {adminRole && (
                        <span className="text-[11px] px-2 py-[2px] bg-green-100 text-green-700 rounded-full">
                          {adminRole}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-2 text-sm">
                    {[
                      ["Role", adminRole],
                      ["Department", userDepartment],
                      ["Sub Dept", userSubDepartment],
                      [
                        "Region",
                        Array.isArray(userRegionNames)
                          ? userRegionNames.join(", ")
                          : userRegionNames,
                      ],
                      [
                        "Zone",
                        userZoneNames?.length ? userZoneNames.join(", ") : "-",
                      ],
                      [
                        "City",
                        userCityNames?.length ? userCityNames.join(", ") : "-",
                      ],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-500">{label}</span>
                        <span className="text-gray-800 font-medium">
                          {value || "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setOpenMenu(null);
                    }}
                    className="w-full px-4 py-2.5 md:py-2 text-sm text-left text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all hover:pl-6 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-orange-300" />
                    Sign out
                  </button>
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
