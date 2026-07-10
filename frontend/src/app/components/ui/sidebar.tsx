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

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux se role/loginType aur activeSection lo
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

  // loginType Redux navigation slice se aata hai (initFromRole ke through).
  // Fallback ke roop me currentUser.loginType bhi check kar lete hain, taaki
  // page refresh ke thoda pehle wale render me bhi vendor menu galti se
  // employee menu na dikhaye.
  const effectiveLoginType =
    loginType || (rawUser?.loginType as string | undefined) || "";
  const isVendor = effectiveLoginType === "vendor";

  const isPresale = role === "presale" || role === "presales";
  const isSales = role === "sales";
  const isAdvisor = role.includes("advisor") || role.includes("travel");
  const isTelesales = subDept === "tele-sales";

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

  return (
    <div
      className="h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out relative overflow-y-auto overflow-x-hidden"
      style={{ width: isExpanded ? "280px" : "100px" }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`${isExpanded ? "px-3" : "px-2"} space-y-1.5 pb-4`}>
        {isVendor ? (
          // ══════════════════════════════════════════════
          // VENDOR MENU
          // ══════════════════════════════════════════════
          <>
            {/* 👇 Naye items: Master ke andar wale hi components, vendor ko
                bhi seedha sidebar se access */}
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
          // ══════════════════════════════════════════════
          // EMPLOYEE MENU — existing behaviour, unchanged.
          // ══════════════════════════════════════════════
          <>
            {/* Master — hidden for presale & sales */}
            {!isPresale && !isSales && (
              <SidebarItem
                icon={<Database size={iconSize} />}
                label="Master"
                description="Manage all forms and data"
                isExpanded={isExpanded}
                isActive={activeSection === "master"}
                onClick={() => dispatch(setActiveSection("master"))}
                color="orange"
              />
            )}

            {/* Leads — visible to all */}
            <SidebarItem
              icon={<Search size={iconSize} />}
              label="Leads"
              description="Manage leads & inquiries"
              isExpanded={isExpanded}
              isActive={activeSection === "leads"}
              onClick={handleLeadsClick}
              color="green"
            />

            {/* Rate Quotation — hidden for presale */}
            {!isPresale && (
              <SidebarItem
                icon={<FileText size={iconSize} />}
                label="Rate Quotation"
                description="Generate & manage quotations"
                isExpanded={isExpanded}
                isActive={activeSection === "rate-quotation"}
                onClick={() => dispatch(setActiveSection("rate-quotation"))}
                color="blue"
              />
            )}

            {/* Booking — hidden for presale */}
            {!isPresale && (
              <SidebarItem
                icon={<Calendar size={iconSize} />}
                label="Booking"
                description="Manage trip bookings"
                isExpanded={isExpanded}
                isActive={activeSection === "booking-trip"}
                onClick={() => dispatch(setActiveSection("booking-trip"))}
                color="purple"
              />
            )}

            {/* Trip — visible to all */}
            <SidebarItem
              icon={<Car size={iconSize} />}
              label="Trip"
              description="Handle payments & transactions"
              isExpanded={isExpanded}
              isActive={activeSection === "payment"}
              onClick={() => dispatch(setActiveSection("payment"))}
              color="yellow"
            />

            {/* Feedback — visible to all */}
            <SidebarItem
              icon={<MessageSquare size={iconSize} />}
              label="Feedback"
              description="Collect & manage feedback"
              isExpanded={isExpanded}
              isActive={activeSection === "feedback"}
              onClick={() => dispatch(setActiveSection("feedback"))}
              color="red"
            />

            {/* Website — hidden for advisor & presale */}
            {!isAdvisor && !isPresale && (
              <SidebarItem
                icon={<Monitor size={iconSize} />}
                label="Website"
                description="Manage website content"
                isExpanded={isExpanded}
                isActive={activeSection === "website"}
                onClick={() => {
                  dispatch(setActiveWebsiteView("gac"));
                }}
                color="red"
              />
            )}

            {/* Download Report — hidden for advisor & presale */}
            {!isAdvisor && !isPresale && (
              <SidebarItem
                icon={<Download size={iconSize} />}
                label="Download Report"
                description="Download & export reports"
                isExpanded={isExpanded}
                isActive={activeSection === "download-report"}
                onClick={() => dispatch(setActiveSection("download-report"))}
                color="indigo"
              />
            )}
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

// ─── SidebarItem ─────────────────────────────────────────────────────────────

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
