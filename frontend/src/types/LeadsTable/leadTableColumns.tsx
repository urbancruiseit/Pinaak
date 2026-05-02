// E:\Pinnak\PINAK_FRONTEND\src\types\leads\leadTableColumns.tsx
import React, { useMemo } from "react";
import { Eye, Edit, UserPlus } from "lucide-react";
import type { LeadRecord } from "../types";

// Import keywords from keywords.ts
import { ADDRESS_KEYWORDS, ITINERARY_KEYWORDS } from "../keywords";

// Import table constants
import {
  TABLE_BANNER_COLUMNS,
  statusClassMap,
  OCCASION_COLOR_MAP,
  SERVICE_TYPE_COLOR_MAP,
} from "./leadstabledata";

// ============ TIMEZONE HELPER ============

const IST_TIMEZONE = "Asia/Kolkata";

const getISTDateParts = (isoDateTime: string) => {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return null;

  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  const rawHour = get("hour");

  return {
    day: get("day"),
    month: get("month"),
    year: get("year"),
    hours: rawHour === "24" ? "00" : rawHour,
    minutes: get("minute"),
    date,
  };
};

const getISTHour = (isoDateTime: string): number => {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return 0;
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    hour: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const hourStr = parts.find((p) => p.type === "hour")?.value ?? "0";
  return parseInt(hourStr === "24" ? "0" : hourStr, 10);
};

// ============ EXPORT ALL HELPER FUNCTIONS ============

export const highlightAddressIfKeyword = (text: string): React.ReactNode => {
  if (!text || text === "—") return "—";
  const pattern = new RegExp(`\\b(${ADDRESS_KEYWORDS.join("|")})\\b`, "gi");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) => {
        const isKeyword = ADDRESS_KEYWORDS.some(
          (keyword) => keyword.toLowerCase() === part.toLowerCase(),
        );
        return isKeyword ? (
          <span key={index} className="text-red-600 font-bold">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </>
  );
};

export const highlightItineraryIfKeyword = (text: string): React.ReactNode => {
  if (!text || text === "—") return "—";

  const pattern = new RegExp(`\\b(${ITINERARY_KEYWORDS.join("|")})\\b`, "gi");
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, index) => {
        const isKeyword = ITINERARY_KEYWORDS.some(
          (keyword) => keyword.toLowerCase() === part.toLowerCase(),
        );
        return isKeyword ? (
          <span key={index} className="text-red-600 font-bold">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </>
  );
};

export const renderOccasion = (occasion: string): React.ReactNode => {
  if (!occasion) return "—";
  const colorClass = OCCASION_COLOR_MAP[occasion] || "text-gray-800";
  return <span className={colorClass}>{occasion}</span>;
};

export const renderServiceType = (serviceType: string): React.ReactNode => {
  if (!serviceType) return "—";
  const colorClass = SERVICE_TYPE_COLOR_MAP[serviceType] || "text-gray-800";
  return <span className={colorClass}>{serviceType}</span>;
};

export const formatDate = (isoDate: string): string => {
  if (!isoDate) return "—";
  const parts = getISTDateParts(isoDate);
  if (!parts) return isoDate;
  return `${parts.day}/${parts.month}/${parts.year}`;
};

export const formatTime24Hour = (isoDateTime?: string): string => {
  if (!isoDateTime) return "—";
  const parts = getISTDateParts(isoDateTime);
  if (!parts) return "—";
  return `${parts.hours}:${parts.minutes}`;
};

export const formatDateTime = (isoDateTime?: string): string => {
  if (!isoDateTime) return "-";
  const parts = getISTDateParts(isoDateTime);
  if (!parts) return isoDateTime;
  return `${parts.day}/${parts.month}/${parts.year}, ${parts.hours}:${parts.minutes}`;
};

