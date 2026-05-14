"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  RefreshCw,
  Filter,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface DsrRecord {
  id: string;
  status?: string;
  aged?: number;
  liveorexpiry?: string;
  dsrDate?: string;
  source?: string;
  presales?: string;
  telesales?: string;
  fullName?: string;
  leadId?: string;
  customerId?: string;
  advisorId?: string;
  bookingId?: string;
  dsrVehicles?: string;
  dsrCategory?: string;
  vehNo?: string;
  driver?: string;
  vendorName?: string;
  customerRate?: string | number;
  customerToll?: string | number;
  parkTax?: string | number;
  gstAmt?: string | number;
  total?: string | number;
  bookingAmount?: string | number;
  otherAmount?: string | number;
  bankName?: string;
  amountReceived?: string | number;
  tds?: string | number;
  remainingAmount?: string | number;
  vendorRate?: string | number;
  vendorToll?: string | number;
  vendorParkTax?: string | number;
  customerToVendor?: string | number;
  outstanding?: string | number;
  paymentStatus?: string;
  balanceAmount?: string | number;
  rate?: string | number;
  pay?: string | number;
  finalBalance?: string | number;
  before?: string | number;
  final?: string | number;
  gst?: string | number;
  remarksTS?: string;
  remarksMIS?: string;
}

interface DsrTableProps {
  data?: DsrRecord[];
  loading?: boolean;
  totalCount?: number;
  onEdit?: (dsr: DsrRecord) => void;
  onView?: (dsr: DsrRecord) => void;
  onDelete?: (id: string) => void;
  onRefresh?: (filters: any) => void;
}

