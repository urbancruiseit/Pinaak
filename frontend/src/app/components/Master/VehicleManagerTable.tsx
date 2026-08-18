"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Loader2,
  Plus,
  ArrowLeft,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../redux/store";

import { getVehicleManagers } from "../../features/vehicleManager/vehicleManagerSlice";
import Pagination from "../ui/pagination";

import VehicleForm from "./Vehicles/VehiclesManagerForm";

interface VehicleManagerRow {
  id: number | string;
  code?: string;
  vendor?: string;
  model?: string;
  veh_no?: string;
  city?: string;
  reg_date?: string;
  garage?: string;
  aging?: string | number;
  amenities?: string;
}

// 2018 se 2026 tak year list (zaroorat ho to range badha lena)
const YEAR_OPTIONS = Array.from(
  { length: 2026 - 2018 + 1 },
  (_, i) => 2018 + i,
);

const PAGE_SIZE = 20;

// =====================================================
// VEHICLES MANAGER
// =====================================================

const VehiclesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // =====================================================
  // REDUX STATE
  // =====================================================

  const { vehicles, loading, error, total, totalPages } = useSelector(
    (state: RootState) => state.vehicleManager,
  );

  // =====================================================
  // LOCAL STATE
  // =====================================================

  const [search, setSearch] = useState("");
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [yearMenuOpen, setYearMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const yearMenuRef = useRef<HTMLDivElement>(null);

  // =====================================================
  // GET VEHICLE MANAGERS
  // =====================================================

  const fetchVehicles = () => {
    dispatch(
      getVehicleManagers({
        search: search.trim() || undefined,
        // multiple years comma-separated jaate hain, backend IN(...) se handle karega
        year: selectedYears.length > 0 ? selectedYears.join(",") : undefined,
        page: currentPage,
        limit: PAGE_SIZE,
      }),
    );
  };

  useEffect(() => {
    if (showForm) return;

    const timer = setTimeout(() => {
      fetchVehicles();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedYears, currentPage, showForm]);

  // Year dropdown ke bahar click hote hi close ho jaye
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        yearMenuRef.current &&
        !yearMenuRef.current.contains(e.target as Node)
      ) {
        setYearMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =====================================================
  // YEAR CHECKBOX TOGGLE
  // =====================================================

  const toggleYear = (y: number) => {
    const value = String(y);
    setSelectedYears((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
    setCurrentPage(1);
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date?: string) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatAging = (aging?: string | number) => {
    if (aging === undefined || aging === null || aging === "") {
      return "-";
    }

    const value = Number(aging);

    if (isNaN(value)) {
      return aging.toString();
    }

    const years = Math.floor(value);
    const months = Math.round((value - years) * 10);

    if (months === 10) {
      return (
        <>
          {years} <span className="text-[9px] font-bold">Y</span> 0{" "}
          <span className="text-[9px] font-bold">M</span>
        </>
      );
    }

    return (
      <>
        {years} <span className="text-[9px] font-bold">Y</span> {months}{" "}
        <span className="text-[9px] font-bold">M</span>
      </>
    );
  };

  const handleAddVehicleManager = () => {
    setShowForm(true);
  };

  const handleBackToTable = () => {
    setShowForm(false);
    setCurrentPage(1);
    setSearch("");
    setSelectedYears([]);

    dispatch(
      getVehicleManagers({
        page: 1,
        limit: PAGE_SIZE,
      }),
    );
  };

  // =====================================================
  // PAGE CHANGE
  // =====================================================

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }

    setCurrentPage(newPage);
  };

  // =====================================================
  // SHOW FORM
  // =====================================================

  if (showForm) {
    return (
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToTable}
            className="flex items-center gap-2 rounded-lg bg-gray-600 px-5 py-3 font-bold text-white shadow-md transition hover:bg-gray-700"
          >
            <ArrowLeft size={20} />
            Back to Vehicles Manager
          </button>
        </div>

        <VehicleForm />
      </div>
    );
  }

  // =====================================================
  // TABLE
  // =====================================================

  return (
    <div className="mt-10 w-full">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 rounded-md bg-orange-100 p-3 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* TITLE */}

          <div className="flex items-center">
            <div className="rounded-md border-l-8 border-orange-500 bg-white px-3 shadow-md">
              <h2 className="py-4 text-2xl font-bold text-orange-600 md:text-3xl">
                Vehicles Manager
              </h2>
            </div>
          </div>

          {/* SEARCH */}

          <div className="relative w-full lg:max-w-md">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by code, vendor, model, vehicle no..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* =================================================
              YEAR FILTER — Checkbox Dropdown
          ================================================= */}

          <div className="relative" ref={yearMenuRef}>
            <button
              type="button"
              onClick={() => setYearMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <Calendar size={16} className="text-gray-400" />
              {selectedYears.length === 0
                ? "All Years"
                : `${selectedYears.length} Year${selectedYears.length > 1 ? "s" : ""}`}
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform ${
                  yearMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {yearMenuOpen && (
              <div className="absolute right-0 z-40 mt-2 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                <div className="max-h-64 overflow-y-auto">
                  {YEAR_OPTIONS.slice()
                    .reverse()
                    .map((y) => {
                      const value = String(y);
                      const checked = selectedYears.includes(value);

                      return (
                        <label
                          key={y}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleYear(y)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          {y}
                        </label>
                      );
                    })}
                </div>

                {selectedYears.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedYears([]);
                      setCurrentPage(1);
                    }}
                    className="mt-1 w-full rounded-md border-t border-gray-100 pt-2 text-center text-xs font-semibold text-red-500 hover:text-red-600"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ADD VEHICLE MANAGER */}

          <button
            type="button"
            onClick={handleAddVehicleManager}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-bold text-white shadow-md transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200"
          >
            <Plus size={20} />
            Add Vehicle Manager
          </button>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="w-full overflow-hidden rounded-xl border bg-white shadow-md">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[1400px] w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-left text-sm text-white">
                <th className="whitespace-nowrap px-4 py-4">#</th>
                <th className="whitespace-nowrap px-4 py-4">Code</th>
                <th className="whitespace-nowrap px-4 py-4">City</th>
                <th className="whitespace-nowrap px-4 py-4">Vendor Name</th>
                <th className="whitespace-nowrap px-4 py-4">Garage</th>
                <th className="whitespace-nowrap px-4 py-4">Vehicle Number</th>
                <th className="whitespace-nowrap px-4 py-4">
                  Registration Date
                </th>
                <th className="whitespace-nowrap px-4 py-4">Aging</th>
                <th className="whitespace-nowrap px-4 py-4">Amenities</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-blue-600">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="font-semibold">Loading vehicles...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && vehicles.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    No vehicle records found.
                  </td>
                </tr>
              )}

              {!loading &&
                (vehicles as VehicleManagerRow[]).map((vehicle, index) => (
                  <tr
                    key={vehicle.id}
                    className="border-b transition hover:bg-blue-50"
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-700">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-blue-700">
                      {vehicle.code || "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-blue-700">
                      {vehicle.city || "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {vehicle.vendor || "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {vehicle.garage || "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-gray-800">
                      {vehicle.veh_no || "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {formatDate(vehicle.reg_date)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-700">
                      {formatAging(vehicle.aging)}
                    </td>

                    <td className="max-w-[350px] px-4 py-4 text-sm text-gray-700">
                      <div className="whitespace-normal">
                        {vehicle.amenities || "-"}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {!loading && total > 0 && (
        <div className="mt-5 shrink-0 border-t border-slate-200 bg-white px-5 py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            rowsPerPage={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default VehiclesManager;
