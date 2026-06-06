"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../redux/store";
import { fetchTimeEnquiry } from "../../../../features/Reports/monthlyReport/monthlyReportSlice"; // Updated import

const timeSlots = [
  { label: "10:00-17:00", start: 10, end: 17 },
  { label: "17:00-21:30", start: 17, end: 21.5 },
  { label: "21:30-00:00", start: 21.5, end: 24 },
  { label: "00:00-10:00", start: 0, end: 10 },
];

function getTimeSlotFromHour(hour: number): string {
  if (hour >= 10 && hour < 17) return "10:00-17:00";
  if (hour >= 17 && hour < 21.5) return "17:00-21:30";
  if (hour >= 21.5 && hour < 24) return "21:30-00:00";
  if (hour >= 0 && hour < 10) return "00:00-10:00";
  return "Unknown";
}

const months = [
  { name: "JAN", index: 1 },
  { name: "FEB", index: 2 },
  { name: "MAR", index: 3 },
  { name: "APR", index: 4 },
  { name: "MAY", index: 5 },
  { name: "JUN", index: 6 },
  { name: "JUL", index: 7 },
  { name: "AUG", index: 8 },
  { name: "SEP", index: 9 },
  { name: "OCT", index: 10 },
  { name: "NOV", index: 11 },
  { name: "DEC", index: 12 },
];

function getDaysInMonth(monthIndex: number, year: number) {
  return new Date(year, monthIndex, 0).getDate();
}

function getCurrentMonthName() {
  const m = new Date().getMonth() + 1;
  return months.find((x) => x.index === m)?.name || "JAN";
}

function getCurrentYear() {
  return new Date().getFullYear().toString();
}

interface TimeEnquiryRecord {
  month: number;
  day: number;
  hour: number;
  total: number;
}

