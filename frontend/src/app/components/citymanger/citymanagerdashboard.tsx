"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Target,
  Filter,
  MapPin,
  RefreshCw,
  Users,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import { fetchMyAssignedLeads } from "@/app/features/access/accessSlice";
import { getMyAssignedLeadsApi } from "@/app/features/access/accessApi";
import { MONTH_OPTIONS } from "../../../types/LeadsTable/leadstabledata";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";

const STATUS_META = [
  { key: "NEW", label: "New", color: "#2563EB" },
  { key: "KYC", label: "KYC", color: "#0891B2" },
  { key: "RFQ", label: "RFQ", color: "#4F46E5" },
  { key: "HOT", label: "Hot", color: "#DC2626" },
  { key: "VEH-N", label: "Vehicle", color: "#7C3AED" },
  { key: "LOST", label: "Lost", color: "#64748B" },
  { key: "BOOK", label: "Booked", color: "#059669" },
] as const;

const ACCENT = "#60A5FA";

interface AdvisorStat {
  advisor: string;
  total: number;
  booked: number;
}

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { assignedLeads } = useSelector(
    (state: RootState) => state.travelAdvisor,
  );
  const {
    leads: liveLeads,
    total: liveTotal,
    statusCounts: liveStatusCounts,
    monthlyStats: liveMonthlyStats,
    loading: liveLoading,
    zonesAdvisors,
  } = assignedLeads;

  // ─── Filter states ────────────────────────────────────────────────────────
  const [liveStatusFilter, setLiveStatusFilter] = useState<string>("All");
  const [liveSelectedMonth, setLiveSelectedMonth] = useState<string | null>(
    null,
  );
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<number | null>(
    null,
  );

  const [advisorStats, setAdvisorStats] = useState<AdvisorStat[]>([]);
  const [advisorStatsLoading, setAdvisorStatsLoading] = useState(false);

  useEffect(() => {
    dispatch(
      fetchMyAssignedLeads({
        page: 1,
        status: liveStatusFilter !== "All" ? liveStatusFilter : undefined,
        month: liveSelectedMonth ? parseInt(liveSelectedMonth) : null,
        advisorId: selectedAdvisorId ?? undefined,
      }),
    );
  }, [dispatch, liveStatusFilter, liveSelectedMonth, selectedAdvisorId]);

  const advisorIdsKey = (zonesAdvisors || [])
    .map((a) => a.id)
    .sort((a, b) => a - b)
    .join(",");

  useEffect(() => {
    if (selectedAdvisorId !== null) return;
    if (!zonesAdvisors || zonesAdvisors.length === 0) return;

    let cancelled = false;

    const fetchAllAdvisorStats = async () => {
      setAdvisorStatsLoading(true);
      try {
        const results = await Promise.all(
          zonesAdvisors.map(async (adv) => {
            try {
              const res = await getMyAssignedLeadsApi(1, {
                advisorId: adv.id,
              });
              return {
                advisor: adv.name,
                total: res.total ?? 0,
                booked: res.statusCounts?.BOOK ?? 0,
              } as AdvisorStat;
            } catch (err) {
              console.error(`Failed to fetch stats for advisor ${adv.id}`, err);
              return { advisor: adv.name, total: 0, booked: 0 } as AdvisorStat;
            }
          }),
        );
        if (!cancelled) setAdvisorStats(results);
      } finally {
        if (!cancelled) setAdvisorStatsLoading(false);
      }
    };

    fetchAllAdvisorStats();

    return () => {
      cancelled = true;
    };
  }, [selectedAdvisorId, advisorIdsKey]);

  // ─── Total leads (filtered) ──────────────────────────────────────────────
  const liveTotalCount = useMemo(() => {
    return Object.values(liveStatusCounts || {}).reduce(
      (sum, value) => sum + Number(value || 0),
      0,
    );
  }, [liveStatusCounts]);

  const livePct = (n: number) =>
    liveTotalCount > 0 ? ((n / liveTotalCount) * 100).toFixed(1) : "0.0";

  // ─── Month counts ────────────────────────────────────────────────────────
  const liveMonthCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    MONTH_OPTIONS.forEach((m) => (counts[m.value] = 0));
    (liveMonthlyStats || []).forEach((stat) => {
      const [, statMonth] = stat.month.split("-");
      if (counts[statMonth] !== undefined)
        counts[statMonth] += Number(stat.leadCount);
    });
    return counts;
  }, [liveMonthlyStats]);

  // ─── Status breakdown chart data ────────────────────────────────────────
  const chartData = useMemo(() => {
    return STATUS_META.map((s) => ({
      status: s.label,
      count: Number(liveStatusCounts?.[s.key] ?? 0),
      color: s.color,
    }));
  }, [liveStatusCounts]);

  // ─── Selected advisor ka naam (banner ke liye) ───────────────────────────
  const selectedAdvisorName = useMemo(() => {
    if (selectedAdvisorId === null) return null;
    return (
      zonesAdvisors?.find((a) => a.id === selectedAdvisorId)?.name ??
      `Advisor ${selectedAdvisorId}`
    );
  }, [selectedAdvisorId, zonesAdvisors]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 relative">
      {/* ─── LEAD STATUS OVERVIEW ─── */}
      <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 text-blue-950 border border-slate-200">
        {/* header with advisor dropdown */}
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
            {(liveStatusFilter !== "All" ||
              liveSelectedMonth !== null ||
              selectedAdvisorId !== null) && (
              <button
                onClick={() => {
                  setLiveStatusFilter("All");
                  setLiveSelectedMonth(null);
                  setSelectedAdvisorId(null);
                }}
                className="text-xs font-semibold uppercase tracking-wider text-blue-600 hover:text-blue-900 transition-colors underline underline-offset-4 decoration-blue-300"
              >
                Reset
              </button>
            )}
            <button
              onClick={() =>
                dispatch(
                  fetchMyAssignedLeads({
                    page: 1,
                    status:
                      liveStatusFilter !== "All" ? liveStatusFilter : undefined,
                    month: liveSelectedMonth
                      ? parseInt(liveSelectedMonth)
                      : null,
                    advisorId: selectedAdvisorId ?? undefined,
                  }),
                )
              }
              className="p-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              title="Refresh"
            >
              <RefreshCw
                size={14}
                className={liveLoading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* ─── 🆕 SELECTED ADVISOR TOTAL BANNER ─── (accessSlice.assignedLeads.total) */}
        {selectedAdvisorId !== null && (
          <div className="mb-5 flex items-center gap-4 rounded-xl bg-blue-50 border border-blue-100 px-5 py-4 shadow-sm">
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-blue-100">
              <Users size={20} className="text-blue-700" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                Total Leads — {selectedAdvisorName}
              </p>
              <p className="text-3xl font-black leading-tight text-blue-950">
                {liveLoading ? "…" : liveTotal}
              </p>
            </div>
          </div>
        )}

        {/* ─── STATUS CARDS ─── (filtered data) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6 bg-slate-50 rounded-xl p-3 border border-slate-100">
          {/* Total card */}
          <button
            onClick={() => setLiveStatusFilter("All")}
            className={`relative flex flex-col justify-between rounded-xl p-3 h-24 border-l-4 bg-white transition-all duration-200 ${
              liveStatusFilter === "All"
                ? "border-blue-500 scale-[1.03] shadow-lg ring-1 ring-blue-200"
                : "border-slate-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Users size={12} />
              Total
            </div>
            <div>
              <div className="text-2xl font-black leading-none text-blue-950">
                {liveTotalCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">100.0%</div>
            </div>
          </button>

          {STATUS_META.map((s) => {
            const count = Number(liveStatusCounts?.[s.key] ?? 0);
            const isActive = liveStatusFilter === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setLiveStatusFilter(isActive ? "All" : s.key)}
                className="relative flex flex-col justify-between rounded-xl p-3 h-24 border-l-4 bg-white transition-all duration-200"
                style={{
                  borderColor: s.color,
                  transform: isActive ? "scale(1.03)" : "scale(1)",
                  boxShadow: isActive
                    ? `0 0 0 1px ${s.color}66, 0 4px 12px rgba(0,0,0,0.15)`
                    : "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: s.color }}
                >
                  {s.label}
                </div>
                <div>
                  <div className="text-2xl font-black leading-none text-blue-950">
                    {count}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {livePct(count)}%
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-[3px] bg-slate-100 w-full rounded-b-xl overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${livePct(count)}%`,
                      backgroundColor: s.color,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── MONTH FILTER STRIP ─── */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 mb-3">
            Filter by month
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {MONTH_OPTIONS.map((month) => {
              const isActive = liveSelectedMonth === month.value;
              const count = liveMonthCounts[month.value] ?? 0;
              return (
                <button
                  key={month.value}
                  onClick={() =>
                    setLiveSelectedMonth(isActive ? null : month.value)
                  }
                  className={`relative flex-shrink-0 min-w-[92px] rounded-lg px-3 py-2 flex items-center justify-between transition-all duration-200 border ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                      : "bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100"
                  }`}
                >
                  <span className="font-bold text-sm">{month.label}</span>
                  <span
                    className={`ml-2 text-xs font-bold rounded-full px-1.5 py-0.5 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-blue-600/10 text-blue-800"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── ADVISOR PERFORMANCE CHART (all advisors — from accessSlice loop) ─── */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-blue-950 flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-600" />
              Advisor Performance (Total Leads vs Booked) – Overall
            </h3>
            {advisorStatsLoading && (
              <span className="text-xs text-slate-400 animate-pulse">
                loading overall…
              </span>
            )}
          </div>

          {selectedAdvisorId !== null ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Please select{" "}
              <strong className="text-blue-900">"All Advisors"</strong> to see
              the team performance.
            </div>
          ) : advisorStats && advisorStats.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={advisorStats}
                  margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="advisor"
                    tick={{ fill: "#334155", fontSize: 11 }}
                    axisLine={{ stroke: "#CBD5E1" }}
                    tickLine={false}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#334155", fontSize: 11 }}
                    axisLine={{ stroke: "#CBD5E1" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B1E3D",
                      border: "1px solid #1E3A8A",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#93C5FD", fontWeight: "bold" }}
                  />
                  <Legend
                    wrapperStyle={{ color: "#334155", fontSize: 12 }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="total"
                    fill="#2563EB"
                    name="Total Leads"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="booked"
                    fill="#0EA5E9"
                    name="Booked"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              No leads data available for advisors.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
