"use client";

import { createPortal } from "react-dom";
import type { LeadColumn } from "./leadTableColumns";
import { MONTH_OPTIONS } from "./leadstabledata";

export interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  statusOptions: string[];
  cityFilter: string;
  onCityChange: (value: string) => void;
  cityOptions: string[];
  selectedPax: number[];
  onPaxChange: (pax: number[]) => void;
  paxOpen: boolean;
  onPaxToggle: () => void;
  paxBtnRef: React.RefObject<HTMLButtonElement | null>;
  paxDropdownRef: React.RefObject<HTMLDivElement | null>;
  paxDropdownStyle: React.CSSProperties;
  selectedDays: number[];
  onDaysChange: (days: number[]) => void;
  daysOpen: boolean;
  onDaysToggle: () => void;
  daysBtnRef: React.RefObject<HTMLButtonElement | null>;
  daysDropdownRef: React.RefObject<HTMLDivElement | null>;
  daysDropdownStyle: React.CSSProperties;
  freezeKey: string | null;
  onFreezeChange: (key: string | null) => void;
  columns: LeadColumn[];
  selectedMonth: string | null;
  onMonthChange: (month: string | null) => void;
  startMonth: string;
  onStartMonthChange: (value: string) => void;
  endMonth: string;
  onEndMonthChange: (value: string) => void;
  startType: string;
  onStartTypeChange: (type: string) => void;
  endType: string;
  onEndTypeChange: (type: string) => void;
}

