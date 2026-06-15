"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createPortal } from "react-dom";
import SalesEditLeadForm from "../telesales/salesEditLeadForm";
import type { LeadRecord } from "../../../types/types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import RateQuotationModel from "../../components/pages/ratequation/list/rateQuotationModel";
import Pagination from "../ui/pagination";
import LeadDetailsModel from "../DetailModel/LeadModel/leadTabledetailsmodel";
import {
  TABLE_BANNER_COLUMNS,
  BANNER_GROUP_LIGHT_BG_CLASS,
  BANNER_GROUP_BG_CLASS,
  LEAD_STATUS_OPTIONS,
  MONTH_OPTIONS,
} from "../../../types/LeadsTable/leadstabledata";
import {
  addRealtimeAssignedLead,
  fetchMyAssignedLeads,
  setAssignedStatus,
  updateRealtimeAssignedLead,
} from "@/app/features/access/accessSlice";

import { Eye, Edit, UserRoundPlus } from "lucide-react";
import {
  useLeadColumns,
  type LeadColumn,
} from "../../../types/LeadsTable/leadTableColumns";
import { connectSocket } from "@/app/socket";
import {
  listenToAdviserLeads,
  listenToLeadUpdated,
  removeLeadListeners,
} from "@/app/socket/leadsocket";
import { useAppSelector } from "@/hooks/useRedux";
import { AllRegionZoneCityFilter } from "../ui/AllRegionZoneCityFilter";

const CITY_OPTIONS = [
  "Delhi",
  "Mumbai",
  "Chandigarh",
  "Varanasi",
  "Prayagraj",
] as const;

const YEAR_OPTIONS = ["All", "2025", "2026", "2027", "2028"] as const;

const CITY_ID_MAP: Record<string, number> = {
  Delhi: 1,
  Mumbai: 2,
  Chandigarh: 3,
  Varanasi: 4,
  Prayagraj: 5,
};

const BG_CLASS_TO_HEX: Record<string, string> = {
  "bg-blue-200": "#bfdbfe",
  "bg-pink-200": "#fbcfe8",
  "bg-emerald-200": "#a7f3d0",
  "bg-purple-200": "#e9d5ff",
  "bg-blue-100": "#dbeafe",
  "bg-amber-200": "#fde68a",
  "bg-rose-200": "#fecdd3",
  "bg-lime-200": "#d9f99d",
  "bg-cyan-200": "#a5f3fc",
  "bg-slate-50": "#f8fafc",
};

