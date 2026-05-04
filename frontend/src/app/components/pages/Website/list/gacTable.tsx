"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/store";
import { getWebsiteGacThunk } from "../../../../features/Website/WebsiteSlice";

interface WebsiteGacEntry {
  id: number;
  name: string;
  country_code: string;
  phone: string;
  city: string;
  created_at: string;
}

const selectGacList = (state: RootState): WebsiteGacEntry[] =>
  state.websiteGac.data;
const selectGacLoading = (state: RootState): boolean =>
  state.websiteGac.loading;
const selectGacError = (state: RootState): string | null =>
  state.websiteGac.error;

const GACForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const list = useSelector(selectGacList);
  const loading = useSelector(selectGacLoading);
  const error = useSelector(selectGacError);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    dispatch(getWebsiteGacThunk());
  }, [dispatch]);

  const filtered = (list ?? []).filter((entry) => {
    const q = search.toLowerCase();
    return (
      entry.name?.toLowerCase().includes(q) ||
      entry.phone?.toLowerCase().includes(q) ||
      entry.city?.toLowerCase().includes(q) ||
      entry.country_code?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRefresh = () => dispatch(getWebsiteGacThunk());

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-800 px-6 py-5 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Website GAC Entries</h1>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-sm rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:outline-none"
            />

            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-white text-blue-600 font-semibold text-sm rounded-lg hover:bg-blue-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-blue-100">
            {/* Head */}
            <thead className="border-b border-blue-200">
              <tr className="text-left text-blue-900 uppercase text-sm">
                <th className="px-6 py-3 border-r border-blue-200 bg-blue-50">
                  No.
                </th>
                <th className="px-6 py-3 border-r border-blue-200 bg-blue-50">
                  Name
                </th>
                <th className="px-6 py-3 border-r border-blue-200 bg-blue-50">
                  Phone
                </th>
                <th className="px-6 py-3 border-r border-blue-200 bg-blue-50">
                  City
                </th>
                <th className="px-6 py-3 bg-blue-50">Date</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    No data found
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-b border-blue-100 hover:bg-blue-100 transition"
                  >
                    <td className="px-6 py-4 border-r border-blue-100 bg-blue-50 text-gray-500">
                      {(currentPage - 1) * rowsPerPage + idx + 1}
                    </td>

                    <td className="px-6 py-4 border-r border-blue-100 bg-blue-50 text-gray-800 font-medium">
                      {item.name}
                    </td>

                    <td className="px-6 py-4 border-r border-blue-100 bg-blue-50 text-gray-700">
                      +{item.country_code} {item.phone}
                    </td>

                    <td className="px-6 py-4 border-r border-blue-100 bg-blue-50 text-gray-700">
                      {item.city}
                    </td>

                    <td className="px-6 py-4 bg-blue-50 text-gray-500 text-sm">
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
          <div className="flex justify-between items-center p-4 border-t bg-blue-50">
            <span>
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-30"
              >
                Prev
              </button>

              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GACForm;