export function LeadSearchFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statusOptions,
  cityFilter,
  onCityChange,
  cityOptions,
  selectedPax,
  onPaxChange,
  paxOpen,
  onPaxToggle,
  paxBtnRef,
  paxDropdownRef,
  paxDropdownStyle,
  selectedDays,
  onDaysChange,
  daysOpen,
  onDaysToggle,
  daysBtnRef,
  daysDropdownRef,
  daysDropdownStyle,
  freezeKey,
  onFreezeChange,
  columns,
  selectedMonth,
  onMonthChange,
  startMonth,
  onStartMonthChange,
  endMonth,
  onEndMonthChange,
  startType,
  onStartTypeChange,
  endType,
  onEndTypeChange,
}: SearchFiltersProps) {
  
  const handlePaxCheckbox = (num: number) => {
    onPaxChange(
      selectedPax.includes(num)
        ? selectedPax.filter((v) => v !== num)
        : [...selectedPax, num]
    );
  };

  const handleDaysCheckbox = (num: number) => {
    onDaysChange(
      selectedDays.includes(num)
        ? selectedDays.filter((v) => v !== num)
        : [...selectedDays, num]
    );
  };

  const handleClearPax = () => {
    onPaxChange([]);
  };

  const handleClearDays = () => {
    onDaysChange([]);
  };

  const handleDateFocus = (
    e: React.FocusEvent<HTMLInputElement>,
    setType: (type: string) => void
  ) => {
    setType("date");
    setTimeout(() => {
      try {
        e.currentTarget.showPicker();
      } catch {}
    }, 0);
  };

  const handleDateClick = (
    e: React.MouseEvent<HTMLInputElement>,
    setType: (type: string) => void
  ) => {
    setType("date");
    setTimeout(() => {
      try {
        e.currentTarget.showPicker();
      } catch {}
    }, 0);
  };

  const handleDateBlur = (
    value: string,
    setType: (type: string) => void
  ) => {
    if (!value) setType("text");
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {/* Search Input */}
      <div className="flex flex-col gap-1">
        <input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search"
          className="w-full px-3 py-2 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Status Filter */}
      <div className="flex flex-col gap-1">
        <select
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value)}
          className="w-full px-3 py-2 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="All">All Statuses</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* City Filter */}
      <div className="flex flex-col gap-1">
        <select
          value={cityFilter}
          onChange={(event) => onCityChange(event.target.value)}
          className="w-full px-3 py-2 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="All">All City</option>
          {cityOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Pax Filter Dropdown */}
      <div className="relative flex flex-col gap-1">
        <button
          ref={paxBtnRef as React.RefObject<HTMLButtonElement>}
          onClick={onPaxToggle}
          className="w-full px-3 h-9 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 text-left flex justify-between items-center bg-white"
        >
          {selectedPax.length > 0
            ? `${selectedPax.length} Pax Selected`
            : "Select Pax"}
          <span>▾</span>
        </button>
        {paxOpen &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={paxDropdownRef as React.RefObject<HTMLDivElement>}
              className="absolute z-[9999] bg-white border rounded-lg shadow max-h-60 overflow-y-auto"
              style={paxDropdownStyle}
            >
              <label className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer">
                <button
                  onClick={handleClearPax}
                  className="text-sm text-red-600 font-semibold hover:underline"
                >
                  Clear All
                </button>
              </label>
              {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
                <label
                  key={num}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPax.includes(num)}
                    onChange={() => handlePaxCheckbox(num)}
                  />
                  <span className="text-sm text-black">{num} Pax</span>
                </label>
              ))}
            </div>,
            document.body,
          )}
      </div>

      {/* Days Filter Dropdown */}
      <div className="relative flex flex-col gap-1">
        <button
          ref={daysBtnRef as React.RefObject<HTMLButtonElement>}
          onClick={onDaysToggle}
          className="w-full px-3 h-9 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 text-left flex justify-between items-center bg-white"
        >
          {selectedDays.length > 0
            ? `${selectedDays.length} Days Selected`
            : "Select Days"}
          <span>▾</span>
        </button>
        {daysOpen &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={daysDropdownRef as React.RefObject<HTMLDivElement>}
              className="absolute z-[9999] bg-white border rounded-lg shadow max-h-60 overflow-y-auto"
              style={daysDropdownStyle}
            >
              <label className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer">
                <button
                  onClick={handleClearDays}
                  className="text-sm text-red-600 font-semibold hover:underline"
                >
                  Clear All
                </button>
              </label>
              {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
                <label
                  key={num}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(num)}
                    onChange={() => handleDaysCheckbox(num)}
                  />
                  <span className="text-sm text-black">{num} Days</span>
                </label>
              ))}
            </div>,
            document.body,
          )}
      </div>

      {/* Freeze Columns Dropdown */}
      <div className="flex flex-col gap-1">
        <select
          value={freezeKey ?? "none"}
          onChange={(event) =>
            onFreezeChange(
              event.target.value === "none" ? null : event.target.value,
            )
          }
          className="w-full px-3 py-2 text-sm font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="none">Freeze Columns</option>
          {columns.map((column) => (
            <option key={column.key} value={column.key}>
              {column.label}
            </option>
          ))}
        </select>
      </div>

      {/* Month and Date Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 lg:col-span-6">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {MONTH_OPTIONS.map((month) => {
            const currentMonth = new Date().getMonth() + 1;
            const isCurrentMonth = Number(month.value) === currentMonth;
            const isActive = selectedMonth === month.value;

            return (
              <button
                key={month.value}
                type="button"
                onClick={() => onMonthChange(isActive ? null : month.value)}
                className={`text-md font-extrabold rounded-lg transition-all shadow-sm min-w-[50px] h-9 ${
                  isCurrentMonth
                    ? "bg-blue-600 text-white ring-2 ring-blue-400"
                    : isActive
                      ? "bg-green-600 text-white"
                      : "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
                }`}
              >
                {month.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <input
            type={startType}
            value={startMonth}
            onChange={(event) => onStartMonthChange(event.target.value)}
            placeholder="Start Date"
            onFocus={(e) => handleDateFocus(e, onStartTypeChange)}
            onClick={(e) => handleDateClick(e, onStartTypeChange)}
            onBlur={() => handleDateBlur(startMonth, onStartTypeChange)}
            className="px-3 h-8 text-md font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white flex-1"
          />
          <input
            type={endType}
            value={endMonth}
            min={startMonth}
            onChange={(event) => onEndMonthChange(event.target.value)}
            placeholder="End Date"
            onFocus={(e) => handleDateFocus(e, onEndTypeChange)}
            onClick={(e) => handleDateClick(e, onEndTypeChange)}
            onBlur={() => handleDateBlur(endMonth, onEndTypeChange)}
            className="px-3 h-8 text-md font-semibold border rounded-lg shadow-sm border-slate-300 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white flex-1"
          />
        </div>
      </div>
    </div>
  );
}