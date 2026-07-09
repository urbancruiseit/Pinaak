"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import type { ComponentType } from "react";
import Navbar from "../components/ui/navbar";
import Sidebar from "../components/ui/sidebar";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { currentUserThunk } from "../features/user/userSlice";
import {
  setActiveMaster,
  setActiveLeadView,
  setSelectedLeadForEdit,
  setSelectedLeadForRateQuotation,
  setSelectedLeadForDsr,
  setActiveSection,
  setActiveWebsiteView,
  initFromRole,
} from "../features/Navigation/navigationSlice";
import type { LeadRecord } from "@/types/types";

// ─── Lazy modules ─────────────────────────────────────────────────────────────

const LoadingPanel = () => (
  <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
    Loading module…
  </div>
);

const lazy = (fn: () => Promise<any>) =>
  dynamic(fn, { ssr: false, loading: LoadingPanel });

const LeadsOverviewModule = lazy(
  () => import("../components/pages/leads/dashboard"),
);
const LeadFormModule = lazy(
  () => import("../components/pages/leads/list/leadsfrom"),
);
const LeadTableModule = lazy(
  () => import("../components/pages/leads/list/leadtable"),
) as ComponentType<{ selectedRegion?: string; selectedCity?: string }>;
const LeadSaleTableModule = lazy(
  () => import("../components/telesales/saleleadable"),
);
const EditLeadFormModule = lazy(
  () => import("../components/pages/leads/list/EditForm/editleadform"),
);
const DsrTableModule = lazy(
  () => import("../components/telesales/DSR/DsrTable"),
);
const DsrFormModule = lazy(
  () => import("../components/telesales/DSR/DsrForm"),
) as ComponentType<{ leadData?: LeadRecord | null }>;
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
) as ComponentType<{ leadData?: LeadRecord | null }>;
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
const GACForm = lazy(() => import("../components/pages/Website/list/gacTable"));
const GAQTable = lazy(
  () => import("../components/pages/Website/list/gaqTable"),
);
const DownloadReportModule = lazy(
  () => import("../components/Download/download"),
);

// ─── Vendor-only lazy modules ───────────────────────────────────────────────
// NOTE: Trip/Booking is still a placeholder — swap this import path once that
// component exists. "Vehicle Documents" reuses the existing Vehicleaddform
// module (same one used under Master → Vehicle Add), so vendor and Master
// both point at the exact same component/import.

const VendorProfileModule = lazy(
  () => import("../components/Vendor/vendorProfile"),
);
const VendorVehicleDocumentsModule = lazy(
  () => import("../components/Master/Vehicleaddform"),
);
const VenderDashboardModule = lazy(
  () => import("../components/Vendor/venderDashboard"),
);

