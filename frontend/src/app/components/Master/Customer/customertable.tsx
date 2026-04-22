"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import {
  getCustomersThunk,
  clearError,
} from "../../../features/NewCustomer/NewCustomerSlice";

const CustomerTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { customers, loading, error } = useSelector(
    (state: RootState) => state.newCustomer,
  );

  useEffect(() => {
    dispatch(getCustomersThunk());
  }, [dispatch]);

  const handleEditClick = (customer: any) => {
    localStorage.setItem("editCustomerData", JSON.stringify(customer));
    window.location.href = "/dashboard?tab=customer-personal&mode=edit";
  };

  // ✅ FIXED ROUTE + typo fixed
  const handleViewClick = (customer: any) => {
    localStorage.setItem("viewCustomerData", JSON.stringify(customer));
    window.location.href = "/dashboard?tab=customer-personal&mode=view";
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-gray-600">Loading customers...</span>
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="text-center py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-600 mb-3">❌ Error: {error}</p>
          <button
            onClick={() => {
              dispatch(clearError());
              dispatch(getCustomersThunk());
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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Customers List
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Total Customers: {customers?.length || 0}
          </p>
        </div>
        <button
          onClick={() => dispatch(getCustomersThunk())}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
        >
          Refresh
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* THEAD */}
          <thead className="bg-gray-50">
            <tr>
              {[
                "S.No",
                "Customer Name",
                "Email",
                "Phone",
                "Company",
                "City",
                "State",
                "Country",
                "Type",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* TBODY */}
          <tbody className="bg-white divide-y divide-gray-200">
            {customers && customers.length > 0 ? (
              customers.map((customer, index) => (
                <tr key={customer.uuid} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {index + 1}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {[
                      customer.firstName,
                      customer.middleName,
                      customer.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {customer.customerEmail || "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {customer.customerPhone || "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {customer.companyName || "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {customer.city || customer.customerCity || "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {customer.state || "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {customer.countryName || "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {customer.customerType || "Regular"}
                    </span>
                  </td>

                  {/* ACTION BUTTONS */}
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(customer)}
                        className="px-3 py-1.5 text-sm text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleViewClick(customer)}
                        className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <>
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(10)].map((_, j) => (
                      <td key={j} className="px-6 py-4 text-gray-300">
                        —
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td colSpan={10} className="text-center py-6 text-gray-500">
                    No customers found
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;
