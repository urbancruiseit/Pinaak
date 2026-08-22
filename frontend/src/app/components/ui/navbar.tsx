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
import UserProfileDropdown from "./UserProfileDropdown";
import {
  setActiveMaster,
  setActiveLeadView,
  setActiveDashboardView,
  setActiveWebsiteView,
  showReport,
  setActiveSection,
} from "../../features/Navigation/navigationSlice";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type MenuItem = {
  label: string;
  value: string;
  allowedRoles?: string[];
};

type MenuSection = {
  key: string;
  label: string;
  items: MenuItem[];
  allowedRoles?: string[];
};

const normalizeRole = (role: unknown): string => {
  const value = String(role ?? "")
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  const roleMap: Record<string, string> = {
    "super admin": "superadmin",
    superadmin: "superadmin",

    "city manager": "city manager",

    "team leader": "team leader",

    "team leader sales": "team leader-sales",

    "pre sales executive": "pre-sales executive",
    "pre-sales executive": "pre-sales executive",

    "seo executive": "seo executive",
    "seo tl": "seo tl",

    "travel advisor": "travel advisor",

    manager: "manager",
    admin: "admin",

    sales: "sales",
    bdm: "bdm",
    presales: "presales",
    presale: "presale",
  };

  return roleMap[value] ?? value;
};

const getEffectiveRole = (roleName: unknown, accessRole: unknown): string => {
  const roleNameValue = String(roleName ?? "").trim();

  if (roleNameValue !== "") {
    return roleNameValue;
  }

  return String(accessRole ?? "").trim();
};

const MASTER_ALLOWED_ROLES = [
  "superadmin",
  "admin",
  "manager",
  "city manager",
  "travel advisor",
];

const MASTER_MENU_SECTIONS: MenuSection[] = [
  {
    key: "customers",
    label: "CUSTOMERS",
    allowedRoles: [
      "superadmin",
      "admin",
      "manager",
      "city manager",
      "travel advisor",
    ],
    items: [
      {
        label: "Customer Form",
        value: "customer-personal",
        allowedRoles: ["superadmin", "admin", "manager", "city manager"],
      },
      {
        label: "Customer Search",
        value: "customer-table",
        allowedRoles: [
          "superadmin",
          "admin",
          "manager",
          "city manager",
          "travel advisor",
        ],
      },
      {
        label: "Customer History",
        value: "customer-history",
        allowedRoles: ["superadmin", "admin", "city manager"],
      },
    ],
  },

  {
    key: "master",
    label: "UC",
    allowedRoles: ["superadmin", "admin", "manager", "city manager"],
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
    allowedRoles: ["superadmin", "admin", "manager", "city manager"],
    items: [
      {
        label: "Vendor Registration Form",
        value: "vendor",
      },
      {
        label: "Vendor Search",
        value: "vendor-table",
      },
    ],
  },

  {
    key: "vehicles",
    label: "VEHICLES",
    allowedRoles: [
      "superadmin",
      "admin",
      "manager",
      "city manager",
      "travel advisor",
    ],
    items: [
      {
        label: "Vehicles Master",
        value: "vehicles",
        allowedRoles: ["superadmin", "admin", "city manager"],
      },
      {
        label: "Vehicle Manager",
        value: "vehicle-manager",
        allowedRoles: ["city manager", "superadmin", "admin"],
      },
      {
        label: "Vehicle Options",
        value: "vehicle-category",
        allowedRoles: ["superadmin", "city manager", "travel advisor"],
      },
      // {
      //   label: "Vehicle Add Form",
      //   value: "vehicle-add",
      //   allowedRoles: ["superadmin", "city manager", "travel advisor"],
      // },
    ],
  },

  {
    key: "drivers",
    label: "DRIVER",
    allowedRoles: ["superadmin", "admin", "manager", "city manager"],
    items: [
      {
        label: "Driver Registration Form",
        value: "driver",
      },
      {
        label: "Driver Search",
        value: "driver-table",
      },
    ],
  },
];

