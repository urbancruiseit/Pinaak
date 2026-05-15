"use client";

import React, { useState, useEffect } from "react";
import { DSR_TABLE_BANNER, BannerColumn, GROUP_COLORS } from "./DsrTableHeader";

import { DsrRecord } from "../../../../types/types";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";

import { fetchAllDsr } from "@/app/features/Dsr/dsrSlice";

import {
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  RefreshCw,
} from "lucide-react";

export default function DsrTable({
  onEdit,
  onView,
  onDelete,
}: {
  onEdit?: (dsr: DsrRecord) => void;
  onView?: (dsr: DsrRecord) => void;
  onDelete?: (id: string) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();

  // =========================================================
  // Redux State
  // =========================================================
  const { dsrList, listLoading, listError, totalCount } = useSelector(
    (state: RootState) => state.dsr,
  );

  const safeDsrList: DsrRecord[] = Array.isArray(dsrList) ? dsrList : [];

  // =========================================================
  // Local State
  // =========================================================
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");

  const [sortField, setSortField] = useState("dsr_date");

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // =========================================================
  // Fetch Data
  // =========================================================
  const fetchData = () => {
    dispatch(
      fetchAllDsr({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        sortField,
        sortOrder,
      }),
    );
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchTerm, sortField, sortOrder]);

  // =========================================================
  // Sorting
  // =========================================================
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // =========================================================
  // Currency Formatter
  // =========================================================
  const formatCurrency = (value: string | number | undefined) => {
    if (!value || value === "0" || value === 0) {
      return "₹0";
    }

    const num = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(num)) return "₹0";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // =========================================================
  // Render Cell
  // =========================================================
  const renderCell = (dsr: DsrRecord, column: BannerColumn) => {
    const value = dsr[column.key as keyof DsrRecord];

    // ACTIONS
    if (column.key === "actions") {
      return (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onView?.(dsr)}
            className="p-1 rounded text-blue-600 hover:bg-blue-100"
            title="View"
          >
            <Eye size={15} />
          </button>

          <button
            onClick={() => onEdit?.(dsr)}
            className="p-1 rounded text-orange-500 hover:bg-orange-100"
            title="Edit"
          >
            <Edit size={15} />
          </button>

          <button
            onClick={() => {
              if (window.confirm("Delete this DSR?")) {
                onDelete?.(dsr.id!);
              }
            }}
            className="p-1 rounded text-red-500 hover:bg-red-100"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      );
    }

    // CURRENCY
    if (column.type === "currency") {
      return (
        <span className="font-semibold">
          {formatCurrency(value as string | number)}
        </span>
      );
    }

    // DATE
    if (column.type === "date" && value) {
      return new Date(value as string).toLocaleDateString("en-IN");
    }

    // DEFAULT
    return value !== undefined && value !== null && value !== "" ? (
      String(value)
    ) : (
      <span className="text-gray-400">—</span>
    );
  };

  // =========================================================
  // Banner Groups
  // =========================================================
  const getBannerGroups = () => {
    const groups: Array<{
      id: string;
      label: string;
      colSpan: number;
      darkColor: string;
    }> = [];

    let current: {
      id: string;
      label: string;
      colSpan: number;
      darkColor: string;
    } | null = null;

    DSR_TABLE_BANNER.forEach((col, i) => {
      const colors = GROUP_COLORS[col.groupLabel];

      if (!current || current.label !== col.groupLabel) {
        if (current) groups.push(current);

        current = {
          id: `${col.groupLabel}-${i}`,
          label: col.groupLabel,
          colSpan: 1,
          darkColor: colors.dark,
        };
      } else {
        current.colSpan += 1;
      }
    });

    if (current) groups.push(current);

    return groups;
  };

  const bannerGroups = getBannerGroups();

  // =========================================================
  // Cell Background
  // =========================================================
  const getCellBgClass = (column: BannerColumn, rowIndex: number) => {
    const colors = GROUP_COLORS[column.groupLabel];

    return `${colors.light} ${
      rowIndex % 2 === 0 ? "bg-opacity-100" : "bg-opacity-70"
    }`;
  };

  // =========================================================
  // JSX
  // =========================================================
  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4">
        <div className="pl-4 border-l-8 border-orange-500 bg-white px-4 rounded-md shadow-sm">
          <h2 className="text-3xl font-bold py-3 text-orange-600">
            DSR Records
          </h2>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 min-w-[250px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              type="text"
              placeholder="Search by name, lead ID, booking ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} rows
                </option>
              ))}
            </select>

            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {listError && (
        <div className="mx-4 mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
          <span className="font-semibold">Error:</span>

          {listError}

          <button
            onClick={fetchData}
            className="ml-auto text-red-500 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* TABLE */}
      <div
        className="overflow-x-auto"
        style={{
          maxHeight: "calc(100vh - 300px)",
        }}
      >
        <table className="w-full min-w-[2400px] border-collapse">
          {/* TABLE HEAD */}
          <thead className="sticky top-0 z-20">
            {/* GROUP HEADER */}
            <tr>
              {bannerGroups.map((group) => (
                <th
                  key={group.id}
                  colSpan={group.colSpan}
                  className={`
                    p-3
                    border-2
                    border-white
                    ${group.darkColor}
                  `}
                >
                  <div className="text-sm font-black uppercase tracking-wide text-white text-center">
                    {group.label}
                  </div>
                </th>
              ))}
            </tr>

            {/* COLUMN HEADER */}
            <tr>
              {DSR_TABLE_BANNER.map((column) => {
                const colors = GROUP_COLORS[column.groupLabel];

                return (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key)}
                    className={`
                        ${column.minWidthClass}
                        px-2
                        py-3
                        text-xs
                        font-semibold
                        text-white
                        border
                        border-white
                        cursor-pointer
                        ${colors.dark}
                        hover:brightness-95
                        whitespace-nowrap
                        text-${column.align ?? "left"}
                      `}
                  >
                    {column.label}

                    {sortField === column.key &&
                      (sortOrder === "asc" ? " ↑" : " ↓")}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody className="divide-y divide-red-500">
            {/* LOADING */}
            {listLoading ? (
              <tr>
                <td
                  colSpan={DSR_TABLE_BANNER.length}
                  className="text-center py-20 border border-white"
                >
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />

                  <p className="text-gray-400 mt-3 text-sm">
                    Loading DSR records...
                  </p>
                </td>
              </tr>
            ) : safeDsrList.length === 0 ? (
              /* EMPTY */
              <tr>
                <td
                  colSpan={DSR_TABLE_BANNER.length}
                  className="text-center py-12 border border-white"
                >
                  <Search size={32} className="text-gray-400 mx-auto mb-2" />

                  <p className="text-gray-500 text-lg">No DSR records found</p>

                  {searchTerm && (
                    <p className="text-gray-400 text-sm mt-1">
                      Try changing your search
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              /* DATA ROWS */
              safeDsrList.map((dsr, rowIndex) => (
                <tr
                  key={dsr.id || rowIndex}
                  className="hover:shadow-md transition-all duration-200"
                >
                  {DSR_TABLE_BANNER.map((column) => {
                    const colors = GROUP_COLORS[column.groupLabel];

                    const cellBgClass = getCellBgClass(column, rowIndex);

                    return (
                      <td
                        key={column.key}
                        className={`
    ${column.minWidthClass}
    px-2
    py-2
    border
    border-gray-500
    text-xs
    whitespace-nowrap
    ${cellBgClass}
    text-black
    ${column.align === "center" ? "text-center" : ""}
    ${column.align === "right" ? "text-right" : ""}
    ${column.align === "left" ? "text-left" : ""}
  `}
                      >
                        {renderCell(dsr, column)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalCount > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center gap-3">
          <span className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
            records
          </span>

          <div className="flex gap-1 items-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-white flex items-center gap-1 text-sm"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span className="px-3 py-1 text-sm font-medium bg-white border rounded-md">
              Page {currentPage} of {Math.ceil(totalCount / pageSize)}
            </span>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= Math.ceil(totalCount / pageSize)}
              className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-white flex items-center gap-1 text-sm"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
