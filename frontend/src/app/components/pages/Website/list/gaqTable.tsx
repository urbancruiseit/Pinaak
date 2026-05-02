"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../../redux/store";

import {
  getTripBookingsThunk,
  selectTripBookings,
  selectLoading,
  selectError,
} from "../../../../features/Website/WebsiteSlice";

// ─── Types ─────────────────────────────────────────────
interface TripBooking {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  customerPhone: string;
  country_code: string;
  customerEmail: string;
  message: string;
  city: string;
  pickupAddress: string;
  pickup_date: string;
  dropAddress: string;
  drop_date: string;
  itinerary: string;
  passengerTotal: number;
  baggageTotal: number;
  vehicle_category: string;
  vehicle_model: string;
  created_at: string;
}

// ─── Component ─────────────────────────────────────────
const TripBookingsTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const list = useSelector(selectTripBookings) as TripBooking[];
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const rowsPerPage = 10;

  useEffect(() => {
    dispatch(getTripBookingsThunk());
  }, [dispatch]);

  // ─── Filter ─────────────────────────────────────────
  const filtered = list.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.firstName?.toLowerCase().includes(q) ||
      item.lastName?.toLowerCase().includes(q) ||
      item.customerPhone?.toLowerCase().includes(q) ||
      item.customerEmail?.toLowerCase().includes(q) ||
      item.city?.toLowerCase().includes(q) ||
      item.vehicle_model?.toLowerCase().includes(q) ||
      item.vehicle_category?.toLowerCase().includes(q) ||
      item.pickupAddress?.toLowerCase().includes(q) ||
      item.dropAddress?.toLowerCase().includes(q)
    );
  });

  // ─── Pagination ─────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // ─── Format Date ────────────────────────────────────
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN");
  };

  return (
    <div className="p-4 space-y-4 w-full">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">Trip Bookings</h2>
          <p className="text-sm text-gray-500">
            Total: {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <input
          type="text"
          placeholder="Search by name, phone, city, vehicle..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded w-72 text-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="border rounded overflow-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="p-3 whitespace-nowrap">#</th>
              <th className="p-3 whitespace-nowrap">Customer</th>
              <th className="p-3 whitespace-nowrap">Phone</th>
              <th className="p-3 whitespace-nowrap">City</th>
              <th className="p-3 whitespace-nowrap">Pickup</th>
              <th className="p-3 whitespace-nowrap">Drop</th>
              <th className="p-3 whitespace-nowrap">Vehicle Category</th>
              <th className="p-3 whitespace-nowrap">Vehicle Model</th>
              <th className="p-3 whitespace-nowrap">Pax / Bags</th>
              <th className="p-3 whitespace-nowrap">Booked On</th>
              <th className="p-3 whitespace-nowrap">Details</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="text-center p-8 text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Loading bookings...
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center p-8 text-gray-400">
                  {search ? `No results found for "${search}"` : "No bookings yet"}
                </td>
              </tr>
            ) : (
              paginated.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <tr className="border-t hover:bg-gray-50 transition-colors">
                    {/* # */}
                    <td className="p-3 text-gray-500">
                      {(currentPage - 1) * rowsPerPage + idx + 1}
                    </td>

                    {/* Customer */}
                    <td className="p-3">
                      <div className="font-medium">
                        {[item.firstName, item.middleName, item.lastName]
                          .filter(Boolean)
                          .join(" ")}
                      </div>
                      {item.customerEmail && (
                        <div className="text-xs text-gray-400">{item.customerEmail}</div>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="p-3 whitespace-nowrap">
                      {item.country_code} {item.customerPhone}
                    </td>

                    {/* City */}
                    <td className="p-3">{item.city || "—"}</td>

                    {/* Pickup */}
                    <td className="p-3">
                      <div className="max-w-[160px] truncate" title={item.pickupAddress}>
                        {item.pickupAddress}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(item.pickup_date)}
                      </div>
                    </td>

                    {/* Drop */}
                    <td className="p-3">
                      <div className="max-w-[160px] truncate" title={item.dropAddress}>
                        {item.dropAddress}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(item.drop_date)}
                      </div>
                    </td>

                    {/* Vehicle Category */}
                    <td className="p-3">
                      {item.vehicle_category ? (
                        <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {item.vehicle_category}
                        </span>
                      ) : "—"}
                    </td>

                    {/* Vehicle Model */}
                    <td className="p-3 font-medium">{item.vehicle_model || "—"}</td>

                    {/* Pax / Bags */}
                    <td className="p-3 whitespace-nowrap">
                      <span title="Passengers">🧍 {item.passengerTotal}</span>
                      {" / "}
                      <span title="Baggages">🧳 {item.baggageTotal}</span>
                    </td>

                    {/* Booked On */}
                    <td className="p-3 text-gray-500 whitespace-nowrap text-xs">
                      {formatDateTime(item.created_at)}
                    </td>

                    {/* Expand */}
                    <td className="p-3">
                      <button
                        onClick={() =>
                          setExpandedRow(expandedRow === item.id ? null : item.id)
                        }
                        className="text-xs border px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        {expandedRow === item.id ? "Hide" : "More"}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row — Itinerary + Message */}
                  {expandedRow === item.id && (
                    <tr className="bg-blue-50 border-t">
                      <td colSpan={11} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold text-gray-700 mb-1">
                              🗺 Travel Itinerary
                            </p>
                            <p className="text-gray-600 whitespace-pre-wrap">
                              {item.itinerary || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-700 mb-1">
                              💬 Message
                            </p>
                            <p className="text-gray-600 whitespace-pre-wrap">
                              {item.message || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex gap-2 items-center justify-between flex-wrap">
        <p className="text-sm text-gray-500">
          Showing {paginated.length} of {filtered.length} entries
        </p>

        {totalPages > 1 && (
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="border px-3 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-100"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="border px-3 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-100"
            >
              Prev
            </button>

            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="border px-3 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-100"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="border px-3 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-100"
            >
              »
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripBookingsTable;