"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  fetchStatusWiseReport,
  fetchStatusWiseDateReport,
} from "@/app/features/Reports/monthlyReport/monthlyReportSlice";
import { AppDispatch } from "@/app/redux/store";
import { Loader2, CalendarDays } from "lucide-react";

const MONTH_MAP: Record<string, number> = {
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

const STATUSES = ["new", "kyc", "rfq", "hot", "vehn", "lost", "book", "blank"];

const STATUS_LABELS: Record<string, string> = {
  new: "NEW",
  kyc: "KYC",
  rfq: "RFQ",
  hot: "HOT",
  vehn: "VEH-N",
  lost: "LOST",
  book: "BOOK",
  blank: "BLANK",
};

const STATUS_STYLE: Record<string, string> = {
  new: "text-emerald-700 bg-emerald-50",
  kyc: "text-blue-700 bg-blue-50",
  rfq: "text-purple-700 bg-purple-50",
  hot: "text-red-700 bg-red-50",
  vehn: "text-amber-700 bg-amber-50",
  lost: "text-gray-700 bg-gray-50",
  book: "text-indigo-700 bg-indigo-50",
  blank: "text-slate-700 bg-slate-50",
};

// Row colors for alternating employees
const rowColors = [
  "bg-indigo-50",
  "bg-cyan-50",
  "bg-rose-50",
  "bg-green-50",
  "bg-purple-50",
  "bg-yellow-50",
];

interface DateWiseData {
  date: string;
  adviser_name: string;
  statuses: Record<string, number>;
  total: number;
}

interface MonthDateWiseData {
  monthName: string;
  dateWiseData: DateWiseData[];
  totals: Record<string, Record<string, number>>;
}

const Empreport = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [dateWiseLoading, setDateWiseLoading] = useState(false);

  const [allMonthsData, setAllMonthsData] = useState<Record<string, any[]>>({});

  const [processedData, setProcessedData] = useState<any[]>([]);

  // Store date-wise data for all months
  const [dateWiseDataMap, setDateWiseDataMap] = useState<
    Record<string, MonthDateWiseData>
  >({});

  // Get unique employees list
  const employeesList = useMemo(() => {
    return processedData.map((emp) => emp.adviser_name);
  }, [processedData]);

  // FETCH ALL MONTHS SUMMARY DATA
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);

        const responses = await Promise.all(
          ALL_MONTHS.map(async (month) => {
            try {
              const result = await dispatch(
                fetchStatusWiseReport({
                  month: MONTH_MAP[month],
                  year: Number(selectedYear),
                }),
              ).unwrap();

              return {
                month,
                data: result?.data || [],
              };
            } catch {
              return {
                month,
                data: [],
              };
            }
          }),
        );

        const formatted: Record<string, any[]> = {};

        responses.forEach((r) => {
          formatted[r.month] = r.data;
        });

        setAllMonthsData(formatted);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [selectedYear, dispatch]);

  // FETCH DATE-WISE DATA FOR SELECTED MONTH
  useEffect(() => {
    const fetchDateWiseData = async () => {
      if (!selectedMonth || selectedMonth === "ALL") return;

      const monthNumber = MONTH_MAP[selectedMonth];

      // Check if already fetched
      if (dateWiseDataMap[selectedMonth]) return;

      try {
        setDateWiseLoading(true);

        const result = await dispatch(
          fetchStatusWiseDateReport({
            month: monthNumber,
            year: Number(selectedYear),
          }),
        ).unwrap();

        setDateWiseDataMap((prev) => ({
          ...prev,
          [selectedMonth]: {
            monthName: selectedMonth,
            dateWiseData: result?.dateWiseData || [],
            totals: result?.totals || {},
          },
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setDateWiseLoading(false);
      }
    };

    fetchDateWiseData();
  }, [selectedMonth, selectedYear, dispatch, dateWiseDataMap]);

  // PROCESS EMPLOYEE SUMMARY DATA
  useEffect(() => {
    const employeeMap = new Map<string, any>();

    for (const month of ALL_MONTHS) {
      const monthData = allMonthsData[month] || [];

      for (const item of monthData) {
        const name = item.adviser_name;

        if (!employeeMap.has(name)) {
          employeeMap.set(name, {
            adviser_name: name,
            months: {},
          });
        }

        employeeMap.get(name).months[month] = {
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

    const emptyMonth = {
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

    finalData.forEach((emp) => {
      ALL_MONTHS.forEach((month) => {
        if (!emp.months[month]) {
          emp.months[month] = { ...emptyMonth };
        }
      });
    });

    setProcessedData(finalData);
  }, [allMonthsData]);

  // Get days in month
  const getDaysInMonth = (month: string, year: number) => {
    const monthNumber = MONTH_MAP[month];
    return new Date(year, monthNumber, 0).getDate();
  };

  // Get date-wise data for current selected month
  const currentDateWiseData =
    selectedMonth !== "ALL" ? dateWiseDataMap[selectedMonth] : null;
  const daysInMonth =
    selectedMonth !== "ALL"
      ? getDaysInMonth(selectedMonth, Number(selectedYear))
      : 0;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Group date-wise data by employee
  const getEmployeeDailyData = (employeeName: string) => {
    if (!currentDateWiseData) return [];
    return currentDateWiseData.dateWiseData.filter(
      (item: any) => item.adviser_name === employeeName,
    );
  };

  const displayMonths = selectedMonth === "ALL" ? ALL_MONTHS : [selectedMonth];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="bg-white rounded-lg shadow p-4 mb-5">
        <h1 className="text-3xl font-bold text-orange-600">
          Employee Performance Report - {selectedYear}
        </h1>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-lg p-4 shadow mb-4 flex gap-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border rounded p-2"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded p-2"
        >
          <option value="ALL">All Months (Summary View)</option>
          {ALL_MONTHS.map((month) => (
            <option key={month}>{month}</option>
          ))}
        </select>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-10 h-10" />
        </div>
      ) : (
        <>
          {selectedMonth === "ALL" ? (
            /* SUMMARY VIEW - Monthly cards */
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {processedData.map((employee, idx) => {
                const yearlyTotal = ALL_MONTHS.reduce(
                  (sum, month) => sum + (employee.months[month]?.total || 0),
                  0,
                );

                return (
                  <div key={idx} className="bg-white rounded-xl shadow">
                    <div className="bg-blue-950 p-4 text-white rounded-t-xl">
                      <h2 className="font-bold text-lg">
                        {employee.adviser_name}
                      </h2>
                      <p>Yearly Total: {yearlyTotal}</p>
                    </div>

                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-100">
                          <th>Month</th>
                          {STATUSES.map((s) => (
                            <th key={s}>{STATUS_LABELS[s]}</th>
                          ))}
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayMonths.map((month) => {
                          const d = employee.months[month];
                          return (
                            <tr key={month}>
                              <td className="font-semibold">{month}</td>
                              {STATUSES.map((status) => (
                                <td key={status}>
                                  <span
                                    className={`px-2 py-1 rounded ${STATUS_STYLE[status]}`}
                                  >
                                    {d?.[status] || 0}
                                  </span>
                                </td>
                              ))}
                              <td className="font-bold">{d?.total || 0}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          ) : (
            /* DAILY BREAKDOWN VIEW - Like distribution report */
            <div className="bg-white rounded-xl shadow">
              <div className="bg-blue-950 p-4 text-white rounded-t-xl">
                <h2 className="font-bold text-xl">
                  Daily Status Breakdown - {selectedMonth} {selectedYear}
                </h2>
                <p className="text-sm opacity-90">
                  Status-wise distribution for all employees
                </p>
              </div>

              {dateWiseLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin w-10 h-10" />
                </div>
              ) : !currentDateWiseData ? (
                <div className="flex justify-center py-20">
                  <p className="text-gray-500">No data available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-400 border-separate border-spacing-0 text-sm">
                    <thead>
                      <tr className="bg-blue-950 text-white sticky top-0">
                        <th className="border-r border-b border-gray-600 px-3 py-2 sticky left-0 bg-blue-950 min-w-[120px]">
                          Employee
                        </th>
                        <th className="border-r border-b border-gray-600 px-3 py-2 min-w-[80px]">
                          Status
                        </th>
                        {daysArray.map((day) => (
                          <th
                            key={day}
                            className="border-r border-b border-gray-600 px-2 py-2 min-w-[50px]"
                          >
                            {day}
                          </th>
                        ))}
                        <th className="border-b border-gray-600 px-3 py-2 min-w-[80px]">
                          TOTAL
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {processedData.map((employee, empIndex) => {
                        const colorIndex = empIndex % rowColors.length;
                        const bgColor = rowColors[colorIndex];
                        const employeeDailyData = getEmployeeDailyData(
                          employee.adviser_name,
                        );
                        const employeeTotals =
                          currentDateWiseData?.totals?.[
                            employee.adviser_name
                          ] || {};

                        return (
                          <React.Fragment key={employee.adviser_name}>
                            {/* LEADS ROW (All statuses combined as one row per status) */}
                            {STATUSES.map((status, statusIdx) => {
                              const isFirstStatus = statusIdx === 0;
                              const statusTotal = employeeTotals[status] || 0;

                              return (
                                <tr
                                  key={`${employee.adviser_name}-${status}`}
                                  className={bgColor}
                                >
                                  {isFirstStatus && (
                                    <td
                                      rowSpan={STATUSES.length}
                                      className={`border-r border-b border-gray-300 px-3 py-2 font-bold text-left sticky left-0 ${bgColor} min-w-[120px]`}
                                    >
                                      {employee.adviser_name}
                                    </td>
                                  )}

                                  <td
                                    className={`border-r border-b border-gray-300 px-3 py-1 ${STATUS_STYLE[status]}`}
                                  >
                                    {STATUS_LABELS[status]}
                                  </td>

                                  {daysArray.map((day) => {
                                    const dayData = employeeDailyData.find(
                                      (d: any) =>
                                        new Date(d.date).getDate() === day,
                                    );
                                    const value =
                                      dayData?.statuses?.[status] || 0;
                                    return (
                                      <td
                                        key={day}
                                        className="border-r border-b border-gray-300 px-2 py-1 text-center"
                                      >
                                        {value > 0 ? value : "-"}
                                      </td>
                                    );
                                  })}

                                  <td
                                    className={`border-b border-gray-300 px-3 py-1 text-center font-bold ${statusTotal > 0 ? "bg-amber-200" : ""}`}
                                  >
                                    {statusTotal || 0}
                                  </td>
                                </tr>
                              );
                            })}

                            {/* Total Row for this employee */}
                            <tr
                              className={`${bgColor} border-b-2 border-gray-400`}
                            >
                              <td
                                colSpan={2}
                                className="border-r border-b border-gray-300 px-3 py-2 font-bold text-right"
                              >
                                TOTAL
                              </td>
                              {daysArray.map((day) => {
                                const dayData = employeeDailyData.find(
                                  (d: any) =>
                                    new Date(d.date).getDate() === day,
                                );
                                const total = dayData?.total || 0;
                                return (
                                  <td
                                    key={day}
                                    className="border-r border-b border-gray-300 px-2 py-2 text-center font-bold bg-amber-100"
                                  >
                                    {total > 0 ? total : "-"}
                                  </td>
                                );
                              })}
                              <td className="border-b border-gray-300 px-3 py-2 text-center font-bold bg-amber-300">
                                {employeeTotals.total || 0}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>

                    {/* Grand Total Row */}
                    {currentDateWiseData && (
                      <tfoot>
                        <tr className="bg-amber-600 text-white font-bold">
                          <td
                            colSpan={2}
                            className="border-r border-gray-600 px-3 py-2 text-center"
                          >
                            GRAND TOTAL
                          </td>
                          {daysArray.map((day) => {
                            let dayTotal = 0;
                            currentDateWiseData.dateWiseData.forEach(
                              (item: any) => {
                                if (new Date(item.date).getDate() === day) {
                                  dayTotal += item.total || 0;
                                }
                              },
                            );
                            return (
                              <td
                                key={day}
                                className="border-r border-gray-600 px-2 py-2 text-center"
                              >
                                {dayTotal}
                              </td>
                            );
                          })}
                          <td className="px-3 py-2 text-center">
                            {Object.values(
                              currentDateWiseData.totals || {},
                            ).reduce(
                              (sum: number, emp: any) => sum + (emp.total || 0),
                              0,
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Empreport;
