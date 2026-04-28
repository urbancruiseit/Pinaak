"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { createPortal } from "react-dom";
import SalesEditLeadForm from "../telesales/salesEditLeadForm";
import type { LeadRecord } from "../../../types/types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";

import Pagination from "../ui/pagination";
import LeadDetailsModel from "../DetailModel/LeadModel/leadTabledetailsmodel";
import {
  TABLE_BANNER_COLUMNS,
  BANNER_GROUP_LIGHT_BG_CLASS,
  BANNER_GROUP_BG_CLASS,
  statusClassMap,
  LEAD_STATUS_OPTIONS,
  MONTH_OPTIONS,
} from "../../../types/LeadsTable/leadstabledata";
import {
  fetchMyAssignedLeads,
  fetchMyLeadStatusCount,
} from "@/app/features/access/accessSlice";

import { Eye, Edit } from "lucide-react";
import {
  useLeadColumns,
  type LeadColumn,
} from "../../../types/LeadsTable/leadTableColumns";

const CITY_OPTIONS = [
  "Delhi",
  "Mumbai",
  "Chandigarh",
  "Varanasi",
  "Prayagraj",
] as const;
const YEAR_OPTIONS = ["All", "2025", "2026", "2027", "2028"] as const;

export default function LeadsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | LeadRecord["status"]
  >("All");
  const [cityFilter, setCityFilter] = useState<
    "All" | (typeof CITY_OPTIONS)[number]
  >("All");
  const [yearFilter, setYearFilter] =
    useState<(typeof YEAR_OPTIONS)[number]>("All");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [startType, setStartType] = useState("text");
  const [endType, setEndType] = useState("text");
  const [detailLead, setDetailLead] = useState<LeadRecord | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [freezeKey, setFreezeKey] = useState<string | null>(null);
  const [selectedPax, setSelectedPax] = useState<number[]>([]);
  const [paxOpen, setPaxOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const paxBtnRef = useRef<HTMLButtonElement>(null);
  const daysBtnRef = useRef<HTMLButtonElement>(null);
  const [daysOpen, setDaysOpen] = useState(false);
  const [paxDropdownStyle, setPaxDropdownStyle] = useState<React.CSSProperties>(
    {},
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [daysDropdownStyle, setDaysDropdownStyle] =
    useState<React.CSSProperties>({});

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 14;

  const dispatch = useDispatch<AppDispatch>();
  const { leads, loading, error, page, monthlyStats } = useSelector(
    (state: RootState) => state.travelAdvisor.assignedLeads,
  );

  const { leadStatus } = useSelector((state: RootState) => state.travelAdvisor);
  console.log("Assigned Leads State:", leadStatus);
  // ─── Data Fetching ───────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchMyLeadStatusCount());
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchMyAssignedLeads(currentPage));
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch, currentPage]);

  useEffect(() => {
    dispatch(fetchMyAssignedLeads(currentPage));
  }, [dispatch, currentPage]);

  useEffect(() => {
    const handleLeadSubmitted = () => {
      dispatch(fetchMyAssignedLeads(currentPage));
    };
    window.addEventListener("leadSubmitted", handleLeadSubmitted);
    return () =>
      window.removeEventListener("leadSubmitted", handleLeadSubmitted);
  }, [dispatch, currentPage]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const togglePax = () => {
    if (!paxOpen) {
      const rect = paxBtnRef.current?.getBoundingClientRect();
      if (rect) {
        setPaxDropdownStyle({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }
    setPaxOpen((prev) => !prev);
  };

  const toggleDays = () => {
    if (!daysOpen) {
      const rect = daysBtnRef.current?.getBoundingClientRect();
      if (rect) {
        setDaysDropdownStyle({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }
    setDaysOpen((prev) => !prev);
  };

  // ─── Click Outside Dropdowns ─────────────────────────────────────────────────

  const daysDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (daysDropdownRef.current?.contains(event.target as Node)) return;
      if (
        daysBtnRef.current &&
        !daysBtnRef.current.contains(event.target as Node)
      ) {
        setDaysOpen(false);
      }
    };
    if (daysOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [daysOpen]);

  const paxDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paxDropdownRef.current?.contains(event.target as Node)) return;
      if (
        paxBtnRef.current &&
        !paxBtnRef.current.contains(event.target as Node)
      ) {
        setPaxOpen(false);
      }
    };
    if (paxOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [paxOpen]);

  const hookColumns = useLeadColumns({
    handleUnwantedClick: () => {},
    handleViewLead: () => {},
    setEditLead: () => {},
  });

  const actionsColumn: LeadColumn = {
    key: "actions",
    label: "Actions",
    render: (lead: LeadRecord) => (
      <div className="flex gap-1 justify-evenly">
        {/* Rate Quotation */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(
              new CustomEvent("rateQuotation", {
                detail: { lead, action: "navigate" },
              }),
            );
          }}
          className="px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded hover:bg-green-700 flex items-center justify-center"
          title="Add Rate Quotation"
        >
          💰
        </button>

        {/* View */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDetailLead(lead);
            setIsDetailModalOpen(true);
          }}
          className="px-2 py-1 text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center justify-center"
          title="View"
        >
          <Eye size={14} />
        </button>

        {/* Edit */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDetailLead(lead);
            setIsEditMode(true);
          }}
          className="px-2 py-1 text-white bg-yellow-900 rounded hover:bg-yellow-950 flex items-center justify-center"
          title="Edit"
        >
          <Edit size={14} />
        </button>
      </div>
    ),
    accessor: () => "",
    sticky: false,
  };

  // Hook ke non-actions columns + apna custom actions column
  const columns: LeadColumn[] = useMemo(() => {
    const withoutActions = hookColumns.filter((col) => col.key !== "actions");
    return [actionsColumn, ...withoutActions];
  }, [hookColumns, detailLead]);

  // ─── Banner Columns Meta ─────────────────────────────────────────────────────

  const bannerColumnsMeta = useMemo(() => {
    const meta = columns
      .map((column, index) => {
        const bannerCol = TABLE_BANNER_COLUMNS.find(
          (c) => c.key === column.key,
        );
        const groupLabel = bannerCol?.groupLabel;
        const headerBgClass = groupLabel
          ? (BANNER_GROUP_LIGHT_BG_CLASS[groupLabel] ?? "bg-slate-50")
          : "bg-slate-50";

        return { ...column, index, headerBgClass, groupLabel };
      })
      .filter(Boolean) as (LeadColumn & {
      index: number;
      headerBgClass: string;
      groupLabel?: string;
    })[];

    return meta.sort((a, b) => a.index - b.index);
  }, [columns]);

  // ─── Freeze Logic ────────────────────────────────────────────────────────────

  const freezeIndex = useMemo(() => {
    if (!freezeKey) return -1;
    return columns.findIndex((column) => column.key === freezeKey);
  }, [columns, freezeKey]);

  useEffect(() => {
    if (!freezeKey) return;
    if (freezeIndex === -1) setFreezeKey(null);
  }, [freezeIndex, freezeKey]);

  // ─── Filter Options ──────────────────────────────────────────────────────────

  const statusOptions: ("All" | LeadRecord["status"])[] = [
    "All",
    ...LEAD_STATUS_OPTIONS,
  ];
  const cityOptions: ("All" | (typeof CITY_OPTIONS)[number])[] = [
    "All",
    ...CITY_OPTIONS,
  ];

  // ─── Filtered Leads ──────────────────────────────────────────────────────────

  const filteredLeads = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const startDate = startMonth ? new Date(startMonth) : null;
    const endDate = endMonth ? new Date(`${endMonth}T23:59:59`) : null;

    return leads.filter((lead) => {
      if (statusFilter !== "All" && lead.status !== statusFilter) return false;
      if (cityFilter !== "All" && lead.city !== cityFilter) return false;

      if (yearFilter !== "All") {
        if (!lead.pickupDateTime) return false;
        const leadYear = new Date(lead.pickupDateTime).getFullYear().toString();
        if (leadYear !== yearFilter) return false;
      }

      if (selectedMonth) {
        if (!lead.pickupDateTime) return false;
        const leadMonth = new Date(lead.pickupDateTime).getMonth() + 1;
        if (leadMonth !== parseInt(selectedMonth)) return false;
      }

      if (term) {
        const haystack = [
          lead.customerName,
          lead.companyName,
          lead.city,
          lead.source,
          lead.tripType,
          lead.customerType,
          lead.customerCategoryType,
          lead.serviceType,
          lead.occasion,
          lead.vehicle2,
          lead.vehicle3,
          lead.requirementVehicle,
          lead.vehicles,
          lead.itinerary?.join(" ") ?? "",
          lead.customerEmail,
          lead.customerPhone,
          lead.telecaller,
          lead.petsNames ?? "",
          lead.pickupAddress,
          lead.dropAddress,
          lead.remarks,
          lead.km ? String(lead.km) : "",
          lead.days ? String(lead.days) : "",
          lead.aged ? String(lead.aged) : "",
          lead.liveorexpiry ? String(lead.liveorexpiry) : "",
          lead.passengerTotal ? String(lead.passengerTotal) : "",
          lead.totalBaggage ? String(lead.totalBaggage) : "",
          lead.smallBaggage ? String(lead.smallBaggage) : "",
          lead.mediumBaggage ? String(lead.mediumBaggage) : "",
          lead.largeBaggage ? String(lead.largeBaggage) : "",
          lead.airportBaggage ? String(lead.airportBaggage) : "",
        ];
        const hasMatch = haystack.some(
          (value) => value && value.toLowerCase().includes(term),
        );
        if (!hasMatch) return false;
      }

      if (startDate || endDate) {
        if (!lead.pickupDateTime) return false;
        const pickupDate = new Date(lead.pickupDateTime);
        if (startDate && pickupDate < startDate) return false;
        if (endDate && pickupDate > endDate) return false;
      }

      if (
        selectedPax.length > 0 &&
        !selectedPax.includes(Number(lead.passengerTotal))
      )
        return false;
      if (selectedDays.length > 0 && !selectedDays.includes(Number(lead.days)))
        return false;

      return true;
    });
  }, [
    leads,
    statusFilter,
    cityFilter,
    yearFilter,
    selectedMonth,
    searchTerm,
    startMonth,
    endMonth,
    selectedPax,
    selectedDays,
  ]);

  // ─── Frozen / Scrollable Columns ─────────────────────────────────────────────

  const frozenColumns = useMemo(
    () => bannerColumnsMeta.slice(0, freezeIndex + 1),
    [bannerColumnsMeta, freezeIndex],
  );

  const scrollableColumns = useMemo(
    () => bannerColumnsMeta.slice(freezeIndex + 1),
    [bannerColumnsMeta, freezeIndex],
  );

  // ─── Banner Groups ───────────────────────────────────────────────────────────

  const getBannerGroups = (cols: typeof bannerColumnsMeta) => {
    const groups: Array<{ id: string; label: string; colSpan: number }> = [];
    let currentGroup: { id: string; label: string; colSpan: number } | null =
      null;

    const finishGroup = () => {
      if (currentGroup) {
        groups.push(currentGroup);
        currentGroup = null;
      }
    };

    cols.forEach((column) => {
      if (!column.groupLabel) {
        finishGroup();
        groups.push({ id: `empty-${column.key}`, label: "", colSpan: 1 });
        return;
      }
      if (!currentGroup || currentGroup.label !== column.groupLabel) {
        finishGroup();
        currentGroup = {
          id: `${column.groupLabel}-${column.index}`,
          label: column.groupLabel,
          colSpan: 1,
        };
      } else {
        currentGroup.colSpan += 1;
      }
    });
    finishGroup();
    return groups;
  };

  const leftBannerGroups = useMemo(
    () => getBannerGroups(frozenColumns),
    [frozenColumns],
  );
  const rightBannerGroups = useMemo(
    () => getBannerGroups(scrollableColumns),
    [scrollableColumns],
  );

  // ─── Stats ───────────────────────────────────────────────────────────────────

  const totalLeadsCount = leadStatus?.totalLeads || 0;
  const newLeads = Number(leadStatus?.statusCount?.NEW ?? 0);
  const kycLeads = Number(leadStatus?.statusCount?.KYC ?? 0);
  const rfqLeads = Number(leadStatus?.statusCount?.RFQ ?? 0);
  const hotLeads = Number(leadStatus?.statusCount?.HOT ?? 0);
  const vehnLeads = Number(leadStatus?.statusCount?.["VEH-N"] ?? 0); // ← capital N
  const lostLeads = Number(leadStatus?.statusCount?.LOST ?? 0);
  const bookLeads = Number(leadStatus?.statusCount?.BOOK ?? 0);
  const blankLeads = 0; // not in API response, keep as 0

  const pct = (n: number) =>
    totalLeadsCount > 0 ? ((n / totalLeadsCount) * 100).toFixed(1) : "0.0";

  // ─── Table Section Renderer ──────────────────────────────────────────────────

  const renderTableSection = (
    cols: typeof bannerColumnsMeta,
    banners: typeof leftBannerGroups,
    isLeft: boolean,
  ) => (
    <div
      className={`overflow-x-auto custom-scrollbar ${isLeft ? "border-r border-white" : ""}`}
      style={{ maxWidth: "100%" }}
    >
      <table className="min-w-full text-xs border border-collapse border-white sm:text-sm">
        <thead>
          <tr>
            {banners.map((group) => {
              const groupBgClass = group.label
                ? (BANNER_GROUP_BG_CLASS[group.label] ?? "bg-slate-900")
                : "bg-white border-b-0";
              return (
                <th
                  key={group.id}
                  colSpan={group.colSpan}
                  className={`p-1 sticky top-0 z-30 ${group.label ? "border border-white" : ""} ${groupBgClass}`}
                >
                  {group.label && (
                    <div className="px-2 py-1 text-[18px] font-black uppercase tracking-[0.35em] text-white">
                      {group.label}
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
          <tr>
            {cols.map((column) => {
              const bannerCol = TABLE_BANNER_COLUMNS.find(
                (c) => c.key === column.key,
              );
              const groupLabel = bannerCol?.groupLabel;
              const headerBgClass = groupLabel
                ? (BANNER_GROUP_BG_CLASS[groupLabel] ?? "bg-slate-900")
                : "bg-slate-900";

              return (
                <th
                  key={column.key}
                  scope="col"
                  className={`sticky top-[30px] border border-white ${headerBgClass} px-1 text-left text-[11px] font-bold uppercase tracking-wide text-white sm:text-xs z-20 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1)]`}
                >
                  <div className="relative flex items-center justify-between w-full">
                    <span className="text-center w-full">{column.label}</span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                className="text-sm font-semibold text-center border border-white text-slate-500"
                colSpan={cols.length}
              >
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td
                className="px-4 text-sm font-semibold text-center border border-white text-rose-500"
                colSpan={cols.length}
              >
                Error: {error}
              </td>
            </tr>
          ) : filteredLeads.length === 0 ? (
            <tr>
              <td
                className="px-4 text-sm font-semibold text-center border border-white text-slate-500"
                colSpan={cols.length}
              >
                No leads.
              </td>
            </tr>
          ) : (
            filteredLeads.map((lead, rowIndex) => (
              <tr
                key={lead.id}
                className={rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}
              >
                {cols.map((column) => {
                  const isAddress =
                    column.key === "pickupAddress" ||
                    column.key === "dropAddress" ||
                    column.key === "itinerary";

                  return (
                    <td
                      key={column.key}
                      className={`
                        whitespace-nowrap border border-white text-slate-800 md:px-2 md:py-1
                        ${isAddress ? "text-[12px] !font-normal" : "text-sm font-extrabold"}
                        ${column.headerBgClass}
                      `.trim()}
                    >
                      {column.render(lead, rowIndex)}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // ─── Edit Mode View ──────────────────────────────────────────────────────────

  if (detailLead && isEditMode) {
    return (
      <div className="w-full">
        <SalesEditLeadForm
          initialData={detailLead}
          isEditMode={isEditMode}
          onSuccess={() => {
            setDetailLead(null);
            setIsEditMode(false);
            dispatch(fetchMyAssignedLeads(1));
          }}
          onCancel={() => {
            setDetailLead(null);
            setIsEditMode(false);
          }}
        />
      </div>
    );
  }

  // ─── Main Render ─────────────────────────────────────────────────────────────

  return (
    <>
      <div className="w-full overflow-auto">
        {/* Stats Header */}
        <div className="p-3 bg-orange-100 rounded-md">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="border-l-8 border rounded-lg border-orange-500 bg-white px-3">
              <h2 className="text-2xl md:text-4xl font-bold text-left text-orange-600 whitespace-nowrap">
                Lead Manager
              </h2>
              <p className="text-2xl md:text-2xl mt-1 text-md text-center text-orange-700">
                (Tele-Sales)
              </p>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 w-full md:w-auto items-center mr-28">
              <div className="flex flex-col items-center justify-center bg-black px-2 py-2 mr-6 rounded-lg shadow-md border border-white min-w-[80px] h-20">
                <div className="font-extrabold text-sm text-white">
                  Total Leads
                </div>
                <div className="text-lg font-extrabold text-white">
                  {totalLeadsCount}
                </div>
                <div className="text-md text-white">(100.0%)</div>
              </div>

              {[
                {
                  label: "NEW",
                  count: newLeads,
                  p: pct(newLeads),
                  bg: "bg-blue-200",
                  border: "border-sky-800",
                  text: "text-black",
                },
                {
                  label: "KYC",
                  count: kycLeads,
                  p: pct(kycLeads),
                  bg: "bg-orange-200",
                  border: "border-orange-800",
                  text: "text-orange-950",
                },
                {
                  label: "RFQ",
                  count: rfqLeads,
                  p: pct(rfqLeads),
                  bg: "bg-blue-300",
                  border: "border-blue-800",
                  text: "text-blue-950",
                },
                {
                  label: "HOT",
                  count: hotLeads,
                  p: pct(hotLeads),
                  bg: "bg-purple-200",
                  border: "border-purple-800",
                  text: "text-purple-950",
                },
                {
                  label: "VEH-N",
                  count: vehnLeads,
                  p: pct(vehnLeads),
                  bg: "bg-pink-200",
                  border: "border-pink-900",
                  text: "text-pink-950",
                },
                {
                  label: "LOST",
                  count: lostLeads,
                  p: pct(lostLeads),
                  bg: "bg-red-500",
                  border: "border-red-600",
                  text: "text-white",
                },
                {
                  label: "BOOK",
                  count: bookLeads,
                  p: pct(bookLeads),
                  bg: "bg-green-800",
                  border: "border-green-800",
                  text: "text-white",
                },
              ].map(({ label, count, p, bg, border, text }) => (
                <div
                  key={label}
                  className={`flex flex-col items-center justify-center ${bg} px-2 py-2 rounded-lg shadow-md border ${border} min-w-[80px] h-20`}
                >
                  <div className={`font-extrabold text-xl ${text}`}>
                    {label}
                  </div>
                  <div className={`font-extrabold ${text}`}>{count}</div>
                  <div className={`text-md ${text}`}>{p}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Filter Section */}
        <div className="sticky md:top-28 z-3 bg-white shadow-sm rounded-2xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {/* Search */}
            <div className="flex flex-col gap-1">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
                className="w-full px-3 py-2 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-1">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as typeof statusFilter)
                }
                className="w-full px-3 py-2 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="All">All Statuses</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div className="flex flex-col gap-1">
              <select
                value={cityFilter}
                onChange={(e) =>
                  setCityFilter(e.target.value as typeof cityFilter)
                }
                className="w-full px-3 py-2 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="All">All City</option>
                {cityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Pax Dropdown */}
            <div className="relative flex flex-col gap-1">
              <button
                ref={paxBtnRef}
                onClick={togglePax}
                className="w-full px-3 h-9 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 text-left flex justify-between items-center bg-white"
              >
                {selectedPax.length > 0
                  ? `${selectedPax.length} Pax Selected`
                  : "Select Pax"}
                <span>▾</span>
              </button>
              {paxOpen &&
                typeof document !== "undefined" &&
                createPortal(
                  <div
                    ref={paxDropdownRef}
                    className="absolute z-[9999] bg-white border rounded-lg shadow max-h-60 overflow-y-auto"
                    style={paxDropdownStyle}
                  >
                    <label className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer">
                      <button
                        onClick={() => setSelectedPax([])}
                        className="text-sm text-red-600 font-semibold hover:underline"
                      >
                        Clear All
                      </button>
                    </label>
                    {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
                      <label
                        key={num}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPax.includes(num)}
                          onChange={() =>
                            setSelectedPax((prev) =>
                              prev.includes(num)
                                ? prev.filter((v) => v !== num)
                                : [...prev, num],
                            )
                          }
                        />
                        <span className="text-sm text-black">{num} Pax</span>
                      </label>
                    ))}
                  </div>,
                  document.body,
                )}
            </div>

            {/* Days Dropdown */}
            <div className="relative flex flex-col gap-1">
              <button
                ref={daysBtnRef}
                onClick={toggleDays}
                className="w-full px-3 h-9 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 text-left flex justify-between items-center bg-white"
              >
                {selectedDays.length > 0
                  ? `${selectedDays.length} Days Selected`
                  : "Select Days"}
                <span>▾</span>
              </button>
              {daysOpen &&
                typeof document !== "undefined" &&
                createPortal(
                  <div
                    ref={daysDropdownRef}
                    className="absolute z-[9999] bg-white border rounded-lg shadow max-h-60 overflow-y-auto"
                    style={daysDropdownStyle}
                  >
                    <label className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer">
                      <button
                        onClick={() => setSelectedDays([])}
                        className="text-sm text-red-600 font-semibold hover:underline"
                      >
                        Clear All
                      </button>
                    </label>
                    {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
                      <label
                        key={num}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDays.includes(num)}
                          onChange={() =>
                            setSelectedDays((prev) =>
                              prev.includes(num)
                                ? prev.filter((v) => v !== num)
                                : [...prev, num],
                            )
                          }
                        />
                        <span className="text-sm text-black">{num} Days</span>
                      </label>
                    ))}
                  </div>,
                  document.body,
                )}
            </div>

            {/* Freeze Columns */}
            <div className="flex flex-col gap-1">
              <select
                value={freezeKey ?? "none"}
                onChange={(e) =>
                  setFreezeKey(
                    e.target.value === "none" ? null : e.target.value,
                  )
                }
                className="w-full px-3 py-2 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="none">Freeze Columns</option>
                {columns.map((column) => (
                  <option key={column.key} value={column.key}>
                    {column.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Month + Date Range */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 lg:col-span-6 mt-2">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {MONTH_OPTIONS.map((month) => {
                  const isActive = selectedMonth === month.value;
                  const monthLeadCount = monthlyStats
                    .filter((stat) => {
                      const statMonth = stat.month.split("-")[1];
                      const statYear = stat.month.split("-")[0];
                      const yearMatch =
                        yearFilter === "All" ? true : statYear === yearFilter;
                      return statMonth === month.value && yearMatch;
                    })
                    .reduce((sum, stat) => sum + Number(stat.leadCount), 0);

                  return (
                    <button
                      key={month.value}
                      type="button"
                      onClick={() =>
                        setSelectedMonth(isActive ? null : month.value)
                      }
                      className={`text-md font-extrabold rounded-lg transition-all shadow-sm min-w-[50px] h-9 px-2 ${
                        isActive
                          ? "bg-green-600 text-white"
                          : "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {month.label}
                      <span
                        className={`ml-1 text-xs font-bold rounded-full px-1.5 py-0.5 ${
                          isActive
                            ? "bg-white text-green-700"
                            : "bg-red-700 text-white"
                        }`}
                      >
                        {monthLeadCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <input
                  type={startType}
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  placeholder="Start Date"
                  onFocus={(e) => {
                    setStartType("date");
                    setTimeout(() => {
                      try {
                        e.currentTarget.showPicker();
                      } catch {}
                    }, 0);
                  }}
                  onClick={(e) => {
                    setStartType("date");
                    setTimeout(() => {
                      try {
                        e.currentTarget.showPicker();
                      } catch {}
                    }, 0);
                  }}
                  onBlur={() => {
                    if (!startMonth) setStartType("text");
                  }}
                  className="px-3 h-9 text-md font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white flex-1"
                />
                <input
                  type={endType}
                  value={endMonth}
                  min={startMonth}
                  onChange={(e) => setEndMonth(e.target.value)}
                  placeholder="End Date"
                  onFocus={(e) => {
                    setEndType("date");
                    setTimeout(() => {
                      try {
                        e.currentTarget.showPicker();
                      } catch {}
                    }, 0);
                  }}
                  onClick={(e) => {
                    setEndType("date");
                    setTimeout(() => {
                      try {
                        e.currentTarget.showPicker();
                      } catch {}
                    }, 0);
                  }}
                  onBlur={() => {
                    if (!endMonth) setEndType("text");
                  }}
                  className="px-3 h-9 text-md font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-2 bg-white border shadow-sm rounded-3xl border-white w-full">
          <div className="relative border border-white rounded-2xl overflow-hidden h-[64vh]">
            <div className="absolute inset-0 flex overflow-x-auto overflow-y-auto">
              {/* Left Frozen Section */}
              {frozenColumns.length > 0 && (
                <div className="sticky left-0 z-30 h-full bg-white flex flex-col shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] border-r border-white">
                  {renderTableSection(frozenColumns, leftBannerGroups, true)}
                </div>
              )}

              {/* Right Scrollable Section */}
              <div className="flex-1 min-w-0 bg-white">
                {renderTableSection(
                  scrollableColumns,
                  rightBannerGroups,
                  false,
                )}
              </div>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={page || 1}
            totalItems={totalLeadsCount}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Lead Details Modal */}
      {isDetailModalOpen && detailLead && (
        <LeadDetailsModel
          lead={detailLead}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setTimeout(() => setDetailLead(null), 300);
          }}
        />
      )}
    </>
  );
}