const DASHBOARD_ITEMS: Record<string, MenuItem[]> = {
  admin: [
    {
      label: "Leads Dashboard",
      value: "leads-dashboard",
    },
    {
      label: "Pre-Sales Team Dashboard",
      value: "presales-dashboard",
    },
    {
      label: "City Manager Dashboard",
      value: "citymanager-dashboard",
    },
    {
      label: "BDM Dashboard",
      value: "bdm-dashboard",
    },
    {
      label: "Sales Team Dashboard",
      value: "salesteam-dashboard",
    },
    {
      label: "Team Leader Dashboard",
      value: "teamleader-dashboard",
    },
  ],

  presales: [
    {
      label: "Pre-Sales Team Dashboard",
      value: "presales-dashboard",
    },
  ],

  presale: [
    {
      label: "Pre-Sales Team Dashboard",
      value: "presales-dashboard",
    },
  ],

  bdm: [
    {
      label: "BDM Dashboard",
      value: "bdm-dashboard",
    },
  ],

  sales: [
    {
      label: "Sales Team Dashboard",
      value: "salesteam-dashboard",
    },
  ],

  "city manager": [
    {
      label: "City Manager Dashboard",
      value: "citymanager-dashboard",
    },
  ],

  citymanager: [
    {
      label: "City Manager Dashboard",
      value: "citymanager-dashboard",
    },
  ],

  "team leader": [
    {
      label: "Team Leader Dashboard",
      value: "teamleader-dashboard",
    },
  ],

  teamleader: [
    {
      label: "Team Leader Dashboard",
      value: "teamleader-dashboard",
    },
  ],

  team_leader: [
    {
      label: "Team Leader Dashboard",
      value: "teamleader-dashboard",
    },
  ],

  "team leader-sales": [
    {
      label: "City Manager Dashboard",
      value: "citymanager-dashboard",
    },
  ],
};

const getMenuIcon = (menuKey: string) => {
  if (menuKey.includes("customer")) {
    return <Users size={16} className="mr-1.5" />;
  }
  if (menuKey.includes("master")) {
    return <Building2 size={16} className="mr-1.5" />;
  }
  if (menuKey.includes("vendor")) {
    return <FileText size={16} className="mr-1.5" />;
  }

  if (menuKey.includes("vehicle")) {
    return <Car size={16} className="mr-1.5" />;
  }

  if (menuKey.includes("driver")) {
    return <UserCircle size={16} className="mr-1.5" />;
  }

  if (menuKey.includes("access")) {
    return <Shield size={16} className="mr-1.5" />;
  }

  return null;
};

