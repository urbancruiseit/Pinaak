"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/store";
import { fetchMonthlyReportTwo } from "../../../../features/Reports/monthlyReport/monthlyReportSlice";

export default function MonthlyEnquiryReportUI() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.report.monthlyReportTwo,
  );
  console.log("report component ", data);
  // ✅ data से rows और pickupMonthSummary अलग करो
  const rows = data?.rows ?? [];
  const pickupMonthSummary = data?.pickupMonthSummary ?? {};

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    dispatch(fetchMonthlyReportTwo({ year: currentYear }));
  }, [dispatch]);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const toDisplay = (m: string) => m.toUpperCase();

  const currentMonthIndex = new Date().getMonth();
  const orderedMonths = [
    ...months.slice(currentMonthIndex),
    ...months.slice(0, currentMonthIndex),
  ];
  const containers = [orderedMonths.slice(0, 6), orderedMonths.slice(6, 12)];

  // ✅ rows से pickupByMonth map बनाओ
  const pickupByMonth = useMemo(() => {
    const map: Record<string, Record<number, number>> = {};
    rows.forEach((r) => {
      Object.entries(r.pickupMonthCounts ?? {}).forEach(
        ([pickupMonth, count]) => {
          if (!map[pickupMonth]) map[pickupMonth] = {};
          map[pickupMonth][r.day] =
            (map[pickupMonth][r.day] ?? 0) + Number(count);
        },
      );
    });
    return map;
  }, [rows]);

  // ─── Helpers ──────────────────────────────────────────────────────

  const getMonthData = (monthName: string): Record<number, number> => {
    const result: Record<number, number> = {};
    rows
      .filter((r) => r.month === monthName)
      .forEach((r) => {
        result[r.day] = r.total;
      });
    return result;
  };

  const getRowTotal = (monthName: string): number =>
    Object.values(getMonthData(monthName)).reduce((s, v) => s + v, 0);

  const getColTotal = (day: number, displayMonths: string[]): number =>
    displayMonths.reduce((sum, m) => sum + (getMonthData(m)[day] ?? 0), 0);

  // ─── Render ───────────────────────────────────────────────────────

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-lg">
        Loading report...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-lg">
        Error: {error}
      </div>
    );

  return (
    <div className="p-4 overflow-auto bg-white">
      {containers.map((displayMonths, containerIndex) => (
        <div
          key={containerIndex}
          className="border-[3px] border-black mb-8 min-w-[1400px]"
        >
          {/* Header */}
          <div className="flex">
            <div className="w-[70px] bg-purple-700 border-r border-black" />
            <div className="flex-1 bg-green-700 text-white text-center font-bold text-2xl py-1 border-r border-black">
              MONTHLY ENQUIRY REPORT - LEAD TRENDS
            </div>
            <div className="w-[120px] bg-green-700 text-yellow-300 text-center font-bold text-xl border-r border-black flex items-center justify-center">
              DELHI
            </div>
            <div className="w-[100px] bg-pink-600 text-white text-center font-bold text-xl border-r border-black flex items-center justify-center">
              {toDisplay(displayMonths[0])}
            </div>
            <div className="w-[350px] bg-yellow-300 text-green-700 text-center font-bold text-lg flex items-center justify-center">
              {displayMonths.map(toDisplay).join(" | ")}
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
                <th className="border border-gray-500 bg-yellow-300 w-[55px]">
                  TOT
                </th>
                {/* ✅ AVG column add */}
                <th className="border border-gray-500 bg-yellow-300 w-[55px]">
                  AVG
                </th>
              </tr>
            </thead>

            <tbody>
              {displayMonths.map((month) => {
                // ✅ pickupMonthSummary से total और avg लो
                const summary = pickupMonthSummary[month];
                const total = summary?.total ?? 0;
                const avg = summary?.avg ?? 0;

                return (
                  <tr key={month}>
                    <td className="border border-gray-400 text-red-600 font-semibold text-center align-middle">
                      {toDisplay(month)}
                    </td>

                    {days.map((day) => {
                      const pickupVal = pickupByMonth[month]?.[day] ?? 0;

                      return (
                        <td
                          key={day}
                          className={`border border-gray-300 text-center text-xs p-0 ${
                            pickupVal > 0 ? "bg-white" : "bg-gray-100"
                          }`}
                        >
                          <div className="flex flex-col items-center justify-start py-[2px] min-h-[28px]">
                            {pickupVal > 0 && (
                              <span className="text-[11px] font-semibold text-blue-600 leading-[13px]">
                                {pickupVal}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* ✅ TOT — pickupMonthSummary से */}
                    <td className="border border-gray-400 bg-lime-200 text-center text-xs font-semibold align-middle">
                      {total > 0 ? total : ""}
                    </td>
                    {/* ✅ AVG — pickupMonthSummary से */}
                    <td className="border border-gray-400 bg-lime-200 text-center text-xs align-middle">
                      {avg > 0 ? avg : ""}
                    </td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr>
                <td className="border border-black bg-yellow-300 font-bold text-center text-sm">
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
                  {displayMonths.reduce(
                    (s, m) => s + (pickupMonthSummary[m]?.total ?? 0),
                    0,
                  ) || ""}
                </td>
                {/* ✅ AVG total cell खाली */}
                <td className="border border-black bg-yellow-300" />
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
