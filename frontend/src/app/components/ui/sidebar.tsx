"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import {
  setActiveSection,
  setActiveLeadView,
  setActiveWebsiteView,
} from "../../features/Navigation/navigationSlice";
import {
  Database,
  Search,
  FileText,
  Calendar,
  MessageSquare,
  Car,
  Monitor,
  Download,
  ChevronRight,
  FileBadge,
  UserCircle,
  Truck,
  Users,
  Store,
} from "lucide-react";

type Color =
  | "orange"
  | "green"
  | "blue"
  | "purple"
  | "yellow"
  | "red"
  | "indigo";

const colorMap: Record<
  Color,
  {
    bg: string;
    hoverBg: string;
    text: string;
    border: string;
    activeBg: string;
  }
> = {
  orange: {
    bg: "bg-orange-100",
    hoverBg: "hover:bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-500",
    activeBg: "bg-orange-50",
  },
  green: {
    bg: "bg-green-100",
    hoverBg: "hover:bg-green-50",
    text: "text-green-600",
    border: "border-green-500",
    activeBg: "bg-green-50",
  },
  blue: {
    bg: "bg-blue-100",
    hoverBg: "hover:bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-500",
    activeBg: "bg-blue-50",
  },
  purple: {
    bg: "bg-purple-100",
    hoverBg: "hover:bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-500",
    activeBg: "bg-purple-50",
  },
  yellow: {
    bg: "bg-yellow-100",
    hoverBg: "hover:bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-500",
    activeBg: "bg-yellow-50",
  },
  red: {
    bg: "bg-red-100",
    hoverBg: "hover:bg-red-50",
    text: "text-red-600",
    border: "border-red-500",
    activeBg: "bg-red-50",
  },
  indigo: {
    bg: "bg-indigo-100",
    hoverBg: "hover:bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-500",
    activeBg: "bg-indigo-50",
  },
};
// Menu access ke liye supported role-tags. Ye woh "canonical" names hain
// jo employeeMenuItems ke `allowedRoles` array me use honge.
type RoleTag =
  | "advisor"
  | "manager"
  | "presale"
  | "tele-sales"
  | "seo-executive";