export function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const nav = useSelector((state: RootState) => state.navigation);
  const rawUser = (currentUser as any) ?? {};
  const userData = rawUser?.data ?? rawUser;
  const userEmail = rawUser?.officeEmail ?? userData?.officeEmail ?? "";
  const userAliasName = rawUser?.aliasName ?? userData?.aliasName ?? "";
  const userDepartment = rawUser?.department ?? userData?.department ?? "";
  const userSubDepartment =
    rawUser?.subDepartment ?? userData?.subDepartment ?? "";
  const userRegionNames = rawUser?.region_names ?? userData?.region_names ?? [];
  const userZoneNames = rawUser?.zone_names ?? userData?.zone_names ?? [];
  const userCityNames = rawUser?.city_names ?? userData?.city_names ?? [];
  const roleName = rawUser?.role_name ?? userData?.role_name ?? "";
  const accessRole = rawUser?.access_role ?? userData?.access_role ?? "";
  const effectiveRole = getEffectiveRole(roleName, accessRole);
  const normalizedRole = normalizeRole(effectiveRole);
  const adminRole = effectiveRole;
  const canSeeMaster = MASTER_ALLOWED_ROLES.includes(normalizedRole);
  const visibleMasterSections = useMemo(
    () =>
      MASTER_MENU_SECTIONS.filter(
        (menu) =>
          !menu.allowedRoles || menu.allowedRoles.includes(normalizedRole),
      ).map((menu) => ({
        ...menu,
        items: menu.items.filter(
          (item) =>
            !item.allowedRoles || item.allowedRoles.includes(normalizedRole),
        ),
      })),
    [normalizedRole],
  );

  const showMaster =
    nav.activeSection === "master" &&
    canSeeMaster &&
    visibleMasterSections.length > 0;

  const showLeadsMenu =
    nav.activeSection === "leads" || nav.activeSection === "dsr-form";
  const showDashboardMenu = nav.activeSection === "dashboard";
  const showWebsiteMenu = nav.activeSection === "website";
  const isSales = normalizedRole === "sales";
  const isTravelAdvisor = normalizedRole === "travel advisor";
  const isTeamLeader = normalizedRole === "team leader";
  const isSuperAdmin = normalizedRole === "superadmin";
  const isManager = normalizedRole === "manager";
  const isCityManager = normalizedRole === "city manager";
  const isTeamLeaderSales = normalizedRole === "team leader-sales";
  const isSeoExecutive = normalizedRole === "seo executive";
  const isSeoTl = normalizedRole === "seo tl";
  const isDigitalMarketingDept =
    String(userDepartment ?? "")
      .toLowerCase()
      .trim() === "digital marketing";
  const isSeoExecutiveDigitalMarketing =
    isSeoExecutive && isDigitalMarketingDept;
  const isSeoTlDigitalMarketing = isSeoTl && isDigitalMarketingDept;
  const isPresalesExecutive = normalizedRole === "pre-sales executive";

  const leadsAllowedRoles = [
    "superadmin",
    "manager",
    "city manager",
    "team leader",
    "team leader-sales",
    "pre-sales executive",
    "seo executive",
  ];

  const canSeeLeadsMenu = leadsAllowedRoles.includes(normalizedRole);
  const shouldShowLeadManagerDropdown =
    isSuperAdmin || isManager || isCityManager || isTeamLeaderSales;

  const dashboardItems = DASHBOARD_ITEMS[normalizedRole] ?? [];
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target as Node)) {
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

  const close = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

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

      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch {
      toast.error("Logout failed");
    }
  };
  const trackingItems = [
    {
      label: "Monthly Enquiry PS (MER)",
      key: "monthlyEnquiry",
      show:
        isSuperAdmin ||
        isPresalesExecutive ||
        isTeamLeader ||
        isCityManager ||
        isTeamLeaderSales ||
        isSeoExecutiveDigitalMarketing ||
        isSeoTlDigitalMarketing,
    },

    {
      label: "Monthly Enquiry PS 2 (MER 2)",
      key: "monthlyLeadsTwo",
      show:
        isSuperAdmin ||
        isPresalesExecutive ||
        isTeamLeader ||
        isCityManager ||
        isTeamLeaderSales,
    },

    {
      label: "Lead Distribution PS (LDR)",
      key: "monthlyDistribution",
      show:
        isSuperAdmin ||
        isPresalesExecutive ||
        isCityManager ||
        isTeamLeaderSales,
    },

    {
      label: "Long Weekend Distribution (LWD)",
      key: "longWeekendLeads",
      show:
        isSuperAdmin ||
        isTravelAdvisor ||
        isTeamLeader ||
        isCityManager ||
        isTeamLeaderSales,
    },

    {
      label: "Employee Performance - TS (EP-TS)",
      key: "employeeReports",
      show:
        isSuperAdmin ||
        isTravelAdvisor ||
        isTeamLeader ||
        isCityManager ||
        isTeamLeaderSales,
    },

    {
      label: "Employee Performance - PS (EP-PS)",
      key: "dateEmployeeReports",
      show:
        isSuperAdmin ||
        isPresalesExecutive ||
        isCityManager ||
        isTeamLeaderSales,
    },

    {
      label: "Unwanted Leads (ULR)",
      key: "unwantedLeads",
      show: isPresalesExecutive,
    },

    {
      label: "Aging Performance - PS (AP-PS)",
      key: "agingReports",
      show:
        isSuperAdmin ||
        isPresalesExecutive ||
        isCityManager ||
        isTeamLeaderSales,
    },
  ].filter((item) => item.show);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <nav
      ref={navbarRef}
      className="w-full h-16 z-50 flex flex-col border-b border-gray-200 shadow-sm bg-orange-50 relative"
    >
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Mobile Header */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <div className="flex items-center h-16 w-full px-4 justify-between md:hidden">
        <button
          type="button"
          className="flex items-center justify-center p-2 text-orange-600 transition border border-orange-200 rounded-full bg-white/80 hover:bg-white hover:shadow-md"
          onClick={() => setMobileOpen((prev) => !prev)}
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

      <div
        className={`${mobileOpen ? "block" : "hidden"} w-full px-4 pb-4 md:block md:pb-0`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:h-16">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap md:gap-2 lg:gap-4">
            <div className="flex items-center gap-2 flex-shrink-0 h-full">
              <Image
                src={pinaak}
                alt="logo"
                width={150}
                priority
                className="rounded-xl hidden sm:block flex-shrink-0"
              />
            </div>

            {showMaster &&
              visibleMasterSections.map((menu) => {
                if (menu.items.length === 0) {
                  return null;
                }
                const isOpen = openMenu === menu.key;
                return (
                  <div key={menu.key} className="relative w-full md:w-auto">
                    <button
                      type="button"
                      className={`w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 ${
                        isOpen
                          ? "bg-orange-600 text-white shadow-lg md:scale-105"
                          : "bg-white text-orange-700 border-2 border-orange-300 hover:border-orange-500 hover:shadow-md hover:scale-[1.02]"
                      } md:min-w-[100px] md:h-9 md:py-2`}
                      onClick={() =>
                        setOpenMenu((prev) =>
                          prev === menu.key ? null : menu.key,
                        )
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
                              className={`px-3 py-2.5 md:py-2 text-sm transition-all cursor-pointer flex items-center gap-2 ${
                                isActive
                                  ? "bg-orange-600 text-white font-semibold"
                                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-700 hover:pl-4"
                              }`}
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
            {showLeadsMenu && (
              <>
                {/* New Lead */}

                {canSeeLeadsMenu &&
                  !isSales &&
                  !isTravelAdvisor &&
                  !isSeoTlDigitalMarketing &&
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
                          setOpenMenu((prev) =>
                            prev === "lead-manager-superadmin"
                              ? null
                              : "lead-manager-superadmin",
                          )
                        }
                      >
                        <FileText size={16} className="mr-1.5 flex-shrink-0" />

                        <span className="truncate">Lead Manager</span>

                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${
                            openMenu === "lead-manager-superadmin"
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>

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
                            onClick={() =>
                              handleSwapLeadSelect("swap-lead-table")
                            }
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

                {/* Travel Advisor */}

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

                {/* Tracking */}

                {trackingItems.length > 0 && (
                  <div className="relative w-full md:w-auto">
                    <button
                      type="button"
                      className={`w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 ${
                        openMenu === "lead-track-menu"
                          ? "bg-green-600 text-white shadow-lg md:scale-105"
                          : "bg-white text-green-700 border-2 border-green-300 hover:border-green-500 hover:shadow-md hover:scale-[1.02] hover:bg-green-50"
                      } md:min-w-[100px] md:h-9 md:py-2`}
                      onClick={() =>
                        setOpenMenu((prev) =>
                          prev === "lead-track-menu" ? null : "lead-track-menu",
                        )
                      }
                    >
                      <span className="flex items-center truncate">
                        <MapPin size={16} className="mr-1.5 flex-shrink-0" />
                        Tracking
                      </span>

                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          openMenu === "lead-track-menu" ? "rotate-180" : ""
                        }`}
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

            {showDashboardMenu && dashboardItems.length > 0 && (
              <div className="relative w-full md:w-auto">
                <button
                  type="button"
                  className={`w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 ${
                    openMenu === "dashboard-menu"
                      ? "bg-green-600 text-white shadow-lg md:scale-105"
                      : "bg-white text-green-700 border-2 border-green-300 hover:border-green-500 hover:shadow-md hover:scale-[1.02] hover:bg-green-50"
                  } md:min-w-[100px] md:h-9 md:py-2`}
                  onClick={() =>
                    setOpenMenu((prev) =>
                      prev === "dashboard-menu" ? null : "dashboard-menu",
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
                    className={`transition-transform duration-200 ${openMenu === "dashboard-menu" ? "rotate-180" : ""}`}
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
                          className={`px-3 py-2.5 md:py-2 text-sm cursor-pointer flex items-center gap-2 ${
                            isActive
                              ? "bg-green-600 text-white font-semibold"
                              : "text-gray-700 hover:bg-green-50 hover:text-green-700 hover:pl-4"
                          }`}
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

            {showWebsiteMenu && (
              <div className="relative w-full md:w-auto">
                <button
                  type="button"
                  className={`w-full md:w-auto flex items-center justify-between gap-1 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 ${
                    openMenu === "website-menu"
                      ? "bg-blue-600 text-white shadow-lg md:scale-105"
                      : "bg-white text-blue-700 border-2 border-blue-300 hover:border-blue-500 hover:shadow-md hover:scale-[1.02] hover:bg-blue-50"
                  } md:min-w-[100px] md:h-9 md:py-2`}
                  onClick={() =>
                    setOpenMenu((prev) =>
                      prev === "website-menu" ? null : "website-menu",
                    )
                  }
                >
                  <span className="flex items-center truncate">
                    <Monitor size={16} className="mr-1.5 flex-shrink-0" />
                    Website
                  </span>

                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${openMenu === "website-menu" ? "rotate-180" : ""}`}
                  />
                </button>

                {openMenu === "website-menu" && (
                  <ul className="w-full md:absolute md:left-0 z-50 py-1 mt-1 bg-white border-2 border-blue-300 rounded-lg shadow-xl md:top-full md:w-56 max-h-80 overflow-y-auto">
                    {[
                      {
                        key: "gac",
                        label: "GAC Table",
                      },
                      {
                        key: "gaq",
                        label: "GAQ Table",
                      },
                    ].map(({ key, label }) => (
                      <li
                        key={key}
                        onClick={() => handleWebsiteSelect(key)}
                        className={`px-3 py-2.5 md:py-2 text-sm cursor-pointer flex items-center gap-2 ${
                          nav.activeWebsiteView === key
                            ? "bg-blue-600 text-white font-semibold"
                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:pl-4"
                        }`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${
                            nav.activeWebsiteView === key
                              ? "bg-white"
                              : "bg-blue-300"
                          }`}
                        />

                        {label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* RIGHT - USER */}
          {/* ─────────────────────────────────────────────────────────────── */}

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:ml-auto md:gap-2 lg:gap-3">
            {/* Rules */}

            {(normalizedRole === "city manager" ||
              isTeamLeaderSales ||
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

            <div className="flex items-center gap-3">
              {/* Other Navbar items */}

              <UserProfileDropdown
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                userAvatar={userAvatar}
                userAliasName={userAliasName}
                userEmail={userEmail}
                rawUser={rawUser}
                userData={userData}
                adminRole={adminRole}
                userDepartment={userDepartment}
                userSubDepartment={userSubDepartment}
                userRegionNames={userRegionNames}
                userZoneNames={userZoneNames}
                userCityNames={userCityNames}
                handleLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
