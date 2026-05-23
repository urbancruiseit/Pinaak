"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStatusWiseReport } from "@/app/features/Reports/monthlyReport/monthlyReportSlice";
import { AppDispatch } from "@/app/redux/store";
const Empreport = () => {
const dispatch = useDispatch<AppDispatch>();  const [selectedYear, setSelectedYear] = useState("2026");
  const [allMonthsData, setAllMonthsData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const monthMap = {
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

  const allMonths = [
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

  const monthNames = {
    JAN: "January",
    FEB: "February",
    MAR: "March",
    APR: "April",
    MAY: "May",
    JUN: "June",
    JUL: "July",
    AUG: "August",
    SEP: "September",
    OCT: "October",
    NOV: "November",
    DEC: "December",
  };

  // ✅ All 8 status fields matching backend
  const emptyMonth = () => ({
    new: 0,
    kyc: 0,
    rfq: 0,
    hot: 0,
    vehn: 0,
    lost: 0,
    book: 0,
    blank: 0,
    total: 0,
  });

  // Fetch ALL months data
  useEffect(() => {
    const fetchAllMonthsData = async () => {
      setLoading(true);
const results: Record<string, any[]> = {};
      for (const month of allMonths) {
        try {
          const result = await dispatch(
            fetchStatusWiseReport({
              month: monthMap[month],
              year: Number(selectedYear),
            }),
          ).unwrap();
          results[month] = result?.data || [];
        } catch (error) {
          console.error(`Error fetching ${month}:`, error);
          results[month] = [];
        }
      }

      setAllMonthsData(results);
      setLoading(false);
    };

    fetchAllMonthsData();
  }, [selectedYear, dispatch]);

  // Transform: group by employee → month
  useEffect(() => {
    if (Object.keys(allMonthsData).length === 0) return;

    const employeeMap = new Map();

    allMonths.forEach((month) => {
      const monthData = allMonthsData[month] || [];

      monthData.forEach((item) => {
        const name = item.adviser_name;

        if (!employeeMap.has(name)) {
          employeeMap.set(name, { adviser_name: name, months: {} });
        }

        const emp = employeeMap.get(name);
        emp.months[month] = {
          new: item.new ?? 0,
          kyc: item.kyc ?? 0,
          rfq: item.rfq ?? 0,
          hot: item.hot ?? 0,
          vehn: item.vehn ?? 0,
          lost: item.lost ?? 0,
          book: item.book ?? 0,
          blank: item.blank ?? 0,
          total: item.total ?? 0,
        };
      });
    });

    // Fill missing months with zeros
    const finalData = Array.from(employeeMap.values()).map((emp) => {
      allMonths.forEach((month) => {
        if (!emp.months[month]) emp.months[month] = emptyMonth();
      });
      return emp;
    });

    setProcessedData(finalData);
  }, [allMonthsData]);

  // Grand total for CONT%
  const grandTotal = processedData.reduce(
    (sum, emp) =>
      sum + allMonths.reduce((s, m) => s + (emp.months[m]?.total || 0), 0),
    0,
  );

  const yearSum = (emp: any, field: string) =>
    allMonths.reduce((s, m) => s + (emp.months[m]?.[field] || 0), 0);

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-orange-100 p-3 rounded-md flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-orange-600">
          📊 Employee Monthly Report – {selectedYear}
        </h2>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border px-3 py-2 rounded-md bg-white"
        >
          {["2024", "2025", "2026", "2027"].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center mt-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="mt-2 font-bold text-blue-600">
            Loading data for all months...
          </p>
        </div>
      )}

      {/* CARDS GRID */}
      {!loading && processedData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-5">
          {processedData.map((employee, empIdx) => {
            const empYearlyTotal = yearSum(employee, "total");
            const contributionPercent =
              grandTotal > 0
                ? ((empYearlyTotal / grandTotal) * 100).toFixed(1)
                : "0.0";

            return (
              <div
                key={empIdx}
                className="border-4 border-green-900 p-3 bg-white shadow-md"
              >
                {/* EMPLOYEE NAME */}
                <h2 className="text-center font-bold text-lg mb-3 bg-orange-100 py-2 rounded">
                  {employee.adviser_name}
                </h2>

                <div className="overflow-x-auto">
                  <table className="min-w-full w-full text-xs border border-green-900">
                    <thead>
                      <tr className="bg-yellow-300 font-bold text-center">
                        <th className="border p-1 whitespace-nowrap">#</th>
                        <th className="border p-1 whitespace-nowrap">MONTH</th>
                        <th className="border p-1 whitespace-nowrap">NEW</th>
                        <th className="border p-1 whitespace-nowrap">KYC</th>
                        <th className="border p-1 whitespace-nowrap">RFQ</th>
                        <th className="border p-1 whitespace-nowrap">HOT</th>
                        <th className="border p-1 whitespace-nowrap">VEH-N</th>
                        <th className="border p-1 whitespace-nowrap">LOST</th>
                        <th className="border p-1 whitespace-nowrap">BOOK</th>
                        <th className="border p-1 whitespace-nowrap">BLANK</th>
                        <th className="border p-1 whitespace-nowrap">TOTAL</th>
                        <th className="border p-1 whitespace-nowrap text-blue-700">
                          CONT%
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {allMonths.map((month, monthIdx) => {
                        const d = employee.months[month];
                        const monthTotal = d?.total || 0;
                        const monthContrib =
                          empYearlyTotal > 0
                            ? ((monthTotal / empYearlyTotal) * 100).toFixed(1)
                            : "0.0";

                        return (
                          <tr
                            key={month}
                            className="text-center hover:bg-gray-50"
                          >
                            <td className="border p-1 whitespace-nowrap">
                              {monthIdx + 1}
                            </td>
                            <td className="border p-1 whitespace-nowrap font-medium">
                              {
                                monthNames[month as keyof typeof monthNames]
                              }{" "}
                            </td>
                            <td className="border p-1 whitespace-nowrap">
                              {d?.new || 0}
                            </td>
                            <td className="border p-1 whitespace-nowrap">
                              {d?.kyc || 0}
                            </td>
                            <td className="border p-1 whitespace-nowrap">
                              {d?.rfq || 0}
                            </td>
                            <td className="border p-1 whitespace-nowrap">
                              {d?.hot || 0}
                            </td>
                            <td className="border p-1 whitespace-nowrap">
                              {d?.vehn || 0}
                            </td>
                            <td className="border p-1 whitespace-nowrap">
                              {d?.lost || 0}
                            </td>
                            <td className="border p-1 whitespace-nowrap">
                              {d?.book || 0}
                            </td>
                            <td className="border p-1 whitespace-nowrap">
                              {d?.blank || 0}
                            </td>
                            <td className="border p-1 whitespace-nowrap font-bold">
                              {monthTotal}
                            </td>
                            <td className="border p-1 whitespace-nowrap text-blue-700 font-semibold">
                              {monthContrib}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    <tfoot>
                      <tr className="bg-green-100 font-bold text-center">
                        <td colSpan={2} className="border p-1">
                          YEARLY TOTAL
                        </td>
                        <td className="border p-1">
                          {yearSum(employee, "new")}
                        </td>
                        <td className="border p-1">
                          {yearSum(employee, "kyc")}
                        </td>
                        <td className="border p-1">
                          {yearSum(employee, "rfq")}
                        </td>
                        <td className="border p-1">
                          {yearSum(employee, "hot")}
                        </td>
                        <td className="border p-1">
                          {yearSum(employee, "vehn")}
                        </td>
                        <td className="border p-1">
                          {yearSum(employee, "lost")}
                        </td>
                        <td className="border p-1">
                          {yearSum(employee, "book")}
                        </td>
                        <td className="border p-1">
                          {yearSum(employee, "blank")}
                        </td>
                        <td className="border p-1 font-bold">
                          {empYearlyTotal}
                        </td>
                        <td className="border p-1 text-blue-700 font-bold">
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
        <div className="text-center mt-20">
          <p className="text-gray-500 font-semibold text-lg">
            No data found for {selectedYear}
          </p>
          <p className="text-gray-400 mt-2">Try selecting a different year</p>
        </div>
      )}
    </div>
  );
};

export default Empreport;
