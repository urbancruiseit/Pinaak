"use client";

import React, { useEffect, useState } from "react";
import { Search, RefreshCw, Loader2, Plus, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../redux/store";
import { getVehicleManagers } from "../../features/vehicleManager/vehicleManagerSlice";

import VehicleForm from "./Vehicles/VehiclesManagerForm";

interface VehicleManagerRow {
  id: number | string;
  code?: string;
  vendor?: string;
  model?: string;
  veh_no?: string;
  reg_date?: string;
  garage?: string;
  aging?: string;
  amenities?: string;
}

const VehiclesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { vehicles, loading, error, total, page, limit, totalPages } =
    useSelector((state: RootState) => state.vehicleManager);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // =====================================================
  // SHOW / HIDE FORM
  // =====================================================

  const [showForm, setShowForm] = useState(false);

  // =====================================================
  // GET VEHICLE MANAGERS
  // =====================================================

  const fetchVehicles = () => {
    dispatch(
      getVehicleManagers({
        search: search.trim() || undefined,
        page: currentPage,
        limit: 20,
      }),
    );
  };

  // =====================================================
  // INITIAL LOAD / SEARCH / PAGINATION
  // =====================================================

  useEffect(() => {
    if (showForm) return;

    const timer = setTimeout(() => {
      fetchVehicles();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, currentPage, showForm]);

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date?: string) => {
    if (!date) return "-";

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

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = () => {
    fetchVehicles();
  };

  // =====================================================
  // OPEN VEHICLE FORM
  // =====================================================

  const handleAddVehicleManager = () => {
    setShowForm(true);
  };

  // =====================================================
  // BACK TO TABLE
  // =====================================================

  const handleBackToTable = () => {
    setShowForm(false);

    setCurrentPage(1);

    dispatch(
      getVehicleManagers({
        page: 1,
        limit: 20,
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
  // FORM VIEW
  // =====================================================

  if (showForm) {
    return (
      <div className="w-full">
        {/* BACK BUTTON */}

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

        {/* VEHICLE FORM */}

        <VehicleForm />
      </div>
    );
  }

  // =====================================================
  // TABLE VIEW
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
          SEARCH + TOTAL + REFRESH
      ================================================= */}

      <div className="mb-5 flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
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

        {/* ACTIONS */}

        <div className="flex flex-wrap items-center gap-3">
          {/* TOTAL */}

          <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            Total Vehicles: {total}
          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
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
            {/* HEADER */}

            <thead>
              <tr className="bg-blue-600 text-left text-sm text-white">
                <th className="whitespace-nowrap px-4 py-4">#</th>

                <th className="whitespace-nowrap px-4 py-4">Code</th>

                <th className="whitespace-nowrap px-4 py-4">Vendor Name</th>

                <th className="whitespace-nowrap px-4 py-4">Model</th>

                <th className="whitespace-nowrap px-4 py-4">Vehicle Number</th>

                <th className="whitespace-nowrap px-4 py-4">
                  Registration Date
                </th>

                <th className="whitespace-nowrap px-4 py-4">Garage</th>

                <th className="whitespace-nowrap px-4 py-4">
                  Manufacturing Year
                </th>

                <th className="whitespace-nowrap px-4 py-4">Amenities</th>
              </tr>
            </thead>

            {/* BODY */}

            <tbody>
              {/* LOADING */}

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

              {/* NO DATA */}

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

              {/* DATA */}

              {!loading &&
                (vehicles as VehicleManagerRow[]).map((vehicle, index) => (
                  <tr
                    key={vehicle.id}
                    className="border-b transition hover:bg-blue-50"
                  >
                    {/* # */}

                    <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-700">
                      {(currentPage - 1) * limit + index + 1}
                    </td>

                    {/* CODE */}

                    <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-blue-700">
                      {vehicle.code || "-"}
                    </td>

                    {/* VENDOR */}

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {vehicle.vendor || "-"}
                    </td>

                    {/* MODEL */}

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {vehicle.model || "-"}
                    </td>

                    {/* VEHICLE NUMBER */}

                    <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-gray-800">
                      {vehicle.veh_no || "-"}
                    </td>

                    {/* REGISTRATION DATE */}

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {formatDate(vehicle.reg_date)}
                    </td>

                    {/* GARAGE */}

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {vehicle.garage || "-"}
                    </td>

                    {/* MANUFACTURING YEAR */}

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {vehicle.aging || "-"}
                    </td>

                    {/* AMENITIES */}

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

      {/* =================================================
          PAGINATION
      ================================================= */}

      {!loading && totalPages > 0 && (
        <div className="mt-5 flex flex-col items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm sm:flex-row">
          {/* PAGE INFO */}

          <div className="text-sm text-gray-600">
            Page <span className="font-bold text-gray-900">{page}</span> of{" "}
            <span className="font-bold text-gray-900">{totalPages}</span>
          </div>

          {/* PAGINATION */}

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from(
              {
                length: totalPages,
              },
              (_, index) => index + 1,
            )
              .filter(
                (pageNumber) =>
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  Math.abs(pageNumber - page) <= 2,
              )
              .map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                    pageNumber === page
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesManager;
