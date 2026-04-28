"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import EditLeadForm from "./EditForm/editleadform";
import type { LeadRecord } from "../../../../../types/types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import { fetchLeads } from "@/app/features/lead/leadSlice";
import LeadDetailsModel from "../../../DetailModel/LeadModel/leadTabledetailsmodel";
import UnwantedModal from "../../../DetailModel/LeadModel/UnwantedModal";
import Pagination from "../../../ui/pagination";
import AssignSalesModal from "../../../DetailModel/LeadModel/AssignSalesModal";
import { markUnwanted } from "@/app/features/lead/leadSlice";

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

// Import from leadstatus
import {
  calculateLeadStatusCounts,
  calculateLeadStatusPercentages,
  LeadStatusBadge,
  MonthPickupBadge,
  calculateMonthPickupCounts,
  type LeadStatusCounts,
  type LeadStatusPercentages,
} from "../../../../../types/LeadsTable/leadstatus";
import { fetchPresalesLeadStatusCount } from "@/app/features/access/accessSlice";

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

const OCCASION_COLOR_MAP: Record<string, string> = {
  Wedding: "text-red-900 font-bold",
  Vacation: "text-orange-900 font-bold",
  Pilgrimage: "text-cyan-700 font-bold",
  Corporate: "text-pink-700 font-bold",
  Event: "text-blue-900 font-bold",
  Local: "text-green-900 font-bold",
};

const statusClassMap: Record<LeadRecord["status"], string> = {
  New: "bg-blue-100 text-blue-600",
  KYC: "bg-amber-100 text-amber-600",
  RFQ: "bg-red-100 text-red-800",
  HOT: "bg-pink-100 text-pink-600",
  Book: "bg-green-600 text-white font-bold",
  "Veh-n": "bg-purple-100 text-purple-600",
  Lost: "bg-black text-white font-bold",
  Blank: "bg-gray-100 text-gray-600",
};

