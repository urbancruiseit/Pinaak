"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState, AppDispatch } from "../../../redux/store";
import CustomerModelView from "./customerModelView";
import { Eye, Pencil, X } from "lucide-react";

import {
  getCustomersThunk,
  clearError,
  getCustomerByIdThunk,
} from "../../../features/NewCustomer/NewCustomerSlice";

import Pagination from "../../ui/pagination";
import CustomerPersonal from "./customerpersonal";

interface CustomerTableProps {
  onEdit?: (customer: any) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ onEdit }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { customers, loading, error } = useSelector(
    (state: RootState) => state.newCustomer,
  );

  /* ================= EDIT STATE ================= */
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  /* ================= VIEW STATE ================= */
  const [selectedViewCustomer, setSelectedViewCustomer] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  /* ================= PAGINATION ================= */
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const total = customers?.length || 0;
  const totalPages = Math.ceil(total / pageSize);

  const paginatedCustomers = customers?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /* ================= FETCH ALL CUSTOMERS ================= */
  useEffect(() => {
    dispatch(getCustomersThunk());
  }, [dispatch]);

  /* ================= EDIT ACTION ================= */
  const handleEditClick = async (customer: any) => {
    try {
      setEditLoading(true);
      const response = await dispatch(
        getCustomerByIdThunk(customer.id),
      ).unwrap();
      setSelectedCustomer(response);
      setShowEditForm(true);
      if (onEdit) {
        onEdit(response);
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
    } finally {
      setEditLoading(false);
    }
  };

  /* ================= VIEW ACTION ================= */
  const handleViewClick = async (customer: any) => {
    try {
      setViewLoading(true);
      const response = await dispatch(
        getCustomerByIdThunk(customer.id),
      ).unwrap();
      setSelectedViewCustomer(response);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching customer:", error);
    } finally {
      setViewLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowViewModal(false);
    setSelectedViewCustomer(null);
  };

  if (showEditForm) {
    return (
      <CustomerPersonal
        initialData={selectedCustomer}
        mode="edit"
        onBack={() => {
          setShowEditForm(false);
          setSelectedCustomer(null);
          dispatch(getCustomersThunk()); // Refresh list
        }}
      />
    );
  }

  if (loading || editLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-200 border-t-orange-600" />
          <span className="text-slate-600 text-lg font-medium">
            {editLoading
              ? "Fetching customer details..."
              : "Loading customers..."}
          </span>
        </div>
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="text-center py-10 px-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto shadow-sm">
          <p className="text-red-600 font-medium mb-4">❌ Error: {error}</p>
          <button
            onClick={() => {
              dispatch(clearError());
              dispatch(getCustomersThunk());
            }}
            className="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden">
        {/* ================= HEADER ================= */}
        <div className="bg-orange-100 p-3 rounded-md mb-3 shrink-0">
          <div className="flex justify-between items-center">
            <div className="pl-4 border-l-8 border-orange-500 bg-white px-4 py-3 rounded-xl shadow-md">
              <h2 className="text-3xl md:text-4xl font-bold text-orange-600">
                Customer List
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Total Customers: {total}
              </p>
            </div>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-md flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="min-w-full border-collapse text-sm">
              {/* HEADER */}
              <thead className="sticky top-0 z-20 bg-slate-800 text-white">
                <tr>
                  {[
                    "S.No",
                    "Customer Name",
                    "Email",
                    "Phone",
                    "Address",
                    "Company",
                    "City",
                    "State",
                    "Country",
                    "Type",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider border border-slate-600 whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {paginatedCustomers?.length > 0 ? (
                  paginatedCustomers.map((customer: any, index: number) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-orange-50 even:bg-slate-50 transition"
                    >
                      <td className="px-2 py-2 border border-slate-200 text-xs">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-2 py-2 border border-slate-200 text-xs font-medium whitespace-nowrap">
                        {[
                          customer.firstName,
                          customer.middleName,
                          customer.lastName,
                        ]
                          .filter(Boolean)
                          .join(" ") || "—"}
                      </td>
                      <td className="px-2 py-2 border border-slate-200 text-xs">
                        {customer.customerEmail || "—"}
                      </td>
                      <td className="px-2 py-2 border border-slate-200 text-xs">
                        {customer.customerPhone || "—"}
                      </td>
                      <td className="px-2 py-2 border border-slate-200 text-xs">
                        {customer.address || "—"}
                      </td>
                      <td className="px-2 py-2 border border-slate-200 text-xs">
                        {customer.companyName || "—"}
                      </td>
                      <td className="px-2 py-2 border border-slate-200 text-xs">
                        {customer.customerCity || "—"}
                      </td>
                      <td className="px-2 py-2 border border-slate-200 text-xs">
                        {customer.state || "—"}
                      </td>
                      <td className="px-2 py-2 border border-slate-200 text-xs">
                        {customer.countryName || "—"}
                      </td>
                      <td className="px-2 py-2 border border-slate-200 text-xs">
                        {customer.customerType || "—"}
                      </td>
                      <td className="px-2 py-2 border border-slate-200">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(customer)}
                            className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                            title="Edit Customer"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleViewClick(customer)}
                            className="flex items-center justify-center h-8 w-8 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                            title="View Customer"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={11}
                      className="text-center py-10 text-slate-500"
                    >
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
                          No customers found
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Click refresh to load customers
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
        </div>
      </div>

      {/* MODAL FOR VIEWING CUSTOMER */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleCloseModal}
          />

          {/* Modal */}
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-slate-800">
                  Customer Details
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-slate-600 transition rounded-lg p-1 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {viewLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-600" />
                      <span className="text-slate-600">
                        Loading customer details...
                      </span>
                    </div>
                  </div>
                ) : (
                  <CustomerModelView customerData={selectedViewCustomer} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerTable;
