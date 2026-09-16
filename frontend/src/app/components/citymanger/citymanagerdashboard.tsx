"use client";

import { useState, useEffect, useMemo } from "react";
import { MapPin, RefreshCw, Users, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import { fetchMyAssignedLeads } from "@/app/features/access/accessSlice";
import { getTodayFollowups } from "@/app/features/leadsFollowups/lead_followupsSlice";
import { MONTH_OPTIONS } from "../../../types/LeadsTable/leadstabledata";
import type { LeadRecord } from "../../../types/types";
import StatusLeadsTable from "./StatusLeadsTable";
import AdvisorFollowupStats from "./AdvisorFollowup";
import HighPaxLeadsTable from "./HighPaxLeadsTable";
import LongDurationLeadsTable from "./LongDurationLeadsTable";

const STATUS_META = [
  {
    key: "NEW",
    label: "New",
    border: "#2563EB",
    bg: "#DBEAFE",
    text: "#1D4ED8",
  },
  {
    key: "KYC",
    label: "KYC",
    border: "#EA580C",
    bg: "#FFEDD5",
    text: "#C2410C",
  },
  {
    key: "RFQ",
    label: "RFQ",
    border: "#2563EB",
    bg: "#DBEAFE",
    text: "#1D4ED8",
  },
  {
    key: "HOT",
    label: "Hot",
    border: "#9333EA",
    bg: "#F3E8FF",
    text: "#7E22CE",
  },
  {
    key: "VEH-N",
    label: "Veh-N",
    border: "#DB2777",
    bg: "#FCE7F3",
    text: "#BE185D",
  },
  {
    key: "LOST",
    label: "Lost",
    border: "#B91C1C",
    bg: "#DC2626",
    text: "#FFFFFF",
  },
  {
    key: "BOOK",
    label: "Book",
    border: "#065F46",
    bg: "#059669",
    text: "#FFFFFF",
  },
] as const;

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { assignedLeads } = useSelector(
    (state: RootState) => state.travelAdvisor,
  );

  const {
    leads: liveLeads,
    total: liveTotal,
    totalPages: liveTotalPages,
    statusCounts: liveStatusCounts,
    monthlyStats: liveMonthlyStats,
    loading: liveLoading,
    zonesAdvisors,
  } = assignedLeads;

  const { todayFollowups = [], loading: todayFollowupsLoading } = useSelector(
    (state: RootState) => state.followUp,
  );

  const cityIds = useMemo<number[]>(() => {
    const user = currentUser as any;
    const rawCityIds =
      user?.city_ids ?? user?.cityIds ?? user?.cities_ids ?? [];

    if (Array.isArray(rawCityIds)) {
      return rawCityIds
        .map((id: unknown) => Number(id))
        .filter((id: number) => Number.isFinite(id));
    }
    const singleCityId =
      user?.city_id ?? user?.cityId ?? user?.cityID ?? user?.city?.id;

    if (
      singleCityId !== undefined &&
      singleCityId !== null &&
      singleCityId !== ""
    ) {
      const parsed = Number(singleCityId);

      if (Number.isFinite(parsed)) {
        return [parsed];
      }
    }

    return [];
  }, [currentUser]);

  const todayFollowupCount = useMemo(() => {
    if (!Array.isArray(todayFollowups)) {
      return 0;
    }
    return todayFollowups.length;
  }, [todayFollowups]);
  const [liveStatusFilter, setLiveStatusFilter] = useState<string>("All");
  const [liveSelectedMonth, setLiveSelectedMonth] = useState<string | null>(
    null,
  );
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<number | null>(
    null,
  );

  const [tablePage, setTablePage] = useState(1);
  const [showTable, setShowTable] = useState(false);
  useEffect(() => {
    if (!cityIds.length) {
      console.warn(
        "City Manager: cityIds not found, today followups not fetched.",
      );

      return;
    }

    dispatch(
      getTodayFollowups({
        cityIds,
      } as any),
    );
  }, [dispatch, cityIds]);

  useEffect(() => {
    dispatch(
      fetchMyAssignedLeads({
        page: tablePage,
        status: liveStatusFilter !== "All" ? liveStatusFilter : undefined,
        month: liveSelectedMonth ? parseInt(liveSelectedMonth) : null,
        advisorId: selectedAdvisorId ?? undefined,
      }),
    );
  }, [
    dispatch,
    tablePage,
    liveStatusFilter,
    liveSelectedMonth,
    selectedAdvisorId,
  ]);

  useEffect(() => {
    setTablePage(1);
  }, [liveStatusFilter, liveSelectedMonth, selectedAdvisorId]);
  const liveTotalCount = useMemo(() => {
    return Object.values(liveStatusCounts || {}).reduce(
      (sum, value) => sum + Number(value || 0),
      0,
    );
  }, [liveStatusCounts]);

  const livePct = (n: number) =>
    liveTotalCount > 0 ? ((n / liveTotalCount) * 100).toFixed(1) : "0.0";
  const liveMonthCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    MONTH_OPTIONS.forEach((month) => {
      counts[month.value] = 0;
    });

    (liveMonthlyStats || []).forEach((stat) => {
      const parts = String(stat.month).split("-");
      const statMonth = parts[1];
      if (statMonth && counts[statMonth] !== undefined) {
        counts[statMonth] += Number(stat.leadCount || 0);
      }
    });

    return counts;
  }, [liveMonthlyStats]);

  const selectedAdvisorName = useMemo(() => {
    if (selectedAdvisorId === null) {
      return null;
    }
    return (
      zonesAdvisors?.find((advisor) => advisor.id === selectedAdvisorId)
        ?.name ?? `Advisor ${selectedAdvisorId}`
    );
  }, [selectedAdvisorId, zonesAdvisors]);

  const selectedMonthLabel = useMemo(() => {
    if (!liveSelectedMonth) {
      return null;
    }

    return (
      MONTH_OPTIONS.find((month) => month.value === liveSelectedMonth)?.label ??
      liveSelectedMonth
    );
  }, [liveSelectedMonth]);

  const handleRefresh = () => {
    dispatch(
      fetchMyAssignedLeads({
        page: tablePage,
        status: liveStatusFilter !== "All" ? liveStatusFilter : undefined,
        month: liveSelectedMonth ? parseInt(liveSelectedMonth) : null,
        advisorId: selectedAdvisorId ?? undefined,
      }),
    );
  };
  useEffect(() => {
    if (!cityIds.length) {
      return;
    }

    dispatch(
      getTodayFollowups({
        cityIds,
      } as any),
    );
  }, [dispatch, cityIds]);
  const handleReset = () => {
    setLiveStatusFilter("All");
    setLiveSelectedMonth(null);
    setSelectedAdvisorId(null);
    setTablePage(1);
  };

  return (
    <div className="min-h-screen relative">
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 text-gray-800 shadow-lg">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <p className="text-2xl font-semibold text-gray-800">
              Hey {currentUser?.aliasName}
            </p>

            <p className="mt-1 text-md italic text-gray-500">
              Let’s make today something new. 🚀
            </p>

            <h2 className="mt-3 text-md font-bold tracking-tight text-gray-800">
              Today! What's My Plan?
            </h2>
          </div>

          <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
            Today
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 shadow-sm transition hover:shadow-md">
            <h3 className="text-sm font-semibold text-orange-700">
              Today's Follow-ups
            </h3>

            <p className="mt-2 text-3xl font-bold text-orange-800">
              {todayFollowupsLoading ? "..." : todayFollowupCount}
            </p>

            <p className="mt-1 text-xs text-orange-600">
              {todayFollowupCount === 0
                ? "No follow-ups today"
                : todayFollowupCount === 1
                  ? "1 follow-up today"
                  : `${todayFollowupCount} follow-ups today`}
            </p>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm transition hover:shadow-md">
            <h3 className="text-sm font-semibold text-green-700">
              Today's Trip Starts
            </h3>

            <p className="mt-2 text-3xl font-bold text-green-800">0</p>

            <p className="mt-1 text-xs text-green-600">Trips starting today</p>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm transition hover:shadow-md">
            <h3 className="text-sm font-semibold text-yellow-700">
              Next Reminder
            </h3>

            <p className="mt-2 text-lg font-bold text-yellow-800">
              No reminder
            </p>

            <p className="mt-1 text-xs text-yellow-600">Upcoming reminder</p>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 shadow-sm transition hover:shadow-md">
            <h3 className="text-sm font-semibold text-purple-700">
              Today's Expense Revenue
            </h3>

            <p className="mt-2 text-3xl font-bold text-purple-800">₹0</p>

            <p className="mt-1 text-xs text-purple-600">Today's total</p>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm transition hover:shadow-md">
            <h3 className="text-sm font-semibold text-rose-700">Revenue</h3>

            <p className="mt-2 text-3xl font-bold text-rose-800">₹0</p>

            <p className="mt-1 text-xs text-rose-600">Total revenue</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 text-blue-950 border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-lg font-bold tracking-wide flex items-center gap-2 text-blue-950">
            <MapPin size={18} className="text-blue-600" />
            Lead Status Overview
            {liveLoading && (
              <span className="text-xs font-medium text-blue-600 ml-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                syncing…
              </span>
            )}
          </h2>

          <div className="flex items-center gap-3">
            {zonesAdvisors && zonesAdvisors.length > 0 && (
              <div className="relative">
                <select
                  value={selectedAdvisorId ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;

                    setSelectedAdvisorId(val ? Number(val) : null);
                  }}
                  className="appearance-none text-sm font-semibold bg-white text-blue-950 border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm cursor-pointer"
                >
                  <option value="">All Advisors</option>

                  {zonesAdvisors.map((advisor) => (
                    <option key={advisor.id} value={advisor.id}>
                      {advisor.name}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-950"
                />
              </div>
            )}

            <div className="relative">
              <select
                value={liveSelectedMonth ?? ""}
                onChange={(e) => {
                  const val = e.target.value;

                  setLiveSelectedMonth(val ? val : null);
                }}
                className="appearance-none text-sm font-semibold bg-white text-blue-950 border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm cursor-pointer"
              >
                <option value="">All Months</option>

                {MONTH_OPTIONS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label} ({liveMonthCounts[month.value] ?? 0})
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-950"
              />
            </div>

            {(liveStatusFilter !== "All" ||
              liveSelectedMonth !== null ||
              selectedAdvisorId !== null) && (
              <button
                onClick={handleReset}
                className="text-xs font-semibold uppercase tracking-wider text-blue-600 hover:text-blue-900 transition-colors underline underline-offset-4 decoration-blue-300"
              >
                Reset
              </button>
            )}

            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              title="Refresh"
            >
              <RefreshCw
                size={14}
                className={
                  liveLoading || todayFollowupsLoading ? "animate-spin" : ""
                }
              />
            </button>
          </div>
        </div>

        {selectedAdvisorId !== null && (
          <div className="mb-5 flex items-center gap-4 rounded-xl bg-blue-50 border border-blue-100 px-5 py-4 shadow-sm">
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-blue-100">
              <Users size={20} className="text-blue-700" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                Total Leads — {selectedAdvisorName}
                {selectedMonthLabel ? ` · ${selectedMonthLabel}` : ""}
              </p>

              <p className="text-3xl font-black leading-tight text-blue-950">
                {liveLoading ? "…" : liveTotal}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6 bg-slate-50 rounded-xl p-3 border border-slate-100">
          <button
            onClick={() => {
              setLiveStatusFilter("All");
              setShowTable(true);
            }}
            className="relative flex flex-col justify-between rounded-xl p-3 h-24 border-l-[6px] transition-colors duration-150"
            style={{
              backgroundColor: "#111111",
              borderColor: "#F97316",
              borderLeftWidth: liveStatusFilter === "All" ? 8 : 6,
            }}
          >
            <div className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-white">
              <Users size={14} />
              Total Leads
            </div>

            <div>
              <div className="text-3xl font-black leading-none text-white">
                {liveTotalCount}
              </div>

              <div className="text-sm text-slate-300 mt-1">100.0%</div>
            </div>
          </button>

          {STATUS_META.map((s) => {
            const count = Number(liveStatusCounts?.[s.key] ?? 0);
            const isActive = liveStatusFilter === s.key;
            return (
              <button
                key={s.key}
                onClick={() => {
                  setLiveStatusFilter(isActive ? "All" : s.key);

                  setShowTable(true);
                }}
                className="relative flex flex-col justify-between rounded-xl p-3 h-24 transition-colors duration-150"
                style={{
                  backgroundColor: s.bg,

                  borderLeft: `${isActive ? 8 : 6}px solid ${s.border}`,
                }}
              >
                <div
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{
                    color: s.text,
                  }}
                >
                  {s.label}
                </div>

                <div>
                  <div
                    className="text-3xl font-black leading-none"
                    style={{
                      color: s.text,
                    }}
                  >
                    {count}
                  </div>

                  <div
                    className="text-sm mt-1 opacity-80"
                    style={{
                      color: s.text,
                    }}
                  >
                    {livePct(count)}%
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {showTable && (
          <div>
            <div className="flex items-center justify-end mb-2">
              <button
                onClick={() => setShowTable(false)}
                className="text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors underline underline-offset-4 decoration-slate-300"
              >
                Hide Table
              </button>
            </div>

            <StatusLeadsTable
              leads={liveLeads as LeadRecord[]}
              loading={liveLoading}
              currentPage={tablePage}
              totalPages={liveTotalPages ?? 1}
              total={liveTotal ?? 0}
              onPageChange={setTablePage}
              visibleColumnKeys={[
                "actions",
                "status",
                "cityName",
                "advisorFullName",
                "fullName",
                "customerPhone",
                "pickupDateTime",
                "dropDateTime",
                "passengerTotal",
              ]}
            />
          </div>
        )}
      </div>
      <AdvisorFollowupStats selectedAdvisorId={selectedAdvisorId} />
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="min-w-0">
          <HighPaxLeadsTable
            cityIds={cityIds}
            selectedAdvisorId={selectedAdvisorId}
          />
        </div>

        <div className="min-w-0">
          <LongDurationLeadsTable
            cityIds={cityIds}
            selectedAdvisorId={selectedAdvisorId}
          />
        </div>
      </div>
    </div>
  );
}
