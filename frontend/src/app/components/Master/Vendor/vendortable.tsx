"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import {
  getVendorsThunk,
  clearError,
  resetSuccess,
} from "../../../features/vendor/vendorSlice";

const VendorTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { vendors, loading, error, successMessage } = useSelector(
    (state: RootState) => state.vendor,
  );

  useEffect(() => {
    console.log("Fetching vendors...");
    dispatch(getVendorsThunk());
  }, [dispatch]);

  // Debug: Log vendors when they change
  useEffect(() => {
    console.log("Vendors data received:", vendors);
    if (vendors && vendors.length > 0) {
      console.log("First vendor structure:", vendors[0]);
    }
  }, [vendors]);

  // Clear success message after 3 seconds
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

  const handleEditClick = (vendor: any) => {
    console.log("Edit clicked:", vendor);
    localStorage.setItem("editVendorData", JSON.stringify(vendor));
    window.location.href = "/dashboard?tab=vendor&mode=edit";
  };

  const handleViewClick = (vendor: any) => {
    console.log("View clicked:", vendor);
    localStorage.setItem("viewVendorData", JSON.stringify(vendor));
    window.location.href = "/dashboard?tab=vendor&mode=view";
  };

  // Helper functions to safely get data from different field names
  const getVendorName = (vendor: any) => {
    return vendor.name || vendor.vendor_name || vendor.vendorName || "—";
  };

  const getEmail = (vendor: any) => {
    return vendor.email || vendor.vendor_email || "—";
  };

  const getPhone = (vendor: any) => {
    return vendor.phone || vendor.mobile || vendor.vendor_phone || "—";
  };

  const getCompanyName = (vendor: any) => {
    return (
      vendor.company_name || vendor.companyName || vendor.company?.name || "—"
    );
  };

  const getCompanyType = (vendor: any) => {
    return (
      vendor.companyType || vendor.company_type || vendor.company?.type || "—"
    );
  };

  const getGstNumber = (vendor: any) => {
    return vendor.gstNumber || vendor.gst_number || vendor.gst || "—";
  };

  const getOwnerName = (vendor: any) => {
    return vendor.ownerName || vendor.owner_name || vendor.owner?.name || "—";
  };

  const getCity = (vendor: any) => {
    return (
      vendor.personalInfo?.personalCity ||
      vendor.personal_city ||
      vendor.city ||
      vendor.address?.city ||
      "—"
    );
  };

  const getState = (vendor: any) => {
    return (
      vendor.personalInfo?.personalState ||
      vendor.personal_state ||
      vendor.state ||
      vendor.address?.state ||
      "—"
    );
  };

  const getStatus = (vendor: any) => {
    return vendor.status || "active";
  };

  // Filter vendors based on search term
  const filteredVendors = vendors?.filter((vendor) => {
    if (searchTerm === "") return true;

    const searchLower = searchTerm.toLowerCase();

    return (
      getVendorName(vendor).toLowerCase().includes(searchLower) ||
      getEmail(vendor).toLowerCase().includes(searchLower) ||
      getPhone(vendor).toLowerCase().includes(searchLower) ||
      getCompanyName(vendor).toLowerCase().includes(searchLower) ||
      getOwnerName(vendor).toLowerCase().includes(searchLower) ||
      getCity(vendor).toLowerCase().includes(searchLower)
    );
  });

  /* ================= LOADING ================= */
  if (loading && vendors.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading Vendors...</span>
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* SUCCESS MESSAGE */}
      {showSuccessMessage && successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-down">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <p className="text-green-600">✅ {successMessage}</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Vendor List</h2>
            <p className="text-sm text-gray-500 mt-1">
              Total Vendors:{" "}
              <span className="font-semibold text-gray-700">
                {filteredVendors?.length || 0}
              </span>
              {searchTerm && vendors?.length > 0 && (
                <span className="text-xs text-gray-400 ml-2">
                  (filtered from {vendors?.length || 0} total)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => dispatch(getVendorsThunk())}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
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

        {/* SEARCH BAR */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email, phone, company, owner or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* THEAD */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                GST Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                State
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* TBODY */}
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVendors && filteredVendors.length > 0 ? (
              filteredVendors.map((vendor, index) => (
                <tr
                  key={vendor.id || index}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {index + 1}
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

                  <td className="px-4 py-4 text-sm text-gray-600">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        getStatus(vendor) === "inactive"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {getStatus(vendor) === "inactive" ? "Inactive" : "Active"}
                    </span>
                  </td>

                  {/* ACTION BUTTONS */}
                  <td className="px-4 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(vendor)}
                        className="px-3 py-1.5 text-sm text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition duration-150"
                        title="Edit Vendor"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleViewClick(vendor)}
                        className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition duration-150"
                        title="View Vendor"
                      >
                        View
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
                      className="w-16 h-16 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
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
                        : "Click the refresh button to load vendors"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default VendorTable;
