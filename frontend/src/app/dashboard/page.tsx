"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import type { ComponentType } from "react";

import Navbar from "../components/ui/navbar";
import Sidebar from "../components/ui/sidebar";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";

import { currentUserThunk } from "../features/user/userSlice";

import {
  setActiveMaster,
  setActiveLeadView,
  setSelectedLeadForEdit,
  setSelectedLeadForRateQuotation,
  setSelectedLeadForDsr,
  setActiveSection,
  initFromRole,
} from "../features/Navigation/navigationSlice";

import type { LeadRecord } from "@/types/types";

/* ============================================================================
   ROLE HELPERS
============================================================================ */

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

/* ============================================================================
   MASTER PERMISSIONS
============================================================================ */

const MASTER_ALLOWED_ROLES = [
  "superadmin",
  "admin",
  "manager",
  "city manager",
  "travel advisor",
];

const MASTER_ITEM_ALLOWED_ROLES: Record<string, string[]> = {
  /* ---------------- Customers ---------------- */

  "customer-personal": ["superadmin", "admin", "manager", "city manager"],

  "customer-table": [
    "superadmin",
    "admin",
    "manager",
    "city manager",
    "travel advisor",
  ],

  "customer-history": ["superadmin", "admin", "manager", "city manager"],

  /* ---------------- Vendor ---------------- */

  vendor: ["superadmin", "admin", "manager", "city manager"],

  "vendor-table": ["superadmin", "admin", "manager", "city manager"],

  /* ---------------- Vehicles ---------------- */

  vehicles: ["superadmin", "admin", "city manager"],

  "vehicle-manager": ["superadmin", "admin", "city manager"],

  "vehicle-category": ["superadmin", "city manager", "travel advisor"],

  /* ---------------- Driver ---------------- */

  driver: ["superadmin", "admin", "manager", "city manager"],

  "driver-table": ["superadmin", "admin", "manager", "city manager"],

  /* ---------------- Other Master ---------------- */

  employee: ["superadmin", "admin", "manager", "city manager"],

  "corporate-form": ["superadmin", "admin", "manager", "city manager"],

  "quotation-pdf": ["superadmin", "admin", "manager", "city manager"],

  "rate-quotation": ["superadmin", "admin", "manager", "city manager"],

  "card-reel": ["superadmin", "admin", "manager", "city manager"],

  "country-code": ["superadmin", "admin", "manager", "city manager"],

  /* ---------------- Future / placeholder ---------------- */

  "corporate-event": ["superadmin", "admin", "manager", "city manager"],

  hr: ["superadmin", "admin", "manager", "city manager"],

  city: ["superadmin", "admin", "manager", "city manager"],

  zone: ["superadmin", "admin", "manager", "city manager"],

  region: ["superadmin", "admin", "manager", "city manager"],
};

/* ============================================================================
   LAZY LOADING
============================================================================ */

const LoadingPanel = () => (
  <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
    Loading module…
  </div>
);

const lazy = (fn: () => Promise<any>) =>
  dynamic(fn, {
    ssr: false,
    loading: LoadingPanel,
  });

/* ============================================================================
   LAZY MODULES
============================================================================ */

const LeadsOverviewModule = lazy(
  () => import("../components/pages/leads/dashboard"),
);

const LeadFormModule = lazy(
  () => import("../components/pages/leads/list/leadsfrom"),
);

const LeadTableModule = lazy(
  () => import("../components/pages/leads/list/leadtable"),
) as ComponentType<{
  selectedRegion?: string;
  selectedCity?: string;
}>;

const LeadSaleTableModule = lazy(
  () => import("../components/telesales/saleleadable"),
);

const LeadSwapTableModule = lazy(
  () => import("../components/telesales/Swap/swapTable"),
);

const EditLeadFormModule = lazy(
  () => import("../components/pages/leads/list/EditForm/editleadform"),
);

const DsrTableModule = lazy(
  () => import("../components/telesales/DSR/DsrTable"),
);

const DsrFormModule = lazy(
  () => import("../components/telesales/DSR/DsrForm"),
) as ComponentType<{
  leadData?: LeadRecord | null;
}>;

const PresalesDashboardModule = lazy(
  () => import("../components/presalesteam/dashboardpresales"),
);

