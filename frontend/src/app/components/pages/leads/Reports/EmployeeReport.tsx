"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStatusWiseReport } from "@/app/features/Reports/monthlyReport/monthlyReportSlice";
import { AppDispatch } from "@/app/redux/store";
import {
  BarChart3,
  Calendar,
  Loader2,
  TrendingUp,
  Users,
  Filter,
} from "lucide-react";

const MONTH_MAP = {
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
  JAN: 1,
  FEB: 2,
  MAR: 3,
};

const ALL_MONTHS = [
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
  "JAN",
  "FEB",
  "MAR",
];

const AVAILABLE_YEARS = ["2023", "2024", "2025", "2026", "2027", "2028"];

const Empreport = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedYear, setSelectedYear] = useState("2026");
  const [ALL_MONTHSData, setALL_MONTHSData] = useState<Record<string, any[]>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const formatValue = (value: any) => {
    if (value === 0 || value === "0" || value === null || value === undefined)
      return "-";
    return value;
  };

  const formatEmployeeName = (name: string) => {
    if (!name) return "";
    return name
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .toUpperCase()
      .split(" ")
      .map((word) => word.split("").join(" "))
      .join("   ");
  };

  const capitalizeName = (name: string) => {
    if (!name) return "";
    return name
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-sky-600";
      case "rfq":
        return "text-sky-700";
      case "kyc":
        return "text-orange-500";
      case "hot":
        return "text-purple-500";
      case "vehn":
        return "text-purple-900";
      case "lost":
        return "text-red-500";
      case "book":
        return "text-green-500";
      default:
        return "text-yellow-700";
    }
  };

  const getHeadingColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "text-blue-600";
      case "RFQ":
        return "text-sky-700";
      case "KYC":
        return "text-orange-500";
      case "HOT":
        return "text-purple-500";
      case "VEH":
        return "text-purple-900";
      case "LST":
        return "text-red-500";
      case "BK":
        return "text-green-500";
      default:
        return "text-yellow-700";
    }
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(event.target.value);
    setExpandedCard(null);
  };

  useEffect(() => {
    const fetchALL_MONTHSData = async () => {
      try {
        setLoading(true);
        const promises = ALL_MONTHS.map(async (month) => {
          try {
            const result = await dispatch(
              fetchStatusWiseReport({
                month: MONTH_MAP[month as keyof typeof MONTH_MAP],
                year: Number(selectedYear),
              }),
            ).unwrap();
            return { month, data: result?.data || [] };
          } catch (error) {
            console.error(`Error fetching ${month}:`, error);
            return { month, data: [] };
          }
        });
        const responses = await Promise.all(promises);
        const results: Record<string, any[]> = {};
        responses.forEach(({ month, data }) => {
          results[month] = data;
        });
        setALL_MONTHSData(results);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchALL_MONTHSData();
  }, [selectedYear, dispatch]);

  useEffect(() => {
    if (!Object.keys(ALL_MONTHSData).length) return;
    const employeeMap = new Map();
    for (const month of ALL_MONTHS) {
      const monthData = ALL_MONTHSData[month] || [];
      for (const item of monthData) {
        const name = capitalizeName(item.adviser_name);
        let emp = employeeMap.get(name);
        if (!emp) {
          emp = { adviser_name: name, months: {} };
          employeeMap.set(name, emp);
        }
        emp.months[month] = {
          new: formatValue(item.new),
          kyc: formatValue(item.kyc),
          rfq: formatValue(item.rfq),
          hot: formatValue(item.hot),
          vehn: formatValue(item.vehn),
          lost: formatValue(item.lost),
          book: formatValue(item.book),
          blank: formatValue(item.blank),
          total: formatValue(item.total),
        };
      }
    }
    const emptyMonthData = {
      new: "-",
      kyc: "-",
      rfq: "-",
      hot: "-",
      vehn: "-",
      lost: "-",
      book: "-",
      blank: "-",
      total: "-",
    };
    const finalData = Array.from(employeeMap.values());
    for (const emp of finalData) {
      for (const month of ALL_MONTHS) {
        if (!emp.months[month]) emp.months[month] = { ...emptyMonthData };
      }
    }
    setProcessedData(finalData);
  }, [ALL_MONTHSData]);

  const grandTotal = useMemo(() => {
    return processedData.reduce(
      (sum, emp) =>
        sum +
        ALL_MONTHS.reduce((s, m) => {
          const total = emp.months[m]?.total;
          return s + (total !== "-" ? Number(total) : 0);
        }, 0),
      0,
    );
  }, [processedData]);

  const yearSum = (emp: any, field: string) => {
    let total = 0;
    for (const month of ALL_MONTHS) {
      const value = emp.months[month]?.[field];
      total += value !== "-" ? Number(value) : 0;
    }
    return total;
  };

  const getSummaryStats = () => {
    const totalLeads = processedData.reduce(
      (sum, emp) => sum + yearSum(emp, "total"),
      0,
    );

    // ✅ Jinme koi bhi data aaya ho unhi months ka avg
    const activeMonths = ALL_MONTHS.filter((m) =>
      processedData.some((emp) => emp.months[m]?.total !== "-"),
    ).length;

    const avgPerMonth =
      activeMonths > 0 ? Math.round(totalLeads / activeMonths) : 0;

    // ✅ Top performer = sabse zyada bookings wala
    const topPerformer = processedData.reduce(
      (best, emp) => {
        const book = yearSum(emp, "book");
        if (book > best.total) return { name: emp.adviser_name, total: book };
        return best;
      },
      { name: "", total: 0 },
    );

    return { totalLeads, avgPerMonth, topPerformer };
  };

  const summary = getSummaryStats();

  const getRowColor = (month: string) => {
    if (["APR", "MAY", "JUN"].includes(month))
      return "bg-green-100 hover:bg-green-200";
    if (["JUL", "AUG", "SEP", "OCT"].includes(month))
      return "bg-sky-100 hover:bg-sky-200";
    if (["NOV", "DEC", "JAN"].includes(month))
      return "bg-green-100 hover:bg-green-200";
    return "bg-sky-100 hover:bg-sky-200";
  };

  return (
    <div className="min-h-screen via-white to-slate-100 p-4">
      {/* HEADER */}
      <div className="pl-4 border-l-8 border-orange-600 bg-white px-3 rounded-md shadow-sm mb-4">
        <div className="flex justify-between items-center py-4">
          <h2 className="text-4xl font-bold text-orange-700 p-2">
            📊 Employee Performance TS – {selectedYear}
          </h2>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
            <Filter className="w-4 h-4 text-slate-500" />
            <label
              htmlFor="yearSelect"
              className="text-sm font-medium text-slate-700"
            >
              Select Year:
            </label>
            <select
              id="yearSelect"
              value={selectedYear}
              onChange={handleYearChange}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              {AVAILABLE_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      {!loading && processedData.length > 0 && (
        <div className="grid grid-cols-12 gap-3 mb-4">
          {/* Total Leads - chota col */}
          <div className="col-span-2 bg-white rounded-lg shadow-md border border-slate-100 p-3 flex gap-3">
            <div className="p-1.5 bg-green-700 rounded-md self-start">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-md text-slate-500">Total Leads</p>
              <p className="text-xl font-bold text-slate-800">
                {summary.totalLeads.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Avg per Month - bara col, ek hi row */}
          <div className="col-span-7 bg-white rounded-lg shadow-md border border-slate-100 p-3">
            <p className="text-md text-slate-500 mb-1">Month wise Leads</p>
            <div className="flex flex-nowrap gap-x-2 overflow-x-auto items-center">
              {ALL_MONTHS.map((m, idx) => {
                const monthTotal = processedData.reduce((sum, emp) => {
                  const val = emp.months[m]?.total;
                  return sum + (val !== "-" ? Number(val) : 0);
                }, 0);
                return (
                  <React.Fragment key={m}>
                    <span className="text-[15px] whitespace-nowrap">
                      <span className="text-black font-bold">{m}</span>
                      <span className="text-black font-bold">- </span>
                      <span className="text-green-800 font-bold">
                        {monthTotal}
                      </span>
                    </span>
                    {idx < ALL_MONTHS.length - 1 && (
                      <span className="text-slate-700 font-light text-[18px]">
                        |
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Top Performers - 1st 2nd 3rd */}
          <div className="col-span-3 bg-white rounded-lg shadow-md border border-slate-100 p-3">
            <p className="text-md text-slate-500 mb-2">Top Performers</p>
            <div className="flex items-center justify-between gap-2">
              {processedData
                .map((emp) => ({
                  name: emp.adviser_name,
                  book: yearSum(emp, "book"),
                }))
                .sort((a, b) => b.book - a.book)
                .slice(0, 3)
                .map((emp, idx) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const textColors = [
                    "text-yellow-700",
                    "text-slate-600",
                    "text-amber-700",
                  ];
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-0.5"
                    >
                      <span className="text-[16px]">{medals[idx]}</span>
                      <span
                        className={`text-[15px] font-bold ${textColors[idx]} text-center truncate w-full`}
                      >
                        {capitalizeName(emp.name)}
                      </span>
                      <span className="text-[13px] font-extrabold text-green-800">
                        {emp.book} BK
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-blue-950 animate-spin" />
          <p className="mt-3 text-slate-500 font-medium text-sm">
            Loading performance data for {selectedYear}...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Fetching reports for all months
          </p>
        </div>
      )}

      {/* CARDS GRID */}
      {!loading && processedData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {processedData.map((employee, empIdx) => {
            const empYearlyTotal = yearSum(employee, "total");
            const empYearlyBook = yearSum(employee, "book");
            const contributionPercent =
              grandTotal > 0
                ? Math.round((empYearlyTotal / grandTotal) * 100)
                : 0;
            const bookingPercent =
              empYearlyTotal > 0
                ? Math.round((empYearlyBook / empYearlyTotal) * 100)
                : 0;
            const isExpanded = expandedCard === empIdx;

            return (
              <div
                key={empIdx}
                className={`bg-white rounded-xl shadow-lg border-2 border-green-500 overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isExpanded ? "ring-2 ring-emerald-400 shadow-2xl" : ""
                }`}
              >
                {/* Employee Header */}
                <div
                  className="bg-green-950 p-3 cursor-pointer"
                  onClick={() => setExpandedCard(isExpanded ? null : empIdx)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-extrabold text-white tracking-wider">
                          {formatEmployeeName(employee.adviser_name)}
                        </h2>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-100 text-md font-semibold whitespace-nowrap">
                            Total: {empYearlyTotal}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                            <span className="text-green-700 text-[14px] font-extrabold leading-tight text-center">
                              {bookingPercent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, contributionPercent)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="px-1.5 py-1.5 text-left text-slate-600 font-semibold text-[13px]">
                          Mon
                        </th>
                        <th
                          className={`px-0.5 py-1.5 text-center font-semibold text-[13px] ${getHeadingColor("NEW")}`}
                        >
                          NEW
                        </th>
                        <th
                          className={`px-0.5 py-1.5 text-center font-semibold text-[13px] ${getHeadingColor("KYC")}`}
                        >
                          KYC
                        </th>
                        <th
                          className={`px-0.5 py-1.5 text-center font-semibold text-[13px] ${getHeadingColor("RFQ")}`}
                        >
                          RFQ
                        </th>
                        <th
                          className={`px-0.5 py-1.5 text-center font-semibold text-[13px] ${getHeadingColor("HOT")}`}
                        >
                          HOT
                        </th>
                        <th
                          className={`px-0.5 py-1.5 text-center font-semibold text-[13px] ${getHeadingColor("VEH")}`}
                        >
                          VEH
                        </th>
                        <th
                          className={`px-0.5 py-1.5 text-center font-semibold text-[13px] ${getHeadingColor("LST")}`}
                        >
                          LST
                        </th>
                        <th
                          className={`px-0.5 py-1.5 text-center font-semibold text-[13px] ${getHeadingColor("BK")}`}
                        >
                          BK
                        </th>
                        <th className="px-0.5 py-1.5 text-center text-slate-600 font-semibold text-[13px]">
                          TTL
                        </th>
                        <th className="px-0.5 py-1.5 text-center text-slate-600 font-semibold text-[13px] relative group cursor-help overflow-visible">
                          %
                          <div className="absolute hidden group-hover:flex z-[999] bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-[11px] rounded px-2 py-1 whitespace-nowrap shadow-lg flex-col items-center">
                            <span>(BK ÷ TTL) × 100</span>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                          </div>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {ALL_MONTHS.map((month) => {
                        const d = employee.months[month];
                        const monthTotal =
                          d?.total !== "-" ? Number(d?.total || 0) : 0;
                        const bookVal =
                          d?.book !== "-" && d?.book ? Number(d.book) : 0;
                        const monthContrib =
                          monthTotal > 0
                            ? Math.round((bookVal / monthTotal) * 100)
                            : 0;

                        return (
                          <tr
                            key={month}
                            className={`border-b border-slate-100 transition-colors ${getRowColor(month)}`}
                          >
                            <td className="px-1.5 py-1 font-semibold text-slate-700 whitespace-nowrap text-[13px]">
                              {month}
                            </td>
                            <td
                              className={`px-0.5 py-1 text-center text-[13px] font-bold ${getStatusColor("new")}`}
                            >
                              {d?.new || "-"}
                            </td>
                            <td
                              className={`px-0.5 py-1 text-center text-[13px] font-bold ${getStatusColor("kyc")}`}
                            >
                              {d?.kyc || "-"}
                            </td>
                            <td
                              className={`px-0.5 py-1 text-center text-[13px] font-bold ${getStatusColor("rfq")}`}
                            >
                              {d?.rfq || "-"}
                            </td>
                            <td
                              className={`px-0.5 py-1 text-center text-[13px] font-bold ${getStatusColor("hot")}`}
                            >
                              {d?.hot || "-"}
                            </td>
                            <td
                              className={`px-0.5 py-1 text-center text-[13px] font-bold ${getStatusColor("vehn")}`}
                            >
                              {d?.vehn || "-"}
                            </td>
                            <td
                              className={`px-0.5 py-1 text-center text-[13px] font-bold ${getStatusColor("lost")}`}
                            >
                              {d?.lost || "-"}
                            </td>
                            <td
                              className={`px-0.5 py-1 text-center text-[13px] font-bold ${getStatusColor("book")}`}
                            >
                              {d?.book || "-"}
                            </td>
                            <td className="px-0.5 py-1 text-center text-[13px] font-bold text-emerald-600">
                              {monthTotal === 0 ? "-" : monthTotal}
                            </td>
                            <td className="px-0.5 py-1 text-center text-[13px] font-bold text-green-900">
                              {monthContrib === 0 ? "-" : `${monthContrib}%`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    <tfoot>
                      <tr className="bg-slate-200 font-bold">
                        <td className="px-1.5 py-1.5 text-slate-700 text-[16px] font-bold">
                          Total
                        </td>
                        <td
                          className={`px-0.5 py-1.5 text-center font-bold text-[16px] ${getStatusColor("new")}`}
                        >
                          {formatValue(yearSum(employee, "new"))}
                        </td>
                        <td
                          className={`px-0.5 py-1.5 text-center font-bold text-[16px] ${getStatusColor("kyc")}`}
                        >
                          {formatValue(yearSum(employee, "kyc"))}
                        </td>
                        <td
                          className={`px-0.5 py-1.5 text-center font-bold text-[16px] ${getStatusColor("rfq")}`}
                        >
                          {formatValue(yearSum(employee, "rfq"))}
                        </td>
                        <td
                          className={`px-0.5 py-1.5 text-center font-bold text-[16px] ${getStatusColor("hot")}`}
                        >
                          {formatValue(yearSum(employee, "hot"))}
                        </td>
                        <td
                          className={`px-0.5 py-1.5 text-center font-bold text-[16px] ${getStatusColor("vehn")}`}
                        >
                          {formatValue(yearSum(employee, "vehn"))}
                        </td>
                        <td
                          className={`px-0.5 py-1.5 text-center font-bold text-[16px] ${getStatusColor("lost")}`}
                        >
                          {formatValue(yearSum(employee, "lost"))}
                        </td>
                        <td
                          className={`px-0.5 py-1.5 text-center font-bold text-[16px] ${getStatusColor("book")}`}
                        >
                          {formatValue(yearSum(employee, "book"))}
                        </td>
                        <td className="px-0.5 py-1.5 text-center text-emerald-700 font-bold text-[16px]">
                          {empYearlyTotal === 0 ? "-" : empYearlyTotal}
                        </td>
                        <td className="px-0.5 py-1.5 text-center text-green-900 font-bold text-[16px]">
                          {bookingPercent === 0 ? "-" : `${bookingPercent}%`}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NO DATA */}
      {!loading && processedData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
            <BarChart3 className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-semibold text-base">
            No data found for {selectedYear}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Try selecting a different year
          </p>
        </div>
      )}
    </div>
  );
};

export default Empreport;
