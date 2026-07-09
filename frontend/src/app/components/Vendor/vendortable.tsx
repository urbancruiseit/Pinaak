"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { Eye, Pencil, RefreshCw, Search, X } from "lucide-react";

import {
  getVendorsThunk,
  clearError,
  resetSuccess,
  getVendorByIdThunk,
} from "../../features/vendor/vendorSlice";
import VendorForm from "./VendorFormData";
import Pagination from "../ui/pagination";
import VendorModalView from "./vendorModelView"; // ← naya import

const VendorTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  /* ================= STATE ================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Modal state ──
  const [viewVendor, setViewVendor] = useState<any>(null); // selected vendor for modal

  const pageSize = 50;

  /* ================= REDUX ================= */
  const { vendors, loading, error, successMessage } = useSelector(
    (state: RootState) => state.vendor,
  );

  /* ================= PAGINATION ================= */
  const total = vendors?.length || 0;
  const totalPages = Math.ceil(total / pageSize);
  const paginatedVendors = vendors?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageChange = (page: number) => setCurrentPage(page);

  /* ================= EFFECTS ================= */
  useEffect(() => {
    dispatch(getVendorsThunk());
  }, [dispatch]);

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

  /* ================= EDIT ACTION ================= */
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

  /* ================= VIEW ACTION — Modal (router.push hata diya) ================= */
  const handleViewClick = (vendor: any) => {
    setViewVendor(vendor); // selected vendor modal me pass hoga
  };

  /* ================= SHOW EDIT FORM ================= */
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

  /* ================= HELPERS ================= */
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

  /* ================= FILTER ================= */
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

  /* ================= LOADING ================= */
  if ((loading && vendors.length === 0) || editLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
        <span className="ml-2 text-gray-600">
          {editLoading ? "Fetching vendor details..." : "Loading Vendors..."}
        </span>
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error && vendors.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-600 mb-3">❌ Error: {error}</p>
          <button
            onClick={() => {
              dispatch(clearError());
              dispatch(getVendorsThunk());
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <>
      {/* ── VENDOR VIEW MODAL ── */}
      {viewVendor && (
        <VendorModalView
          vendor={viewVendor}
          onClose={() => setViewVendor(null)}
        />
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* SUCCESS TOAST */}
        {showSuccessMessage && successMessage && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px]">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-green-700 font-medium">✅ {successMessage}</p>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Vendor List
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Total Vendors:{" "}
                <span className="font-semibold text-gray-700">{total}</span>
                {searchTerm && vendors?.length > 0 && (
                  <span className="text-xs text-gray-400 ml-2">
                    (filtered from {vendors?.length || 0} total)
                  </span>
                )}
              </p>
            </div>

            {/* Refresh */}
            <button
              onClick={() => dispatch(getVendorsThunk())}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition flex items-center gap-1 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
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
                  <span>Refresh</span>
                </>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, phone, company, owner or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "S.No",
                  "Vendor Name",
                  "Email",
                  "Phone",
                  "Company Name",
                  "Company Type",
                  "GST Number",
                  "Owner Name",
                  "City",
                  "State",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendors && filteredVendors.length > 0 ? (
                filteredVendors.map((vendor, index) => (
                  <tr
                    key={vendor.id || index}
                    className="hover:bg-orange-50 transition duration-150"
                  >
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {getVendorName(vendor)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {getEmail(vendor)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {getPhone(vendor)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {getCompanyName(vendor)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        {getCompanyType(vendor)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {getGstNumber(vendor)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {getOwnerName(vendor)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {getCity(vendor)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {getState(vendor)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatus(vendor) === "inactive" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                      >
                        {getStatus(vendor) === "inactive"
                          ? "Inactive"
                          : "Active"}
                      </span>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td className="px-4 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(vendor)}
                          className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          title="Edit Driver"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleViewClick(vendor)}
                          className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          title="View Driver"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="w-16 h-16 text-gray-300 mb-4"
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
                      <p className="text-gray-500 text-lg">
                        {searchTerm
                          ? "No matching vendors found"
                          : "No vendors found"}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchTerm
                          ? "Try adjusting your search term"
                          : "Click refresh to load vendors"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {total > 0 && (
          <div className="shrink-0 border-t border-slate-200 bg-white p-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={total}
              rowsPerPage={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* CSS for animations */}
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
