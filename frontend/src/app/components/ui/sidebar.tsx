"use client";

import React, { useState } from "react";
import Image from "next/image";
import siteIcon from "../../assets/SITE-ICON.png";
import pinaak from "../../assets/pinaak.jpeg";
import {
  Database,
  Search,
  FileText,
  Calendar,
  MessageSquare,
  Car,
  Monitor,
  Shield,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  activeItem?: string;
  userRole?: string;
  onMasterClick?: () => void;
  onLeadsClick?: () => void;
  onRateQuotationClick?: () => void;
  onBookingTripClick?: () => void;
  onPaymentClick?: () => void;
  onAccessClick?: () => void;
  onFeedbackClick?: () => void;
  onDashboardClick?: () => void;
  onAdminClick?: () => void;
}

const brandGradientStyle: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, #ef4444 0%, #f97316 30%, #22c55e 68%, #facc15 100%)",
};

const Sidebar: React.FC<SidebarProps> = ({
  activeItem,
  userRole,
  onMasterClick,
  onLeadsClick,
  onRateQuotationClick,
  onBookingTripClick,
  onPaymentClick,
  onAccessClick,
  onFeedbackClick,
  onDashboardClick,
  onAdminClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsExpanded(false);
  };

  const iconSize = 28;
  const sidebarWidth = isExpanded ? "280px" : "100px";

  return (
    <div
      className="h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out relative overflow-y-auto overflow-x-hidden"
      style={{ width: sidebarWidth }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo Section - Fixed height to prevent shifting */}
      {/* <div
        className={`flex items-center min-h-[90px] ${
          isExpanded
            ? "justify-start gap-3 px-4 py-3"
            : "justify-center px-2 py-3"
        }`}
      >
        <Image
          src={siteIcon}
          alt="Site Icon"
          width={isExpanded ? 50 : 44}
          height={isExpanded ? 52 : 46}
          className="object-cover shadow-sm rounded-xl transition-all duration-300 flex-shrink-0"
        />
        {isExpanded && (
          <Image
            src={pinaak}
            alt="Pinaak Logo"
            width={140}
            className="object-cover shadow-sm rounded-xl transition-all duration-300"
          />
        )}
      </div> */}

      {/* Menu Items Container */}
      <div className={`${isExpanded ? "px-3" : "px-2"} space-y-1.5 pb-4`}>
        {/* Master - Hide for Presales and Sales */}
        {userRole?.toLowerCase() !== "presale" &&
          userRole?.toLowerCase() !== "sales" && (
            <MenuItem
              icon={<Database size={isExpanded ? 26 : iconSize} />}
              label="Master"
              description="Manage all forms and data"
              isExpanded={isExpanded}
              isActive={activeItem === "master"}
              onClick={onMasterClick}
              color="orange"
            />
          )}

        {/* Leads - Show for all */}
        <MenuItem
          icon={<Search size={isExpanded ? 26 : iconSize} />}
          label="Leads"
          description="Manage leads & inquiries"
          isExpanded={isExpanded}
          isActive={activeItem === "leads"}
          onClick={onLeadsClick}
          color="green"
        />

        {/* Rate Quotation - Hide for Presales */}
        {userRole?.toLowerCase() !== "presale" && (
          <MenuItem
            icon={<FileText size={isExpanded ? 26 : iconSize} />}
            label="Rate Quotation"
            description="Generate & manage quotations"
            isExpanded={isExpanded}
            isActive={activeItem === "rate-quotation"}
            onClick={onRateQuotationClick}
            color="blue"
          />
        )}

        {/* Booking - Hide for Presales */}
        {userRole?.toLowerCase() !== "presale" && (
          <MenuItem
            icon={<Calendar size={isExpanded ? 26 : iconSize} />}
            label="Booking"
            description="Manage trip bookings"
            isExpanded={isExpanded}
            isActive={activeItem === "booking-trip"}
            onClick={onBookingTripClick}
            color="purple"
          />
        )}

        {/* Trip/Payment */}
        <MenuItem
          icon={<Car size={isExpanded ? 26 : iconSize} />}
          label="Trip"
          description="Handle payments & transactions"
          isExpanded={isExpanded}
          isActive={activeItem === "payment"}
          onClick={onPaymentClick}
          color="yellow"
        />

        {/* Feedback */}
        <MenuItem
          icon={<MessageSquare size={isExpanded ? 26 : iconSize} />}
          label="Feedback"
          description="Collect & manage feedback"
          isExpanded={isExpanded}
          isActive={activeItem === "feedback"}
          onClick={onFeedbackClick}
          color="red"
        />

        {/* Admin - Only for admin role */}
        {userRole?.toLowerCase() === "admin" && (
          <MenuItem
            icon={<Shield size={isExpanded ? 26 : iconSize} />}
            label="Admin"
            description="User management"
            isExpanded={isExpanded}
            isActive={activeItem === "admin"}
            onClick={onAdminClick}
            color="indigo"
          />
        )}

        {/* Dashboard - Only for Admin */}
        {userRole === "admin" && (
          <MenuItem
            icon={<Monitor size={isExpanded ? 26 : iconSize} />}
            label="DASHBOARD"
            description="Role-specific dashboard"
            isExpanded={isExpanded}
            isActive={activeItem === "dashboard"}
            onClick={onDashboardClick}
            color="red"
          />
        )}

        {/* Access Level - Hide for Sales and Presales */}
        {userRole?.toLowerCase() !== "sales" &&
          userRole?.toLowerCase() !== "presale" && (
            <MenuItem
              icon={<Shield size={isExpanded ? 26 : iconSize} />}
              label="Access"
              description="Access Level"
              isExpanded={isExpanded}
              isActive={activeItem === "access"}
              onClick={onAccessClick}
              color="yellow"
            />
          )}
      </div>

      {/* Collapse indicator - small chevron */}
      {!isExpanded && isHovered && (
        <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 rounded-full p-1 shadow-md animate-pulse">
          <ChevronRight size={16} className="text-gray-600" />
        </div>
      )}
    </div>
  );
};

