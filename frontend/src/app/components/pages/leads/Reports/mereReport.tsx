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

const MONTH_NAME_TO_NUMBER: { [key: string]: number } = {
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

const MONTH_NAME_TO_INDEX: { [key: string]: number } = {
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
  JAN: 0,
  FEB: 1,
  MAR: 2,
};

const getMonthsData = (year: number) => {
  return MONTH_NAMES.map((name) => {
    const monthIndex = MONTH_NAME_TO_INDEX[name];
    const days = getDaysInMonth(year, monthIndex);
    return {
      name,
      monthNumber: MONTH_NAME_TO_NUMBER[name],
      days,
      firstDay: getFirstDayOfMonth(year, monthIndex),
    };
  });
};

function getMonthColorClass(monthName: string): string {
  if (["APR", "MAY", "JUN"].includes(monthName)) return "bg-green-300";
  if (["JUL", "AUG", "SEP", "OCT"].includes(monthName)) return "bg-cyan-300";
  if (["NOV", "DEC", "JAN"].includes(monthName)) return "bg-green-300";
  if (["FEB", "MAR"].includes(monthName)) return "bg-cyan-300";
  return "";
}

const isSunday = (year: number, monthIndex: number, day: number): boolean => {
  return new Date(year, monthIndex, day).getDay() === 0;
};

const now = new Date();
const CURRENT_YEAR = now.getFullYear();

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) =>
  (CURRENT_YEAR - 2 + i).toString(),
);

export default function MonthlyEnquiryReport() {
  const [year, setYear] = useState(CURRENT_YEAR.toString());

  const dispatch = useDispatch<AppDispatch>();

  const {
    data: apiData,
    loading,
    error,
  } = useSelector((s: RootState) => s.report);

  useEffect(() => {
    dispatch(fetchMonthlyEnquiry(Number(year)));
  }, [year, dispatch]);

  const reportData = useMemo(() => {
    const monthsData = getMonthsData(Number(year));

    return monthsData.map((month) => {
      const dailyData = Array(month.days).fill(0);

      if (apiData && apiData.length > 0) {
        apiData.forEach((item) => {
          if (item.month === month.monthNumber && item.day <= month.days) {
            dailyData[item.day - 1] = item.total;
          }
        });
      }

      const total = dailyData.reduce((a: number, b: number) => a + b, 0);

      // AVG: sirf data wale dino se divide
      const activeDays = dailyData.filter((v: number) => v > 0).length;
      const avg = activeDays > 0 ? Math.round(total / activeDays) : 0;

      return { ...month, dailyData, total, avg };
    });
  }, [apiData, year]);

  const grandTotal = reportData.reduce((acc, m) => acc + m.total, 0);

  // ── Grand AVG: sirf un months ka average jisme koi data aaya ho ──
  // Formula: un months ke avg ka average jinka total > 0
  const activeMonths = reportData.filter((m) => m.total > 0);
  const grandAvg =
    activeMonths.length > 0
      ? Math.round(
          activeMonths.reduce((sum, m) => sum + m.avg, 0) / activeMonths.length,
        )
      : 0;

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
      <style>{`
        .high-value {
          display: inline-block;
          color: #7c2d12;
          font-weight: 900;
        }
        .sunday-cell {
          color: #b91c1c;
          font-weight: 900;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="sticky top-0 z-10 bg-orange-100 p-3 rounded-md mb-4 border border-orange-200 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="pl-4 border-l-8 border-orange-600 bg-white px-3 rounded-md shadow-sm">
            <h2 className="text-4xl font-bold text-left py-4 text-orange-700 p-2">
              📊 Monthly Enquiry Report – {year}
            </h2>
          </div>

          <div className="flex gap-4">
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

        {/* ── Legend ── */}
        <div className="flex gap-4 mt-2 pl-1 text-sm font-semibold">
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 rounded bg-red-200 border border-red-400" />
            Sunday
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 rounded bg-orange-400 border border-orange-600" />
            Enquiry &gt; 50
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 rounded bg-orange-200 border border-orange-400" />
            Sunday + &gt; 50
          </span>
        </div>
      </div>

      {/* ── No Data Warning ── */}
      {(!apiData || apiData.length === 0) && !loading && (
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
              const monthIndex = MONTH_NAME_TO_INDEX[month.name];

              return (
                <tr key={idx}>
                  <td
                    className={`border border-gray-600 p-2 font-bold text-xl ${monthColor}`}
                  >
                    {month.name}
                  </td>

                  {month.dailyData.map((value: number, i: number) => {
                    const dayNumber = i + 1;
                    const sunday = isSunday(
                      Number(year),
                      monthIndex,
                      dayNumber,
                    );
                    const highValue = value > 50;

                    let cellBg = "";
                    if (sunday && highValue) cellBg = "!bg-orange-200";
                    else if (highValue) cellBg = "!bg-orange-400";
                    else if (sunday) cellBg = "!bg-red-200";

                    return (
                      <td
                        key={i}
                        className={`border border-gray-600 p-1 text-lg ${monthColor} ${cellBg}`}
                      >
                        {value > 0 ? (
                          <span
                            className={
                              highValue
                                ? "high-value"
                                : sunday
                                  ? "sunday-cell"
                                  : ""
                            }
                          >
                            {value}
                          </span>
                        ) : (
                          ""
                        )}
                      </td>
                    );
                  })}

                  {[...Array(31 - month.days)].map((_, i) => (
                    <td
                      key={`empty-${i}`}
                      className={`border border-gray-600 p-1 ${monthColor}`}
                    />
                  ))}

                  <td className="border border-gray-600 p-2 bg-amber-200 font-bold text-green-800 text-xl">
                    {month.total}
                  </td>

                  <td className="border border-gray-600 p-2 bg-amber-200 font-bold text-red-800 text-xl">
                    {month.avg > 0 ? month.avg : ""}
                  </td>
                </tr>
              );
            })}

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

              {/* ── Grand AVG: active months ke avg ka average ── */}
              <td className="border border-gray-600 p-2 text-2xl font-extrabold text-red-700">
                {grandAvg > 0 ? grandAvg : ""}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
