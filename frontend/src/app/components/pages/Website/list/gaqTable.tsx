"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/store";

import { getTripBookingsThunk } from "../../../../features/Website/WebsiteSlice";

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
  pickupAddress: string;
  pickup_date: string;
  dropAddress: string;
  drop_date: string;
  itinerary: string;
  passengerTotal: number;
  baggageTotal: number;
  vehicle_model: string;
  city: string;
  created_at: string;
}

// ─── Selectors ─────────────────────────────────────────
const selectTripList = (state: RootState): TripBooking[] =>
  state.websiteGac.tripBookings;

const selectLoading = (state: RootState): boolean => state.websiteGac.loading;

const selectError = (state: RootState): string | null => state.websiteGac.error;

// ─── Component ─────────────────────────────────────────
const TripBookingsTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const list = useSelector(selectTripList);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    dispatch(getTripBookingsThunk());
  }, [dispatch]);

  // ─── Filter ─────────────────────────────────────────
  const filtered = (list ?? []).filter((item) => {
    const q = search.toLowerCase();
    return (
      item.firstName?.toLowerCase().includes(q) ||
      item.lastName?.toLowerCase().includes(q) ||
      item.customerPhone?.toLowerCase().includes(q) ||
      item.city?.toLowerCase().includes(q) ||
      item.vehicle_model?.toLowerCase().includes(q)
    );
  });

  // ─── Pagination ─────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  // ─── Format Date ────────────────────────────────────
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN");
  };

  return (
    <div className="p-4 space-y-4 w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Trip Bookings</h2>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded w-60"
        />
      </div>

      {/* Error */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Table */}
      <div className="border rounded overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Pickup</th>
              <th className="p-3">Drop</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Passengers</th>
              <th className="p-3">City</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center p-5">
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center p-5">
                  No data found
                </td>
              </tr>
            ) : (
              paginated.map((item, idx) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {(currentPage - 1) * rowsPerPage + idx + 1}
                  </td>

                  <td className="p-3 font-medium">
                    {item.firstName} {item.middleName} {item.lastName}
                    <div className="text-xs text-gray-500">
                      {item.customerEmail}
                    </div>
                  </td>

                  <td className="p-3">
                    {item.country_code} {item.customerPhone}
                  </td>

                  <td className="p-3">
                    {item.pickupAddress}
                    <div className="text-xs text-gray-500">
                      {formatDate(item.pickup_date)}
                    </div>
                  </td>

                  <td className="p-3">
                    {item.dropAddress}
                    <div className="text-xs text-gray-500">
                      {formatDate(item.drop_date)}
                    </div>
                  </td>

                  <td className="p-3">{item.vehicle_model}</td>

                  <td className="p-3">
                    {item.passengerTotal} / {item.baggageTotal}
                  </td>

                  <td className="p-3">{item.city}</td>

                  <td className="p-3 text-gray-500">
                    {formatDate(item.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="border px-3 py-1 rounded"
          >
            Prev
          </button>

          <span>
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="border px-3 py-1 rounded"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TripBookingsTable;
