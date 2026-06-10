"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/store";
import { fetchMonthlyReportTwo } from "../../../../features/Reports/monthlyReport/monthlyReportSlice";

export default function MonthlyEnquiryReportUI() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error, year } = useSelector(
    (state: RootState) => state.report,
  );

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    dispatch(fetchMonthlyReportTwo(currentYear));
  }, [dispatch]);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
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

  const currentMonthIndex = new Date().getMonth();
  const orderedMonths = [
    ...months.slice(currentMonthIndex),
    ...months.slice(0, currentMonthIndex),
  ];

  const firstContainerMonths = orderedMonths.slice(0, 6);
  const secondContainerMonths = orderedMonths.slice(6, 12);
  const containers = [firstContainerMonths, secondContainerMonths];

  // Helper: slice data se ek month ka day-wise data nikalo
  const getMonthData = (monthName: string): Record<number, number> => {
    const record = data.find((r) => r.month === monthName);
    return record?.dates ?? {};
  };

  // Helper: ek row ka total nikalo
  const getRowTotal = (monthName: string): number => {
    const dates = getMonthData(monthName);
    return Object.values(dates).reduce((sum, v) => sum + v, 0);
  };

  // Helper: average (non-zero days)
  const getRowAvg = (monthName: string): string => {
    const dates = getMonthData(monthName);
    const values = Object.values(dates).filter((v) => v > 0);
    if (!values.length) return "-";
    return (values.reduce((s, v) => s + v, 0) / values.length).toFixed(1);
  };

  // Helper: column total (day-wise sum across all displayed months)
  const getColTotal = (day: number, displayMonths: string[]): number => {
    return displayMonths.reduce((sum, month) => {
      return sum + (getMonthData(month)[day] ?? 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-lg">
        Loading report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4 overflow-auto bg-white">
      {containers.map((displayMonths, index) => (
        <div
          key={index}
          className="border-[3px] border-black mb-8 min-w-[1700px]"
        >
          {/* Header */}
          <div className="flex">
            <div className="w-[70px] bg-purple-700 border-r border-black"></div>
            <div className="flex-1 bg-green-700 text-white text-center font-bold text-2xl py-1 border-r border-black">
              MONTHLY ENQUIRY REPORT - LEAD TRENDS
            </div>
            <div className="w-[120px] bg-green-700 text-yellow-300 text-center font-bold text-xl border-r border-black flex items-center justify-center">
              DELHI
            </div>
            <div className="w-[100px] bg-pink-600 text-white text-center font-bold text-xl border-r border-black flex items-center justify-center">
              {displayMonths[0]}
            </div>
            <div className="w-[350px] bg-yellow-300 text-green-700 text-center font-bold text-lg flex items-center justify-center">
              {displayMonths.join(" | ")}
            </div>
          </div>

          {/* Table */}
          <table className="border-collapse w-full">
            <thead>
              <tr>
                <th className="border border-gray-500 bg-yellow-200 w-[80px]">
                  Month
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="border border-gray-500 bg-yellow-100 text-xs w-[40px]"
                  >
                    {day}
                  </th>
                ))}
                <th className="border border-gray-500 bg-yellow-300 w-[70px]">
                  TOT
                </th>
                <th className="border border-gray-500 bg-yellow-300 w-[70px]">
                  AVG
                </th>
                <th className="border border-gray-500 bg-yellow-300 w-[70px]">
                  AVG-2
                </th>
              </tr>
            </thead>

            <tbody>
              {displayMonths.map((month) => {
                const monthDates = getMonthData(month);
                const total = getRowTotal(month);
                const avg = getRowAvg(month);

                return (
                  <tr key={month}>
                    <td className="border border-gray-400 text-red-600 font-semibold text-center">
                      {month}
                    </td>
                    {days.map((day) => {
                      const val = monthDates[day];
                      return (
                        <td
                          key={day}
                          className={`border border-gray-300 h-7 text-center text-xs ${
                            val > 0 ? "bg-white font-medium" : "bg-gray-100"
                          }`}
                        >
                          {val > 0 ? val : "\u00A0"}
                        </td>
                      );
                    })}
                    <td className="border border-gray-400 bg-lime-200 text-center text-xs font-semibold">
                      {total > 0 ? total : ""}
                    </td>
                    <td className="border border-gray-400 bg-lime-200 text-center text-xs">
                      {avg !== "-" ? avg : ""}
                    </td>
                    <td className="border border-gray-400 bg-lime-200"></td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr>
                <td className="border border-black bg-yellow-300 font-bold text-center">
                  TOTAL
                </td>
                {days.map((day) => {
                  const colTotal = getColTotal(day, displayMonths);
                  return (
                    <td
                      key={day}
                      className="border border-black bg-yellow-100 text-center text-xs font-semibold"
                    >
                      {colTotal > 0 ? colTotal : ""}
                    </td>
                  );
                })}
                <td className="border border-black bg-yellow-300 text-center text-xs font-bold">
                  {displayMonths.reduce((s, m) => s + getRowTotal(m), 0) || ""}
                </td>
                <td className="border border-black bg-yellow-300"></td>
                <td className="border border-black bg-yellow-300"></td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