export default function LeadsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<
    "All" | (typeof CITY_OPTIONS)[number]
  >("All");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [yearFilter, setYearFilter] =
    useState<(typeof YEAR_OPTIONS)[number]>("All");
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<number | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<
    "All" | LeadRecord["status"]
  >("All");

  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [startType, setStartType] = useState("text");
  const [endType, setEndType] = useState("text");
  const [selectedPax, setSelectedPax] = useState<number[]>([]);
  const [paxOpen, setPaxOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [daysOpen, setDaysOpen] = useState(false);
  const [detailLead, setDetailLead] = useState<LeadRecord | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [freezeKey, setFreezeKey] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;
  const paxBtnRef = useRef<HTMLButtonElement>(null);
  const daysBtnRef = useRef<HTMLButtonElement>(null);
  const daysDropdownRef = useRef<HTMLDivElement>(null);
  const paxDropdownRef = useRef<HTMLDivElement>(null);
  const [rateQuotationLead, setRateQuotationLead] = useState<LeadRecord | null>(
    null,
  );
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [paxDropdownStyle, setPaxDropdownStyle] = useState<React.CSSProperties>(
    {},
  );
  const [daysDropdownStyle, setDaysDropdownStyle] =
    useState<React.CSSProperties>({});
  // State add karo
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const { assignedLeads } = useSelector(
    (state: RootState) => state.travelAdvisor,
  );
  const { currentUser } = useSelector((state: RootState) => state.user);
  const {
    leads,
    loading,
    error,
    totalPages,
    total,
    totalLeads,
    statusCounts,
    monthlyStats,
    zonesAdvisors,
  } = assignedLeads;

  // ─── Search debounce (400ms) ───────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    cityFilter,
    selectedMonth,
    yearFilter,
    selectedAdvisorId,
    statusFilter,
    selectedZoneId,
  ]);

  useEffect(() => {
    if (!currentUser) return;

    connectSocket(currentUser);

    // New Lead
    listenToAdviserLeads((lead) => {
      dispatch(addRealtimeAssignedLead(lead));
    });

    // Lead Updated
    listenToLeadUpdated((updatedLead) => {
      dispatch(updateRealtimeAssignedLead(updatedLead)); // ← sirf ye change karo
    });
    return () => {
      removeLeadListeners();
    };
  }, [currentUser, dispatch]);

  const buildFetchArgs = useCallback(
    (page: number) => ({
      page,
      search: debouncedSearch.trim() || undefined,
      cityIds:
        cityFilter !== "All" && CITY_ID_MAP[cityFilter]
          ? [CITY_ID_MAP[cityFilter]]
          : undefined,
      month: selectedMonth ? parseInt(selectedMonth) : null,
      year: yearFilter !== "All" ? parseInt(yearFilter) : null,
      advisorId: selectedAdvisorId ?? undefined,
      status: statusFilter !== "All" ? statusFilter : undefined,
      zoneId: selectedZoneId ?? null,
    }),
    [
      debouncedSearch,
      cityFilter,
      selectedMonth,
      yearFilter,
      selectedAdvisorId,
      statusFilter,
      selectedZoneId,
    ],
  );

  // ─── Main fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchMyAssignedLeads(buildFetchArgs(currentPage)));
  }, [dispatch, currentPage, buildFetchArgs]);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  const handleZoneChange = (zone: string) => {
    setSelectedZone(zone);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };
  useEffect(() => {
    const handleLeadSubmitted = () => {
      dispatch(fetchMyAssignedLeads({ page: 1 }));
    };
    window.addEventListener("leadSubmitted", handleLeadSubmitted);
    return () =>
      window.removeEventListener("leadSubmitted", handleLeadSubmitted);
  }, [dispatch]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleStatusChange = (val: "All" | LeadRecord["status"]) => {
    setStatusFilter(val);
    dispatch(setAssignedStatus(val));
    setCurrentPage(1);
  };

  const togglePax = () => {
    if (!paxOpen) {
      const rect = paxBtnRef.current?.getBoundingClientRect();
      if (rect)
        setPaxDropdownStyle({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
    }
    setPaxOpen((prev) => !prev);
  };

  const toggleDays = () => {
    if (!daysOpen) {
      const rect = daysBtnRef.current?.getBoundingClientRect();
      if (rect)
        setDaysDropdownStyle({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
    }
    setDaysOpen((prev) => !prev);
  };

  // ─── Click outside dropdowns ──────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (daysDropdownRef.current?.contains(event.target as Node)) return;
      if (
        daysBtnRef.current &&
        !daysBtnRef.current.contains(event.target as Node)
      )
        setDaysOpen(false);
    };
    if (daysOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [daysOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paxDropdownRef.current?.contains(event.target as Node)) return;
      if (
        paxBtnRef.current &&
        !paxBtnRef.current.contains(event.target as Node)
      )
        setPaxOpen(false);
    };
    if (paxOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [paxOpen]);

  // ─── Columns ──────────────────────────────────────────────────────────────
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
        {/* Rate Quotation Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setRateQuotationLead(lead);
          }}
          className="px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded hover:bg-green-700 flex items-center justify-center"
          title="Rate Quotation"
        >
          💰{" "}
        </button>

        {/* DSR Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(
              new CustomEvent("dsr-form", {
                detail: { lead, action: "navigate" },
              }),
            );
          }}
          className="px-2 py-1 text-xs font-semibold text-white bg-orange-600 rounded hover:bg-orange-700 flex items-center justify-center"
          title="Add DSR"
        >
          <UserRoundPlus size={20} />
        </button>

        {/* View Button */}
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

        {/* Edit Button */}
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

  const columns: LeadColumn[] = useMemo(() => {
    const withoutActions = hookColumns.filter((col) => col.key !== "actions");
    return [actionsColumn, ...withoutActions];
  }, [hookColumns, detailLead]);

  // ─── Banner columns meta ───────────────────────────────────────────────────
  const bannerColumnsMeta = useMemo(() => {
    return columns
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
      .filter(Boolean)
      .sort((a, b) => a.index - b.index) as (LeadColumn & {
      index: number;
      headerBgClass: string;
      groupLabel?: string;
    })[];
  }, [columns]);

  // ─── Freeze index ──────────────────────────────────────────────────────────
  const freezeIndex = useMemo(() => {
    if (!freezeKey) return -1;
    return bannerColumnsMeta.findIndex((col) => col.key === freezeKey);
  }, [bannerColumnsMeta, freezeKey]);

  useEffect(() => {
    if (!freezeKey) return;
    if (freezeIndex === -1) setFreezeKey(null);
  }, [freezeIndex, freezeKey]);

  const theadRef = useRef<HTMLTableSectionElement>(null);
  const [colWidths, setColWidths] = useState<number[]>([]);

  useEffect(() => {
    const measure = () => {
      if (!theadRef.current) return;
      // Second <tr> has the per-column <th> cells
      const headerRow = theadRef.current.querySelectorAll("tr")[1];
      if (!headerRow) return;
      const ths = Array.from(headerRow.querySelectorAll("th"));
      setColWidths(ths.map((th) => th.getBoundingClientRect().width));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [bannerColumnsMeta, freezeIndex]);

  const calcStickyLeft = useCallback(
    (colIndex: number): number => {
      if (colWidths.length === 0) return colIndex * 120; // fallback before first paint
      return colWidths.slice(0, colIndex).reduce((acc, w) => acc + w, 0);
    },
    [colWidths],
  );

  // ─── Banner group builder (flat list) ─────────────────────────────────────
  const buildBannerGroups = (
    cols: typeof bannerColumnsMeta,
  ): Array<{
    id: string;
    label: string;
    colSpan: number;
    startIndex: number;
  }> => {
    const groups: Array<{
      id: string;
      label: string;
      colSpan: number;
      startIndex: number;
    }> = [];
    let current: (typeof groups)[0] | null = null;

    cols.forEach((col, i) => {
      if (!col.groupLabel) {
        if (current) {
          groups.push(current);
          current = null;
        }
        groups.push({
          id: `ungrouped-${col.key}`,
          label: "",
          colSpan: 1,
          startIndex: i,
        });
        return;
      }
      if (!current || current.label !== col.groupLabel) {
        if (current) groups.push(current);
        current = {
          id: `${col.groupLabel}-${col.index}`,
          label: col.groupLabel,
          colSpan: 1,
          startIndex: i,
        };
      } else {
        current.colSpan += 1;
      }
    });
    if (current) groups.push(current);
    return groups;
  };

  const bannerGroups = useMemo(
    () => buildBannerGroups(bannerColumnsMeta),
    [bannerColumnsMeta],
  );

  // ─── Filter options ────────────────────────────────────────────────────────
  const statusOptions: ("All" | LeadRecord["status"])[] = [
    "All",
    ...LEAD_STATUS_OPTIONS,
  ];
  const cityOptions: ("All" | (typeof CITY_OPTIONS)[number])[] = [
    "All",
    ...CITY_OPTIONS,
  ];

  // ─── Client-side only filters (date range, pax, days) ─────────────────────
  const filteredLeads = useMemo(() => {
    const startDate = startMonth ? new Date(startMonth) : null;
    const endDate = endMonth ? new Date(`${endMonth}T23:59:59`) : null;

    return leads.filter((lead) => {
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
  }, [leads, startMonth, endMonth, selectedPax, selectedDays]);

  // ─── Stats ────────────────────────────────────────────────────────────────
  const totalLeadsCount = total || 0;
  const newLeads = Number(statusCounts?.NEW ?? 0);
  const kycLeads = Number(statusCounts?.KYC ?? 0);
  const rfqLeads = Number(statusCounts?.RFQ ?? 0);
  const hotLeads = Number(statusCounts?.HOT ?? 0);
  const vehnLeads = Number(statusCounts?.["VEH-N"] ?? 0);
  const lostLeads = Number(statusCounts?.LOST ?? 0);
  const bookLeads = Number(statusCounts?.BOOK ?? 0);

  const pct = (n: number) =>
    totalLeadsCount > 0 ? ((n / totalLeadsCount) * 100).toFixed(1) : "0.0";

  // ─── Edit mode ─────────────────────────────────────────────────────────────
  if (detailLead && isEditMode) {
    return (
      <div className="w-full">
        <SalesEditLeadForm
          initialData={detailLead}
          isEditMode={isEditMode}
          onSuccess={() => {
            setDetailLead(null);
            setIsEditMode(false);
            dispatch(fetchMyAssignedLeads({ page: 1 }));
          }}
          onCancel={() => {
            setDetailLead(null);
            setIsEditMode(false);
          }}
        />
      </div>
    );
  }

  // ─── Main render ───────────────────────────────────────────────────────────
  return (
    <>
      <div className="w-full overflow-auto">
        {/* ── Stats Header ── */}
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
              {/* Total */}
              <div
                onClick={() => handleStatusChange("All")}
                className={`flex flex-col items-center justify-center bg-black px-2 py-2 mr-6 rounded-lg shadow-md border min-w-[80px] h-20 cursor-pointer transition-all hover:scale-105 hover:shadow-lg
                  ${statusFilter === "All" ? "ring-4 ring-offset-2 ring-orange-400 scale-105 border-orange-400" : "border-white"}`}
              >
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
                  ring: "ring-sky-500",
                },
                {
                  label: "KYC",
                  count: kycLeads,
                  p: pct(kycLeads),
                  bg: "bg-orange-200",
                  border: "border-orange-800",
                  text: "text-orange-950",
                  ring: "ring-orange-500",
                },
                {
                  label: "RFQ",
                  count: rfqLeads,
                  p: pct(rfqLeads),
                  bg: "bg-blue-300",
                  border: "border-blue-800",
                  text: "text-blue-950",
                  ring: "ring-blue-600",
                },
                {
                  label: "HOT",
                  count: hotLeads,
                  p: pct(hotLeads),
                  bg: "bg-purple-200",
                  border: "border-purple-800",
                  text: "text-purple-950",
                  ring: "ring-purple-500",
                },
                {
                  label: "VEH-N",
                  count: vehnLeads,
                  p: pct(vehnLeads),
                  bg: "bg-pink-200",
                  border: "border-pink-900",
                  text: "text-pink-950",
                  ring: "ring-pink-500",
                },
                {
                  label: "LOST",
                  count: lostLeads,
                  p: pct(lostLeads),
                  bg: "bg-red-500",
                  border: "border-red-600",
                  text: "text-white",
                  ring: "ring-red-300",
                },
                {
                  label: "BOOK",
                  count: bookLeads,
                  p: pct(bookLeads),
                  bg: "bg-green-800",
                  border: "border-green-800",
                  text: "text-white",
                  ring: "ring-green-400",
                },
              ].map(({ label, count, p, bg, border, text, ring }) => {
                const isActive = statusFilter === label;
                return (
                  <div
                    key={label}
                    onClick={() =>
                      handleStatusChange(
                        isActive ? "All" : (label as LeadRecord["status"]),
                      )
                    }
                    className={`flex flex-col items-center justify-center ${bg} px-2 py-2 rounded-lg shadow-md border ${border} min-w-[80px] h-20 cursor-pointer transition-all
                      ${
                        isActive
                          ? `ring-4 ring-offset-2 ${ring} scale-105 shadow-xl`
                          : "hover:scale-105 hover:shadow-lg"
                      }`}
                  >
                    <div className={`font-extrabold text-xl ${text}`}>
                      {label}
                    </div>
                    <div className={`font-extrabold ${text}`}>{count}</div>
                    <div className={`text-md ${text}`}>{p}%</div>
                  </div>
                );
              })}
            </div>

            {/* Conditionally render filter */}
            <div className="px-4 py-2">
              <AllRegionZoneCityFilter
                selectedRegion={selectedRegion}
                selectedZone={selectedZone}
                selectedCity={selectedCity}
                onRegionChange={handleRegionChange}
                onZoneChange={handleZoneChange}
                onCityChange={handleCityChange}
              />
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="sticky md:top-28 z-30 bg-white shadow-sm rounded-2xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {/* Search */}
            <div className="flex flex-col gap-1">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search (name, phone, city…)"
                className="w-full px-3 py-2 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <select
                value={statusFilter}
                onChange={(e) =>
                  handleStatusChange(e.target.value as typeof statusFilter)
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

            {/* City */}
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

            {/* Pax */}
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

            {/* Days */}
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

            {/* Month + Year + Zone Advisor + Date range row */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 lg:col-span-6 mt-2">
              {/* Month buttons */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {MONTH_OPTIONS.map((month) => {
                  const isActive = selectedMonth === month.value;

                  const monthLeadCount = monthlyStats
                    .filter((stat) => {
                      const [statYear, statMonth] = stat.month.split("-");
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

              {/* Year */}
              <div className="flex-shrink-0">
                <select
                  value={yearFilter}
                  onChange={(e) =>
                    setYearFilter(e.target.value as typeof yearFilter)
                  }
                  className="px-3 py-2 h-9 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {YEAR_OPTIONS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zone Advisor dropdown */}
              {zonesAdvisors && zonesAdvisors.length > 0 && (
                <div className="flex-shrink-0">
                  <select
                    value={selectedAdvisorId ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedAdvisorId(val ? Number(val) : null);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 h-9 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">All Advisors</option>
                    {zonesAdvisors.map((advisor) => (
                      <option key={advisor.id} value={advisor.id}>
                        {advisor.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Zone dropdown */}
              {currentUser?.zone_names?.length > 0 && (
                <div className="flex-shrink-0">
                  <select
                    value={selectedZoneId ?? ""}
                    onChange={(e) => {
                      const idx = e.target.selectedIndex - 1; // -1 for "All Zones" option
                      const zoneId =
                        idx >= 0 ? currentUser.zone_ids[idx] : null;
                      setSelectedZoneId(zoneId);
                      setSelectedAdvisorId(null); // zone change hone par advisor reset karo
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 h-9 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">All Zones</option>
                    {currentUser.zone_names.map(
                      (zone: string, index: number) => (
                        <option
                          key={currentUser.zone_ids[index]}
                          value={currentUser.zone_ids[index]}
                        >
                          {zone}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              )}

              {/* Date range */}
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

        {/* ── Table Container ── */}
        <div className="mt-2 bg-white border shadow-sm rounded-3xl border-white w-full flex flex-col">
          <div
            className="border border-white rounded-2xl"
            style={{
              maxHeight: "calc(100vh - 320px)",
              overflowY: "auto",
              overflowX: "auto",
            }}
          >
            <table className="min-w-full text-xs border-collapse border border-white sm:text-sm">
              {/* ── Single thead — sticky top:0 ── */}
              <thead
                ref={theadRef}
                style={{ position: "sticky", top: 0, zIndex: 20 }}
              >
                {/* Banner / group header row */}
                <tr>
                  {bannerGroups.map((group) => {
                    const bgClass = group.label
                      ? (BANNER_GROUP_BG_CLASS[group.label] ?? "bg-slate-900")
                      : "bg-white";

                    const isFrozenBanner =
                      freezeIndex >= 0 && group.startIndex <= freezeIndex;

                    return (
                      <th
                        key={group.id}
                        colSpan={group.colSpan}
                        className={`p-1 ${group.label ? "border border-white" : ""} ${bgClass}`}
                        style={
                          isFrozenBanner
                            ? {
                                position: "sticky",
                                left: calcStickyLeft(group.startIndex),
                                zIndex: 40,
                              }
                            : {}
                        }
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

                {/* Column label row */}
                <tr>
                  {bannerColumnsMeta.map((column, i) => {
                    const isFrozen = freezeIndex >= 0 && i <= freezeIndex;
                    const bgClass = column.groupLabel
                      ? (BANNER_GROUP_BG_CLASS[column.groupLabel] ??
                        "bg-slate-900")
                      : "bg-slate-900";

                    return (
                      <th
                        key={column.key}
                        scope="col"
                        className={`border border-white ${bgClass} px-1 text-left text-[11px] font-bold uppercase tracking-wide text-white sm:text-xs`}
                        style={
                          isFrozen
                            ? {
                                position: "sticky",
                                left: calcStickyLeft(i),
                                zIndex: 30,
                              }
                            : {}
                        }
                      >
                        <div className="relative flex items-center justify-between w-full">
                          <span className="text-center w-full">
                            {column.label}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* ── Single tbody — this scrolls ── */}
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      className="text-sm font-semibold text-center border border-white text-slate-500 py-8"
                      colSpan={bannerColumnsMeta.length}
                    >
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      className="px-4 text-sm font-semibold text-center border border-white text-rose-500 py-8"
                      colSpan={bannerColumnsMeta.length}
                    >
                      Error: {error}
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 text-sm font-semibold text-center border border-white text-slate-500 py-8"
                      colSpan={bannerColumnsMeta.length}
                    >
                      No leads.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead, rowIndex) => {
                    const rowBaseHex =
                      rowIndex % 2 === 0 ? "#ffffff" : "#f8fafc";

                    return (
                      <tr key={lead.id}>
                        {bannerColumnsMeta.map((column, i) => {
                          const isFrozen = freezeIndex >= 0 && i <= freezeIndex;
                          const isAddress =
                            column.key === "pickupAddress" ||
                            column.key === "dropAddress" ||
                            column.key === "itinerary";

                          // Frozen cells: use actual column bg color (not white)
                          const frozenBgColor = isFrozen
                            ? (BG_CLASS_TO_HEX[column.headerBgClass] ??
                              rowBaseHex)
                            : undefined;

                          return (
                            <td
                              key={column.key}
                              className={`border border-white text-slate-800 p-[3px_6px]
    ${
      column.key === "itinerary"
        ? "whitespace-normal break-words max-w-[300px]"
        : "whitespace-nowrap"
    }
    ${isAddress ? "text-[12px] !font-normal" : "text-sm font-extrabold"}
    ${isFrozen ? "" : column.headerBgClass}
  `}
                              style={{
                                ...(isFrozen
                                  ? {
                                      position: "sticky",
                                      left: calcStickyLeft(i),
                                      zIndex: 10,
                                      backgroundColor: frozenBgColor,
                                    }
                                  : {}),
                              }}
                            >
                              {column.render(lead, rowIndex)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages ?? 1}
            totalItems={total ?? 0}
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

      {/* Rate Quotation Modal */}
      {/* Rate Quotation Modal */}
      {rateQuotationLead && (
        <RateQuotationModel
          lead={rateQuotationLead}
          isOpen={true}
          onClose={() => setRateQuotationLead(null)}
        />
      )}
    </>
  );
}
