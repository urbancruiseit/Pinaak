"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/store"; // adjust path
;
import {
  getWebsiteGacThunk,
} from "../../../../features/Website/WebsiteSlice"; // adjust path

interface WebsiteGacEntry {
  id: number;
  name: string;
  country_code: string;
  phone: string;
  city: string;
  created_at: string;
}

// ── Selectors (inline, since slice doesn't export them) ──
const selectGacList    = (state: RootState): WebsiteGacEntry[] => state.websiteGac.data;
const selectGacLoading = (state: RootState): boolean           => state.websiteGac.loading;
const selectGacError   = (state: RootState): string | null     => state.websiteGac.error;

const GACForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const list    = useSelector(selectGacList);
  const loading = useSelector(selectGacLoading);
  const error   = useSelector(selectGacError);

  const [search, setSearch]           = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    dispatch(getWebsiteGacThunk());
  }, [dispatch]);

  const filtered: WebsiteGacEntry[] = (list ?? []).filter((entry) => {
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
    currentPage * rowsPerPage
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
    <div className="w-full space-y-4 p-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Website GAC Entries</h1>
          <p className="text-sm text-gray-500">
            All enquiries submitted through the website contact form
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search name, phone, city…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-sm border rounded-lg w-56"
          />
          <button
            onClick={handleRefresh}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 text-left">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">City</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-400">
                  No data found
                </td>
              </tr>
            ) : (
              paginated.map((item, idx) => (
                <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3 text-gray-500">
                    {(currentPage - 1) * rowsPerPage + idx + 1}
                  </td>
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3 text-gray-600">
                    {item.country_code} {item.phone}
                  </td>
                  <td className="p-3 text-gray-600">{item.city}</td>
                  <td className="p-3 text-gray-500">{formatDate(item.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 items-center text-sm">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Prev
          </button>
          <span className="text-gray-600">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default GACForm;