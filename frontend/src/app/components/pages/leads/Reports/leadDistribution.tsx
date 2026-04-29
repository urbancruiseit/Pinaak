"use client";
import { fetchLeadDistribution } from "@/app/features/Reports/monthlyReport/monthlyReportSlice";
import { AppDispatch, RootState } from "@/app/redux/store";
import { useState, Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const monthsList = [
  { name: "Jan", num: 1 },
  { name: "Feb", num: 2 },
  { name: "Mar", num: 3 },
  { name: "Apr", num: 4 },
  { name: "May", num: 5 },
  { name: "Jun", num: 6 },
  { name: "Jul", num: 7 },
  { name: "Aug", num: 8 },
  { name: "Sep", num: 9 },
  { name: "Oct", num: 10 },
  { name: "Nov", num: 11 },
  { name: "Dec", num: 12 },
];

const rowColors = [
  { bg: "bg-indigo-50", name: "bg-indigo-50" },
  { bg: "bg-cyan-50",   name: "bg-cyan-50" },
  { bg: "bg-rose-50",   name: "bg-rose-50" },
  { bg: "bg-green-50",  name: "bg-green-50" },
  { bg: "bg-purple-50", name: "bg-purple-50" },
  { bg: "bg-yellow-50", name: "bg-yellow-50" },
];

export default function DailyLeadReport() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear  = String(new Date().getFullYear());

  const [selectedMonthNum, setSelectedMonthNum] = useState(currentMonth);
  const [year, setYear]                         = useState(currentYear);

  const dispatch   = useDispatch<AppDispatch>();
  const { distribution } = useSelector((state: RootState) => state.report);

  useEffect(() => {
    dispatch(fetchLeadDistribution({ month: selectedMonthNum, year }));
  }, [selectedMonthNum, year, dispatch]);

  // API se data
  const apiData        = distribution?.data          ?? [];
  const teamTotal      = distribution?.teamTotal      ?? null;
  const totalDays      = distribution?.totalDaysInMonth ?? 30;
  const daysArray      = Array.from({ length: totalDays }, (_, i) => i);

  const selectedMonthName = monthsList.find((m) => m.num === selectedMonthNum)?.name ?? "";

  const cell     = "border-r border-b border-gray-300 text-center px-1 py-1";
  const headCell = "border-r border-b border-gray-300 px-2 py-2 text-center";

  // Loading state
  if (distribution?.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="">
      {/* HEADER */}
      <div className="mb-4 bg-orange-100 shadow-lg rounded-md flex justify-between items-center">
        <div className="sticky top-0 z-10 bg-orange-100 p-3 rounded-md">
          <div className="pl-4 border-l-8 border-orange-500 bg-white px-3 rounded-md shadow-md">
            <h2 className="text-4xl font-bold text-left py-4 text-orange-600 p-2">
              Leads Distribution Report – {selectedMonthName} {year}
            </h2>
          </div>
        </div>

        <div className="flex gap-3 pr-4">
          <select
            value={selectedMonthNum}
            onChange={(e) => setSelectedMonthNum(Number(e.target.value))}
            className="border rounded px-3 py-2 font-semibold"
          >
            {monthsList.map((m) => (
              <option key={m.num} value={m.num}>{m.name}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border rounded px-3 py-2 font-semibold"
          >
            {["2024", "2025", "2026", "2027"].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* NO DATA */}
      {apiData.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-400 text-lg">No data found for this period.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-400 border-separate border-spacing-0 text-md font-semibold">
            <thead>
              <tr className="bg-blue-950 text-white">
                <th className={headCell}>NAME</th>
                <th className={headCell}>STATUS</th>
                {daysArray.map((d) => (
                  <th key={d} className={headCell}>{d + 1}</th>
                ))}
                <th className="border-b border-white bg-blue-950 text-white px-2 py-2">TOTAL</th>
                <th className="border-b border-white bg-blue-950 text-white px-2 py-2">AVG/DAY</th>
                <th className="border-b border-white bg-blue-950 text-white px-2 py-2">CNTB %</th>
              </tr>
            </thead>

            <tbody>
              {apiData.map((adviser: any, index: number) => {
                const color = rowColors[index % rowColors.length];

                return (
                  <Fragment key={adviser.adviser_id}>
                    {/* LEADS ROW */}
                    <tr className={color.bg}>
                      <td
                        rowSpan={2}
                        className={`${cell} font-bold text-xl ${color.name}`}
                      >
                        {adviser.adviser_name}
                      </td>

                      <td className={`${cell} text-blue-700`}>Lead</td>

                      {adviser.days.map((d: any) => (
                        <td key={d.day} className={cell}>
                          {d.leads || 0}
                        </td>
                      ))}

                      <td className={`${cell} font-extrabold text-green-700 bg-amber-200`}>
                        {adviser.total_leads}
                      </td>
                      <td className={`${cell} font-extrabold bg-amber-200`}>
                        {adviser.avg_leads_per_day}
                      </td>
                      <td
                        rowSpan={2}
                        className="border-b border-gray-400 px-2 py-1 font-extrabold text-purple-700 bg-amber-200 text-center"
                      >
                        {adviser.cntb_percentage}%
                      </td>
                    </tr>

                    {/* BOOKED ROW */}
                    <tr className={color.bg}>
                      <td className={`${cell} text-pink-700`}>Book</td>

                      {adviser.days.map((d: any) => (
                        <td key={d.day} className={cell}>
                          {d.booked || 0}
                        </td>
                      ))}

                      <td className={`${cell} font-extrabold text-red-600 bg-amber-200`}>
                        {adviser.total_booked}
                      </td>
                      <td className={`${cell} font-extrabold text-red-600 bg-amber-200`}>
                        —
                      </td>
                    </tr>
                  </Fragment>
                );
              })}

              {/* TEAM TOTAL ROW */}
              {teamTotal && (
                <tr className="bg-amber-600 text-white font-extrabold">
                  <td colSpan={2} className={cell}>Team Total</td>

                  {teamTotal.days.map((d: any) => (
                    <td key={d.day} className={cell}>
                      {d.leads || 0}
                    </td>
                  ))}

                  <td className={cell}>{teamTotal.total_leads}</td>
                  <td className={cell}>—</td>
                  <td className="text-center px-2">
                    {teamTotal.total_leads > 0
                      ? ((teamTotal.total_booked / teamTotal.total_leads) * 100).toFixed(1)
                      : "0.0"}%
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}