export const formatTime12Hour = (isoDateTime?: string): string => {
  if (!isoDateTime) return "—";
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return "—";

  return date
    .toLocaleTimeString("en-IN", {
      timeZone: IST_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
};

export const formatTripType = (tripType: any): string => {
  if (!tripType) return "—";
  const tripTypeMap: Record<string, string> = {
    pickup: "Pickup",
    drop: "Drop",
    both: "Pickup & Drop",
    Sightseeing: "Sightseeing",
    "Point to Point": "Point to Point",
  };
  return tripTypeMap[tripType] ?? String(tripType);
};

// ============ COLUMN TYPE ============

export type LeadColumn = {
  key: string;
  label: string;
  render: (lead: LeadRecord, rowIndex?: number) => React.ReactNode;
  accessor: (lead: LeadRecord, rowIndex?: number) => string;
  sticky?: boolean;
};

interface UseLeadColumnsProps {
  handleUnwantedClick: (lead: LeadRecord, e: React.MouseEvent) => void;
  handleViewLead: (lead: LeadRecord) => void;
  setEditLead: (lead: LeadRecord | null) => void;
  handleRateQuotation?: (lead: LeadRecord, e: React.MouseEvent) => void;
}

// ============ MAIN HOOK ============

export const useLeadColumns = ({
  handleUnwantedClick,
  handleViewLead,
  setEditLead,
  handleRateQuotation,
}: UseLeadColumnsProps) => {
  return useMemo<LeadColumn[]>(() => {
    return TABLE_BANNER_COLUMNS.map((col) => ({
      key: col.key,
      label: col.label,
      render: (lead: LeadRecord, rowIndex?: number) => {
        const val = lead[col.key as keyof LeadRecord];

        // Actions Column
        if (col.key === "actions") {
          return (
            <div className="flex gap-1 justify-evenly">
              {handleRateQuotation && (
                <button
                  onClick={(e) => handleRateQuotation(lead, e)}
                  className="p-1 text-white transition-colors bg-green-600 rounded hover:bg-green-700"
                  title="Add Rate Quotation"
                >
                  <span className="text-xs font-medium">💰</span>
                </button>
              )}

              <button
                onClick={(e) => handleUnwantedClick(lead, e)}
                className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded hover:bg-red-600 flex items-center justify-center"
              >
                <span className="text-white">✕</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewLead(lead);
                }}
                className="p-1 text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
                title="View"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditLead(lead);
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }, 100);
                }}
                className="p-1 text-white transition-colors bg-yellow-600 rounded hover:bg-yellow-700"
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(
                    new CustomEvent("assignLead", { detail: lead }),
                  );
                }}
                className="p-1 text-white bg-black rounded hover:bg-gray-800"
                title="Assign"
              >
                <UserPlus size={16} />
              </button>
            </div>
          );
        }

        // Occasion Column
        if (col.key === "occasion") {
          return renderOccasion(String(val));
        }

        // Service Type Column
        if (col.key === "serviceType") {
          return renderServiceType(String(val));
        }

        // Date Column
        if (col.key === "date") {
          const dateStr = formatDate(String(val));
          const timeStr = lead.enquiryTime
            ? formatTime24Hour(lead.enquiryTime)
            : "";
          return `${dateStr} ${timeStr}`.trim();
        }

        // Status Column
        if (col.key === "status") {
          return (
            <span
              className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wider ${lead.status ? (statusClassMap[lead.status] ?? "bg-gray-100 text-gray-800") : "bg-gray-100 text-gray-800"}`}
            >
              {lead.status ? lead.status.toUpperCase() : "-"}
            </span>
          );
        }

        // Pickup DateTime Column
        if (col.key === "pickupDateTime") {
          const dateTimeStr = formatDateTime(String(val));
          const time12Hour = formatTime12Hour(lead.pickupDateTime);

          const hour = getISTHour(lead.pickupDateTime);
          const isNightTime = hour >= 17 || hour < 5;

          const pickupDate = new Date(lead.pickupDateTime);
          const currentDate = new Date();

          const toISTMidnight = (date: Date) => {
            const istStr = date.toLocaleDateString("en-CA", {
              timeZone: IST_TIMEZONE,
            });
            return new Date(istStr + "T00:00:00+05:30");
          };

          const today = toISTMidnight(currentDate);
          const pickupDateOnly = toISTMidnight(pickupDate);

          const diffTime = pickupDateOnly.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          const isNearbyDate = diffDays >= 0 && diffDays <= 2;

          return (
            <div className="relative group cursor-pointer">
              <span
                className={`px-2 py-1 rounded transition-colors
                  ${isNightTime ? "bg-red-900 text-white font-semibold" : ""}
                  ${isNearbyDate ? "text-red-900 font-bold" : "text-slate-800"}`}
              >
                {dateTimeStr}
              </span>
              {/* ✅ Upar dikhega — bottom-full */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-[9999] w-auto bg-slate-800 text-white rounded-lg shadow-xl px-3 py-2 whitespace-nowrap">
                <div className="text-xs font-semibold text-slate-300 mb-1">
                  Pickup Time (IST)
                </div>
                <div className="text-lg font-bold text-white">{time12Hour}</div>
              </div>
            </div>
          );
        }

        // Drop DateTime Column
        if (col.key === "dropDateTime") {
          const dateTimeStr = formatDateTime(String(val));
          const time12Hour = formatTime12Hour(lead.dropDateTime);
          return (
            <div className="relative group cursor-pointer">
              <span className="text-slate-800 hover:text-blue-600 transition-colors">
                {dateTimeStr}
              </span>
              {/* ✅ Upar dikhega — bottom-full */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-[9999] w-auto bg-slate-800 text-white rounded-lg shadow-xl px-3 py-2 whitespace-nowrap">
                <div className="text-xs font-semibold text-slate-300 mb-1">
                  Drop Time (IST)
                </div>
                <div className="text-lg font-bold text-white">{time12Hour}</div>
              </div>
            </div>
          );
        }

        // Trip Type Column
        if (col.key === "tripType")
          return formatTripType(val as any) || String(val);

        // Aged Column
        if (col.key === "aged") {
          const leadDate = new Date(lead.date);
          const currentDate = new Date();
          const diffTime = currentDate.getTime() - leadDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const age = diffDays >= 0 ? diffDays : 0;

          let bgClass = "";
          if (age >= 0 && age <= 5)
            bgClass = "bg-green-500 text-white px-2 py-1 rounded";
          else if (age >= 6 && age <= 10)
            bgClass = "bg-orange-500 text-white px-2 py-1 rounded";
          else if (age >= 11)
            bgClass = "bg-red-900 text-white px-2 py-1 rounded";

          return <span className={bgClass}>{String(age)}</span>;
        }

        // Live/Expiry Column
        if (col.key === "liveorexpiry") {
          if (!lead.pickupDateTime) return "—";
          const pickupDate = new Date(lead.pickupDateTime);
          const currentDate = new Date();
          const isExpired = pickupDate <= currentDate;
          return (
            <span
              className={`px-2 py-1 rounded font-bold ${isExpired ? "text-red-500" : "text-green-500"}`}
            >
              {isExpired ? "EXPIRY" : "LIVE"}
            </span>
          );
        }

        // KM Column
        if (col.key === "km") {
          if (!lead?.km) return "—";
          return (
            <span className="px-2 py-1 rounded font-bold text-white bg-black">
              {Number(lead.km).toFixed(0)}
            </span>
          );
        }

        // Days Column
        if (col.key === "days") {
          if (lead.days === null || lead.days === undefined) return "—";
          const days = Number(lead.days);
          let bgClass = "";
          if (days >= 0 && days <= 1) bgClass = "bg-red-500 text-white";
          else if (days > 1 && days <= 7) bgClass = "bg-blue-500 text-white";
          else if (days >= 8) bgClass = "bg-green-500 text-white";
          return (
            <span className={`px-2 py-1 rounded font-bold ${bgClass}`}>
              {days}
            </span>
          );
        }

        if (col.key === "passengerTotal") {
          if (lead.passengerTotal === null || lead.passengerTotal === undefined)
            return "—";
          const pax = Number(lead.passengerTotal);
          let bgClass = "";
          if (pax >= 1 && pax <= 20) bgClass = "bg-blue-500 text-white";
          else if (pax >= 21 && pax <= 53) bgClass = "bg-black text-white";
          else if (pax >= 54 && pax <= 150) bgClass = "bg-pink-500 text-white";
          else if (pax >= 151) bgClass = "bg-red-900 text-white";
          return (
            <span className={`px-2 py-1 rounded font-bold ${bgClass}`}>
              {pax}
            </span>
          );
        }

        // Vehicles Column
        if (col.key === "vehicles" && Array.isArray(val)) {
          return val
            .map((v: any) => `${v.quantity}x ${v.category} (${v.type})`)
            .join(", ");
        }

        // Itinerary Column
        if (col.key === "itinerary" && Array.isArray(val)) {
          const itineraryText = val.length > 0 ? val.join(", ") : "—";
          return highlightItineraryIfKeyword(itineraryText);
        }

        if (col.key === "fullName") {
          const showBelow = (rowIndex ?? 0) < 3;
          const positionClass = showBelow
            ? "top-full mt-1"
            : "bottom-full mb-1";
          return (
            <div className="relative group cursor-pointer">
              <span className="font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                {String(val)}
              </span>
              <div
                className={`absolute left-0 ${positionClass} hidden group-hover:block z-[9999] w-auto bg-slate-800 text-white rounded-lg shadow-xl p-3 whitespace-nowrap`}
              >
                <div className="font-semibold mb-1 border-b border-slate-600 pb-1">
                  {String(val)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-extrabold text-xl">
                    <span className="text-slate-400">📞</span>
                    <span>{lead.customerPhone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 font-extrabold text-xl">
                    <span className="text-slate-400">📞</span>
                    <span>{lead.alternatePhone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="text-slate-400">🌐</span>
                    <span>{lead.countryName || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">✉️</span>
                    <span>{lead.customerEmail || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (col.key === "requirementVehicle") {
          const requirementText =
            val !== undefined && val !== null && val !== "" ? String(val) : "—";

          const vehicle1Qty = lead.vehicle1Quantity
            ? String(lead.vehicle1Quantity)
            : "";
          const vehicle2Qty = lead.vehicle2Quantity
            ? String(lead.vehicle2Quantity)
            : "";
          const vehicle3Qty = lead.vehicle3Quantity
            ? String(lead.vehicle3Quantity)
            : "";

          const quantitiesToHighlight = [
            vehicle1Qty,
            vehicle2Qty,
            vehicle3Qty,
          ].filter((qty) => qty !== "");

          if (quantitiesToHighlight.length === 0) {
            return <span>{requirementText}</span>;
          }

          let result = requirementText;
          const parts = [];
          let globalKeyCounter = 0;

          quantitiesToHighlight.forEach((qty) => {
            if (result.includes(qty)) {
              const splitParts = result.split(qty);
              for (let i = 0; i < splitParts.length - 1; i++) {
                parts.push(splitParts[i]);
                parts.push(
                  <span
                    key={`highlight-${qty}-${globalKeyCounter++}`}
                    className="text-red-600 font-bold"
                  >
                    {qty}
                  </span>,
                );
              }
              result = splitParts[splitParts.length - 1];
            }
          });

          if (result) {
            parts.push(result);
          }

          return <span>{parts}</span>;
        }

        if (col.key === "petsNumber") {
          return (
            <div className="relative group cursor-pointer">
              <span className="font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                {String(val)}
              </span>
              {/* ✅ Upar dikhega */}
              <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-[9999] w-48 bg-slate-800 text-white rounded-lg shadow-xl p-3">
                <div className="font-semibold mb-1 border-b border-slate-600 pb-1">
                  {String(val)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-sm">
                    <span className="text-slate-400">Pets Names -</span>
                    <span>{lead.petsNames || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (col.key === "totalBaggage") {
          return (
            <div className="relative group cursor-pointer">
              <span className="font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                {String(val)}
              </span>
              {/* ✅ Upar dikhega */}
              <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-[9999] w-48 bg-slate-800 text-white rounded-lg shadow-xl p-3">
                <div className="font-semibold mb-1 border-b border-slate-600 pb-1">
                  {String(val)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-sm">
                    <span className="text-slate-400">Small Baggage -</span>
                    <span>{lead.smallBaggage || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Med Baggage -</span>
                    <span className="truncate">
                      {lead.mediumBaggage || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Large Baggage -</span>
                    <span className="truncate">{lead.largeBaggage || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Airport Baggage -</span>
                    <span className="truncate">
                      {lead.airportBaggage || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (col.key === "pickupAddress") {
          const addressText =
            val !== undefined && val !== null && val !== "" ? String(val) : "—";

          return (
            <div className="relative group cursor-pointer">
              <span className="font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                {highlightAddressIfKeyword(addressText)}
              </span>

              {/* Hover tooltip - upar dikhega */}
              <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-[9999] w-48 bg-slate-800 text-white rounded-lg shadow-xl p-3">
                <div className="font-semibold mb-1 border-b border-slate-600 pb-1">
                  {addressText}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">Multiple Pickup -</span>
                    <span className="truncate">
                      {lead.multiplepickup || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // if (col.key === "dropAddress") {
        //   const addressText =
        //     val !== undefined && val !== null && val !== "" ? String(val) : "—";
        //   return highlightAddressIfKeyword(addressText);
        // }

        if (col.key === "dropAddress") {
          const addressText =
            val !== undefined && val !== null && val !== "" ? String(val) : "—";

          return (
            <div className="relative group cursor-pointer">
              <span className="font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                {highlightAddressIfKeyword(addressText)}
              </span>

              {/* Hover tooltip - upar dikhega */}
              <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-[9999] w-48 bg-slate-800 text-white rounded-lg shadow-xl p-3">
                <div className="font-semibold mb-1 border-b border-slate-600 pb-1">
                  {addressText}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">Multiple Drop -</span>
                    <span className="truncate">{lead.multipledrop || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return val !== undefined && val !== null && val !== ""
          ? String(val)
          : "—";
      },
      accessor: (lead: LeadRecord) => {
        const val = lead[col.key as keyof LeadRecord];
        if (val === undefined || val === null) return "";
        if (typeof val === "object") return JSON.stringify(val);
        return String(val);
      },
      sticky: false,
    }));
  }, [handleUnwantedClick, handleViewLead, setEditLead, handleRateQuotation]);
};
