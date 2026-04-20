"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import Navbar from "../components/ui/navbar";
import Sidebar from "../components/ui/sidebar";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { currentUserThunk } from "../features/user/userSlice";
import type { LeadRecord } from "@/types/types";

type SidebarSection =
  | "leads"
  | "master"
  | "rate-quotation"
  | "booking-trip"
  | "payment"
  | "feedback"
  | "dashboard"
  | "access"
  | "admin";

type MasterKey =
  | "vendor"
  | "vendor-table"
  | "vehicles"
  | "vehicle-category"
  | "vehicle-registration"
  | "vehicle-add"
  | "driver"
  | "driver-table"
  | "employee"
  | "hr"
  | "city"
  | "corporate-form"
  | "corporate-event"
  | "customer-personal"
  | "customer-table"
  | "rate-quotation"
  | "card-reel"
  | "quotation-pdf"
  | "country-code"
  | "access-level"
  | "region"
  | "zone";

type LeadView =
  | "dashboard"
  | "lead-form"
  | "lead-table"
  | "sale-lead-table"
  | "sales-edit-form";

type DashboardView =
  | "leads-dashboard"
  | "presales-dashboard"
  | "telesales-dashboard"
  | "teamleader-dashboard"
  | "citymanager-dashboard";

interface MasterTab {
  key: MasterKey;
  label: string;
  component: ComponentType;
}

const LoadingPanel = () => (
  <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
    Loading module…
  </div>
);

const LeadsOverviewModule = dynamic(
  () => import("../components/pages/leads/dashboard"),
  {
    ssr: false,
    loading: LoadingPanel,
  },
);

const LeadFormModule = dynamic(
  () => import("../components/pages/leads/list/leadsfrom"),
  {
    ssr: false,
    loading: LoadingPanel,
  },
);

const LeadTableModule = dynamic(
  () => import("../components/pages/leads/list/leadtable"),
  {
    ssr: false,
    loading: LoadingPanel,
  },
) as React.ComponentType<{ selectedRegion?: string; selectedCity?: string }>;

const LeadSaleTableModule = dynamic(
  () => import("../components/telesales/saleleadable"),
  {
    ssr: false,
    loading: LoadingPanel,
  },
);

const EditLeadFormModule = dynamic(
  () => import("../components/pages/leads/list/EditForm/editleadform"),
  {
    ssr: false,
    loading: LoadingPanel,
  },
);

const PresalesDashboardModule = dynamic(
  () => import("../components/presalesteam/dashboardpresales"),
  {
    ssr: false,
    loading: LoadingPanel,
  },
);

const SalesTeamDashboardModule = dynamic(
  () => import("../components/telesales/telesalesdahboard"),
  {
    ssr: false,
    loading: LoadingPanel,
  },
);

const TeamLeaderDashboardModule = dynamic(
  () => import("../components/pages/teamleader/teamleaderdashboard"),
  {
    ssr: false,
    loading: LoadingPanel,
  },
);

const CityManagerDashboardModule = dynamic(
  () => import("../components/citymanger/citymanagerdashboard"),
  {
    ssr: false,
    loading: LoadingPanel,
  },
);

const RateQuotationTableModule = dynamic(
  () => import("../components/pages/ratequation/list/ratequotationtable"),
  {
    ssr: false,
    loading: LoadingPanel,
  },
) as React.ComponentType<{ leadData?: LeadRecord | null }>;

