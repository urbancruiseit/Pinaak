"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus, X, Car, ChevronLeft, ChevronRight } from "lucide-react";
import type { AppDispatch, RootState } from "../../redux/store";
import { vehicleslice } from "../../features/vehicle/vehicleSlice";
import VehicleForm from "./Vehicles/VehiclesMasterForm";

const VehicleTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicleCodes, loading, error, page, limit, totalPages, total } =
    useSelector((state: RootState) => state.vehicle);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(vehicleslice({ search, page: currentPage, limit: 20 }));
  }, [dispatch, currentPage]);

  // Modal khule hone par background scroll lock
  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showForm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    dispatch(vehicleslice({ search, page: 1, limit: 20 }));
  };

  return (
    <div className="w-full">
      {/* ===================================================
          HEADER
      =================================================== */}
      <div className="sticky top-0 z-30 mb-6 rounded-2xl border border-orange-100 bg-white/80 p-4 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md">
              <Car size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Vehicles Master
              </h2>
              <p className="text-xs font-medium text-gray-400">
                {total ?? 0} vehicles registered
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by code, description, amenities..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-72"
              />
            </form>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:shadow-lg hover:shadow-orange-300 active:scale-[0.98]"
            >
              <Plus size={18} />
              Add Vehicle
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          ERROR
      =================================================== */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* ===================================================
          TABLE
      =================================================== */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead>
              <tr className="border-b border-gray-200 bg-orange-100 text-[15px] font-bold uppercase tracking-wider text-black">
                <th className="px-5 py-3.5">#</th>
                <th className="px-5 py-3.5">Code</th>
                <th className="px-5 py-3.5">Seat</th>
                <th className="px-5 py-3.5">Config</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Make</th>
                <th className="px-5 py-3.5">Model</th>
                <th className="px-5 py-3.5">Variant</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Amenities</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
                      <span className="text-sm font-medium">
                        Loading vehicles...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : vehicleCodes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Car size={32} className="text-gray-300" />
                      <span className="text-sm font-medium">
                        No vehicles found
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                vehicleCodes.map((v, idx) => (
                  <tr
                    key={v.id ?? idx}
                    className="transition-colors hover:bg-blue-50/50"
                  >
                    <td className="px-5 py-3.5 text-gray-400">
                      {(currentPage - 1) * limit + idx + 1}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-md ">{v.code}</td>
                    <td className="px-5 py-3.5 text-md font-semibold">
                      {v.seat}
                    </td>
                    <td className="px-5 py-3.5 text-md font-semibold">
                      {v.config}
                    </td>
                    <td className="px-5 py-3.5">
                      {v.category ? (
                        <span className="inline-flex  px-2.5 py-1 text-md font-semibold ">
                          {v.category}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-md font-semibold ">
                      {v.make || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-md font-semibold">
                      {v.model || "-"}
                    </td>
                    <td className="px-5 py-3.5">
                      {v.variant ? (
                        <span className="inline-flex  px-2.5 py-1 text-md font-semibold ">
                          {v.variant}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td
                      className="px-5 py-3.5 text-md font-semibold"
                      title={v.description}
                    >
                      {v.description || "-"}
                    </td>
                    <td
                      className="px-5 py-3.5 text-md font-semibold"
                      title={v.amenities}
                    >
                      {v.amenities || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================
          PAGINATION
      =================================================== */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">
            Page <span className="font-bold text-gray-800">{page}</span> of{" "}
            <span className="font-bold text-gray-800">{totalPages}</span>{" "}
            <span className="text-gray-400">({total} total)</span>
          </span>

          {/* <div className="flex gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div> */}
        </div>
      )}

      {/* ===================================================
          MODAL — ADD VEHICLE FORM
      =================================================== */}
      {showForm && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowForm(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-red-800 text-white transition hover:bg-red-200 hover:text-red-700"
            >
              <X size={18} />
            </button>

            <div className="p-6">
              <VehicleForm
                onSuccess={() => {
                  setShowForm(false);
                  setCurrentPage(1);
                  dispatch(vehicleslice({ search: "", page: 1, limit: 20 }));
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleTable;