const SalesTeamDashboardModule = lazy(
  () => import("../components/telesales/telesalesdahboard"),
);

const TeamLeaderDashboardModule = lazy(
  () => import("../components/pages/teamleader/teamleaderdashboard"),
);

const CityManagerDashboardModule = lazy(
  () => import("../components/citymanger/citymanagerdashboard"),
);

const RateQuotationTableModule = lazy(
  () => import("../components/pages/ratequation/list/ratequotationtable"),
) as ComponentType<{
  leadData?: LeadRecord | null;
}>;

const MonthlyEnquiryModule = lazy(
  () => import("../components/pages/leads/Reports/mereReport"),
);

const LeadDistributionModule = lazy(
  () => import("../components/pages/leads/Reports/leadDistribution"),
);

const UnwantedLeadsModule = lazy(
  () => import("../components/pages/leads/Reports/UnwantedLead"),
);

const EmployeeReportsModule = lazy(
  () => import("../components/pages/leads/Reports/EmployeeReport"),
);

const TimeEnquiryReportsModule = lazy(
  () => import("../components/pages/leads/Reports/TimeEnquiryReports"),
);

const MonthlyLeadsTwoModule = lazy(
  () => import("../components/pages/leads/Reports/MereReportTwo"),
);

const LongWeekendLeadsModule = lazy(
  () => import("../components/pages/leads/Reports/LongWeekendReport"),
);

const DateEmployeeReportsModule = lazy(
  () => import("../components/pages/leads/Reports/EmployeeDateReport"),
);

const AgingReportsModule = lazy(
  () => import("../components/pages/leads/Reports/AgingReport"),
);

const TimeTrackingReports = lazy(
  () => import("../components/pages/leads/Reports/vehiclesTracking"),
);

const GACForm = lazy(() => import("../components/pages/Website/list/gacTable"));

const GAQTable = lazy(
  () => import("../components/pages/Website/list/gaqTable"),
);

const DownloadReportModule = lazy(
  () => import("../components/Download/download"),
);

/* ============================================================================
   VENDOR MODULES
============================================================================ */

const VendorProfileModule = lazy(
  () => import("../components/Vendor/vendorProfile"),
);

const VendorVehicleDocumentsModule = lazy(
  () =>
    import("../components/Master/Vehicles/VehiclesManager/VehicleManagerCalenderPopup"),
);

const VenderDashboardModule = lazy(
  () => import("../components/Vendor/venderDashboard"),
);

/* ============================================================================
   MASTER TABS
============================================================================ */

const masterTabs = [
  {
    key: "vendor",
    component: lazy(() => import("../components/Vendor/VendorFormData")),
  },
  {
    key: "vendor-table",
    component: lazy(() => import("../components/Vendor/vendortable")),
  },
  {
    key: "vehicles",
    component: lazy(
      () =>
        import("../components/Master/Vehicles/VehiclesMaster/vehiclesmasterTable"),
    ),
  },

  {
    key: "vehicle-manager",
    component: lazy(
      () =>
        import("../components/Master/Vehicles/VehiclesManager/VehicleManagerTable"),
    ),
  },

  {
    key: "driver",
    component: lazy(() => import("../components/Master/Driver/DriverFormData")),
  },
  {
    key: "employee",
    component: lazy(() => import("../components/Master/EmployeeFormData")),
  },
  {
    key: "corporate-form",
    component: lazy(() => import("../components/Master/coprateform")),
  },
  {
    key: "customer-personal",
    component: lazy(
      () => import("../components/Master/Customer/customerpersonal"),
    ),
  },
  {
    key: "customer-table",
    component: lazy(
      () => import("../components/Master/Customer/customertable"),
    ),
  },
  {
    key: "customer-history",
    component: lazy(
      () => import("../components/Master/Customer/CustomerHistory"),
    ),
  },
  {
    key: "driver-table",
    component: lazy(() => import("../components/Master/Driver/drivertable")),
  },
  {
    key: "card-reel",
    component: lazy(() => import("../components/Master/cardreel")),
  },
  {
    key: "quotation-pdf",
    component: lazy(
      () => import("../components/pages/ratequation/list/quotation"),
    ),
  },
  {
    key: "country-code",
    component: lazy(() => import("../components/Master/countrycode")),
  },
];

/* ============================================================================
   VENDOR DIRECT MASTER ACCESS
============================================================================ */

