"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStatusWiseReport } from "@/app/features/Reports/monthlyReport/monthlyReportSlice";
import { AppDispatch } from "@/app/redux/store";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  Download,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";

const MONTH_MAP = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};
const ALL_MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const Empreport = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedYear, setSelectedYear] = useState("2026");
  const [ALL_MONTHSData, setALL_MONTHSData] = useState<Record<string, any[]>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  interface MonthData {
    new: number;
    kyc: number;
    rfq: number;
    hot: number;
    vehn: number;
    lost: number;
    book: number;
    blank: number;
    total: number;
  }

  interface EmployeeData {
    adviser_name: string;
    months: Record<string, MonthData>;
  }

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

            return {
              month,
              data: result?.data || [],
            };
          } catch (error) {
            console.error(`Error fetching ${month}:`, error);
            return {
              month,
              data: [],
            };
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

  // Transform: group by employee → month
  useEffect(() => {
    if (!Object.keys(ALL_MONTHSData).length) return;

    const employeeMap = new Map();

    for (const month of ALL_MONTHS) {
      const monthData = ALL_MONTHSData[month] || [];

      for (const item of monthData) {
        const name = item.adviser_name;

        let emp = employeeMap.get(name);

        if (!emp) {
          emp = {
            adviser_name: name,
            months: {},
          };

          employeeMap.set(name, emp);
        }

        emp.months[month] = {
          new: item.new || 0,
          kyc: item.kyc || 0,
          rfq: item.rfq || 0,
          hot: item.hot || 0,
          vehn: item.vehn || 0,
          lost: item.lost || 0,
          book: item.book || 0,
          blank: item.blank || 0,
          total: item.total || 0,
        };
      }
    }

    const empty = {
      new: 0,
      kyc: 0,
      rfq: 0,
      hot: 0,
      vehn: 0,
      lost: 0,
      book: 0,
      blank: 0,
      total: 0,
    };

    const finalData = Array.from(employeeMap.values());

    for (const emp of finalData) {
      for (const month of ALL_MONTHS) {
        if (!emp.months[month]) {
          emp.months[month] = empty;
        }
      }
    }

    setProcessedData(finalData);
  }, [ALL_MONTHSData]);

  // Grand total for CONT%
  const grandTotal = useMemo(() => {
    return processedData.reduce(
      (sum, emp) =>
        sum + ALL_MONTHS.reduce((s, m) => s + (emp.months[m]?.total || 0), 0),
      0,
    );
  }, [processedData]);

  const yearSum = (emp: any, field: string) => {
    let total = 0;

    for (const month of ALL_MONTHS) {
      total += emp.months[month]?.[field] || 0;
    }

    return total;
  };

  const getSummaryStats = () => {
    const totalLeads = processedData.reduce(
      (sum, emp) => sum + yearSum(emp, "total"),
      0,
    );
    const avgPerEmployee = totalLeads / (processedData.length || 1);
    const topPerformer = processedData.reduce(
      (best, emp) => {
        const total = yearSum(emp, "total");
        if (total > best.total) return { name: emp.adviser_name, total };
        return best;
      },
      { name: "", total: 0 },
    );

    return { totalLeads, avgPerEmployee, topPerformer };
  };

  const summary = getSummaryStats();

  return (
    <div className="min-h-screen  via-white to-slate-100 p-4">
      {/* HEADER */}

      <div className="pl-4 border-l-8 border-orange-600 bg-white px-3 rounded-md shadow-sm">
        <h2 className="text-4xl font-bold text-left py-4 text-orange-700 p-2">
          📊 Employee Performance Report – {selectedYear}
        </h2>
      </div>

      {/* SUMMARY CARDS */}
      {!loading && processedData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow-md border border-slate-100 p-3 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-950" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Leads</p>
              <p className="text-xl font-bold text-slate-800">
                {summary.totalLeads.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-slate-100 p-3 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Avg per Employee</p>
              <p className="text-xl font-bold text-slate-800">
                {summary.avgPerEmployee.toFixed(1)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-slate-100 p-3 flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Top Performer</p>
              <p className="text-base font-bold text-slate-800 truncate">
                {summary.topPerformer.name || "—"}
              </p>
              <p className="text-xs text-blue-950">
                {summary.topPerformer.total} leads
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-blue-950 animate-spin" />
          <p className="mt-3 text-slate-500 font-medium text-sm">
            Loading performance data...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Fetching reports for all months
          </p>
        </div>
      )}

      {/* CARDS GRID */}
      {!loading && processedData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {processedData.map((employee, empIdx) => {
            const empYearlyTotal = yearSum(employee, "total");
            const contributionPercent =
              grandTotal > 0
                ? ((empYearlyTotal / grandTotal) * 100).toFixed(1)
                : "0.0";
            const isExpanded = expandedCard === empIdx;

            return (
              <div
                key={empIdx}
                className={`bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isExpanded ? "ring-2 ring-emerald-400 shadow-2xl" : ""
                }`}
              >
                {/* Employee Header */}
                <div
                  className="bg-blue-950 p-3 cursor-pointer"
                  onClick={() => setExpandedCard(isExpanded ? null : empIdx)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {employee.adviser_name}
                      </h2>
                      <div className="flex gap-3 mt-0.5">
                        <span className="text-emerald-100 text-xs">
                          Yearly Total: {empYearlyTotal}
                        </span>
                        <span className="text-emerald-100 text-xs">
                          Contribution: {contributionPercent}%
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  {/* Mini progress bar */}
                  <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, parseFloat(contributionPercent))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-2 py-1.5 text-left text-slate-600 font-semibold text-xs">
                          Month
                        </th>
                        <th className="px-1 py-1.5 text-center text-slate-600 font-semibold text-xs">
                          NEW
                        </th>
                        <th className="px-1 py-1.5 text-center text-slate-600 font-semibold text-xs">
                          KYC
                        </th>
                        <th className="px-1 py-1.5 text-center text-slate-600 font-semibold text-xs">
                          RFQ
                        </th>
                        <th className="px-1 py-1.5 text-center text-slate-600 font-semibold text-xs">
                          HOT
                        </th>
                        <th className="px-1 py-1.5 text-center text-slate-600 font-semibold text-xs">
                          VEH-N
                        </th>
                        <th className="px-1 py-1.5 text-center text-slate-600 font-semibold text-xs">
                          LOST
                        </th>
                        <th className="px-1 py-1.5 text-center text-slate-600 font-semibold text-xs">
                          BOOK
                        </th>
                        <th className="px-1 py-1.5 text-center text-slate-600 font-semibold text-xs">
                          TOTAL
                        </th>
                        <th className="px-1 py-1.5 text-center text-slate-600 font-semibold text-xs">
                          %
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {ALL_MONTHS.map((month, monthIdx) => {
                        const d = employee.months[month];
                        const monthTotal = d?.total || 0;
                        const monthContrib =
                          empYearlyTotal > 0
                            ? ((monthTotal / empYearlyTotal) * 100).toFixed(1)
                            : "0.0";

                        return (
                          <tr
                            key={month}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-2 py-1 font-semibold text-slate-700 whitespace-nowrap text-xs">
                              {month}
                            </td>
                            <td className="px-1 py-1 text-center">
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded font-bold text-sm text-emerald-700 min-w-[32px]">
                                {d?.new || 0}
                              </span>
                            </td>
                            <td className="px-1 py-1 text-center">
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded font-bold text-sm text-blue-700 min-w-[32px]">
                                {d?.kyc || 0}
                              </span>
                            </td>
                            <td className="px-1 py-1 text-center">
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded font-bold text-sm text-purple-700 min-w-[32px]">
                                {d?.rfq || 0}
                              </span>
                            </td>
                            <td className="px-1 py-1 text-center">
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded font-bold text-sm text-red-700 min-w-[32px]">
                                {d?.hot || 0}
                              </span>
                            </td>
                            <td className="px-1 py-1 text-center">
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded font-bold text-sm text-amber-700 min-w-[32px]">
                                {d?.vehn || 0}
                              </span>
                            </td>
                            <td className="px-1 py-1 text-center">
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded font-bold text-sm text-gray-600 min-w-[32px]">
                                {d?.lost || 0}
                              </span>
                            </td>
                            <td className="px-1 py-1 text-center">
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded font-bold text-sm text-indigo-700 min-w-[32px]">
                                {d?.book || 0}
                              </span>
                            </td>
                            <td className="px-1 py-1 text-center">
                              <span className="font-bold text-sm text-emerald-600">
                                {monthTotal}
                              </span>
                            </td>
                            <td className="px-1 py-1 text-center">
                              <span className="text-blue-600 font-bold text-sm">
                                {monthContrib}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    <tfoot>
                      <tr className="bg-slate-50 font-bold">
                        <td className="px-2 py-1.5 text-slate-700 text-xs">
                          Total
                        </td>
                        <td className="px-1 py-1.5 text-center text-emerald-700 font-bold text-sm">
                          {yearSum(employee, "new")}
                        </td>
                        <td className="px-1 py-1.5 text-center text-blue-700 font-bold text-sm">
                          {yearSum(employee, "kyc")}
                        </td>
                        <td className="px-1 py-1.5 text-center text-purple-700 font-bold text-sm">
                          {yearSum(employee, "rfq")}
                        </td>
                        <td className="px-1 py-1.5 text-center text-red-700 font-bold text-sm">
                          {yearSum(employee, "hot")}
                        </td>
                        <td className="px-1 py-1.5 text-center text-amber-700 font-bold text-sm">
                          {yearSum(employee, "vehn")}
                        </td>
                        <td className="px-1 py-1.5 text-center text-gray-600 font-bold text-sm">
                          {yearSum(employee, "lost")}
                        </td>
                        <td className="px-1 py-1.5 text-center text-indigo-700 font-bold text-sm">
                          {yearSum(employee, "book")}
                        </td>
                        <td className="px-1 py-1.5 text-center text-emerald-700 font-bold text-base">
                          {empYearlyTotal}
                        </td>
                        <td className="px-1 py-1.5 text-center text-blue-700 font-bold text-sm">
                          {contributionPercent}%
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
