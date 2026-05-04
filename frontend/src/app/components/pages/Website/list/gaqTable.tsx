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

const TripBookingsTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const list = useSelector(selectTripBookings) as TripBooking[];
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  useEffect(() => {
    dispatch(getTripBookingsThunk());
  }, [dispatch]);

  const filtered = list.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.firstName?.toLowerCase().includes(q) ||
      item.lastName?.toLowerCase().includes(q) ||
      item.customerPhone?.toLowerCase().includes(q) ||
      item.customerEmail?.toLowerCase().includes(q) ||
      item.city?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  // ✅ Date + Time Format
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "—";

    const d = new Date(dateStr);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="w-auto p-6">
      <div className="bg-white rounded-2xl  overflow-hidden">
        <div className="sticky top-0 z-30 bg-orange-100 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <div className="pl-4 border-l-8 border-orange-500 bg-white px-3 rounded-md shadow-md">
              <h2 className="text-4xl font-bold text-left py-4 text-orange-600">
                Website GAC Entries
              </h2>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-auto mt-4">
          <table className="w-full text-sm border border-blue-100">
            {/* TABLE HEADER */}
            <thead>
              <tr className="bg-blue-950 text-white uppercase text-xs font-bold">
                <th className="p-3 border border-blue-200">No</th>
                <th className="p-3 border border-blue-200">Customer</th>
                <th className="p-3 border border-blue-200">Phone</th>
                <th className="p-3 border border-blue-200">Email</th>
                <th className="p-3 border border-blue-200">City</th>
                <th className="p-3 border border-blue-200">Pickup Address</th>
                <th className="p-3 border border-blue-200">Pickup Date</th>
                <th className="p-3 border border-blue-200">Drop Address</th>
                <th className="p-3 border border-blue-200">Drop Date</th>
                <th className="p-3 border border-blue-200">Vehicle Category</th>
                <th className="p-3 border border-blue-200">Vehicle Model</th>
                <th className="p-3 border border-blue-200">Passengers</th>
                <th className="p-3 border border-blue-200">Baggage</th>
                <th className="p-3 border border-blue-200">Itinerary</th>
                <th className="p-3 border border-blue-200">Message</th>
                <th className="p-3 border border-blue-200">Created</th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody className="bg-blue-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center p-10 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center p-10 text-gray-400">
                    No data found
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition">
                    <td className="p-3 border border-blue-100 text-gray-500">
                      {(currentPage - 1) * rowsPerPage + idx + 1}
                    </td>

                    <td className="p-3 border border-blue-100">
                      <div className="font-semibold text-gray-800">
                        {[item.firstName, item.lastName].join(" ")}
                      </div>
                    </td>

                    <td className="p-3 border border-blue-100">
                      {item.country_code} {item.customerPhone}
                    </td>

                    <td className="p-3 border border-blue-100">
                      {item.customerEmail}
                    </td>

                    <td className="p-3 border border-blue-100">{item.city}</td>

                    {/* PICKUP */}
                    <td className="p-3 border border-blue-100 text-xs">
                      {item.pickupAddress}
                    </td>
                    <td className="p-3 border border-blue-100">
                      {formatDateTime(item.pickup_date)}
                    </td>
                    {/* DROP */}
                    <td className="p-3 border border-blue-100 text-xs">
                      {item.dropAddress}
                    </td>
                    <td className="p-3 border border-blue-100">
                      {formatDateTime(item.drop_date)}
                    </td>
                    {/* VEHICLE */}
                    <td className="p-3 border border-blue-100">
                      {item.vehicle_category}
                    </td>
                    <td className="p-3 border border-blue-100">
                      {item.vehicle_model}
                    </td>
                    {/* PASSENGER */}
                    <td className="p-3 border border-blue-100 text-xs">
                      {item.passengerTotal}
                    </td>
                    <td className="p-3 border border-blue-100 text-xs">
                      {item.baggageTotal}
                    </td>
                    <td className="p-3 border border-blue-100 text-xs text-gray-600">
                      {item.itinerary}
                    </td>
                    <td className="p-3 border border-blue-100 text-xs text-gray-600">
                      {item.message}
                    </td>

                    {/* CREATED */}
                    <td className="p-3 border border-blue-100 text-xs text-gray-600">
                      {formatDateTime(item.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center p-4">
          <span className="text-sm text-blue-600">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="border px-3 py-1 rounded disabled:opacity-40"
            >
              Prev
            </button>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="border px-3 py-1 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripBookingsTable;
