"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LeadRecord } from "../../../../../types/types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import {
  fetchLeads,
  setStatus,
} from "@/app/features/lead/leadSlice";
import LeadDetailsModel from "../../../DetailModel/LeadModel/leadTabledetailsmodel";
import UnwantedModal from "../../../DetailModel/LeadModel/UnwantedModal";
import Pagination from "../../../ui/pagination";
import AssignSalesModal from "../../../DetailModel/LeadModel/AssignSalesModal";
import EditLeadForm from "./EditForm/editleadform";

import {
  useLeadColumns,
  type LeadColumn,
} from "../../../../../types/LeadsTable/leadTableColumns";
import { LeadSearchFilters } from "../../../../../types/LeadsTable/leadsearch";

import {
  TABLE_BANNER_COLUMNS,
  LEAD_STATUS_OPTIONS,
  MONTH_OPTIONS,
  CITY_OPTIONS,
} from "../../../../../types/LeadsTable/leadstabledata";

import {
  calculateLeadStatusCounts,
  calculateLeadStatusPercentages,
  LeadStatusBadge,
  MonthPickupBadge,
  calculateMonthPickupCounts,
  type LeadStatusCounts,
  type LeadStatusPercentages,
} from "../../../../../types/LeadsTable/leadstatus";
import {
  listenToLeadUpdates,
  removeLeadListeners,
} from "@/app/socket/leadsocket";

const BANNER_GROUP_LIGHT_BG_CLASS: Record<string, string> = {
  STATUS: "bg-blue-200",
  ENQUIRY: "bg-pink-200",
  CUSTOMER: "bg-emerald-200",
  TRAVEL: "bg-purple-200",
  VEHICLE: "bg-blue-100",
  BAGGAGE: "bg-amber-200",
  TS_REPORT: "bg-rose-200",
  ACTION: "bg-lime-200",
  ITINERARY: "bg-cyan-200",
  PASSANGER: "bg-emerald-200",
  "Travel Req.": "bg-rose-200",
};

const BANNER_GROUP_BG_CLASS: Record<string, string> = {
  STATUS: "bg-blue-950",
  ENQUIRY: "bg-pink-700",
  CUSTOMER: "bg-emerald-900",
  TRAVEL: "bg-purple-800",
  VEHICLE: "bg-blue-800",
  BAGGAGE: "bg-amber-800",
  TS_REPORT: "bg-rose-900",
  ACTION: "bg-lime-800",
  ITINERARY: "bg-cyan-800",
  PASSANGER: "bg-emerald-700",
  "Travel Req.": "bg-rose-800",
};