const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const activeSection = useSelector(
    (state: RootState) => state.navigation.activeSection,
  );
  const loginType = useSelector(
    (state: RootState) => state.navigation.loginType,
  );

  const rawUser = (currentUser as any) ?? {};
  const role = (rawUser?.role ?? rawUser?.data?.role ?? "").toLowerCase();
  const subDept = (
    rawUser?.subDepartment ??
    rawUser?.data?.subDepartment ??
    ""
  ).toLowerCase();
  const departmentName = (
    rawUser?.department_name ??
    rawUser?.data?.department_name ??
    ""
  ).toLowerCase();
  const roleName = (
    rawUser?.role_name ??
    rawUser?.data?.role_name ??
    ""
  ).toLowerCase();

  const effectiveLoginType =
    loginType || (rawUser?.loginType as string | undefined) || "";
  const isVendor = effectiveLoginType === "vendor";

  // ══════════════════════════════════════════════
  // ROLE DETECTION — inputs se derive karte hain,
  // par final access ALLOW-LIST (userRoleTags) se decide hota hai
  // ══════════════════════════════════════════════
  const isPresale =
    role.includes("presale") ||
    role.includes("pre-sale") ||
    roleName.includes("presale") ||
    roleName.includes("pre-sale");

  const isAdvisor = role.includes("advisor") || role.includes("travel");
  const isManager = role.includes("manager") || roleName.includes("manager");
  const isTelesales = subDept === "tele-sales";

  const isSeoExecutiveDigitalMarketing =
    departmentName === "digital marketing" && roleName === "seo executive";

  // User ke paas jo bhi role-tags match hote hain, unka list.
  // Menu items sirf isi list ke against check honge (whitelist).
  const userRoleTags: RoleTag[] = [
    isAdvisor && "advisor",
    isManager && "manager",
    isPresale && "presale",
    isTelesales && "tele-sales",
    isSeoExecutiveDigitalMarketing && "seo-executive",
  ].filter(Boolean) as RoleTag[];

  const hasAccess = (allowedRoles: RoleTag[]) =>
    allowedRoles.some((r) => userRoleTags.includes(r));

  const [isExpanded, setIsExpanded] = useState(false);
  const iconSize = isExpanded ? 26 : 28;

  const handleLeadsClick = () => {
    if (isTelesales) {
      dispatch(setActiveLeadView("sale-lead-table"));
    } else {
      dispatch(setActiveSection("leads"));
      dispatch(setActiveLeadView("dashboard" as any));
    }
  };

  // ══════════════════════════════════════════════
  // EMPLOYEE MENU ITEMS — ab whitelist (allowedRoles) driven
  // ══════════════════════════════════════════════
  const employeeMenuItems = [
    {
      key: "master",
      icon: <Database size={iconSize} />,
      label: "Master",
      description: "Manage all forms and data",
      isActive: activeSection === "master",
      onClick: () => dispatch(setActiveSection("master")),
      color: "orange" as Color,
      allowedRoles: ["advisor", "manager"] as RoleTag[],
    },
    {
      key: "leads",
      icon: <Search size={iconSize} />,
      label: "Leads",
      description: "Manage leads & inquiries",
      isActive: activeSection === "leads",
      onClick: handleLeadsClick,
      color: "green" as Color,
      allowedRoles: [
        "presale",
        "tele-sales",
        "seo-executive",
        "advisor",
        "manager",
      ] as RoleTag[],
    },
    {
      key: "rate-quotation",
      icon: <FileText size={iconSize} />,
      label: "Rate Quotation",
      description: "Generate & manage quotations",
      isActive: activeSection === "rate-quotation",
      onClick: () => dispatch(setActiveSection("rate-quotation")),
      color: "blue" as Color,
      allowedRoles: ["advisor", "manager"] as RoleTag[],
    },
    {
      key: "booking-trip",
      icon: <Calendar size={iconSize} />,
      label: "Booking",
      description: "Manage trip bookings",
      isActive: activeSection === "booking-trip",
      onClick: () => dispatch(setActiveSection("booking-trip")),
      color: "purple" as Color,
      allowedRoles: ["advisor", "manager", "presale"] as RoleTag[],
    },
    {
      key: "payment",
      icon: <Car size={iconSize} />,
      label: "Trip",
      description: "Handle payments & transactions",
      isActive: activeSection === "payment",
      onClick: () => dispatch(setActiveSection("payment")),
      color: "yellow" as Color,
      allowedRoles: ["advisor", "manager", "presale"] as RoleTag[],
    },
    {
      key: "feedback",
      icon: <MessageSquare size={iconSize} />,
      label: "Feedback",
      description: "Collect & manage feedback",
      isActive: activeSection === "feedback",
      onClick: () => dispatch(setActiveSection("feedback")),
      color: "red" as Color,
      allowedRoles: [
        "advisor",
        "manager",
        "presale",
        "seo-executive",
      ] as RoleTag[],
    },
    {
      key: "website",
      icon: <Monitor size={iconSize} />,
      label: "Website",
      description: "Manage website content",
      isActive: activeSection === "website",
      onClick: () => dispatch(setActiveWebsiteView("gac")),
      color: "red" as Color,
      allowedRoles: ["manager", "presale"] as RoleTag[],
    },
    {
      key: "download-report",
      icon: <Download size={iconSize} />,
      label: "Download Report",
      description: "Download & export reports",
      isActive: activeSection === "download-report",
      onClick: () => dispatch(setActiveSection("download-report")),
      color: "indigo" as Color,
      allowedRoles: ["manager"] as RoleTag[],
    },
  ].filter((item) => hasAccess(item.allowedRoles));

  return (
    <div
      className="absolute top-0 left-0 z-40 h-full bg-white border-r border-gray-200 shadow-xl transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden"
      style={{ width: isExpanded ? "280px" : "100px" }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`${isExpanded ? "px-3" : "px-2"} space-y-1.5 pb-4`}>
        {isVendor ? (
          <>
            <SidebarItem
              icon={<Store size={iconSize} />}
              label="Dashboard"
              description="Vendor overview & stats"
              isExpanded={isExpanded}
              isActive={activeSection === "venderDashboard"}
              onClick={() => dispatch(setActiveSection("venderDashboard"))}
              color="indigo"
            />
            <SidebarItem
              icon={<Car size={iconSize} />}
              label="Trip / Booking"
              description="View & manage your trips"
              isExpanded={isExpanded}
              isActive={activeSection === "booking-trip"}
              onClick={() => dispatch(setActiveSection("booking-trip"))}
              color="purple"
            />
            <SidebarItem
              icon={<FileBadge size={iconSize} />}
              label="Vehicle Documents"
              description="Manage vehicle documents"
              isExpanded={isExpanded}
              isActive={activeSection === "vehicle-documents"}
              onClick={() => dispatch(setActiveSection("vehicle-documents"))}
              color="blue"
            />
            <SidebarItem
              icon={<UserCircle size={iconSize} />}
              label="Vendor Profile"
              description="View & edit your profile"
              isExpanded={isExpanded}
              isActive={activeSection === "vendor-profile"}
              onClick={() => dispatch(setActiveSection("vendor-profile"))}
              color="orange"
            />
            <SidebarItem
              icon={<Truck size={iconSize} />}
              label="Vehicles"
              description="Manage your vehicles"
              isExpanded={isExpanded}
              isActive={activeSection === "vehicles"}
              onClick={() => dispatch(setActiveSection("vehicles"))}
              color="yellow"
            />
            <SidebarItem
              icon={<Users size={iconSize} />}
              label="Driver"
              description="Manage your drivers"
              isExpanded={isExpanded}
              isActive={activeSection === "driver"}
              onClick={() => dispatch(setActiveSection("driver"))}
              color="green"
            />
            <SidebarItem
              icon={<FileText size={iconSize} />}
              label="Rate Quotation"
              description="Generate & manage quotations"
              isExpanded={isExpanded}
              isActive={activeSection === "rate-quotation"}
              onClick={() => dispatch(setActiveSection("rate-quotation"))}
              color="blue"
            />
            <SidebarItem
              icon={<Calendar size={iconSize} />}
              label="Booking"
              description="Manage trip bookings"
              isExpanded={isExpanded}
              isActive={activeSection === "booking-trip"}
              onClick={() => dispatch(setActiveSection("booking-trip"))}
              color="purple"
            />
            <SidebarItem
              icon={<Car size={iconSize} />}
              label="Trip"
              description="Handle payments & transactions"
              isExpanded={isExpanded}
              isActive={activeSection === "payment"}
              onClick={() => dispatch(setActiveSection("payment"))}
              color="yellow"
            />
          </>
        ) : (
          <>
            {employeeMenuItems.map((item) => (
              <SidebarItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                description={item.description}
                isExpanded={isExpanded}
                isActive={item.isActive}
                onClick={item.onClick}
                color={item.color}
              />
            ))}
          </>
        )}
      </div>

      {!isExpanded && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-1 shadow-md animate-pulse">
          <ChevronRight size={16} className="text-gray-600" />
        </div>
      )}
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  isExpanded: boolean;
  isActive: boolean;
  onClick: () => void;
  color: Color;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  description,
  isExpanded,
  isActive,
  onClick,
  color,
}) => {
  const c = colorMap[color];

  if (isExpanded) {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all group relative ${c.hoverBg} ${isActive ? `${c.activeBg} border-r-4 ${c.border}` : "text-gray-700"}`}
      >
        <div
          className={`p-2 ${c.bg} rounded-lg group-hover:bg-opacity-80 flex-shrink-0`}
        >
          <span className={c.text}>{icon}</span>
        </div>
        <div className="text-left flex-1 min-w-0">
          <p className="font-extrabold text-md truncate">{label}</p>
          <p className="text-sm text-gray-500 truncate">{description}</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex flex-col items-center gap-1 py-3 px-1 rounded-lg transition-all group relative ${c.hoverBg} ${isActive ? `${c.activeBg} border-r-4 ${c.border}` : ""}`}
    >
      <div className={`p-1.5 ${c.bg} rounded-lg group-hover:bg-opacity-80`}>
        <span className={c.text}>{icon}</span>
      </div>
      <span className="text-xs font-bold text-gray-600 truncate w-full text-center">
        {label}
      </span>
    </button>
  );
};

export default Sidebar;