// ─── Master tabs ──────────────────────────────────────────────────────────────

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
    component: lazy(() => import("../components/Master/vehiclesmaster")),
  },
  {
    key: "vehicle-category",
    component: lazy(() => import("../components/Master/vehiclecategory")),
  },
  {
    key: "vehicle-registration",
    component: lazy(() => import("../components/Master/Vehicleregistration")),
  },
  {
    key: "vehicle-add",
    component: lazy(() => import("../components/Master/Vehicleaddform")),
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

// 👇 In yeh master keys ko vendor login ke liye bhi directly accessible banaya
// (sidebar mein separate menu item ke through dispatch(setActiveSection(key)) karna hoga)
const vendorAccessibleMasterKeys = [
  "vendor-table",
  "vehicles",
  "driver",
  "driver-table",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();

  // All state from Redux
  const { currentUser } = useSelector((state: RootState) => state.user);
  const nav = useSelector((state: RootState) => state.navigation);

  // ── Fetch current user on mount ──────────────────────────────────────────
  useEffect(() => {
    dispatch(currentUserThunk());
  }, [dispatch]);

  // ── Init navigation from role + loginType when user loads ────────────────
  useEffect(() => {
    if (!currentUser) return;
    const u = currentUser as any;
    const role = u.role || u.role_name || "user";
    const department = u.department_name || u.departmentname || "";
    const subDepartment =
      u.subDepartment_name || u.subdepartname_name || u.department || "";
    // loginType comes from the JWT (decoded.loginType), set on req.user by
    // verifyJWT middleware — e.g. "employee" | "vendor" | "driver" | "customer"
    const loginType = u.loginType || "";
    dispatch(initFromRole({ role, department, subDepartment, loginType }));
  }, [currentUser, dispatch]);

  // ── URL tab param on first load ──────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab) dispatch(setActiveMaster(tab as any));
  }, [dispatch]);

  // ── Custom events from child components ──────────────────────────────────
  useEffect(() => {
    const onViewLead = (e: CustomEvent<LeadRecord>) => {
      if (e.detail) {
        dispatch(setSelectedLeadForEdit(e.detail));
        dispatch(setActiveLeadView("sales-edit-form"));
      }
    };
    window.addEventListener("viewLead", onViewLead as EventListener);
    return () =>
      window.removeEventListener("viewLead", onViewLead as EventListener);
  }, [dispatch]);

  useEffect(() => {
    const onNavToLeadTable = () => dispatch(setActiveLeadView("lead-table"));
    window.addEventListener("navigateToLeadTable", onNavToLeadTable);
    return () =>
      window.removeEventListener("navigateToLeadTable", onNavToLeadTable);
  }, [dispatch]);

  useEffect(() => {
    const onRateQuotation = (e: CustomEvent<{ lead: LeadRecord }>) => {
      if (e.detail?.lead)
        dispatch(setSelectedLeadForRateQuotation(e.detail.lead));
    };
    window.addEventListener("rateQuotation", onRateQuotation as EventListener);
    return () =>
      window.removeEventListener(
        "rateQuotation",
        onRateQuotation as EventListener,
      );
  }, [dispatch]);

  useEffect(() => {
    const onDsrForm = (e: CustomEvent<{ lead: LeadRecord }>) => {
      if (e.detail?.lead) dispatch(setSelectedLeadForDsr(e.detail.lead));
      else dispatch(setActiveSection("dsr-form" as any));
    };
    window.addEventListener("dsr-form", onDsrForm as EventListener);
    return () =>
      window.removeEventListener("dsr-form", onDsrForm as EventListener);
  }, [dispatch]);

  // ── Active master component ──────────────────────────────────────────────
  const ActiveMasterComponent = useMemo(() => {
    if (nav.activeSection !== "master") return null;
    return (
      masterTabs.find((t) => t.key === nav.activeMaster)?.component ?? null
    );
  }, [nav.activeMaster, nav.activeSection]);

  // 👇 Vendor ke liye: agar activeSection directly ek master-tab key ho
  // (e.g. sidebar se "vendor-table" / "vehicles" / "driver" pe click hua)
  const VendorDirectMasterComponent = useMemo(() => {
    if (nav.loginType !== "vendor") return null;
    if (!vendorAccessibleMasterKeys.includes(nav.activeSection as string))
      return null;
    return (
      masterTabs.find((t) => t.key === nav.activeSection)?.component ?? null
    );
  }, [nav.loginType, nav.activeSection]);

  // ── Fallback UI ──────────────────────────────────────────────────────────
  const renderFallback = (title: string, desc: string) => (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
      <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
      <p className="max-w-xl mt-2 text-sm text-slate-500">{desc}</p>
    </div>
  );

  // ── Main content ─────────────────────────────────────────────────────────
  const mainContent = (() => {
    // ══════════════════════════════════════════════════════════
    // VENDOR — completely separate content tree. Vendor never
    // falls through to the employee sections below.
    // ══════════════════════════════════════════════════════════
    // if (nav.loginType === "vendor") {
    //   if (nav.activeSection === "venderDashboard")
    //     return (
    //       <div className="space-y-6">
    //         <VenderDashboardModule />
    //       </div>
    //     );
    //   if (nav.activeSection === "vehicle-documents")
    //     return (
    //       <div className="space-y-6">
    //         <VendorVehicleDocumentsModule />
    //       </div>
    //     );
    //   if (nav.activeSection === "vendor-profile")
    //     return (
    //       <div className="space-y-6">
    //         <VendorProfileModule />
    //       </div>
    //     );

    //   // 👇 Naya: vendor-table / vehicles / driver / driver-table sidebar se
    //   // directly khulenge (master flow ke bina)
    //   if (VendorDirectMasterComponent) {
    //     const Comp = VendorDirectMasterComponent;
    //     return (
    //       <div className="space-y-6">
    //         <Comp />
    //       </div>
    //     );
    //   }

    //   return (
    //     <div className="space-y-6">
    //       {" "}
    //       <VenderDashboardModule />
    //     </div>
    //   );
    // }

    if (nav.loginType === "vendor") {
      if (nav.activeSection === "venderDashboard")
        return (
          <div className="space-y-6">
            <VenderDashboardModule />
          </div>
        );
      if (nav.activeSection === "vehicle-documents")
        return (
          <div className="space-y-6">
            <VendorVehicleDocumentsModule />
          </div>
        );
      if (nav.activeSection === "vendor-profile")
        return (
          <div className="space-y-6">
            <VendorProfileModule />
          </div>
        );

      // 👇 Rate Quotation — vendor ke liye bhi wahi module jo employee use karta hai
      if (nav.activeSection === "rate-quotation")
        return (
          <div className="space-y-6">
            <RateQuotationTableModule
              leadData={nav.selectedLeadForRateQuotation}
            />
          </div>
        );

      // 👇 Booking & Trip — abhi module ready nahi hai, "coming soon" dikhao
      if (nav.activeSection === "booking-trip")
        return renderFallback(
          "Booking module coming soon",
          "Trip booking feature is under development.",
        );
      if (nav.activeSection === "payment")
        return renderFallback(
          "Trip module coming soon",
          "Trip/payment feature is under development.",
        );

      if (VendorDirectMasterComponent) {
        const Comp = VendorDirectMasterComponent;
        return (
          <div className="space-y-6">
            <Comp />
          </div>
        );
      }

      // 👇 Default: koi bhi sidebar item active na ho to vendor dashboard dikhao
      return (
        <div className="space-y-6">
          <VenderDashboardModule />
        </div>
      );
    }

    // MASTER
    if (nav.activeSection === "master") {
      if (nav.pendingModuleKey)
        return renderFallback(
          "Module coming soon",
          `The ${nav.pendingModuleKey.replace(/-/g, " ")} module is not ready yet.`,
        );
      if (ActiveMasterComponent)
        return (
          <div className="space-y-6">
            <ActiveMasterComponent />
          </div>
        );
      return renderFallback(
        "Module not found",
        "Select a different master module.",
      );
    }

    // LEADS
    if (nav.activeSection === "leads") {
      if (nav.showMonthlyEnquiry)
        return (
          <div className="space-y-6">
            <MonthlyEnquiryModule />
          </div>
        );
      if (nav.showMonthlyDistribution)
        return (
          <div className="space-y-6">
            <LeadDistributionModule />
          </div>
        );
      if (nav.showUnwantedLeads)
        return (
          <div className="space-y-6">
            <UnwantedLeadsModule />
          </div>
        );
      if (nav.showEmployeeReports)
        return (
          <div className="space-y-6">
            <EmployeeReportsModule />
          </div>
        );
      if (nav.showTimeEnquiryReports)
        return (
          <div className="space-y-6">
            <TimeEnquiryReportsModule />
          </div>
        );
      if (nav.showLongWeekendLeads)
        return (
          <div className="space-y-6">
            <LongWeekendLeadsModule />
          </div>
        );
      if (nav.showMonthlyLeadsTwo)
        return (
          <div className="space-y-6">
            <MonthlyLeadsTwoModule />
          </div>
        );
      if (nav.showDateEmployeeReports)
        return (
          <div className="space-y-6">
            <DateEmployeeReportsModule />
          </div>
        );

      if (nav.activeLeadView === "lead-form")
        return (
          <div className="space-y-6">
            <LeadFormModule />
          </div>
        );
      if (nav.activeLeadView === "lead-table")
        return (
          <div className="space-y-6">
            <LeadTableModule
              selectedRegion={nav.selectedRegion}
              selectedCity={nav.selectedCity}
            />
          </div>
        );
      if (nav.activeLeadView === "sale-lead-table")
        return (
          <div className="space-y-6">
            <LeadSaleTableModule />
          </div>
        );
      if (nav.activeLeadView === "dsr-lead-table")
        return (
          <div className="space-y-6">
            <DsrTableModule />
          </div>
        );

      if (nav.activeLeadView === "sales-edit-form") {
        if (!nav.selectedLeadForEdit)
          return renderFallback(
            "No Lead Selected",
            "Please select a lead from the table to edit.",
          );
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

      return (
        <div className="space-y-6">
          <LeadsOverviewModule />
        </div>
      );
    }

    // DASHBOARD
    if (nav.activeSection === "dashboard") {
      if (nav.activeDashboardView === "presales-dashboard")
        return (
          <div className="space-y-6">
            <PresalesDashboardModule />
          </div>
        );
      if (nav.activeDashboardView === "telesales-dashboard")
        return (
          <div className="space-y-6">
            <SalesTeamDashboardModule />
          </div>
        );
      if (nav.activeDashboardView === "teamleader-dashboard")
        return (
          <div className="space-y-6">
            <TeamLeaderDashboardModule />
          </div>
        );
      if (nav.activeDashboardView === "citymanager-dashboard")
        return (
          <div className="space-y-6">
            <CityManagerDashboardModule />
          </div>
        );
      return (
        <div className="space-y-6">
          <LeadsOverviewModule />
        </div>
      );
    }

    // ✅ Rules section
    if (nav.activeSection === "rules") {
      const RulesBoard = dynamic(
        () => import("../components/Rules/RulesBoard"),
        { ssr: false, loading: LoadingPanel },
      );
      return (
        <div className="space-y-6">
          <RulesBoard />
        </div>
      );
    }

    if (nav.activeSection === "rate-quotation")
      return (
        <div className="space-y-6">
          <RateQuotationTableModule
            leadData={nav.selectedLeadForRateQuotation}
          />
        </div>
      );
    if (nav.activeSection === "dsr-form")
      return (
        <div className="space-y-6">
          <DsrFormModule leadData={nav.selectedLeadForDsr} />
        </div>
      );
    if (nav.activeSection === "website")
      return (
        <div className="space-y-6">
          {nav.activeWebsiteView === "gac" ? <GACForm /> : <GAQTable />}
        </div>
      );
    if (nav.activeSection === "download-report")
      return (
        <div className="space-y-6">
          <DownloadReportModule />
        </div>
      );

    // Employee reaching a vendor-only section (e.g. stale URL/tab) — just
    // fall back to their normal leads dashboard instead of a blank screen.
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

  // ── Layout ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 text-slate-900">
      {/* ✅ Zero props — Navbar reads everything from Redux */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* ✅ Zero props — Sidebar reads/dispatches Redux directly */}
        <Sidebar />

        <main className="flex-1 px-4 py-1 overflow-y-auto bg-white sm:px-6">
          <div className="w-full mx-auto space-y-6">{mainContent}</div>
        </main>
      </div>
    </div>
  );
}
