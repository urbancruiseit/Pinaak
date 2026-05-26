"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStatusWiseDateReport } from "@/app/features/Reports/monthlyReport/monthlyReportSlice";
import { AppDispatch } from "@/app/redux/store";
import { Loader2 } from "lucide-react";

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

const rowColors = [
  "bg-indigo-50",
  "bg-cyan-50",
  "bg-rose-50",
  "bg-green-50",
  "bg-purple-50",
  "bg-yellow-50",
];

const Empreport = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [selectedYear, setSelectedYear] = useState("2026");

  const [selectedMonth, setSelectedMonth] = useState("MAY");

  const [loading, setLoading] = useState(false);

  const [employees, setEmployees] = useState<any[]>([]);

  // Date Wise API Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const result = await dispatch(
          fetchStatusWiseDateReport({
            month: MONTH_MAP[selectedMonth],
            year: Number(selectedYear),
          }),
        ).unwrap();

        console.log("DATE REPORT API:", result);

        const safeEmployees = Array.isArray(result?.data) ? result.data : [];

        setEmployees(safeEmployees);
      } catch (err) {
        console.error("Date Report Error:", err);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear, dispatch]);

  const daysInMonth = new Date(
    Number(selectedYear),
    MONTH_MAP[selectedMonth],
    0,
  ).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="">
      {/* HEADER */}
      <div className="mb-4 bg-orange-100 shadow-lg rounded-md flex justify-between items-center">
        <div className="sticky top-0 z-10 bg-orange-100 p-3 rounded-md">
          <div className="pl-4 border-l-8 border-orange-500 bg-white px-3 rounded-md shadow-md">
            <h2 className="text-4xl font-bold text-left py-4 text-orange-600 p-2">
              Employee Performance Report -{selectedMonth} {selectedYear}
            </h2>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-2 shadow mb-4 flex gap-2">
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
            {ALL_MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-10 h-10" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-blue-950 text-white">
                <th className="sticky left-0 bg-blue-950 border p-2 w-auto">
                  EMP
                </th>

                <th className="border p-1 min-w-[50px] ">Status</th>

                {daysArray.map((day) => (
                  <th key={day} className="border p-2 min-w-[50px]">
                    {day}
                  </th>
                ))}

                <th className="border p-2 bg-amber-700">TOTAL</th>
              </tr>
            </thead>

            <tbody>
              {employees.length > 0 ? (
                employees.map((employee, empIndex) => {
                  const bgColor = rowColors[empIndex % rowColors.length];

                  const days = Array.isArray(employee?.days)
                    ? employee.days
                    : [];

                  const totals = employee?.totals || {};

                  return (
                    <React.Fragment key={employee?.adviser_id}>
                      {STATUSES.map((status, statusIdx) => (
                        <tr
                          key={`${employee?.adviser_id}-${status}`}
                          className={bgColor}
                        >
                          {statusIdx === 0 && (
                            <td
                              rowSpan={STATUSES.length + 1}
                              className={`sticky left-0 border font-bold ${bgColor} w-[35px] min-w-[35px] max-w-[35px] p-0 text-center align-middle`}
                            >
                              <div
                                className="flex items-center justify-center mx-auto font-extrabold text-base"
                                style={{
                                  writingMode: "vertical-rl",
                                  transform: "rotate(180deg)",
                                  whiteSpace: "nowrap",
                                  lineHeight: "16px",
                                  padding: "6px 0",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                {employee?.adviser_name}
                              </div>
                            </td>
                          )}

                          <td className={`border p-2 ${STATUS_STYLE[status]}`}>
                            {STATUS_LABELS[status]}
                          </td>

                          {daysArray.map((dayNo) => {
                            const dayData =
                              days.find((d: any) => d.day === dayNo) || {};

                            return (
                              <td
                                key={dayNo}
                                className="border text-center font-semibold"
                              >
                                {(dayData?.[status] || 0) > 0
                                  ? dayData[status]
                                  : "-"}
                              </td>
                            );
                          })}

                          <td className="border text-center bg-amber-200 font-bold">
                            {totals[status] || 0}
                          </td>
                        </tr>
                      ))}
                      {/* TOTAL ROW */}
                      <tr className="bg-amber-500 text-lg font-extrabold ">
                        <td className="border text-center px-3 py-2">TOTAL</td>

                        {daysArray.map((dayNo) => {
                          const dayData =
                            days.find((d: any) => d.day === dayNo) || {};

                          return (
                            <td
                              key={dayNo}
                              className="border text-center text-base font-semibold"
                            >
                              {(dayData?.total || 0) > 0 ? dayData.total : "-"}
                            </td>
                          );
                        })}

                        <td className="border bg-amber-300 text-center font-bold">
                          {totals.total || 0}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={daysArray.length + 3}
                    className="text-center py-10 text-gray-500"
                  >
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Empreport;