// Separate MenuItem component for consistent alignment
interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  isExpanded: boolean;
  isActive: boolean;
  onClick?: () => void;
  color: "orange" | "green" | "blue" | "purple" | "yellow" | "red" | "indigo";
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  description,
  isExpanded,
  isActive,
  onClick,
  color,
}) => {
  const colorClasses = {
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

  const classes = colorClasses[color];

  if (isExpanded) {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all group relative
          ${classes.hoverBg} ${classes.text}
          ${isActive ? `${classes.activeBg} border-r-4 ${classes.border}` : "text-gray-700"}`}
        title={label}
      >
        <div
          className={`p-2 ${classes.bg} rounded-lg group-hover:bg-opacity-80 flex-shrink-0`}
        >
          <span className={classes.text}>{icon}</span>
        </div>
        <div className="text-left flex-1 min-w-0">
          <p className="font-extrabold text-md truncate">{label}</p>
          {/* Increased description text size from text-xs to text-sm */}
          <p className="text-sm text-gray-500 truncate">{description}</p>
        </div>
      </button>
    );
  }

  // Collapsed state
  return (
    <button
      onClick={onClick}
      className={`w-full flex flex-col items-center gap-1 py-3 px-1 rounded-lg transition-all group relative
        ${classes.hoverBg}
        ${isActive ? `${classes.activeBg} border-r-4 ${classes.border}` : ""}`}
      title={label}
    >
      <div
        className={`p-1.5 ${classes.bg} rounded-lg group-hover:bg-opacity-80`}
      >
        <span className={classes.text}>{icon}</span>
      </div>
      <span className="text-xs font-bold text-gray-600 truncate w-full text-center">
        {label}
      </span>
    </button>
  );
};

export default Sidebar;