export default function DsrTable({
  data = [],
  loading = false,
  totalCount = 0,
  onEdit,
  onView,
  onDelete,
  onRefresh,
}: DsrTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  const [sortField, setSortField] = useState("dsrDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (onRefresh) {
      onRefresh({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        status: filterStatus,
        paymentStatus: filterPaymentStatus,
        sortField,
        sortOrder,
      });
    }
  }, [
    currentPage,
    pageSize,
    searchTerm,
    filterStatus,
    filterPaymentStatus,
    sortField,
    sortOrder,
  ]);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this DSR?")) {
      onDelete?.(id);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterPaymentStatus("");
    setCurrentPage(1);
  };

  const formatCurrency = (value: string | number | undefined) => {
    if (!value || value === "0" || value === 0) return "₹0";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getPaymentStatusBadge = (status: string | undefined) => {
    const styles = {
      Pending: "bg-red-100 text-red-800 border border-red-200",
      Partial: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      Completed: "bg-green-100 text-green-800 border border-green-200",
    };
    const icons = {
      Pending: <Clock size={12} className="mr-1" />,
      Partial: <AlertCircle size={12} className="mr-1" />,
      Completed: <CheckCircle size={12} className="mr-1" />,
    };
    const key = (status || "Pending") as keyof typeof styles;
    return {
      className: styles[key] || "bg-gray-100 text-gray-800",
      icon: icons[key] || null,
    };
  };

  const getStatusBadge = (status: string | undefined) => {
    const styles: Record<string, string> = {
      NEW: "bg-blue-100 text-blue-800 border border-blue-200",
      RFO: "bg-green-100 text-green-800 border border-green-200",
      KYC: "bg-purple-100 text-purple-800 border border-purple-200",
      LOST: "bg-red-100 text-red-800 border border-red-200",
      BOOKED: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    };
    return styles[status || "NEW"] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4">
        <div className="pl-4 border-l-8 border-orange-500 bg-white px-4 rounded-md shadow-sm">
          <h2 className="text-3xl font-bold text-left py-3 text-orange-600">
            DSR Records
          </h2>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[250px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, lead ID, booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              showFilters || filterStatus || filterPaymentStatus
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Filter size={16} />
            Filters
            {(filterStatus || filterPaymentStatus) && (
              <span className="bg-white text-orange-600 rounded-full px-1.5 py-0.5 text-xs font-bold">
                {(filterStatus ? 1 : 0) + (filterPaymentStatus ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() =>
                onRefresh?.({
                  page: currentPage,
                  limit: pageSize,
                  search: searchTerm,
                  status: filterStatus,
                  paymentStatus: filterPaymentStatus,
                  sortField,
                  sortOrder,
                })
              }
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 transition-colors">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">Advanced Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <X size={14} />
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Status</option>
                <option value="NEW">NEW</option>
                <option value="RFO">RFO</option>
                <option value="KYC">KYC</option>
                <option value="LOST">LOST</option>
                <option value="BOOKED">BOOKED</option>
              </select>

              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Payment Status</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value={10}>10 rows per page</option>
                <option value={25}>25 rows per page</option>
                <option value={50}>50 rows per page</option>
                <option value={100}>100 rows per page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto"
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <table className="w-full min-w-[2000px]">
            <thead className="bg-gray-800 text-white sticky top-0 z-10">
              {/* Group Headers Row */}
              <tr>
                <th
                  colSpan={1}
                  className="px-3 py-2 text-center text-xs font-bold bg-gray-900 border-r border-gray-700"
                >
                  ACTION
                </th>
                <th
                  colSpan={3}
                  className="px-3 py-2 text-center text-xs font-bold bg-gray-900 border-r border-gray-700"
                >
                  STATUS
                </th>
                <th
                  colSpan={4}
                  className="px-3 py-2 text-center text-xs font-bold bg-gray-800 border-r border-gray-700"
                >
                  ENQUIRY
                </th>
                <th
                  colSpan={5}
                  className="px-3 py-2 text-center text-xs font-bold bg-gray-800 border-r border-gray-700"
                >
                  CUSTOMER
                </th>
                <th
                  colSpan={5}
                  className="px-3 py-2 text-center text-xs font-bold bg-gray-800 border-r border-gray-700"
                >
                  VEHICLE INFO
                </th>
                <th
                  colSpan={11}
                  className="px-3 py-2 text-center text-xs font-bold bg-gray-800 border-r border-gray-700"
                >
                  CUSTOMER FINANCIAL
                </th>
                <th
                  colSpan={5}
                  className="px-3 py-2 text-center text-xs font-bold bg-gray-800 border-r border-gray-700"
                >
                  VENDOR FINANCIAL
                </th>
                <th
                  colSpan={8}
                  className="px-3 py-2 text-center text-xs font-bold bg-gray-800 border-r border-gray-700"
                >
                  PAYMENT & BALANCE
                </th>
                <th
                  colSpan={2}
                  className="px-3 py-2 text-center text-xs font-bold bg-gray-800"
                >
                  REMARKS
                </th>
              </tr>
              {/* Column Headers Row */}
              <tr className="bg-gray-700">
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[100px]">
                  ACTIONS
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[90px]">
                  STATUS
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[70px]">
                  AGED
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[110px]">
                  LIVE/EXPIRY
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-semibold cursor-pointer hover:bg-gray-600 min-w-[110px]"
                  onClick={() => handleSort("dsrDate")}
                >
                  DSR DATE{" "}
                  {sortField === "dsrDate" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[90px]">
                  SOURCE
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[110px]">
                  PRESALES
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[110px]">
                  TELE SALES
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-semibold cursor-pointer hover:bg-gray-600 min-w-[140px]"
                  onClick={() => handleSort("fullName")}
                >
                  FULL NAME{" "}
                  {sortField === "fullName" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[90px]">
                  LEAD ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[110px]">
                  CUSTOMER ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[110px]">
                  ADVISOR ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[110px]">
                  BOOKING ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[110px]">
                  VEHICLES
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[100px]">
                  CATEGORY
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[110px]">
                  VEHICLE NO
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[110px]">
                  DRIVER
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[140px]">
                  VENDOR NAME
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[120px]">
                  CUSTOMER RATE
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[120px]">
                  CUSTOMER TOLL
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[100px]">
                  PARK TAX
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[110px]">
                  GST AMOUNT
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[100px]">
                  TOTAL
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[130px]">
                  BOOKING AMOUNT
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[110px]">
                  OTHER AMOUNT
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[120px]">
                  BANK NAME
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[130px]">
                  AMOUNT RECEIVED
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[80px]">
                  TDS
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[140px]">
                  REMAINING
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[110px]">
                  VENDOR RATE
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[110px]">
                  VENDOR TOLL
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[130px]">
                  VENDOR PARK TAX
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[140px]">
                  CUST TO VENDOR
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[110px]">
                  OUTSTANDING
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[120px]">
                  PAYMENT STATUS
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[120px]">
                  BALANCE
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[90px]">
                  RATE
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[90px]">
                  PAY
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[120px]">
                  FINAL BALANCE
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[90px]">
                  BEFORE
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[90px]">
                  FINAL
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[80px]">
                  GST
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[150px]">
                  REMARKS TS
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold min-w-[150px]">
                  REMARKS MIS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.map((dsr, index) => {
                const paymentBadge = getPaymentStatusBadge(dsr.paymentStatus);
                return (
                  <tr
                    key={dsr.id || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => onView?.(dsr)}
                          className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onEdit?.(dsr)}
                          className="p-1 text-green-600 hover:text-green-800 rounded hover:bg-green-50"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(dsr.id)}
                          className="p-1 text-red-600 hover:text-red-800 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(dsr.status)}`}
                      >
                        {dsr.status || "NEW"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-center">
                      {dsr.aged || 0}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-medium ${dsr.liveorexpiry === "LIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {dsr.liveorexpiry || "LIVE"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      {dsr.dsrDate || "-"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {dsr.source || "Call"}
                    </td>
                    <td className="px-3 py-2 text-xs">{dsr.presales || "-"}</td>
                    <td className="px-3 py-2 text-xs">
                      {dsr.telesales || "-"}
                    </td>
                    <td className="px-3 py-2 text-xs font-medium whitespace-nowrap">
                      {dsr.fullName || "-"}
                    </td>
                    <td className="px-3 py-2 text-xs">{dsr.leadId || "-"}</td>
                    <td className="px-3 py-2 text-xs">
                      {dsr.customerId || "-"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {dsr.advisorId || "-"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {dsr.bookingId || "-"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {dsr.dsrVehicles || "-"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {dsr.dsrCategory || "-"}
                    </td>
                    <td className="px-3 py-2 text-xs">{dsr.vehNo || "-"}</td>
                    <td className="px-3 py-2 text-xs">{dsr.driver || "-"}</td>
                    <td className="px-3 py-2 text-xs">
                      {dsr.vendorName || "-"}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.customerRate)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.customerToll)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.parkTax)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.gstAmt)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right font-semibold">
                      {formatCurrency(dsr.total)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.bookingAmount)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.otherAmount)}
                    </td>
                    <td className="px-3 py-2 text-xs">{dsr.bankName || "-"}</td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.amountReceived)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.tds)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.remainingAmount)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.vendorRate)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.vendorToll)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.vendorParkTax)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.customerToVendor)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.outstanding)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${paymentBadge.className}`}
                      >
                        {paymentBadge.icon}
                        {dsr.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.balanceAmount)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.rate)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.pay)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right font-semibold">
                      {formatCurrency(dsr.finalBalance)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.before)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.final)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      {formatCurrency(dsr.gst)}
                    </td>
                    <td
                      className="px-3 py-2 text-xs max-w-[200px] truncate"
                      title={dsr.remarksTS}
                    >
                      {dsr.remarksTS || "-"}
                    </td>
                    <td
                      className="px-3 py-2 text-xs max-w-[200px] truncate"
                      title={dsr.remarksMIS}
                    >
                      {dsr.remarksMIS || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && data.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No DSR records found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center gap-3">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
            entries
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {Math.ceil(totalCount / pageSize)}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= Math.ceil(totalCount / pageSize)}
              className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors flex items-center gap-1"
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