export default function MonthlyEnquiryReport() {
  const dispatch = useDispatch<AppDispatch>();

  const { timeEnquiry } = useSelector((state: RootState) => state.report);

  const { data: reportData, loading, error } = timeEnquiry;

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthName());
  const [year, setYear] = useState(getCurrentYear());

  const [compareMonth, setCompareMonth] = useState(() => {
    const m = new Date().getMonth() + 1;
    const prev = m === 1 ? 12 : m - 1;
    return months.find((x) => x.index === prev)?.name || "DEC";
  });

  useEffect(() => {
    dispatch(fetchTimeEnquiry(parseInt(year)));
  }, [dispatch, year]);

  const getMonthInfo = (name: string, yearNum: number) => {
    const base = months.find((m) => m.name === name) || months[0];
    return {
      ...base,
      days: getDaysInMonth(base.index, yearNum),
    };
  };

  const yearNum = parseInt(year);
  const monthInfo = getMonthInfo(selectedMonth, yearNum);
  const compareMonthInfo = getMonthInfo(compareMonth, yearNum);

  const timeData = useMemo(() => {
    const slotData = timeSlots.map((slot) => ({
      label: slot.label,
      daily: Array(monthInfo.days).fill(0),
      total: 0,
      avg: 0,
    }));

    const monthRecords = (reportData || []).filter(
      (record: TimeEnquiryRecord) => record.month === monthInfo.index,
    );

    monthRecords.forEach((record) => {
      const dayIndex = record.day - 1;

      if (dayIndex >= 0 && dayIndex < monthInfo.days) {
        const slotLabel = getTimeSlotFromHour(record.hour);

        const slotIdx = timeSlots.findIndex((s) => s.label === slotLabel);

        if (slotIdx !== -1) {
          slotData[slotIdx].daily[dayIndex] += record.total;
          slotData[slotIdx].total += record.total;
        }
      }
    });

    slotData.forEach((slot) => {
      slot.avg = Math.round(slot.total / monthInfo.days);
    });

    return slotData;
  }, [reportData, monthInfo]);

  /* ==============================
      DAILY TOTAL
  ============================== */

  const dailyTotals = useMemo(() => {
    const totals = Array(monthInfo.days).fill(0);

    timeData.forEach((slot) => {
      slot.daily.forEach((val, i) => {
        totals[i] += val;
      });
    });

    return totals;
  }, [timeData, monthInfo.days]);

  const grandTotal = dailyTotals.reduce((a, b) => a + b, 0);

  /* ==============================
      COMPARE MONTH
  ============================== */

  const compareTimeData = useMemo(() => {
    const slotData = timeSlots.map((slot) => ({
      label: slot.label,
      daily: Array(compareMonthInfo.days).fill(0),
      total: 0,
      avg: 0,
    }));

    const monthRecords = (reportData || []).filter(
      (record: TimeEnquiryRecord) => record.month === compareMonthInfo.index,
    );

    monthRecords.forEach((record) => {
      const dayIndex = record.day - 1;

      if (dayIndex >= 0 && dayIndex < compareMonthInfo.days) {
        const slotLabel = getTimeSlotFromHour(record.hour);

        const slotIdx = timeSlots.findIndex((s) => s.label === slotLabel);

        if (slotIdx !== -1) {
          slotData[slotIdx].daily[dayIndex] += record.total;
          slotData[slotIdx].total += record.total;
        }
      }
    });

    slotData.forEach((slot) => {
      slot.avg = Math.round(slot.total / compareMonthInfo.days);
    });

    return slotData;
  }, [reportData, compareMonthInfo]);

  const compareDailyTotals = useMemo(() => {
    const totals = Array(compareMonthInfo.days).fill(0);

    compareTimeData.forEach((slot) => {
      slot.daily.forEach((val, i) => {
        totals[i] += val;
      });
    });

    return totals;
  }, [compareTimeData, compareMonthInfo.days]);

  const compareGrandTotal = compareDailyTotals.reduce((a, b) => a + b, 0);
  const compareAvg = Math.round(compareGrandTotal / compareMonthInfo.days);

  const getPercent = (value: number) => {
    if (!grandTotal) return 0;
    return Math.round((value / grandTotal) * 100);
  };

  const growth =
    compareGrandTotal === 0
      ? 0
      : Math.round(
          ((grandTotal - compareGrandTotal) / compareGrandTotal) * 100,
        );

  /* ==============================
      UI
  ============================== */

  if (loading) return <div className="p-6">Loading...</div>;

  if (error) return <div className="p-6 text-red-600">Error : {error}</div>;

  // Check if there's any data at all
  const hasAnyData = reportData && reportData.length > 0;

  // Get current month name for display
  const currentMonthName = getCurrentMonthName();
  const currentYear = getCurrentYear();

  return (
    <div className="p-6 ">
      {/* Header */}

      <div className="mb-4 bg-orange-100 shadow-lg rounded-md flex justify-between items-center">
        <div className="sticky top-0 z-10 bg-orange-100 p-3 rounded-md w-full">
          <div className="flex items-center">
            {/* LEFT TITLE - Updated to show current month and year */}
            <div className="pl-4 border-l-8 border-orange-500 bg-white px-3 rounded-md shadow-md">
              <h2 className="text-4xl font-bold text-left py-4 text-orange-600 p-2">
                Time Enquiry Reports – {currentMonthName} {currentYear}
              </h2>
            </div>

            {/* RIGHT FILTERS */}
            <div className="flex gap-3 flex-wrap ml-auto">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border px-3 py-2 font-semibold"
              >
                {months.map((m) => (
                  <option key={m.name}>{m.name}</option>
                ))}
              </select>

              <select
                value={compareMonth}
                onChange={(e) => setCompareMonth(e.target.value)}
                className="border px-3 py-2 font-semibold bg-yellow-100"
              >
                {months.map((m) => (
                  <option key={m.name}>{m.name}</option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="border px-3 py-2 font-semibold"
              >
                {["2024", "2025", "2026", "2027"].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table - Always visible */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg border">
        {hasAnyData ? (
          <table className="border-collapse w-full text-center font-semibold">
            <thead>
              <tr className="bg-green-950 text-white">
                <th className="border p-2">TIME SLOT</th>
                {[...Array(monthInfo.days)].map((_, i) => (
                  <th key={i} className="border p-1">
                    {i + 1}
                  </th>
                ))}
                <th className="border bg-green-950 text-white">TOTAL</th>
                <th className="border bg-green-950 text-white">AVG</th>
                <th className="border bg-green-950 text-white">%</th>
              </tr>
            </thead>

            <tbody>
              {timeData.map((slot, idx) => (
                <tr key={idx}>
                  <td className="border p-2 bg-gray-200 font-bold">
                    {slot.label}
                  </td>
                  {slot.daily.map((v, i) => (
                    <td key={i} className="border p-1">
                      {v}
                    </td>
                  ))}
                  <td className="border border-white bg-amber-200 font-bold">
                    {slot.total}
                  </td>
                  <td className="border border-white bg-amber-200 font-bold">
                    {slot.avg}
                  </td>
                  <td className="border border-white bg-amber-200 font-bold">
                    {getPercent(slot.total)}%
                  </td>
                </tr>
              ))}

              {/* Total row */}
              <tr className="bg-green-800 text-white font-bold">
                <td className="border p-2">TOTAL</td>
                {dailyTotals.map((v, i) => (
                  <td key={i} className="border p-1">
                    {v}
                  </td>
                ))}
                <td className="border">{grandTotal}</td>
                <td className="border">
                  {Math.round(grandTotal / monthInfo.days)}
                </td>
                <td className="border">100%</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <p className="text-gray-500 text-lg font-semibold">
              No Data Available
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Please check back later
            </p>
          </div>
        )}
      </div>

      {/* Month Comparison - Only show if data exists */}
      {hasAnyData && (
        <div className="mt-8 bg-white shadow-xl rounded-lg p-6 border">
          <h3 className="text-2xl font-bold text-center mb-6 text-purple-700">
            📊 Month Comparison Analysis
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-center font-bold">
            <div className="bg-green-100 p-6 rounded-lg shadow">
              <h4 className="text-xl text-green-700 mb-2">
                {selectedMonth} {year}
              </h4>
              <p>Total Leads: {grandTotal}</p>
              <p>Average Leads: {Math.round(grandTotal / monthInfo.days)}</p>
            </div>
            <div className="bg-blue-100 p-6 rounded-lg shadow">
              <h4 className="text-xl text-blue-700 mb-2">
                {compareMonth} {year}
              </h4>
              <p>Total Leads: {compareGrandTotal}</p>
              <p>Average Leads: {compareAvg}</p>
            </div>
            <div
              className={`p-6 rounded-lg shadow text-white ${
                growth >= 0 ? "bg-green-600" : "bg-red-600"
              }`}
            >
              <h4 className="text-xl mb-2">Growth</h4>
              <p className="text-3xl">
                {growth >= 0 ? "▲" : "▼"} {Math.abs(growth)}%
              </p>
              <p>{growth >= 0 ? "Lead Increased" : "Lead Decreased"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
