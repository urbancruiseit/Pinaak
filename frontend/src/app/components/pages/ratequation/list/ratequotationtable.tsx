"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import { fetchAllRateQuotation } from "@/app/features/Rate/rateSlice";
import RateQuotationModel from "./rateQuotationModel";
import QuotationPdf from "./quotation";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Link,
  Eye,
} from "lucide-react";

export default function RateQuotationTable() {
  const dispatch = useDispatch<AppDispatch>();

  const { rateList, listLoading, listError } = useSelector(
    (state: RootState) => state.rate,
  );

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);

  const LIMIT = 50;

  // ─── Max vehicles across all leads (for column count) ──
  const maxVehicles = Math.max(
    1,
    ...(rateList?.map((item: any) => (item.vehicles || []).length) || [0]),
  );

  // ─── FETCH ─────────────────────────────────────────────
  const fetchData = useCallback(
    async (page = currentPage, searchVal = search) => {
      const result = await dispatch(
        fetchAllRateQuotation({ page, limit: LIMIT, search: searchVal.trim() }),
      );
      if (fetchAllRateQuotation.fulfilled.match(result)) {
        const payload = result.payload as any;
        setTotalPages(payload?.totalPages || 1);
        setTotalRecords(payload?.total || 0);
      }
    },
    [dispatch, currentPage, search],
  );

  useEffect(() => {
    fetchData(currentPage, search);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1, search);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleGenerateLink = (item: any) => {
    const link = `${window.location.origin}/rate-quotation/${item.lead_id}`;
    navigator.clipboard
      .writeText(link)
      .then(() => alert("Link copied!\n" + link));
  };

  const handleView = (item: any) => {
    console.log("View clicked:", item);
    setSelectedQuotation(item);
    setIsPdfOpen(true);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-blue-600">
          Rate Quotation Records
        </h2>
        {totalRecords > 0 && (
          <span className="text-sm text-blue-500 font-medium">
            {totalRecords} total records
          </span>
        )}
      </div>

      {/* TOOLBAR */}
      <div className="p-4 border-b flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search Lead / Customer... (Enter to search)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600 transition"
        >
          <Search size={16} /> Search
        </button>
        <button
          onClick={() => fetchData(currentPage, search)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition"
        >
          <RefreshCw size={16} className={listLoading ? "animate-spin" : ""} />{" "}
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {listError && (
        <div className="p-3 text-red-600 bg-red-50 border border-red-200 text-sm">
          ⚠️ {listError}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="border-collapse text-sm" style={{ minWidth: "100%" }}>
          <thead>
            {/* ROW 1 — Main headers + Vehicle group headers */}
            <tr className="bg-gray-100 text-xs text-gray-600 uppercase">
              <th className="p-3 border text-center" rowSpan={2}>
                #
              </th>
              <th className="p-3 border text-center" rowSpan={2}>
                Actions
              </th>
              <th className="p-3 border" rowSpan={2}>
                Lead ID
              </th>
              <th className="p-3 border" rowSpan={2}>
                Customer
              </th>
              <th className="p-3 border" rowSpan={2}>
                Advisor
              </th>
              <th className="p-3 border" rowSpan={2}>
                Date
              </th>

              {/* One group header per max vehicle slot */}
              {Array.from({ length: maxVehicles }).map((_, i) => (
                <th
                  key={i}
                  colSpan={4}
                  className="p-2 border text-center bg-blue-600 text-white font-semibold tracking-wide"
                >
                  Vehicle {i + 1}
                </th>
              ))}
            </tr>

            {/* ROW 2 — Sub-headers for each vehicle group */}
            <tr className="bg-blue-50 text-xs text-blue-700 uppercase">
              {Array.from({ length: maxVehicles }).map((_, i) => (
                <React.Fragment key={i}>
                  <th className="p-2 border whitespace-nowrap">Type</th>
                  <th className="p-2 border whitespace-nowrap">Category</th>
                  <th className="p-2 border whitespace-nowrap">Description</th>
                  <th className="p-2 border whitespace-nowrap text-right">
                    Amount
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody>
            {listLoading ? (
              <tr>
                <td
                  colSpan={6 + maxVehicles * 4}
                  className="text-center p-10 text-gray-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="animate-spin" size={24} />
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : !rateList || rateList.length === 0 ? (
              <tr>
                <td
                  colSpan={6 + maxVehicles * 4}
                  className="text-center p-10 text-gray-400"
                >
                  No Rate Quotations Found
                </td>
              </tr>
            ) : (
              rateList.map((item: any, index: number) => {
                const vehicles: any[] = item.vehicles || [];

                return (
                  <tr
                    key={item.id || index}
                    className="hover:bg-blue-50/40 transition border-t border-gray-200"
                  >
                    {/* Serial */}
                    <td className="p-3 border text-center text-gray-500 font-medium">
                      {(currentPage - 1) * LIMIT + index + 1}
                    </td>

                    {/* Actions */}
                    <td className="p-3 border">
                      <div className="flex items-center gap-2 justify-center">
                        {/* View */}
                        <button
                          onClick={() => handleView(item)}
                          title="View"
                          className="p-2 rounded-lg bg-white text-blue-900 border border-blue-900
                 hover:bg-blue-100 transition"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleEdit(item)}
                          title="Edit"
                          className="p-2 rounded-lg bg-white text-amber-900 border border-amber-900
                 hover:bg-amber-100 transition"
                        >
                          <Pencil size={16} />
                        </button>

                        {/* Generate Link */}
                        <button
                          onClick={() => handleGenerateLink(item)}
                          title="Generate Link"
                          className="p-2 rounded-lg bg-white text-green-900 border border-green-900    
                 hover:bg-green-100 transition"
                        >
                          <Link size={16} />
                        </button>
                      </div>
                    </td>

                    {/* Lead ID */}
                    <td className="p-3 border font-mono text-xs text-gray-700 whitespace-nowrap">
                      {item.lead_id || "—"}
                    </td>

                    {/* Customer */}
                    <td className="p-3 border font-medium text-gray-800 whitespace-nowrap">
                      {item.fullName || "—"}
                    </td>

                    {/* Advisor */}
                    <td className="p-3 border text-gray-600 whitespace-nowrap">
                      {item.advisorShortName || "—"}
                    </td>

                    {/* Date */}
                    <td className="p-3 border text-gray-500 whitespace-nowrap">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("en-IN")
                        : "—"}
                    </td>

                    {/* Vehicle columns — padded with "—" if fewer than maxVehicles */}
                    {Array.from({ length: maxVehicles }).map((_, vIdx) => {
                      const v = vehicles[vIdx];
                      return (
                        <React.Fragment key={vIdx}>
                          <td
                            className={`p-2 border text-gray-700 whitespace-nowrap ${v ? "bg-white" : "bg-gray-50"}`}
                          >
                            {v?.vehicleType || (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td
                            className={`p-2 border text-gray-600 whitespace-nowrap ${v ? "bg-white" : "bg-gray-50"}`}
                          >
                            {v?.category || (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td
                            className={`p-2 border text-gray-500 max-w-[160px] truncate ${v ? "bg-white" : "bg-gray-50"}`}
                          >
                            {v?.description || (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td
                            className={`p-2 border text-right font-semibold whitespace-nowrap ${v ? "text-green-600 bg-white" : "bg-gray-50 text-gray-300"}`}
                          >
                            {v
                              ? `₹${Number(v.amount || 0).toLocaleString("en-IN")}`
                              : "—"}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      {!listLoading && (
        <div className="p-4 bg-gray-50 border-t flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold">{rateList?.length || 0}</span> leads
            — page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-semibold">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {isEditOpen && (
        <RateQuotationModel
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          lead={selectedItem}
        />
      )}

      {isPdfOpen && selectedQuotation && (
        <QuotationPdf
          data={selectedQuotation}
          onClose={() => {
            setIsPdfOpen(false);
            setSelectedQuotation(null);
          }}
        />
      )}
    </div>
  );
}
