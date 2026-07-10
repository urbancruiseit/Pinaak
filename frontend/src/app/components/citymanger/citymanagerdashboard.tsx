"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Target,
  Filter,
  MapPin,
  RefreshCw,
  Users,
  BarChart3,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import { fetchMyAssignedLeads } from "@/app/features/access/accessSlice";
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
  { key: "NEW", label: "New", color: "#0E7C7B" },
  { key: "KYC", label: "KYC", color: "#E8A33D" },
  { key: "RFQ", label: "RFQ", color: "#3B6EA5" },
  { key: "HOT", label: "Hot", color: "#E4572E" },
  { key: "VEH-N", label: "Vehicle", color: "#B5578A" },
  { key: "LOST", label: "Lost", color: "#7C8896" },
  { key: "BOOK", label: "Booked", color: "#3F9142" },
] as const;

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

  // ─── 🆕 Overall leads state (for advisor stats) ──────────────────────────
  const [overallLeads, setOverallLeads] = useState<any[]>([]);
  const [overallLoading, setOverallLoading] = useState(false);

  // ─── Fetch filtered data (status cards, month strip, status chart) ──────
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

  // ─── 🆕 Fetch overall leads (bina kisi filter ke – sabhi advisors ki) ───
  useEffect(() => {
    const fetchOverall = async () => {
      setOverallLoading(true);
      try {
        // ✅ IMPORTANT: advisorId = null ya undefined -> backend ko sabhi advisors ki leads return karni chahiye
        const result = await dispatch(
          fetchMyAssignedLeads({
            page: 1,
            // ✅ No status, no month, no advisorId – pure overall data
          }),
        ).unwrap();
        setOverallLeads(result.leads || []);
      } catch (error) {
        console.error("Failed to fetch overall leads", error);
      } finally {
        setOverallLoading(false);
      }
    };
    fetchOverall();
  }, [dispatch]); // sirf ek baar run hoga – agar aap chahein toh dependencies add kar sakte hain (e.g., year change)

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

  // ─── 🆕 Advisor Stats (overall leads – unfiltered) ──────────────────────
  const advisorStats = useMemo(() => {
    // Jab "All Advisors" select ho tabhi dikhana hai
    if (selectedAdvisorId !== null) return null;

    // Advisor name map
    const advisorMap = new Map<number, string>();
    (zonesAdvisors || []).forEach((adv) => advisorMap.set(adv.id, adv.name));

    // Group overall leads by advisor_id
    const groups: Record<number, { total: number; booked: number }> = {};
    (overallLeads || []).forEach((lead) => {
      // ⚠️ Yahan field ka naam check karein – aapke lead object me kaunsa field hai advisor ka?
      // Ho sakta hai: advisor_id, assigned_to, adviser_id, etc.
      const advisorId = lead.advisor_id; // ← isko apne field ke hisaab change karein
      if (!advisorId) return;
      if (!groups[advisorId]) {
        groups[advisorId] = { total: 0, booked: 0 };
      }
      groups[advisorId].total += 1;
      if (lead.status === "BOOK") {
        groups[advisorId].booked += 1;
      }
    });

    return Object.entries(groups).map(([id, stats]) => ({
      advisor: advisorMap.get(Number(id)) || `Advisor ${id}`,
      total: stats.total,
      booked: stats.booked,
    }));
  }, [overallLeads, zonesAdvisors, selectedAdvisorId]);

  // ─── (Aapka existing code for leads table, modals, etc. yahan rahega) ──

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      {/* ─── LEAD STATUS OVERVIEW ─── */}
      <div className="bg-[#10243E] rounded-2xl shadow-lg mb-6 p-6 text-white">
        {/* header with advisor dropdown */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
            <MapPin size={18} className="text-[#E8A33D]" />
            Lead Status Overview
            {liveLoading && (
              <span className="text-xs font-normal text-white/50 ml-2">
                syncing…
              </span>
            )}
          </h2>
          <div className="flex items-center gap-3">
            {zonesAdvisors && zonesAdvisors.length > 0 && (
              <select
                value={selectedAdvisorId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedAdvisorId(val ? Number(val) : null);
                }}
                className="text-sm font-semibold bg-white/10 text-white border border-white/20 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-[#E8A33D]"
              >
                <option value="">All Advisors</option>
                {zonesAdvisors.map((advisor) => (
                  <option key={advisor.id} value={advisor.id}>
                    {advisor.name}
                  </option>
                ))}
              </select>
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
                className="text-xs font-semibold uppercase tracking-wider text-[#E8A33D] hover:text-white transition-colors"
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
              className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
              title="Refresh"
            >
              <RefreshCw
                size={14}
                className={liveLoading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* ─── STATUS CARDS ─── (filtered data) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          {/* Total card */}
          <button
            onClick={() => setLiveStatusFilter("All")}
            className={`relative flex flex-col justify-between rounded-xl p-3 h-24 border-l-4 bg-white transition-all duration-200 ${
              liveStatusFilter === "All"
                ? "border-[#E8A33D] scale-[1.03] shadow-lg"
                : "border-gray-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <Users size={12} />
              Total
            </div>
            <div>
              <div className="text-2xl font-black leading-none text-[#10243E]">
                {liveTotalCount}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">100.0%</div>
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
                  <div className="text-2xl font-black leading-none text-[#10243E]">
                    {count}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    {livePct(count)}%
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-[3px] bg-gray-100 w-full rounded-b-xl overflow-hidden">
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50 mb-3">
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
                  className={`relative flex-shrink-0 min-w-[92px] rounded-lg px-3 py-2 flex items-center justify-between transition-all duration-200 ${
                    isActive
                      ? "bg-[#E8A33D] text-[#10243E] shadow-md scale-105"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <span
                    className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#10243E]"
                    aria-hidden
                  />
                  <span
                    className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#10243E]"
                    aria-hidden
                  />
                  <span className="font-bold text-sm">{month.label}</span>
                  <span
                    className={`ml-2 text-xs font-bold rounded-full px-1.5 py-0.5 ${
                      isActive
                        ? "bg-[#10243E] text-[#E8A33D]"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── STATUS BREAKDOWN CHART ─── (filtered) */}
        <div className="mt-4 bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#E8A33D] rounded-full" />
              Leads by Status
            </h3>
            {liveLoading && (
              <span className="text-xs text-white/40 animate-pulse">
                loading…
              </span>
            )}
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis
                  dataKey="status"
                  tick={{ fill: "#ffffff90", fontSize: 11 }}
                  axisLine={{ stroke: "#ffffff30" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#ffffff90", fontSize: 11 }}
                  axisLine={{ stroke: "#ffffff30" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#10243E",
                    border: "1px solid #ffffff30",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [`${value} leads`, "Count"]}
                  labelStyle={{ color: "#E8A33D", fontWeight: "bold" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── 🆕 ADVISOR PERFORMANCE CHART (overall – unfiltered) ─── */}
        <div className="mt-6 bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
              <BarChart3 size={16} className="text-[#E8A33D]" />
              Advisor Performance (Total Leads vs Booked) – Overall
            </h3>
            {overallLoading && (
              <span className="text-xs text-white/40 animate-pulse">
                loading overall…
              </span>
            )}
          </div>

          {selectedAdvisorId !== null ? (
            <div className="text-center py-8 text-white/60 text-sm">
              Please select{" "}
              <strong className="text-white">"All Advisors"</strong> to see the
              team performance.
            </div>
          ) : advisorStats && advisorStats.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={advisorStats}
                  margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis
                    dataKey="advisor"
                    tick={{ fill: "#ffffff90", fontSize: 11 }}
                    axisLine={{ stroke: "#ffffff30" }}
                    tickLine={false}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#ffffff90", fontSize: 11 }}
                    axisLine={{ stroke: "#ffffff30" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#10243E",
                      border: "1px solid #ffffff30",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#E8A33D", fontWeight: "bold" }}
                  />
                  <Legend
                    wrapperStyle={{ color: "#ffffff90", fontSize: 12 }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="total"
                    fill="#60A5FA"
                    name="Total Leads"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="booked"
                    fill="#34D399"
                    name="Booked"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-white/60 text-sm">
              No leads data available for advisors.
            </div>
          )}
        </div>
      </div>

      {/* ─── YOUR EXISTING BOTTOM SECTION (leads table, modals, etc.) ─── */}
      {/* ... (aapka existing code yahan rakhein) ... */}
    </div>
  );
}
