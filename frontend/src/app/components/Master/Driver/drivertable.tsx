"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import {
  getDriversThunk,
  clearError,
  resetSuccess,
} from "../../../features/Driver/driverSlice";

const DriverTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { drivers, loading, error, successMessage } = useSelector(
    (state: RootState) => state.driver,
  );

  useEffect(() => {
    dispatch(getDriversThunk());
  }, [dispatch]);

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

  const handleEditClick = (driver: any) => {
    console.log("Edit clicked:", driver);
    localStorage.setItem("editDriverData", JSON.stringify(driver));
    window.location.href = "/dashboard?tab=driver&mode=edit";
  };

  const handleViewClick = (driver: any) => {
    console.log("View clicked:", driver);
    localStorage.setItem("viewDriverData", JSON.stringify(driver));
    window.location.href = "/dashboard?tab=driver&mode=view";
  };

  // Helper function to get driver name
  const getDriverName = (driver: any) => {
    // Try different possible field names
    if (driver.firstName && driver.lastName) {
      return `${driver.firstName} ${driver.lastName}`;
    }
    if (driver.first_name && driver.last_name) {
      return `${driver.first_name} ${driver.last_name}`;
    }
    if (driver.name) return driver.name;
    if (driver.firstName) return driver.firstName;
    if (driver.first_name) return driver.first_name;
    return "—";
  };

  // Helper function to get employee ID
  const getEmployeeId = (driver: any) => {
    if (driver.employeeId) return driver.employeeId;
    if (driver.employee_id) return driver.employee_id;
    if (driver.employmentInfo?.employeeId)
      return driver.employmentInfo.employeeId;
    return "—";
  };

  // Helper function to get phone
  const getPhone = (driver: any) => {
    if (driver.phone) return driver.phone;
    if (driver.personalInfo?.phone) return driver.personalInfo.phone;
    return "—";
  };

  // Helper function to get email
  const getEmail = (driver: any) => {
    if (driver.email) return driver.email;
    if (driver.personalInfo?.email) return driver.personalInfo.email;
    return "—";
  };

  // Helper function to get license number
  const getLicenseNumber = (driver: any) => {
    if (driver.licenseNumber) return driver.licenseNumber;
    if (driver.license_number) return driver.license_number;
    if (driver.licenseInfo?.licenseNumber)
      return driver.licenseInfo.licenseNumber;
    return "—";
  };

  // Helper function to get license type
  const getLicenseType = (driver: any) => {
    if (driver.licenseType) return driver.licenseType;
    if (driver.license_type) return driver.license_type;
    if (driver.licenseInfo?.licenseType) return driver.licenseInfo.licenseType;
    return null;
  };

  // Helper function to get vendor
  const getVendor = (driver: any) => {
    if (driver.vendor) return driver.vendor;
    if (driver.personalInfo?.vendor) return driver.personalInfo.vendor;
    return null;
  };

  // Helper function to get city
  const getCity = (driver: any) => {
    if (driver.city) return driver.city;
    if (driver.addressInfo?.city) return driver.addressInfo.city;
    return "—";
  };

  // Helper function to get state
  const getState = (driver: any) => {
    if (driver.state) return driver.state;
    if (driver.addressInfo?.state) return driver.addressInfo.state;
    return "—";
  };

  // Helper function to get blood group
  const getBloodGroup = (driver: any) => {
    if (driver.bloodGroup) return driver.bloodGroup;
    if (driver.blood_group) return driver.blood_group;
    if (driver.personalInfo?.bloodGroup) return driver.personalInfo.bloodGroup;
    return null;
  };

  // Filter drivers based on search term
  const filteredDrivers = drivers?.filter((driver) => {
    if (searchTerm === "") return true;

    const searchLower = searchTerm.toLowerCase();

    // Check all possible fields
    const name = getDriverName(driver).toLowerCase();
    const employeeId = getEmployeeId(driver).toLowerCase();
    const licenseNumber = getLicenseNumber(driver).toLowerCase();
    const phone = getPhone(driver).toLowerCase();
    const vendor = getVendor(driver)?.toLowerCase() || "";
    const email = getEmail(driver).toLowerCase();

    return (
      name.includes(searchLower) ||
      employeeId.includes(searchLower) ||
      licenseNumber.includes(searchLower) ||
      phone.includes(searchLower) ||
      vendor.includes(searchLower) ||
      email.includes(searchLower)
    );
  });

  /* ================= LOADING ================= */
  if (loading && drivers.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading Drivers...</span>
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error && drivers.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-600 mb-3">❌ Error: {error}</p>
          <button
            onClick={() => {
              dispatch(clearError());
              dispatch(getDriversThunk());
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
            <h2 className="text-xl font-semibold text-gray-800">Driver List</h2>
            <p className="text-sm text-gray-500 mt-1">
              Total Drivers:{" "}
              <span className="font-semibold text-gray-700">
                {filteredDrivers?.length || 0}
              </span>
              {searchTerm && drivers?.length > 0 && (
                <span className="text-xs text-gray-400 ml-2">
                  (filtered from {drivers?.length || 0} total)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => dispatch(getDriversThunk())}
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
            placeholder="Search by name, employee ID, license number, phone, email or vendor..."
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
                Employee ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Driver Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                License Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                License Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                State
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blood Group
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* TBODY */}
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDrivers && filteredDrivers.length > 0 ? (
              filteredDrivers.map((driver, index) => (
                <tr
                  key={driver.id || index}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {index + 1}
                  </td>

                  <td className="px-4 py-4 text-sm font-mono text-blue-600 font-medium">
                    {getEmployeeId(driver)}
                  </td>

                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {getDriverName(driver)}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {getPhone(driver)}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {getEmail(driver)}
                  </td>

                  <td className="px-4 py-4 text-sm font-mono text-gray-600">
                    {getLicenseNumber(driver)}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {getLicenseType(driver) ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {getLicenseType(driver)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {getVendor(driver) ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        {getVendor(driver)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {getCity(driver)}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {getState(driver)}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {getBloodGroup(driver) ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                        {getBloodGroup(driver)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* ACTION BUTTONS */}
                  <td className="px-4 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(driver)}
                        className="px-3 py-1.5 text-sm text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition duration-150"
                        title="Edit Driver"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleViewClick(driver)}
                        className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition duration-150"
                        title="View Driver"
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg">
                      {searchTerm
                        ? "No matching drivers found"
                        : "No drivers found"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchTerm
                        ? "Try adjusting your search term"
                        : "Click the refresh button to load drivers"}
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

export default DriverTable;