const masterTabs: MasterTab[] = [
  {
    key: "vendor",
    label: "Vendor Master",
    component: dynamic(
      () => import("../components/Master/Vendor/VendorFormData"),
      {
        ssr: false,
        loading: LoadingPanel,
      },
    ),
  },

  {
    key: "vendor-table",
    label: "Vendor Table",
    component: dynamic(
      () => import("../components/Master/Vendor/vendortable"),
      {
        ssr: false,
        loading: LoadingPanel,
      },
    ),
  },

  {
    key: "vehicles",
    label: "Vehicles Master",
    component: dynamic(() => import("../components/Master/vehiclesmaster"), {
      ssr: false,
      loading: LoadingPanel,
    }),
  },
  {
    key: "vehicle-category",
    label: "Vehicle Category",
    component: dynamic(() => import("../components/Master/vehiclecategory"), {
      ssr: false,
      loading: LoadingPanel,
    }),
  },
  {
    key: "vehicle-registration",
    label: "Vehicle Registration",
    component: dynamic(
      () => import("../components/Master/Vehicleregistration"),
      {
        ssr: false,
        loading: LoadingPanel,
      },
    ),
  },
  {
    key: "vehicle-add",
    label: "Vehicle Add Form",
    component: dynamic(() => import("../components/Master/Vehicleaddform"), {
      ssr: false,
      loading: LoadingPanel,
    }),
  },
  {
    key: "driver",
    label: "Driver Master",
    component: dynamic(
      () => import("../components/Master/Driver/DriverFormData"),
      {
        ssr: false,
        loading: LoadingPanel,
      },
    ),
  },
  {
    key: "employee",
    label: "Employee Master",
    component: dynamic(() => import("../components/Master/EmployeeFormData"), {
      ssr: false,
      loading: LoadingPanel,
    }),
  },

  {
    key: "corporate-form",
    label: "Corporate Form",
    component: dynamic(() => import("../components/Master/coprateform"), {
      ssr: false,
      loading: LoadingPanel,
    }),
  },

  {
    key: "customer-personal",
    label: "Customer Personal",
    component: dynamic(
      () => import("../components/Master/Customer/customerpersonal"),
      {
        ssr: false,
        loading: LoadingPanel,
      },
    ),
  },

  {
    key: "customer-table",
    label: "Customer Table",
    component: dynamic(
      () => import("../components/Master/Customer/customertable"),
      {
        ssr: false,
        loading: LoadingPanel,
      },
    ),
  },

  {
    key: "driver-table",
    label: "Driver Table",
    component: dynamic(
      () => import("../components/Master/Driver/drivertable"),
      {
        ssr: false,
        loading: LoadingPanel,
      },
    ),
  },
  {
    key: "card-reel",
    label: "Card Reel",
    component: dynamic(() => import("../components/Master/cardreel"), {
      ssr: false,
      loading: LoadingPanel,
    }),
  },
  {
    key: "quotation-pdf",
    label: "Quotation PDF",
    component: dynamic(() => import("../components/Master/quotationPdf"), {
      ssr: false,
      loading: LoadingPanel,
    }),
  },
  {
    key: "country-code",
    label: "Country Code",
    component: dynamic(() => import("../components/Master/countrycode"), {
      ssr: false,
      loading: LoadingPanel,
    }),
  },
];

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<SidebarSection>("leads");
  const [activeMaster, setActiveMaster] = useState<MasterKey>("vendor");
  const [activeLeadView, setActiveLeadView] = useState<LeadView>("dashboard");
  const [activeDashboardView, setActiveDashboardView] =
    useState<DashboardView>("leads-dashboard");
  const [pendingModuleKey, setPendingModuleKey] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [activeYearKey, setActiveYearKey] = useState<string | null>(null);
  const [activeAccessKey, setActiveAccessKey] = useState<string | null>(null);

  const [userRole, setUserRole] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userSubDepartment, setUserSubDepartment] = useState<string>("");
  const [userDepartment, setUserDepartment] = useState<string>("");
  const [selectedLeadForEdit, setSelectedLeadForEdit] =
    useState<LeadRecord | null>(null);
  const [selectedLeadForRateQuotation, setSelectedLeadForRateQuotation] =
    useState<LeadRecord | null>(null);

  const resetAllReportStates = () => {};

  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(currentUserThunk());
  }, [dispatch]);

  // Handle URL search params for tab navigation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab) {
        setActiveSection("master");
        setActiveMaster(tab as MasterKey);
      }
    }
  }, []);

  // Simplified role detection logic
  useEffect(() => {
    if (currentUser) {
      const userAny = currentUser as any;

      const role = userAny.role || userAny.role_name || "user";
      const subDepartment_name =
        userAny.subDepartment_name ||
        userAny.subdepartname_name ||
        userAny.department ||
        "";
      const departmentName =
        userAny.department_name || userAny.departmentname || "";

      setUserRole(role);
      setUserName(currentUser.fullName || "User");
      setUserEmail(currentUser.role || "");
      setUserSubDepartment(subDepartment_name);
      setUserDepartment(departmentName);

      const isTelesales = subDepartment_name?.toLowerCase() === "tele-sales";
      const isPresales = subDepartment_name?.toLowerCase() === "pre-sales";
      const isTeamLeaderSales =
        isTelesales && role?.toLowerCase().includes("team leader");
      const isCityManager =
        isTelesales && role?.toLowerCase().includes("city manager");

      if (isTeamLeaderSales) {
        setActiveSection("dashboard");
        setActiveDashboardView("teamleader-dashboard");
      } else if (isCityManager) {
        setActiveSection("dashboard");
        setActiveDashboardView("citymanager-dashboard");
      } else if (isTelesales) {
        setActiveSection("dashboard");
        setActiveDashboardView("telesales-dashboard");
      } else if (isPresales) {
        setActiveSection("dashboard");
        setActiveDashboardView("presales-dashboard");
      } else {
        setActiveSection("leads");
        setActiveLeadView("dashboard");
        setActiveDashboardView("leads-dashboard");
      }

      setPendingModuleKey(null);
      resetAllReportStates();
    }
  }, [currentUser]);

  useEffect(() => {
    const handleViewLead = (event: CustomEvent<LeadRecord>) => {
      const lead = event.detail;
      if (lead) {
        setSelectedLeadForEdit(lead);
        setActiveSection("leads");
        setActiveLeadView("sales-edit-form");
        resetAllReportStates();
      }
    };

    window.addEventListener("viewLead", handleViewLead as EventListener);
    return () => {
      window.removeEventListener("viewLead", handleViewLead as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleNavigateToLeadTable = () => {
      setActiveSection("leads");
      setActiveLeadView("lead-table");
      resetAllReportStates();
    };

    window.addEventListener("navigateToLeadTable", handleNavigateToLeadTable);
    return () => {
      window.removeEventListener(
        "navigateToLeadTable",
        handleNavigateToLeadTable,
      );
    };
  }, []);

  useEffect(() => {
    const handleRateQuotation = (event: CustomEvent<{ lead: LeadRecord }>) => {
      const { lead } = event.detail;
      if (lead) {
        setSelectedLeadForRateQuotation(lead);
        setActiveSection("rate-quotation");
        setPendingModuleKey(null);
        resetAllReportStates();
      }
    };

    window.addEventListener(
      "rateQuotation",
      handleRateQuotation as EventListener,
    );
    return () => {
      window.removeEventListener(
        "rateQuotation",
        handleRateQuotation as EventListener,
      );
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const permittedMasterTabs = useMemo(() => masterTabs, []);
  const permittedMasterKeys = useMemo(
    () => permittedMasterTabs.map((tab) => tab.key) as MasterKey[],
    [permittedMasterTabs],
  );

  useEffect(() => {
    if (!permittedMasterKeys.includes(activeMaster)) {
      const fallback = permittedMasterKeys[0] ?? "vendor";
      setActiveMaster(fallback);
    }
  }, [activeMaster, permittedMasterKeys]);

  useEffect(() => {
    if (activeSection !== "leads" && activeLeadView !== "dashboard") {
      setActiveLeadView("dashboard");
    }
  }, [activeSection, activeLeadView]);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCity("");
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  const handleDashboardSelect = (key: string) => {
    setActiveDashboardView(key as DashboardView);
  };

  const handleYearSelect = (key: string) => {
    setActiveYearKey(key);
  };

  const handleAccessSelect = (key: string) => {
    setActiveAccessKey(key);
  };

  const handleSalesLeadSelect = (key: string) => {
    if (key === "sales-lead-table" || key === "sale-lead-table") {
      setPendingModuleKey(null);
      setActiveSection("leads");
      setActiveLeadView("sale-lead-table");
      resetAllReportStates();
    }
  };

  const handleSalesEditFormSelect = (key: string) => {
    if (key === "sales-edit-form") {
      setPendingModuleKey(null);
      setActiveSection("leads");
      setActiveLeadView("sales-edit-form");
      resetAllReportStates();
    }
  };

  const ActiveMasterComponent = useMemo(() => {
    if (activeSection !== "master") {
      return null;
    }
    return (
      permittedMasterTabs.find((tab) => tab.key === activeMaster)?.component ??
      null
    );
  }, [activeMaster, activeSection, permittedMasterTabs]);

  const renderFallback = (title: string, description: string) => (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
      <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
      <p className="max-w-xl mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );

  const mainContent = (() => {
    if (activeSection === "master") {
      if (pendingModuleKey) {
        return renderFallback(
          "Module coming soon",
          `The ${pendingModuleKey.replace(/-/g, " ")} module is not ready yet.`,
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
        "Select a different master module while we locate this one.",
      );
    }

    if (activeSection === "leads") {
      if (activeLeadView === "lead-form") {
        return (
          <div className="space-y-6">
            <LeadFormModule />
          </div>
        );
      }

      if (activeLeadView === "lead-table") {
        return (
          <div className="space-y-6">
            <LeadTableModule
              selectedRegion={selectedRegion}
              selectedCity={selectedCity}
            />
          </div>
        );
      }

      if (activeLeadView === "sale-lead-table") {
        return (
          <div className="space-y-6">
            <LeadSaleTableModule />
          </div>
        );
      }

      if (activeLeadView === "sales-edit-form") {
        if (!selectedLeadForEdit) {
          return renderFallback(
            "No Lead Selected",
            "Please select a lead from the table to edit.",
          );
        }
        return (
          <div className="space-y-6">
            <EditLeadFormModule
              initialData={selectedLeadForEdit}
              onSuccess={() => {
                setSelectedLeadForEdit(null);
                setActiveLeadView("sale-lead-table");
              }}
              onCancel={() => {
                setSelectedLeadForEdit(null);
                setActiveLeadView("sale-lead-table");
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

    if (activeSection === "dashboard") {
      if (activeDashboardView === "presales-dashboard") {
        return (
          <div className="space-y-6">
            <PresalesDashboardModule />
          </div>
        );
      }
      if (activeDashboardView === "telesales-dashboard") {
        return (
          <div className="space-y-6">
            <SalesTeamDashboardModule />
          </div>
        );
      }

      if (activeDashboardView === "teamleader-dashboard") {
        return (
          <div className="space-y-6">
            <TeamLeaderDashboardModule />
          </div>
        );
      }

      if (activeDashboardView === "citymanager-dashboard") {
        return (
          <div className="space-y-6">
            <CityManagerDashboardModule />
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <LeadsOverviewModule />
        </div>
      );
    }

    if (activeSection === "rate-quotation") {
      return (
        <div className="space-y-6">
          <RateQuotationTableModule leadData={selectedLeadForRateQuotation} />
        </div>
      );
    }

    return null;
  })();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 text-slate-900">
      <Navbar
        showSalesMenu={true}
        showAccess={activeSection === "access"}
        showMaster={activeSection === "master"}
        showLeadsMenu={activeSection === "leads"}
        showDashboardMenu={
          activeSection === "dashboard" && userRole?.toLowerCase() === "admin"
        }
        showYearMenu={activeSection === "leads"}
        activeSection={activeSection}
        activeMasterKey={activeMaster}
        activeLeadKey={activeLeadView === "dashboard" ? null : activeLeadView}
        activeDashboardKey={activeDashboardView}
        activeYearKey={activeYearKey}
        activeAccessKey={activeAccessKey}
        selectedRegion={selectedRegion}
        selectedCity={selectedCity}
        onRegionChange={handleRegionChange}
        onCityChange={handleCityChange}
        onDashboardSelect={handleDashboardSelect}
        onYearSelect={handleYearSelect}
        onAccessSelect={handleAccessSelect}
        onSalesLeadSelect={handleSalesLeadSelect}
        onSalesEditFormSelect={handleSalesEditFormSelect}
        onMasterSelect={(key) => {
          const targeted = permittedMasterTabs.find((tab) => tab.key === key);
          setActiveSection("master");
          resetAllReportStates();
          if (targeted) {
            setPendingModuleKey(null);
            setActiveMaster(targeted.key);
            return;
          }
          setPendingModuleKey(key);
        }}
        onLeadSelect={(key) => {
          if (key === "lead-form" || key === "lead-table") {
            setPendingModuleKey(null);
            setActiveSection("leads");
            setActiveLeadView(key);
            resetAllReportStates();
          } else if (key === "sale-lead-table") {
            handleSalesLeadSelect(key);
          }
        }}
        permittedMasterKeys={permittedMasterKeys}
        userName={userName}
        roleLabel={userRole}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeItem={activeSection}
          userRole={userRole}
          onAccessClick={() => {
            setActiveSection("access");
            setPendingModuleKey(null);
            resetAllReportStates();
          }}
          onAdminClick={() => {
            setActiveSection("admin");
            setPendingModuleKey(null);
            resetAllReportStates();
          }}
          onMasterClick={() => {
            setActiveSection("master");
            setPendingModuleKey(null);
            resetAllReportStates();
          }}
          onLeadsClick={() => {
            const isTelesales =
              userSubDepartment?.toLowerCase() === "tele-sales";
            if (isTelesales) {
              setActiveSection("leads");
              setActiveLeadView("sale-lead-table");
            } else {
              setActiveSection("leads");
              setActiveLeadView("dashboard");
            }
            setPendingModuleKey(null);
            resetAllReportStates();
          }}
          onRateQuotationClick={() => {
            setActiveSection("rate-quotation");
            setPendingModuleKey(null);
            resetAllReportStates();
          }}
          onBookingTripClick={() => {
            setActiveSection("booking-trip");
            setPendingModuleKey(null);
            resetAllReportStates();
          }}
          onPaymentClick={() => {
            setActiveSection("payment");
            setPendingModuleKey(null);
            resetAllReportStates();
          }}
          onFeedbackClick={() => {
            setActiveSection("feedback");
            setPendingModuleKey(null);
            resetAllReportStates();
          }}
          onDashboardClick={() => {
            setActiveSection("dashboard");
            setPendingModuleKey(null);
            resetAllReportStates();
          }}
        />

        <main className="flex-1 px-4 py-1 overflow-y-auto bg-white sm:px-6">
          <div className="w-full mx-auto space-y-6">{mainContent}</div>
        </main>
      </div>
    </div>
  );
}
