"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import { Eye, Pencil, RefreshCw, Search, X } from "lucide-react";
import {
  getDriversThunk,
  clearError,
  getDriverByIdThunk,
  resetSuccess,
} from "../../../features/Driver/driverSlice";
import Pagination from "../../ui/pagination";
import DriverForm from "./DriverFormData";
import DriverViewModal from "./driverModelView"; // Import the view modal

interface DriverTableProps {
  onEdit?: (driver: any) => void;
  onView?: (driver: any) => void;
}

const DriverTable: React.FC<DriverTableProps> = ({ onEdit, onView }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { drivers, loading, error, successMessage } = useSelector(
    (state: RootState) => state.driver,
  );

  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false); // For view modal
  const [editLoading, setEditLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Success toast
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (successMessage) {
      setToastMessage(successMessage);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        dispatch(resetSuccess());
      }, 3000);
    }
  }, [successMessage, dispatch]);

  // Fetch drivers
  useEffect(() => {
    dispatch(getDriversThunk());
  }, [dispatch]);

  // Filter drivers
  const filteredDrivers = useMemo(() => {
    if (!drivers) return [];
    if (searchTerm === "") return drivers;

    const term = searchTerm.toLowerCase();
    return drivers.filter((driver: any) => {
      const firstName =
        driver.personalInfo?.firstName || driver.first_name || "";
      const lastName = driver.personalInfo?.lastName || driver.last_name || "";
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      const employeeId = (
        driver.employmentInfo?.employeeId ||
        driver.employee_id ||
        ""
      ).toLowerCase();
      const phone = (
        driver.personalInfo?.phone ||
        driver.phone ||
        ""
      ).toLowerCase();
      const licenseNumber = (
        driver.licenseInfo?.licenseNumber ||
        driver.license_number ||
        ""
      ).toLowerCase();

      return (
        fullName.includes(term) ||
        employeeId.includes(term) ||
        phone.includes(term) ||
        licenseNumber.includes(term)
      );
    });
  }, [drivers, searchTerm]);

  const totalPages = Math.ceil(filteredDrivers.length / rowsPerPage);
  const paginatedDrivers = filteredDrivers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getDriverName = (driver: any) => {
    const firstName = driver.personalInfo?.firstName || driver.first_name || "";
    const lastName = driver.personalInfo?.lastName || driver.last_name || "";
    return `${firstName} ${lastName}`.trim() || "—";
  };

  const getEmployeeId = (driver: any) =>
    driver.employmentInfo?.employeeId || driver.employee_id || "—";
  const getPhone = (driver: any) =>
    driver.personalInfo?.phone || driver.phone || "—";
  const getEmail = (driver: any) =>
    driver.personalInfo?.email || driver.email || "—";
  const getLicenseNumber = (driver: any) =>
    driver.licenseInfo?.licenseNumber || driver.license_number || "—";
  const getLicenseType = (driver: any) =>
    driver.licenseInfo?.licenseType || driver.license_type || null;
  const getVendor = (driver: any) =>
    driver.personalInfo?.vendor || driver.vendor || null;
  const getCity = (driver: any) =>
    driver.addressInfo?.city || driver.city || "—";
  const getState = (driver: any) =>
    driver.addressInfo?.state || driver.state || "—";
  const getBloodGroup = (driver: any) =>
    driver.personalInfo?.bloodGroup || driver.blood_group || null;

  const handleEditClick = async (driver: any) => {
    try {
      setEditLoading(true);
      const driverData = await dispatch(getDriverByIdThunk(driver.id)).unwrap();
      console.log("Fetched Driver Data for Edit:", driverData);
      setSelectedDriver(driverData);
      setShowEditForm(true);
      onEdit?.(driverData);
    } catch (error) {
      console.error("Error fetching driver:", error);
      setToastMessage("Failed to load driver data");
      setShowSuccessToast(true);
    } finally {
      setEditLoading(false);
    }
  };

  // ✅ Updated VIEW HANDLER - Opens modal instead of redirecting
  const handleViewClick = async (driver: any) => {
    try {
      setViewLoading(true);
      const driverData = await dispatch(getDriverByIdThunk(driver.id)).unwrap();
      console.log("Fetched Driver Data for View:", driverData);
      setSelectedDriver(driverData);
      setShowViewModal(true); // Open modal
      onView?.(driverData);
    } catch (error) {
      console.error("Error fetching driver:", error);
      setToastMessage("Failed to load driver data");
      setShowSuccessToast(true);
    } finally {
      setViewLoading(false);
    }
  };

  // Show edit form
  if (showEditForm) {
    return (
      <DriverForm
        initialData={selectedDriver}
        mode="edit"
        onBack={() => {
          setShowEditForm(false);
          setSelectedDriver(null);
          dispatch(getDriversThunk());
        }}
      />
    );
  }

  if (loading || editLoading || viewLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-200 border-t-orange-600" />
        <span className="ml-3 text-gray-600">
          {editLoading 
            ? "Fetching driver details for edit..." 
            : viewLoading 
              ? "Fetching driver details..." 
              : "Loading drivers..."}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => {
              dispatch(clearError());
              dispatch(getDriversThunk());
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden">
      {/* View Modal */}
      <DriverViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedDriver(null);
        }}
        driverData={selectedDriver}
      />

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-lg p-4 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-green-700 font-medium">{toastMessage}</p>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="text-green-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-orange-100 p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="pl-4 border-l-8 border-orange-500 bg-white px-6 py-4 rounded-xl shadow-md">
            <h2 className="text-3xl font-bold text-orange-600">Driver List</h2>
            <p className="text-sm text-gray-500 mt-1">
              Total Drivers:{" "}
              <span className="font-semibold text-orange-600">
                {filteredDrivers.length}
              </span>
              {searchTerm && drivers?.length > 0 && (
                <span className="text-xs text-gray-400 ml-2">
                  (filtered from {drivers.length} total)
                </span>
              )}
            </p>
          </div>

          {/* Search and Refresh */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name, ID, phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 w-64 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X size={16} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <button
              onClick={() => dispatch(getDriversThunk())}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl shadow-md flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-slate-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">S.No</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Employee ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Driver Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">License Number</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">License Type</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">City</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">State</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Blood Group</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDrivers.length > 0 ? (
                paginatedDrivers.map((driver: any, index: number) => (
                  <tr key={driver.id} className="hover:bg-orange-50 even:bg-gray-50">
                    <td className="px-4 py-3 border text-xs">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 border text-xs font-mono text-blue-600">
                      {getEmployeeId(driver)}
                    </td>
                    <td className="px-4 py-3 border text-xs font-medium">
                      {getDriverName(driver)}
                    </td>
                    <td className="px-4 py-3 border text-xs">{getPhone(driver)}</td>
                    <td className="px-4 py-3 border text-xs">{getEmail(driver)}</td>
                    <td className="px-4 py-3 border text-xs font-mono">
                      {getLicenseNumber(driver)}
                    </td>
                    <td className="px-4 py-3 border text-xs">
                      {getLicenseType(driver) && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {getLicenseType(driver)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 border text-xs">
                      {getVendor(driver) && (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          {getVendor(driver)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 border text-xs">{getCity(driver)}</td>
                    <td className="px-4 py-3 border text-xs">{getState(driver)}</td>
                    <td className="px-4 py-3 border text-xs">
                      {getBloodGroup(driver) && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          {getBloodGroup(driver)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 border">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(driver)}
                          className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          title="Edit Driver"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleViewClick(driver)}
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
                  <td colSpan={12} className="text-center py-12 text-gray-500">
                    {searchTerm ? "No matching drivers found" : "No drivers found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredDrivers.length > 0 && (
          <div className="border-t p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredDrivers.length}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

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
  );
};

export default DriverTable;