const vendorAccessibleMasterKeys = [
  "vendor-table",
  "vehicles",
  "driver",
  "driver-table",
];

/* ============================================================================
   PAGE
============================================================================ */

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { currentUser } = useSelector((state: RootState) => state.user);

  const nav = useSelector((state: RootState) => state.navigation);

  /* --------------------------------------------------------------------------
     CURRENT USER
  -------------------------------------------------------------------------- */

  useEffect(() => {
    dispatch(currentUserThunk());
  }, [dispatch]);

  /* --------------------------------------------------------------------------
     ROLE + LOGIN TYPE
  -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!currentUser) return;

    const rawUser = (currentUser as any) ?? {};
    const userData = rawUser?.data ?? rawUser;

    const roleName = rawUser?.role_name ?? userData?.role_name ?? "";

    const accessRole = rawUser?.access_role ?? userData?.access_role ?? "";

    const effectiveRole = getEffectiveRole(roleName, accessRole);

    const normalizedRole = normalizeRole(effectiveRole);

    const department =
      rawUser?.department_name ??
      userData?.department_name ??
      rawUser?.department ??
      userData?.department ??
      "";

    const subDepartment =
      rawUser?.subDepartment_name ??
      userData?.subDepartment_name ??
      rawUser?.subDepartment ??
      userData?.subDepartment ??
      rawUser?.subdepartname_name ??
      userData?.subdepartname_name ??
      "";

    const loginType = rawUser?.loginType ?? userData?.loginType ?? "";

    dispatch(
      initFromRole({
        role: normalizedRole,
        department,
        subDepartment,
        loginType,
      }),
    );
  }, [currentUser, dispatch]);

  /* --------------------------------------------------------------------------
     URL TAB
  -------------------------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tab = new URLSearchParams(window.location.search).get("tab");

    if (tab) {
      dispatch(setActiveMaster(tab as any));
    }
  }, [dispatch]);

  /* --------------------------------------------------------------------------
     CUSTOM EVENT: VIEW LEAD
  -------------------------------------------------------------------------- */

  useEffect(() => {
    const onViewLead = (e: CustomEvent<LeadRecord>) => {
      if (!e.detail) return;

      dispatch(setSelectedLeadForEdit(e.detail));

      dispatch(setActiveLeadView("sales-edit-form"));
    };

    window.addEventListener("viewLead", onViewLead as EventListener);

    return () =>
      window.removeEventListener("viewLead", onViewLead as EventListener);
  }, [dispatch]);

  /* --------------------------------------------------------------------------
     NAVIGATE LEAD TABLE
  -------------------------------------------------------------------------- */

  useEffect(() => {
    const onNavToLeadTable = () => {
      dispatch(setActiveLeadView("lead-table"));
    };

    window.addEventListener("navigateToLeadTable", onNavToLeadTable);

    return () =>
      window.removeEventListener("navigateToLeadTable", onNavToLeadTable);
  }, [dispatch]);

  /* --------------------------------------------------------------------------
     RATE QUOTATION
  -------------------------------------------------------------------------- */

  useEffect(() => {
    const onRateQuotation = (
      e: CustomEvent<{
        lead: LeadRecord;
      }>,
    ) => {
      if (!e.detail?.lead) return;

      dispatch(setSelectedLeadForRateQuotation(e.detail.lead));
    };

    window.addEventListener("rateQuotation", onRateQuotation as EventListener);

    return () =>
      window.removeEventListener(
        "rateQuotation",
        onRateQuotation as EventListener,
      );
  }, [dispatch]);

  /* --------------------------------------------------------------------------
     DSR
  -------------------------------------------------------------------------- */

  useEffect(() => {
    const onDsrForm = (
      e: CustomEvent<{
        lead: LeadRecord;
      }>,
    ) => {
      if (e.detail?.lead) {
        dispatch(setSelectedLeadForDsr(e.detail.lead));
      } else {
        dispatch(setActiveSection("dsr-form" as any));
      }
    };

    window.addEventListener("dsr-form", onDsrForm as EventListener);

    return () =>
      window.removeEventListener("dsr-form", onDsrForm as EventListener);
  }, [dispatch]);

  /* --------------------------------------------------------------------------
     ROLE
  -------------------------------------------------------------------------- */

  const rawUserForRole = (currentUser as any) ?? {};

  const userDataForRole = rawUserForRole?.data ?? rawUserForRole;

  const roleName =
    rawUserForRole?.role_name ?? userDataForRole?.role_name ?? "";

  const accessRole =
    rawUserForRole?.access_role ?? userDataForRole?.access_role ?? "";

  const effectiveRole = getEffectiveRole(roleName, accessRole);

  const normalizedRole = normalizeRole(effectiveRole);

  /* --------------------------------------------------------------------------
     ROLE FLAGS
  -------------------------------------------------------------------------- */

  const isCityManager = normalizedRole === "city manager";

  const isTeamLeaderSales = normalizedRole === "team leader-sales";

  // ── NEW: explicit flags used only to document/lock the
  // "Leads" landing-view rule below. Not required for the
  // logic itself (showCityManagerDashboard already excludes
  // them), but kept so the intent is explicit in code and
  // survives future edits.
  //
  //   role_name: "Travel Advisor"  (role_id: 34)
  const isTravelAdvisor = normalizedRole === "travel advisor";
  const isManagerRole = normalizedRole === "manager";
  const isTeamLeaderRole = normalizedRole === "team leader";

  /*
   * LOCKED RULE — "Leads" section landing view:
   *
   *   - City Manager        → CityManagerDashboardModule
   *   - Team Leader-Sales    → CityManagerDashboardModule
   *   - Travel Advisor       → LeadsOverviewModule  (same as Manager / Team Leader)
   *   - Manager               → LeadsOverviewModule
   *   - Team Leader            → LeadsOverviewModule
   *   - anything else (default) → LeadsOverviewModule
   *
   * Only City Manager / Team Leader-Sales get the CityManagerDashboard;
   * every other role (including Travel Advisor, Manager, Team Leader)
   * explicitly falls through to LeadsOverviewModule.
   */
  const showCityManagerDashboard = isCityManager || isTeamLeaderSales;

  /* --------------------------------------------------------------------------
     MASTER ACCESS
  -------------------------------------------------------------------------- */

  const canAccessMaster = MASTER_ALLOWED_ROLES.includes(normalizedRole);

  const activeMasterAllowed =
    !nav.activeMaster ||
    !MASTER_ITEM_ALLOWED_ROLES[nav.activeMaster] ||
    MASTER_ITEM_ALLOWED_ROLES[nav.activeMaster].includes(normalizedRole);

  /* --------------------------------------------------------------------------
     ACTIVE MASTER COMPONENT
  -------------------------------------------------------------------------- */

  const ActiveMasterComponent = useMemo(() => {
    if (nav.activeSection !== "master") {
      return null;
    }

    return (
      masterTabs.find((tab) => tab.key === nav.activeMaster)?.component ?? null
    );
  }, [nav.activeMaster, nav.activeSection]);

  /* --------------------------------------------------------------------------
     VENDOR DIRECT MASTER
  -------------------------------------------------------------------------- */

  const VendorDirectMasterComponent = useMemo(() => {
    if (nav.loginType !== "vendor") {
      return null;
    }

    if (!vendorAccessibleMasterKeys.includes(nav.activeSection as string)) {
      return null;
    }

    return (
      masterTabs.find((tab) => tab.key === nav.activeSection)?.component ?? null
    );
  }, [nav.loginType, nav.activeSection]);

  /* --------------------------------------------------------------------------
     FALLBACK
  -------------------------------------------------------------------------- */

  const renderFallback = (title: string, desc: string) => (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
      <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>

      <p className="mt-2 max-w-xl text-sm text-slate-500">{desc}</p>
    </div>
  );

  /* ==========================================================================
     MAIN CONTENT
  ========================================================================== */

  const mainContent = (() => {
    /* ------------------------------------------------------------------------
       VENDOR
    ------------------------------------------------------------------------ */

    if (nav.loginType === "vendor") {
      if (nav.activeSection === "venderDashboard") {
        return (
          <div className="space-y-6">
            <VenderDashboardModule />
          </div>
        );
      }

      if (nav.activeSection === "vehicle-documents") {
        return (
          <div className="space-y-6">
            <VendorVehicleDocumentsModule />
          </div>
        );
      }

      if (nav.activeSection === "vendor-profile") {
        return (
          <div className="space-y-6">
            <VendorProfileModule />
          </div>
        );
      }

      if (nav.activeSection === "rate-quotation") {
        return (
          <div className="space-y-6">
            <RateQuotationTableModule
              leadData={nav.selectedLeadForRateQuotation}
            />
          </div>
        );
      }

      if (nav.activeSection === "booking-trip") {
        return renderFallback(
          "Booking module coming soon",
          "Trip booking feature is under development.",
        );
      }

      if (nav.activeSection === "payment") {
        return renderFallback(
          "Payment module coming soon",
          "Trip/payment feature is under development.",
        );
      }

      if (VendorDirectMasterComponent) {
        const Comp = VendorDirectMasterComponent;

        return (
          <div className="space-y-6">
            <Comp />
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <VenderDashboardModule />
        </div>
      );
    }

    /* ------------------------------------------------------------------------
       MASTER
    ------------------------------------------------------------------------ */

    if (nav.activeSection === "master") {
      if (!canAccessMaster) {
        return renderFallback(
          "Access Denied",
          "You don't have permission to view the Master section.",
        );
      }

      if (!activeMasterAllowed) {
        return renderFallback(
          "Access Denied",
          "You don't have permission to view this Master module.",
        );
      }

      if (nav.pendingModuleKey) {
        return renderFallback(
          "Module coming soon",
          `The ${nav.pendingModuleKey.replace(/-/g, " ")} module is not ready yet.`,
        );
      }

      if (ActiveMasterComponent) {
        return (
          <div className="space-y-6">
            <ActiveMasterComponent />
          </div>
        );
      }

      return renderFallback(
        "Module not found",
        "Select a different master module.",
      );
    }

    /* ------------------------------------------------------------------------
       LEADS
    ------------------------------------------------------------------------ */

    if (nav.activeSection === "leads") {
      if (nav.showMonthlyEnquiry) {
        return (
          <div className="space-y-6">
            <MonthlyEnquiryModule />
          </div>
        );
      }

      if (nav.showMonthlyDistribution) {
        return (
          <div className="space-y-6">
            <LeadDistributionModule />
          </div>
        );
      }

      if (nav.showUnwantedLeads) {
        return (
          <div className="space-y-6">
            <UnwantedLeadsModule />
          </div>
        );
      }

      if (nav.showEmployeeReports) {
        return (
          <div className="space-y-6">
            <EmployeeReportsModule />
          </div>
        );
      }

      if (nav.showTimeEnquiryReports) {
        return (
          <div className="space-y-6">
            <TimeEnquiryReportsModule />
          </div>
        );
      }

      if (nav.showLongWeekendLeads) {
        return (
          <div className="space-y-6">
            <LongWeekendLeadsModule />
          </div>
        );
      }

      if (nav.showMonthlyLeadsTwo) {
        return (
          <div className="space-y-6">
            <MonthlyLeadsTwoModule />
          </div>
        );
      }

      if (nav.showDateEmployeeReports) {
        return (
          <div className="space-y-6">
            <DateEmployeeReportsModule />
          </div>
        );
      }

      if (nav.showagingReports) {
        return (
          <div className="space-y-6">
            <AgingReportsModule />
          </div>
        );
      }

      if (nav.showTimeTrackingReports) {
        return (
          <div className="space-y-6">
            <TimeTrackingReports />
          </div>
        );
      }

      if (nav.activeLeadView === "lead-form") {
        return (
          <div className="space-y-6">
            <LeadFormModule />
          </div>
        );
      }

      if (nav.activeLeadView === "lead-table") {
        return (
          <div className="space-y-6">
            <LeadTableModule
              selectedRegion={nav.selectedRegion}
              selectedCity={nav.selectedCity}
            />
          </div>
        );
      }

      if (nav.activeLeadView === "sale-lead-table") {
        return (
          <div className="space-y-6">
            <LeadSaleTableModule />
          </div>
        );
      }

      if (nav.activeLeadView === "swap-lead-table") {
        return (
          <div className="space-y-6">
            <LeadSwapTableModule />
          </div>
        );
      }

      if (nav.activeLeadView === "dsr-lead-table") {
        return (
          <div className="space-y-6">
            <DsrTableModule />
          </div>
        );
      }

      if (nav.activeLeadView === "sales-edit-form") {
        if (!nav.selectedLeadForEdit) {
          return renderFallback(
            "No Lead Selected",
            "Please select a lead from the table to edit.",
          );
        }

        return (
          <div className="space-y-6">
            <EditLeadFormModule
              initialData={nav.selectedLeadForEdit}
              onSuccess={() => {
                dispatch(setSelectedLeadForEdit(null));

                dispatch(setActiveLeadView("sale-lead-table"));
              }}
              onCancel={() => {
                dispatch(setSelectedLeadForEdit(null));

                dispatch(setActiveLeadView("sale-lead-table"));
              }}
            />
          </div>
        );
      }

      // ── "Leads" default landing view (activeLeadView === "dashboard"
      // or unset). See LOCKED RULE comment above showCityManagerDashboard.
      return (
        <div className="space-y-6">
          {showCityManagerDashboard ? (
            <CityManagerDashboardModule />
          ) : (
            <LeadsOverviewModule />
          )}
        </div>
      );
    }

    /* ------------------------------------------------------------------------
       DASHBOARD
    ------------------------------------------------------------------------ */

    if (nav.activeSection === "dashboard") {
      if (nav.activeDashboardView === "presales-dashboard") {
        return (
          <div className="space-y-6">
            <PresalesDashboardModule />
          </div>
        );
      }

      if (nav.activeDashboardView === "telesales-dashboard") {
        return (
          <div className="space-y-6">
            <SalesTeamDashboardModule />
          </div>
        );
      }

      if (nav.activeDashboardView === "teamleader-dashboard") {
        return (
          <div className="space-y-6">
            <TeamLeaderDashboardModule />
          </div>
        );
      }

      if (nav.activeDashboardView === "citymanager-dashboard") {
        return (
          <div className="space-y-6">
            <CityManagerDashboardModule />
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {showCityManagerDashboard ? (
            <CityManagerDashboardModule />
          ) : (
            <LeadsOverviewModule />
          )}
        </div>
      );
    }

    /* ------------------------------------------------------------------------
       RULES
    ------------------------------------------------------------------------ */

    if (nav.activeSection === "rules") {
      const RulesBoard = dynamic(
        () => import("../components/Rules/RulesBoard"),
        {
          ssr: false,
          loading: LoadingPanel,
        },
      );

      return (
        <div className="space-y-6">
          <RulesBoard />
        </div>
      );
    }

    /* ------------------------------------------------------------------------
       RATE QUOTATION
    ------------------------------------------------------------------------ */

    if (nav.activeSection === "rate-quotation") {
      return (
        <div className="space-y-6">
          <RateQuotationTableModule
            leadData={nav.selectedLeadForRateQuotation}
          />
        </div>
      );
    }

    /* ------------------------------------------------------------------------
       DSR FORM
    ------------------------------------------------------------------------ */

    if (nav.activeSection === "dsr-form") {
      return (
        <div className="space-y-6">
          <DsrFormModule leadData={nav.selectedLeadForDsr} />
        </div>
      );
    }

    /* ------------------------------------------------------------------------
       WEBSITE
    ------------------------------------------------------------------------ */

    if (nav.activeSection === "website") {
      return (
        <div className="space-y-6">
          {nav.activeWebsiteView === "gac" ? <GACForm /> : <GAQTable />}
        </div>
      );
    }

    /* ------------------------------------------------------------------------
       DOWNLOAD
    ------------------------------------------------------------------------ */

    if (nav.activeSection === "download-report") {
      return (
        <div className="space-y-6">
          <DownloadReportModule />
        </div>
      );
    }

    /* ------------------------------------------------------------------------
       DEFAULT
    ------------------------------------------------------------------------ */

    if (
      nav.activeSection === "booking-trip" ||
      nav.activeSection === "vehicle-documents" ||
      nav.activeSection === "vendor-profile"
    ) {
      return (
        <div className="space-y-6">
          <LeadsOverviewModule />
        </div>
      );
    }

    return null;
  })();

  /* ==========================================================================
     LAYOUT
  ========================================================================== */

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <div className="relative">
          <Sidebar />
        </div>

        <main className="ml-[100px] flex-1 overflow-y-auto bg-white px-4 py-1 sm:px-6">
          <div className="mx-auto w-full space-y-6">{mainContent}</div>
        </main>
      </div>
    </div>
  );
}