export default function LeadsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | LeadRecord["status"]
  >("All");
  const [cityFilter, setCityFilter] = useState<
    "All" | (typeof CITY_OPTIONS)[number]
  >("All");
  const [yearFilter, setYearFilter] = useState<"All" | "2025" | "2026">("All");

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
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

  // Assign Sales Modal state and handlers
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);

  const handleAssignClick = (lead: LeadRecord) => {
    setSelectedLead(lead);
    setIsAssignModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAssignModalOpen(false);
    setSelectedLead(null);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 14;

  const dispatch = useDispatch<AppDispatch>();
  const { leads, loading, error, totalPages, total } = useSelector(
    (state: RootState) => state.lead,
  );
  const { leadStatus } = useSelector((state: RootState) => state.travelAdvisor);

  useEffect(() => {
    dispatch(fetchPresalesLeadStatusCount());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchLeads(currentPage));
  }, [dispatch, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      dispatch(fetchLeads(currentPage));
    };
    window.addEventListener("leadSubmitted", handleLeadSubmitted);
    return () =>
      window.removeEventListener("leadSubmitted", handleLeadSubmitted);
  }, [dispatch, currentPage]);

  // Handle assignLead event from table columns
  useEffect(() => {
    const handleAssignLead = (event: Event) => {
      const customEvent = event as CustomEvent<LeadRecord>;
      if (customEvent.detail) {
        handleAssignClick(customEvent.detail); // 🔥 full lead pass karo
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
    if (paxOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
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
    if (daysOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [daysOpen]);

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

        return {
          ...column,
          index,
          headerBgClass,
          groupLabel,
        };
      })
      .filter(Boolean) as (LeadColumn & {
      index: number;
      headerBgClass: string;
      groupLabel?: string;
    })[];

    return meta.sort((a, b) => a.index - b.index);
  }, [columns]);

  const freezeIndex = useMemo(() => {
    if (!freezeKey) return -1;
    return columns.findIndex((column) => column.key === freezeKey);
  }, [columns, freezeKey]);

  useEffect(() => {
    if (!freezeKey) return;
    if (freezeIndex === -1) setFreezeKey(null);
  }, [freezeIndex, freezeKey]);

  const statusOptions: ("All" | LeadRecord["status"])[] = [
    "All",
    ...LEAD_STATUS_OPTIONS,
  ];
  const cityOptions: ("All" | (typeof CITY_OPTIONS)[number])[] = [
    "All",
    ...CITY_OPTIONS,
  ];

  // FIXED: Filter by enquiry month (lead.date) instead of pickup month
  const filteredLeads = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const startDate = startMonth ? new Date(startMonth) : null;
    const endDate = endMonth ? new Date(`${endMonth}T23:59:59`) : null;

    return leads.filter((lead) => {
      // Status filter
      if (statusFilter !== "All" && lead.status !== statusFilter) return false;

      // City filter
      if (cityFilter !== "All" && lead.city !== cityFilter) return false;

      // Year filter
      if (yearFilter !== "All") {
        const leadYear = new Date(lead.date).getFullYear().toString();
        if (leadYear !== yearFilter) return false;
      }

      // MONTH FILTER - FIXED: Filter by enquiry month (lead.date)
      if (selectedMonth) {
        const enquiryDate = new Date(lead.date);
        if (isNaN(enquiryDate.getTime())) return false;
        const enquiryMonth = enquiryDate.getMonth() + 1; // getMonth() returns 0-11
        const selectedMonthNum = parseInt(selectedMonth);
        if (enquiryMonth !== selectedMonthNum) return false;
      }

      // Search term filter
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
        const hasMatch = haystack.some(
          (value) => value && value.toLowerCase().includes(term),
        );
        if (!hasMatch) return false;
      }

      // Date range filter
      if (startDate || endDate) {
        const leadDate = new Date(`${lead.date}T00:00`);
        if (startDate && leadDate < startDate) return false;
        if (endDate && leadDate > endDate) return false;
      }

      // Pax filter
      if (
        selectedPax.length > 0 &&
        !selectedPax.includes(Number(lead.passengerTotal))
      )
        return false;

      // Days filter
      if (selectedDays.length > 0 && !selectedDays.includes(Number(lead.days)))
        return false;

      return true;
    });
  }, [
    leads,
    statusFilter,
    cityFilter,
    yearFilter,
    selectedMonth, // Make sure this is included in dependencies
    searchTerm,
    startMonth,
    endMonth,
    selectedPax,
    selectedDays,
  ]);

  const frozenColumns = useMemo(() => {
    return bannerColumnsMeta.slice(0, freezeIndex + 1);
  }, [bannerColumnsMeta, freezeIndex]);

  const scrollableColumns = useMemo(() => {
    return bannerColumnsMeta.slice(freezeIndex + 1);
  }, [bannerColumnsMeta, freezeIndex]);

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
            {banners.map((group, index) => {
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
                    <div className="px-2 py-1 text-[18px] font-black uppercase tracking-[0.35em] text-white min-w-max">
                      {group.label}
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
          <tr>
            {cols.map((column, index) => {
              const bannerCol = TABLE_BANNER_COLUMNS.find(
                (c) => c.key === column.key,
              );
              const groupLabel = bannerCol?.groupLabel;
              const headerBgClass = groupLabel
                ? (BANNER_GROUP_BG_CLASS[groupLabel] ?? "bg-slate-900")
                : "bg-slate-900";

              const headerClassName = `sticky top-[30px] border border-white ${headerBgClass} px-1 text-left text-[11px] font-bold uppercase tracking-wide text-white sm:text-xs z-20 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1)]`;

              return (
                <th
                  key={column.key}
                  scope="col"
                  className={headerClassName.trim()}
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
                  const bgClass = column.headerBgClass;
                  const isAddress =
                    column.key === "pickupAddress" ||
                    column.key === "dropAddress" ||
                    column.key === "itinerary";

                  const cellClassName = `
                    whitespace-nowrap border border-white text-slate-800 p-[3px_6px]
                    ${isAddress ? "text-[12px] !font-normal" : "text-sm font-extrabold"}
                    ${bgClass}
                  `;

                  return (
                    <td key={column.key} className={cellClassName.trim()}>
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

  const statusCounts: LeadStatusCounts = useMemo(
    () => calculateLeadStatusCounts(filteredLeads),
    [filteredLeads],
  );

  const statusPercentages: LeadStatusPercentages = useMemo(
    () => calculateLeadStatusPercentages(statusCounts),
    [statusCounts],
  );

  const totalLeadsCount = total || 0;

  if (editLead) {
    return (
      <div className="w-full">
        <div className="mb-4"></div>
        <EditLeadForm
          initialData={editLead}
          onSuccess={() => {
            setEditLead(null);
            dispatch(fetchLeads(currentPage));
          }}
          onCancel={() => setEditLead(null)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
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
                  value={leadStatus.totalLeads}
                  percentage={statusPercentages.totalPercentage}
                />
                <LeadStatusBadge
                  type="new"
                  label="NEW"
                  value={leadStatus.statusCount.NEW}
                  percentage={statusPercentages.newPercentage}
                />
                <LeadStatusBadge
                  type="rfq"
                  label="RFQ"
                  value={leadStatus.statusCount.RFQ}
                  percentage={statusPercentages.rfqPercentage}
                />
                <LeadStatusBadge
                  type="kyc"
                  label="KYC"
                  value={leadStatus.statusCount.KYC}
                  percentage={statusPercentages.kycPercentage}
                />
                <LeadStatusBadge
                  type="hot"
                  label="HOT"
                  value={leadStatus.statusCount.HOT}
                  percentage={statusPercentages.hotPercentage}
                />
                <LeadStatusBadge
                  type="vehn"
                  label="VEH-N"
                  value={leadStatus.statusCount["VEH-N"]}
                  percentage={statusPercentages.vehnPercentage}
                />
                <LeadStatusBadge
                  type="lost"
                  label="LOST"
                  value={leadStatus.statusCount.LOST}
                  percentage={statusPercentages.lostPercentage}
                />
                <LeadStatusBadge
                  type="book"
                  label="BOOK"
                  value={leadStatus.statusCount.BOOK}
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
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky md:top-28 z-3 bg-white shadow-sm rounded-2xl">
          <LeadSearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={(value) =>
              setStatusFilter(value as typeof statusFilter)
            }
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

        <div className="mt-1 bg-white border shadow-sm rounded-3xl border-white w-full">
          <div className="border border-white rounded-2xl overflow-x-auto">
            <div className="flex overflow-x-auto">
              {frozenColumns.length > 0 && (
                <div className="sticky left-0 z-30 bg-white flex flex-col border-r border-white">
                  {renderTableSection(frozenColumns, leftBannerGroups, true)}
                </div>
              )}
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
            totalPages={totalPages || 1}
            totalItems={totalLeadsCount}
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
          cityId={selectedLead.city_id} // 🔥 correct
        />
      )}
    </>
  );
}