export default function LeadsTable() {
  const [statusFilter, setStatusFilter] = useState<
    "All" | LeadRecord["status"]
  >("All");
  const [cityFilter, setCityFilter] = useState<
    "All" | (typeof CITY_OPTIONS)[number]
  >("All");
  const [yearFilter, setYearFilter] = useState<"All" | "2025" | "2026">("All");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [startType, setStartType] = useState("text");
  const [endType, setEndType] = useState("text");
  const [detailLead, setDetailLead] = useState<LeadRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editLead, setEditLead] = useState<LeadRecord | null>(null);
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
  const [daysDropdownStyle, setDaysDropdownStyle] =
    useState<React.CSSProperties>({});
  const paxDropdownRef = useRef<HTMLDivElement>(null);
  const daysDropdownRef = useRef<HTMLDivElement>(null);
  const [unwantedModalOpen, setUnwantedModalOpen] = useState(false);
  const [selectedUnwantedLead, setSelectedUnwantedLead] =
    useState<LeadRecord | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  const dispatch = useDispatch<AppDispatch>();

  const {
    leads,
    loading,
    error,
    totalPages,
    total,
    selectedMonth: reduxMonth,
    selectedYear: reduxYear,
    selectedStatus: reduxStatus,
    statusCounts,
    totalLeads,
  } = useSelector((state: RootState) => state.lead);

  useEffect(() => {
    dispatch(
      fetchLeads({
        page: currentPage,
        month: reduxMonth,
        year: reduxYear,
        status: reduxStatus ?? undefined,
      }),
    );
  }, [dispatch, currentPage, reduxMonth, reduxYear, reduxStatus]);

 

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleMonthYearChange = (month: number, year: number) => {
    setCurrentPage(1);
    dispatch(setMonthYear({ month, year }));
  };

  const handleAssignClick = (lead: LeadRecord) => {
    setSelectedLead(lead);
    setIsAssignModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAssignModalOpen(false);
    setSelectedLead(null);
  };

  const handleViewLead = (lead: LeadRecord) => {
    setDetailLead(lead);
    setIsDetailModalOpen(true);
  };

  const handleUnwantedClick = (lead: LeadRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUnwantedLead(lead);
    setUnwantedModalOpen(true);
  };

  const handleCloseUnwantedModal = () => {
    setUnwantedModalOpen(false);
    setSelectedUnwantedLead(null);
  };

  const columns = useLeadColumns({
    handleUnwantedClick,
    handleViewLead,
    setEditLead,
  });

  useEffect(() => {
    const handleLeadSubmitted = () => {
      setEditLead(null);
      setDetailLead(null);
      dispatch(
        fetchLeads({
          page: currentPage,
          month: reduxMonth,
          year: reduxYear,
          status: reduxStatus ?? undefined,
        }),
      );
    };
    window.addEventListener("leadSubmitted", handleLeadSubmitted);
    return () =>
      window.removeEventListener("leadSubmitted", handleLeadSubmitted);
  }, [dispatch, currentPage, reduxMonth, reduxYear, reduxStatus]);

  useEffect(() => {
    const handleAssignLead = (event: Event) => {
      const customEvent = event as CustomEvent<LeadRecord>;
      if (customEvent.detail) {
        handleAssignClick(customEvent.detail);
      }
    };
    window.addEventListener("assignLead", handleAssignLead);
    return () => window.removeEventListener("assignLead", handleAssignLead);
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        paxDropdownRef.current &&
        !paxDropdownRef.current.contains(event.target as Node) &&
        paxBtnRef.current &&
        !paxBtnRef.current.contains(event.target as Node)
      ) {
        setPaxOpen(false);
      }
    };
    if (paxOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [paxOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        daysDropdownRef.current &&
        !daysDropdownRef.current.contains(event.target as Node) &&
        daysBtnRef.current &&
        !daysBtnRef.current.contains(event.target as Node)
      ) {
        setDaysOpen(false);
      }
    };
    if (daysOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [daysOpen]);

  // ─── Column meta (sorted by index) ───────────────────────────────────────
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
      .sort((a, b) => a.index - b.index) as (LeadColumn & {
      index: number;
      headerBgClass: string;
      groupLabel?: string;
    })[];
  }, [columns]);

  // ─── Freeze index ─────────────────────────────────────────────────────────
  const freezeIndex = useMemo(() => {
    if (!freezeKey) return -1;
    return bannerColumnsMeta.findIndex((col) => col.key === freezeKey);
  }, [bannerColumnsMeta, freezeKey]);

  useEffect(() => {
    if (!freezeKey) return;
    if (freezeIndex === -1) setFreezeKey(null);
  }, [freezeIndex, freezeKey]);

  // ─── DOM-measured column widths for accurate sticky left offsets ─────────
  // We measure actual <th> widths after render so frozen cells sit flush
  // against each other with no gap.
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
    // Re-measure on window resize (e.g. zoom change)
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

  // ─── Tailwind bg → CSS hex map for frozen td background ──────────────────
  // We need real CSS color values (not class names) to set backgroundColor
  // on sticky <td>s so they don't become transparent over scrolled content.
  // This map must mirror BANNER_GROUP_LIGHT_BG_CLASS.
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

  // ─── Banner group builder (for a flat list of columns) ───────────────────
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
        // Ungrouped column — push a single empty-label group
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

  // ─── Filters ──────────────────────────────────────────────────────────────
  const statusOptions: ("All" | LeadRecord["status"])[] = [
    "All",
    ...LEAD_STATUS_OPTIONS,
  ];
  const cityOptions: ("All" | (typeof CITY_OPTIONS)[number])[] = [
    "All",
    ...CITY_OPTIONS,
  ];

  const filteredLeads = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const startDate = startMonth ? new Date(startMonth) : null;
    const endDate = endMonth ? new Date(`${endMonth}T23:59:59`) : null;

    return leads.filter((lead) => {
      if (cityFilter !== "All" && lead.city !== cityFilter) return false;
      if (yearFilter !== "All") {
        const leadYear = new Date(lead.date).getFullYear().toString();
        if (leadYear !== yearFilter) return false;
      }
      if (selectedMonth) {
        const enquiryDate = new Date(lead.date);
        if (isNaN(enquiryDate.getTime())) return false;
        const enquiryMonth = enquiryDate.getMonth() + 1;
        if (enquiryMonth !== parseInt(selectedMonth)) return false;
      }
      if (term) {
        const haystack = [
          lead.fullName,
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
          lead.customerEmail,
          lead.customerPhone,
          lead.telecaller,
          lead.petsNames ?? "",
          lead.pickupAddress,
          lead.dropAddress,
          lead.remarks,
          lead.km ? String(Number(lead.km).toFixed(0)) : "",
          lead.days ? String(lead.days) : "",
          lead.passengerTotal ? String(lead.passengerTotal) : "",
          lead.totalBaggage ? String(lead.totalBaggage) : "",
        ];
        if (!haystack.some((v) => v && v.toLowerCase().includes(term)))
          return false;
      }
      if (startDate || endDate) {
        const leadDate = new Date(`${lead.date}T00:00`);
        if (startDate && leadDate < startDate) return false;
        if (endDate && leadDate > endDate) return false;
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
    cityFilter,
    yearFilter,
    selectedMonth,
    searchTerm,
    startMonth,
    endMonth,
    selectedPax,
    selectedDays,
  ]);

  const statusPercentages: LeadStatusPercentages = useMemo(
    () => calculateLeadStatusPercentages(statusCounts),
    [statusCounts],
  );

  // ─── Edit view ────────────────────────────────────────────────────────────
  if (editLead) {
    return (
      <div className="w-full">
        <div className="mb-4"></div>
        <EditLeadForm
          initialData={editLead}
          onSuccess={() => {
            setEditLead(null);
            dispatch(
              fetchLeads({
                page: currentPage,
                month: reduxMonth,
                year: reduxYear,
                status: reduxStatus ?? undefined,
              }),
            );
          }}
          onCancel={() => setEditLead(null)}
        />
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <>
      <div className="w-full">
        {/* ─── Top Banner ─── */}
        <div className="p-3 bg-orange-100 rounded-md mb-1">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="border-l-8 border rounded-lg border-orange-500 bg-white px-3">
              <h2 className="text-2xl md:text-4xl font-bold text-left text-orange-600 whitespace-nowrap">
                Lead Manager
              </h2>
              <p className="text-2xl md:text-2xl mt-1 text-md text-center text-orange-700">
                (Pre-Sales)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <div className="flex flex-wrap items-center gap-2 ml-10">
                <LeadStatusBadge
                  type="total"
                  label="TOTAL"
                  value={total}
                  percentage={statusPercentages.totalPercentage}
                />
                <LeadStatusBadge
                  type="new"
                  label="NEW"
                  value={statusCounts.NEW}
                  percentage={statusPercentages.newPercentage}
                />
                <LeadStatusBadge
                  type="rfq"
                  label="RFQ"
                  value={statusCounts.RFQ}
                  percentage={statusPercentages.rfqPercentage}
                />
                <LeadStatusBadge
                  type="kyc"
                  label="KYC"
                  value={statusCounts.KYC}
                  percentage={statusPercentages.kycPercentage}
                />
                <LeadStatusBadge
                  type="hot"
                  label="HOT"
                  value={statusCounts.HOT}
                  percentage={statusPercentages.hotPercentage}
                />
                <LeadStatusBadge
                  type="vehn"
                  label="VEH-N"
                  value={statusCounts["VEH-N"]}
                  percentage={statusPercentages.vehnPercentage}
                />
                <LeadStatusBadge
                  type="lost"
                  label="LOST"
                  value={statusCounts.LOST}
                  percentage={statusPercentages.lostPercentage}
                />
                <LeadStatusBadge
                  type="book"
                  label="BOOK"
                  value={statusCounts.BOOK}
                  percentage={statusPercentages.bookPercentage}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 ml-10">
                {MONTH_OPTIONS.map((month) => {
                  const currentMonth = new Date().getMonth() + 1;
                  const isCurrentMonth = Number(month.value) === currentMonth;
                  const monthPickupCount = calculateMonthPickupCounts(
                    filteredLeads,
                    month.value,
                  );
                  return (
                    <MonthPickupBadge
                      key={month.value}
                      month={month}
                      count={monthPickupCount}
                      isCurrentMonth={isCurrentMonth}
                      onClick={() =>
                        handleMonthYearChange(Number(month.value), reduxYear)
                      }
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Search / Filter Bar — sticky ─── */}
        <div className="sticky md:top-28 z-30 bg-white shadow-sm rounded-2xl">
          <LeadSearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={(value) => {
              setStatusFilter(value as typeof statusFilter);
              setCurrentPage(1);
              dispatch(setStatus(value === "All" ? null : (value as string)));
            }}
            statusOptions={statusOptions}
            cityFilter={cityFilter}
            onCityChange={(value) => setCityFilter(value as typeof cityFilter)}
            cityOptions={cityOptions}
            selectedPax={selectedPax}
            onPaxChange={setSelectedPax}
            paxOpen={paxOpen}
            onPaxToggle={togglePax}
            paxBtnRef={paxBtnRef}
            paxDropdownRef={paxDropdownRef}
            paxDropdownStyle={paxDropdownStyle}
            selectedDays={selectedDays}
            onDaysChange={setSelectedDays}
            daysOpen={daysOpen}
            onDaysToggle={toggleDays}
            daysBtnRef={daysBtnRef}
            daysDropdownRef={daysDropdownRef}
            daysDropdownStyle={daysDropdownStyle}
            freezeKey={freezeKey}
            onFreezeChange={setFreezeKey}
            columns={columns}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            startMonth={startMonth}
            onStartMonthChange={setStartMonth}
            endMonth={endMonth}
            onEndMonthChange={setEndMonth}
            startType={startType}
            onStartTypeChange={setStartType}
            endType={endType}
            onEndTypeChange={setEndType}
          />
        </div>

        {/* ─── Table Container ─── */}
        <div className="mt-1 bg-white border shadow-sm rounded-3xl border-white w-full flex flex-col">
          {/*
           * KEY FIX: Single scroll container + single <table>
           * - overflowY: auto  → vertical scroll (rows scroll, thead stays fixed)
           * - overflowX: auto  → horizontal scroll (sticky columns stay on left)
           * Both scroll axes share one context so frozen columns and thead
           * are always in sync.
           */}
          <div
            className="border border-white rounded-2xl"
            style={{
              maxHeight: "calc(100vh - 310px)",
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
                  {bannerGroups.map((group, gi) => {
                    const bgClass = group.label
                      ? (BANNER_GROUP_BG_CLASS[group.label] ?? "bg-slate-900")
                      : "bg-white";

                    // For frozen banner cells, we need sticky left too.
                    // Find the absolute column index where this group starts.
                    const absoluteStartIndex = group.startIndex;
                    const isFrozenBanner =
                      freezeIndex >= 0 && absoluteStartIndex <= freezeIndex;

                    return (
                      <th
                        key={group.id}
                        colSpan={group.colSpan}
                        className={`p-1 ${group.label ? "border border-white" : ""} ${bgClass}`}
                        style={{
                          ...(isFrozenBanner
                            ? {
                                position: "sticky",
                                left: calcStickyLeft(absoluteStartIndex),
                                zIndex: 40,
                              }
                            : {}),
                        }}
                      >
                        {group.label && (
                          <div className="px-2 py-1 text-[18px] font-black uppercase tracking-[0.35em] text-white min-w-max">
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
                        style={{
                          ...(isFrozen
                            ? {
                                position: "sticky",
                                left: calcStickyLeft(i),
                                zIndex: 30,
                              }
                            : {}),
                        }}
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

                        
                          const frozenBgColor = isFrozen
                            ? (BG_CLASS_TO_HEX[column.headerBgClass] ??
                              rowBaseHex)
                            : undefined;

                          return (
                            <td
                              key={column.key}
                              className={`whitespace-nowrap border border-white text-slate-800 p-[3px_6px] ${
                                isAddress
                                  ? "text-[12px] !font-normal"
                                  : "text-sm font-extrabold"
                              } ${isFrozen ? "" : column.headerBgClass}`}
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

          {/* ─── Pagination — always visible at bottom ─── */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages || 1}
            totalItems={total}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

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

      {unwantedModalOpen && selectedUnwantedLead && (
        <UnwantedModal
          isOpen={unwantedModalOpen}
          onClose={handleCloseUnwantedModal}
          lead={selectedUnwantedLead}
        />
      )}

      {isAssignModalOpen && selectedLead && (
        <AssignSalesModal
          isOpen={isAssignModalOpen}
          onClose={handleCloseModal}
          leadId={selectedLead.id}
          cityId={selectedLead.city_id}
        />
      )}
    </>
  );
}
