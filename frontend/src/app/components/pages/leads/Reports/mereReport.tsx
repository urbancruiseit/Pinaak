// MonthlyEnquiryReport.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMonthlyEnquiry } from "../../../../features/Reports/monthlyReport/monthlyReportSlice";
import { RootState, AppDispatch } from "@/app/redux/store";

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const MONTH_NAMES = [
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

const getMonthsData = (year: number) => {
  return MONTH_NAMES.map((name, index) => ({
    name,
    days: getDaysInMonth(year, index),
    firstDay: getFirstDayOfMonth(year, index),
  }));
};

function getMonthColorClass(monthName: string): string {
  if (["APR", "MAY", "JUN"].includes(monthName)) return "bg-green-300";
  if (["JUL", "AUG", "SEP", "OCT"].includes(monthName)) return "bg-cyan-300";
  if (["NOV", "DEC", "JAN"].includes(monthName)) return "bg-green-300";
  if (["FEB", "MAR"].includes(monthName)) return "bg-cyan-300";

  return "";
}

// ─── Current year & month (dynamic) ───────────────────────
const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH = MONTH_NAMES[now.getMonth()];

// Year range: 2 pehle se 2 baad tak
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) =>
  (CURRENT_YEAR - 2 + i).toString(),
);

export default function MonthlyEnquiryReport() {
  const [year, setYear] = useState(CURRENT_YEAR.toString());
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);

  const dispatch = useDispatch<AppDispatch>();

  // ─── Redux State ───────────────────────────────────────────
  const {
    data: apiData,
    loading,
    error,
  } = useSelector((s: RootState) => s.report);
  // ─── Fetch on year change ──────────────────────────────────
  useEffect(() => {
    dispatch(fetchMonthlyEnquiry(Number(year)));
  }, [year, dispatch]);
  // ─── Process data ──────────────────────────────────────────
  const reportData = useMemo(() => {
    const monthsData = getMonthsData(Number(year));

    return monthsData.map((month, index) => {
      const monthNumber = index + 4;
      const dailyData = Array(month.days).fill(0);

      if (apiData && apiData.length > 0) {
        apiData.forEach((item) => {
          if (item.month === monthNumber && item.day <= month.days) {
            dailyData[item.day - 1] = item.total;
          }
        });
      }
      const total = dailyData.reduce((a: number, b: number) => a + b, 0);
      const avg = Math.round(total / month.days);

      return { ...month, dailyData, total, avg };
    });
  }, [apiData, year]);

  const grandTotal = reportData.reduce((acc, m) => acc + m.total, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 font-semibold">❌ Error: {error}</p>
          <button
            onClick={() => dispatch(fetchMonthlyEnquiry(Number(year)))}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 bg-orange-100 p-3 rounded-md mb-4 border border-orange-200 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="pl-4 border-l-8 border-orange-600 bg-white px-3 rounded-md shadow-sm">
            <h2 className="text-4xl font-bold text-left py-4 text-orange-700 p-2">
              📊 Monthly Enquiry Report – {year}
            </h2>
          </div>

          <div className="flex gap-4">
            {/* Year Select */}
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border border-gray-600 p-2 rounded bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── No Data Warning ── */}
      {apiData.length === 0 && !loading && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center text-yellow-700 font-medium">
          ⚠️ No data found for year {year}
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto border border-gray-600 rounded-lg shadow-sm">
        <table className="border-collapse w-full text-center font-bold">
          <thead className="bg-yellow-300 text-blue-900 text-2xl">
            <tr>
              <th className="border border-gray-600 p-3 font-bold text-xl">
                MONTH
              </th>

              {[...Array(31)].map((_, i) => (
                <th
                  key={i}
                  className="border border-gray-600 p-2 font-bold text-lg"
                >
                  {i + 1}
                </th>
              ))}

              <th className="border border-gray-600 p-3 font-bold text-green-600 text-xl">
                TOTAL
              </th>

              <th className="border border-gray-600 p-3 font-bold text-red-600 text-xl">
                AVG
              </th>
            </tr>
          </thead>

          <tbody>
            {reportData.map((month, idx) => {
              const monthColor = getMonthColorClass(month.name);
              return (
                <tr key={idx}>
                  <td
                    className={`border border-gray-600 p-2 font-bold text-xl ${monthColor}`}
                  >
                    {month.name}
                  </td>

                  {month.dailyData.map((value: number, i: number) => (
                    <td
                      key={i}
                      className={`border border-gray-600 p-1 text-lg ${monthColor} ${value > 0 ? "font-bold" : ""}`}
                    >
                      {value > 0 ? value : ""}
                    </td>
                  ))}

                  {[...Array(31 - month.days)].map((_, i) => (
                    <td
                      key={i}
                      className={`border border-gray-600 p-1 ${monthColor}`}
                    />
                  ))}

                  <td className="border border-gray-600 p-2 bg-amber-200 font-bold text-green-800 text-xl">
                    {month.total}
                  </td>

                  <td className="border border-gray-600 p-2 bg-amber-200 font-bold text-red-800 text-xl">
                    {month.avg}
                  </td>
                </tr>
              );
            })}

            {/* ── Grand Total Row ── */}
            {/* ── Grand Total Row ── */}
            <tr className="bg-yellow-200 text-black font-bold text-lg">
              <td className="border border-gray-600 p-2 text-xl">TOTAL</td>

              {[...Array(31)].map((_, dateIndex) => {
                const dailyTotal = reportData.reduce((sum, month) => {
                  if (dateIndex < month.days) {
                    return sum + (month.dailyData[dateIndex] || 0);
                  }
                  return sum;
                }, 0);

                return (
                  <td
                    key={dateIndex}
                    className="border border-gray-600 p-2 text-lg"
                  >
                    {dailyTotal > 0 ? dailyTotal : ""}
                  </td>
                );
              })}

              <td className="border border-gray-600 p-2 text-2xl font-extrabold text-green-700">
                {grandTotal}
              </td>

              <td className="border border-gray-600 p-2 text-xl font-bold text-red-700">
                {/* empty avg cell */}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
