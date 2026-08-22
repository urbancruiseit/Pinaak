"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { Eye, Pencil, X } from "lucide-react";

import {
  getVendorsThunk,
  clearError,
  resetSuccess,
  getVendorByIdThunk,
} from "../../features/vendor/vendorSlice";

import VendorForm from "./VendorFormData";
import Pagination from "../ui/pagination";
import VendorModalView from "./vendorModelView";

// =====================================================
// REUSABLE TABLE COMPONENTS
// =====================================================
import Table from "../ui/Table/Table";
import TableHeader from "../ui/Table/TableHeader";
import TableRow from "../ui/Table/TableRow";
import TableCell from "../ui/Table/TableCell";

// =====================================================
// COMPONENT
// =====================================================
const VendorTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // =====================================================
  // STATE
  // =====================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [viewVendor, setViewVendor] = useState<any>(null);

  const pageSize = 50;

  // =====================================================
  // REDUX
  // =====================================================
  const { vendors, loading, error, successMessage } = useSelector(
    (state: RootState) => state.vendor,
  );

  // =====================================================
  // PAGINATION
  // =====================================================
  const total = vendors?.length || 0;

  const totalPages = Math.ceil(total / pageSize);

  const paginatedVendors = vendors?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // =====================================================
  // FETCH VENDORS
  // =====================================================
  useEffect(() => {
    dispatch(getVendorsThunk());
  }, [dispatch]);

  // =====================================================
  // SUCCESS MESSAGE
  // =====================================================
  useEffect(() => {
    if (successMessage) {
      setShowSuccessMessage(true);

      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        dispatch(resetSuccess());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  // =====================================================
  // EDIT
  // =====================================================
  const handleEditClick = async (vendor: any) => {
    try {
      setEditLoading(true);

      const vendorId = vendor?.id || vendor?.vendor_id;

      if (!vendorId) {
        console.error("Vendor ID missing:", vendor);
        return;
      }

      await dispatch(getVendorByIdThunk(Number(vendorId))).unwrap();

      setShowEditForm(true);
    } catch (err) {
      console.error("Error fetching vendor:", err);
    } finally {
      setEditLoading(false);
    }
  };

  // =====================================================
  // VIEW
  // =====================================================
  const handleViewClick = (vendor: any) => {
    setViewVendor(vendor);
  };

  // =====================================================
  // EDIT FORM
  // =====================================================
  if (showEditForm) {
    return (
      <VendorForm
        mode="edit"
        onBack={() => {
          setShowEditForm(false);
          dispatch(getVendorsThunk());
        }}
      />
    );
  }

  // =====================================================
  // HELPERS
  // =====================================================
  const getVendorName = (v: any) =>
    v.name || v.vendor_name || v.vendorName || "—";

  const getEmail = (v: any) => v.email || v.vendor_email || "—";

  const getPhone = (v: any) => v.phone || v.mobile || v.vendor_phone || "—";

  const getCompanyName = (v: any) =>
    v.company_name || v.companyName || v.company?.name || "—";

  const getCompanyType = (v: any) =>
    v.companyType || v.company_type || v.company?.type || "—";

  const getGstNumber = (v: any) => v.gstNumber || v.gst_number || v.gst || "—";

  const getOwnerName = (v: any) =>
    v.ownerName || v.owner_name || v.owner?.name || "—";

  const getCity = (v: any) =>
    v.personalInfo?.personalCity ||
    v.personal_city ||
    v.city ||
    v.address?.city ||
    "—";

  const getState = (v: any) =>
    v.personalInfo?.personalState ||
    v.personal_state ||
    v.state ||
    v.address?.state ||
    "—";

  const getStatus = (v: any) => v.status || "active";

  // =====================================================
  // FILTER
  // =====================================================
  const filteredVendors = paginatedVendors?.filter((vendor) => {
    if (!searchTerm) return true;

    const s = searchTerm.toLowerCase();

    return (
      getVendorName(vendor).toLowerCase().includes(s) ||
      getEmail(vendor).toLowerCase().includes(s) ||
      getPhone(vendor).toLowerCase().includes(s) ||
      getCompanyName(vendor).toLowerCase().includes(s) ||
      getOwnerName(vendor).toLowerCase().includes(s) ||
      getCity(vendor).toLowerCase().includes(s)
    );
  });

  // =====================================================
  // LOADING
  // =====================================================
  if ((loading && vendors.length === 0) || editLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-600" />

        <span className="ml-2 text-gray-600">
          {editLoading ? "Fetching vendor details..." : "Loading Vendors..."}
        </span>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================
  if (error && vendors.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="mb-3 text-red-600">❌ Error: {error}</p>

          <button
            type="button"
            onClick={() => {
              dispatch(clearError());
              dispatch(getVendorsThunk());
            }}
            className="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <>
      {/* =====================================================
          VENDOR VIEW MODAL
      ===================================================== */}
      {viewVendor && (
        <VendorModalView
          vendor={viewVendor}
          onClose={() => setViewVendor(null)}
        />
      )}

      <div className="w-full">
        {/* =====================================================
            SUCCESS TOAST
        ===================================================== */}
        {showSuccessMessage && successMessage && (
          <div className="fixed right-4 top-4 z-50 animate-slide-in-right">
            <div className="flex min-w-[300px] items-center gap-3 rounded-lg border-l-4 border-green-500 bg-green-50 p-4 shadow-lg">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

              <p className="font-medium text-green-700">✅ {successMessage}</p>

              <button
                type="button"
                onClick={() => setShowSuccessMessage(false)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="mb-2 rounded-md bg-orange-100 p-3 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* TITLE */}
            <div className="flex shrink-0 items-center">
              <div className="rounded-md border-l-8 border-orange-500 bg-white px-3 shadow-md">
                <h2 className="py-3 text-2xl font-bold text-orange-600 md:text-3xl">
                  Vendor List
                </h2>
              </div>

              <div className="ml-4">
                <p className="text-sm text-gray-500">
                  Total Vendors:{" "}
                  <span className="font-semibold text-gray-700">{total}</span>
                  {searchTerm && vendors?.length > 0 && (
                    <span className="ml-2 text-xs text-gray-400">
                      (filtered from {vendors?.length || 0} total)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* REFRESH */}
            <button
              type="button"
              onClick={() => dispatch(getVendorsThunk())}
              disabled={loading}
              className="flex items-center gap-2 self-end rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-white" />
                  Loading...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>

          {/* SEARCH */}
          <div className="relative mt-4">
            <input
              type="text"
              placeholder="Search by name, email, phone, company, owner or city..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}
        <Table minWidth="min-w-[1400px]" maxHeight="max-h-[920px]">
          {/* TABLE HEADER */}
          <TableHeader>
            <TableRow alternate={false}>
              <TableCell header sticky>
                S.No
              </TableCell>

              <TableCell header>Vendor Name</TableCell>

              <TableCell header>Company Name</TableCell>

              <TableCell header>Company Type</TableCell>

              <TableCell header>GST Number</TableCell>

              <TableCell header>Owner Name</TableCell>

              <TableCell header>City</TableCell>

              <TableCell header>State</TableCell>

              <TableCell header>Status</TableCell>

              <TableCell header>Actions</TableCell>
            </TableRow>
          </TableHeader>

          {/* TABLE BODY */}
          <tbody>
            {filteredVendors && filteredVendors.length > 0 ? (
              filteredVendors.map((vendor, index) => {
                const status = getStatus(vendor);

                return (
                  <TableRow key={vendor.id || index} index={index}>
                    {/* S.NO */}
                    <TableCell sticky rowIndex={index}>
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>

                    {/* VENDOR NAME */}
                    <TableCell className="font-bold text-orange-700">
                      {getVendorName(vendor)}
                    </TableCell>

                    {/* COMPANY */}
                    <TableCell>{getCompanyName(vendor)}</TableCell>

                    {/* COMPANY TYPE */}
                    <TableCell>
                      <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-800">
                        {getCompanyType(vendor)}
                      </span>
                    </TableCell>

                    {/* GST */}
                    <TableCell>{getGstNumber(vendor)}</TableCell>

                    {/* OWNER */}
                    <TableCell>{getOwnerName(vendor)}</TableCell>

                    {/* CITY */}
                    <TableCell>{getCity(vendor)}</TableCell>

                    {/* STATE */}
                    <TableCell>{getState(vendor)}</TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          status === "inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {status === "inactive" ? "Inactive" : "Active"}
                      </span>
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* EDIT */}
                        <button
                          type="button"
                          onClick={() => handleEditClick(vendor)}
                          className="rounded-lg bg-blue-100 p-2 text-blue-700 transition hover:bg-blue-200"
                          title="Edit Vendor"
                        >
                          <Pencil size={14} />
                        </button>

                        {/* VIEW */}
                        <button
                          type="button"
                          onClick={() => handleViewClick(vendor)}
                          className="rounded-lg bg-gray-100 p-2 text-gray-700 transition hover:bg-gray-200"
                          title="View Vendor"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              /* EMPTY */
              <tr>
                <td colSpan={10} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="mb-4 h-16 w-16 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>

                    <p className="text-lg text-gray-500">
                      {searchTerm
                        ? "No matching vendors found"
                        : "No vendors found"}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      {searchTerm
                        ? "Try adjusting your search term"
                        : "Click refresh to load vendors"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* =====================================================
            PAGINATION
        ===================================================== */}
        {total > 0 && (
          <div className="mt-2 shrink-0 rounded-xl border border-slate-200 bg-white px-2 py-2 shadow-sm">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={total}
              rowsPerPage={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* =====================================================
            ANIMATION
        ===================================================== */}
        <style jsx>{`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }

            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .animate-slide-in-right {
            animation: slideInRight 0.3s ease-out;
          }
        `}</style>
      </div>
    </>
  );
};

export default VendorTable;
