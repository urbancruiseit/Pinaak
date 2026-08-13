"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import CustomerModelView from "./customerModelView";

import {
  Eye,
  Pencil,
  X,
  Search,
  RotateCcw,
  Users,
  MapPin,
  UserRound,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";

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

const TABLE_COLUMNS: { label: string; key: string }[] = [
  { label: "First Name", key: "firstName" },
  { label: "Middle Name", key: "middleName" },
  { label: "Last Name", key: "lastName" },
  { label: "Email", key: "customerEmail" },
  { label: "Phone", key: "customerPhone" },
  { label: "Alternate Phone", key: "alternatePhone" },
  { label: "Company", key: "companyName" },
  { label: "Customer Type", key: "customerType" },
  { label: "Category Type", key: "customerCategoryType" },
  { label: "Country", key: "countryName" },
  { label: "City", key: "customerCity" },
  { label: "State", key: "state" },
  { label: "Pincode", key: "pincode" },
  { label: "Address", key: "address" },
];

const CustomerTable: React.FC<CustomerTableProps> = ({ onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { customers, loading, error } = useSelector(
    (state: RootState) => state.newCustomer,
  );

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedViewCustomer, setSelectedViewCustomer] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    dispatch(getCustomersThunk());
  }, [dispatch]);

  const cityOptions = useMemo(() => {
    const cities = (customers || [])
      .map((c: any) => c.customerCity)
      .filter((city: any) => typeof city === "string" && city.trim() !== "");
    return Array.from(new Set(cities)).sort((a: string, b: string) =>
      a.localeCompare(b),
    );
  }, [customers]);

  /* =========================================================
     CUSTOMER TYPE OPTIONS
  ========================================================= */

  const typeOptions = useMemo(() => {
    const types = (customers || [])
      .map((c: any) => c.customerType)
      .filter((type: any) => typeof type === "string" && type.trim() !== "");

    return Array.from(new Set(types)).sort((a: string, b: string) =>
      a.localeCompare(b),
    );
  }, [customers]);

  /* =========================================================
     FILTER CUSTOMERS
  ========================================================= */

  const filteredCustomers = useMemo(() => {
    let result = customers || [];

    const term = searchTerm.trim().toLowerCase();

    if (term) {
      result = result.filter((c: any) => {
        const fullName = [c.firstName, c.middleName, c.lastName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const phone = String(c.customerPhone || "").toLowerCase();

        const alternatePhone = String(c.alternatePhone || "").toLowerCase();

        const email = String(c.customerEmail || "").toLowerCase();

        const company = String(c.companyName || "").toLowerCase();

        return (
          fullName.includes(term) ||
          phone.includes(term) ||
          alternatePhone.includes(term) ||
          email.includes(term) ||
          company.includes(term)
        );
      });
    }

    if (cityFilter) {
      result = result.filter((c: any) => c.customerCity === cityFilter);
    }

    if (typeFilter) {
      result = result.filter((c: any) => c.customerType === typeFilter);
    }

    return result;
  }, [customers, searchTerm, cityFilter, typeFilter]);

  const total = filteredCustomers.length;

  const totalPages = Math.ceil(total / pageSize);

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  /* =========================================================
     RESET PAGE WHEN FILTER CHANGES
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, cityFilter, typeFilter]);

  /* =========================================================
     HANDLERS
  ========================================================= */

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCityFilter("");
    setTypeFilter("");
  };

  /* =========================================================
     EDIT CUSTOMER
  ========================================================= */

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

  /* =========================================================
     VIEW CUSTOMER
  ========================================================= */

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

  /* =========================================================
     EDIT SCREEN
  ========================================================= */

  if (showEditForm) {
    return (
      <CustomerPersonal
        initialData={selectedCustomer}
        mode="edit"
        onBack={() => {
          setShowEditForm(false);
          setSelectedCustomer(null);
          dispatch(getCustomersThunk());
        }}
      />
    );
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading || editLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="w-[320px] bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="relative mx-auto w-14 h-14">
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />

            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-orange-500 animate-spin" />

            <Users
              size={20}
              className="absolute inset-0 m-auto text-slate-500"
            />
          </div>

          <p className="mt-6 text-base font-semibold text-slate-800">
            {editLoading ? "Fetching customer details" : "Loading customers"}
          </p>

          <p className="text-sm text-slate-400 mt-1">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-9 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-xl">
            ⚠️
          </div>

          <h3 className="mt-5 text-xl font-bold text-slate-800">
            Unable to load customers
          </h3>

          <p className="text-sm text-slate-500 mt-2">{error}</p>

          <button
            onClick={() => {
              dispatch(clearError());
              dispatch(getCustomersThunk());
            }}
            className="
              mt-6
              px-6 py-3
              rounded-xl
              bg-slate-800
              text-white
              text-sm
              font-semibold
              hover:bg-slate-900
              transition-all
            "
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-120px)] min-h-0 bg-slate-50">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="shrink-0 mb-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1 bg-orange-500 w-full" />

            <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <Users size={23} className="text-slate-600" />
                </div>

                <div>
                  <h2 className="text-2xl md:text-[27px] font-bold text-slate-800 tracking-tight">
                    Customer List
                  </h2>

                  <p className="text-sm md:text-[15px] text-slate-400 mt-1">
                    Manage and view customer records
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Total Customers
                  </p>

                  <p className="text-2xl font-bold text-slate-800">{total}</p>
                </div>

                <div className="h-10 w-px bg-slate-200" />

                <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                  <span className="text-sm font-medium text-slate-600">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            FILTER BAR
        ====================================================== */}

        <div className="shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <SlidersHorizontal size={16} className="text-slate-500" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-700">Filters</p>

              <p className="text-xs text-slate-400 mt-0.5">
                Search and filter customer records
              </p>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            {/* Search */}

            <div className="relative flex-1 min-w-[280px]">
              <Search
                size={18}
                className="
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, phone, email or company..."
                className="
                  w-full
                  h-11
                  pl-11
                  pr-4
                  text-[15px]
                  bg-slate-50
                  border border-slate-200
                  rounded-xl
                  outline-none
                  text-slate-700
                  placeholder:text-slate-400
                  transition-all
                  focus:bg-white
                  focus:border-orange-400
                  focus:ring-4
                  focus:ring-orange-50
                "
              />
            </div>

            {/* City */}

            <div className="relative min-w-[200px]">
              <MapPin
                size={17}
                className="
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  pointer-events-none
                "
              />

              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="
                  w-full
                  h-11
                  pl-10
                  pr-9
                  text-[15px]
                  bg-slate-50
                  border border-slate-200
                  rounded-xl
                  outline-none
                  text-slate-600
                  cursor-pointer
                  appearance-none
                  transition-all
                  focus:bg-white
                  focus:border-orange-400
                  focus:ring-4
                  focus:ring-orange-50
                "
              >
                <option value="">All Cities</option>

                {cityOptions.map((city: string) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  pointer-events-none
                "
              />
            </div>

            {/* Customer Type */}

            <div className="relative min-w-[210px]">
              <UserRound
                size={17}
                className="
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  pointer-events-none
                "
              />

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="
                  w-full
                  h-11
                  pl-10
                  pr-9
                  text-[15px]
                  bg-slate-50
                  border border-slate-200
                  rounded-xl
                  outline-none
                  text-slate-600
                  cursor-pointer
                  appearance-none
                  transition-all
                  focus:bg-white
                  focus:border-orange-400
                  focus:ring-4
                  focus:ring-orange-50
                "
              >
                <option value="">All Customer Types</option>

                {typeOptions.map((type: string) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  pointer-events-none
                "
              />
            </div>

            {/* Reset */}

            {(searchTerm || cityFilter || typeFilter) && (
              <button
                onClick={handleResetFilters}
                className="
                  h-11
                  px-5
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-slate-100
                  border border-slate-200
                  text-slate-600
                  text-sm
                  font-semibold
                  hover:bg-slate-800
                  hover:text-white
                  hover:border-slate-800
                  transition-all
                "
              >
                <RotateCcw size={16} />
                Reset
              </button>
            )}
          </div>

          {/* Active Filters */}

          {(searchTerm || cityFilter || typeFilter) && (
            <div
              className="
              flex
              flex-wrap
              items-center
              gap-2
              mt-4
              pt-4
              border-t
              border-slate-100
            "
            >
              <span
                className="
                text-[11px]
                uppercase
                tracking-wider
                font-bold
                text-slate-400
              "
              >
                Active:
              </span>

              {searchTerm && (
                <span
                  className="
                  px-3
                  py-1.5
                  bg-slate-100
                  border
                  border-slate-200
                  text-slate-600
                  text-sm
                  font-medium
                "
                >
                  Search: {searchTerm}
                </span>
              )}

              {cityFilter && (
                <span
                  className="
                  px-3
                  py-1.5
                  bg-slate-100
                  border
                  border-slate-200
                  text-slate-600
                  text-sm
                  font-medium
                "
                >
                  City: {cityFilter}
                </span>
              )}

              {typeFilter && (
                <span
                  className="
                  px-3
                  py-1.5
                  bg-slate-100
                  border
                  border-slate-200
                  text-slate-600
                  text-sm
                  font-medium
                "
                >
                  Type: {typeFilter}
                </span>
              )}
            </div>
          )}
        </div>

        {/* =====================================================
            TABLE
        ====================================================== */}

        <div
          className="
          bg-white
          border border-slate-200
          rounded-2xl
          shadow-sm
          flex flex-col
          flex-1
          min-h-0
          overflow-hidden
        "
        >
          <div className="flex-1 overflow-auto">
            <table
              className="
              min-w-max
              w-full
              border-collapse
              text-[14px]
            "
            >
              {/* TABLE HEADER */}

              <thead className="sticky top-0 z-30">
                <tr className="bg-slate-800">
                  <th
                    className="
                      sticky
                      left-0
                      z-40
                      bg-slate-800
                      px-5
                      py-4
                      text-left
                      text-[12px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-200
                      border-r
                      border-slate-700
                      whitespace-nowrap
                    "
                  >
                    #
                  </th>

                  {TABLE_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className="
                          px-5
                          py-4
                          text-left
                          text-[12px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-slate-200
                          border-r
                          border-slate-700
                          whitespace-nowrap
                        "
                    >
                      {col.label}
                    </th>
                  ))}

                  <th
                    className="
                      sticky
                      right-0
                      z-40
                      bg-slate-800
                      px-5
                      py-4
                      text-center
                      text-[12px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-200
                      border-l
                      border-slate-700
                      whitespace-nowrap
                    "
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}

              <tbody>
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((customer: any, index: number) => (
                    <tr
                      key={customer.id}
                      className="
                          group
                          border-b
                          border-slate-100
                          hover:bg-slate-50
                          transition-colors
                        "
                    >
                      {/* NUMBER */}

                      <td
                        className="
                            sticky
                            left-0
                            z-10
                            bg-white
                            group-hover:bg-slate-50
                            px-5
                            py-4
                            border-r
                            border-slate-100
                            text-sm
                            font-semibold
                            text-slate-500
                            whitespace-nowrap
                          "
                      >
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>

                      {/* COLUMNS */}

                      {TABLE_COLUMNS.map((col) => {
                        const value = customer[col.key];

                        return (
                          <td
                            key={col.key}
                            className="
                                  px-5
                                  py-4
                                  text-[14px]
                                  leading-6
                                  text-slate-600
                                  whitespace-nowrap
                                  border-r
                                  border-slate-50
                                "
                          >
                            {value !== null &&
                            value !== undefined &&
                            value !== "" ? (
                              col.key === "customerPhone" ? (
                                <span
                                  className="
                                      font-semibold
                                      text-slate-700
                                      text-[14px]
                                    "
                                >
                                  {String(value)}
                                </span>
                              ) : col.key === "customerType" ? (
                                <span
                                  className="
                                      font-medium
                                      text-slate-700
                                      text-[14px]
                                    "
                                >
                                  {String(value)}
                                </span>
                              ) : col.key === "customerCategoryType" ? (
                                <span
                                  className="
                                      font-medium
                                      text-slate-700
                                      text-[14px]
                                    "
                                >
                                  {String(value)}
                                </span>
                              ) : (
                                <span
                                  className="
                                      text-[14px]
                                      text-slate-600
                                    "
                                >
                                  {String(value)}
                                </span>
                              )
                            ) : (
                              <span
                                className="
                                    text-slate-300
                                    text-[14px]
                                  "
                              >
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* ACTIONS */}

                      <td
                        className="
                            sticky
                            right-0
                            z-10
                            bg-white
                            group-hover:bg-slate-50
                            px-5
                            py-3
                            border-l
                            border-slate-100
                          "
                      >
                        <div
                          className="
                            flex
                            items-center
                            justify-center
                            gap-2.5
                          "
                        >
                          {/* EDIT */}

                          <button
                            onClick={() => handleEditClick(customer)}
                            className="
                                h-9
                                w-9
                                flex
                                items-center
                                justify-center
                                bg-slate-50
                                text-slate-600
                                border
                                border-slate-200
                                rounded-lg
                                hover:bg-slate-800
                                hover:text-white
                                hover:border-slate-800
                                transition-all
                              "
                            title="Edit Customer"
                          >
                            <Pencil size={16} />
                          </button>

                          {/* VIEW */}

                          <button
                            onClick={() => handleViewClick(customer)}
                            className="
                                h-9
                                w-9
                                flex
                                items-center
                                justify-center
                                bg-slate-50
                                text-slate-600
                                border
                                border-slate-200
                                rounded-lg
                                hover:bg-slate-800
                                hover:text-white
                                hover:border-slate-800
                                transition-all
                              "
                            title="View Customer"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* =================================================
                     EMPTY STATE
                  ================================================== */

                  <tr>
                    <td colSpan={TABLE_COLUMNS.length + 2} className="py-24">
                      <div
                        className="
                        flex
                        flex-col
                        items-center
                        justify-center
                      "
                      >
                        <div
                          className="
                          h-18
                          w-18
                          rounded-2xl
                          bg-slate-100
                          border
                          border-slate-200
                          flex
                          items-center
                          justify-center
                        "
                        >
                          <Users size={30} className="text-slate-300" />
                        </div>

                        <h3
                          className="
                          mt-5
                          text-lg
                          font-bold
                          text-slate-700
                        "
                        >
                          {searchTerm || cityFilter || typeFilter
                            ? "No customers found"
                            : "No customer records"}
                        </h3>

                        <p
                          className="
                          text-sm
                          text-slate-400
                          mt-2
                          text-center
                          max-w-sm
                        "
                        >
                          {searchTerm || cityFilter || typeFilter
                            ? "Try changing your search or clearing the active filters."
                            : "Customer records will appear here once they are available."}
                        </p>

                        {(searchTerm || cityFilter || typeFilter) && (
                          <button
                            onClick={handleResetFilters}
                            className="
                              mt-5
                              px-5
                              py-2.5
                              bg-slate-800
                              text-white
                              text-sm
                              font-semibold
                              rounded-xl
                              hover:bg-slate-900
                              transition-all
                            "
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* =====================================================
              PAGINATION
          ====================================================== */}

          {total > 0 && (
            <div
              className="
              shrink-0
              border-t
              border-slate-200
              bg-white
              px-5
              py-4
            "
            >
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

      {/* =========================================================
          CUSTOMER VIEW MODAL
      ========================================================= */}

      {showViewModal && (
        <div className="fixed inset-0 z-[100]">
          {/* BACKDROP */}

          <div
            className="
              absolute
              inset-0
              bg-slate-950/50
              backdrop-blur-[3px]
            "
            onClick={handleCloseModal}
          />

          {/* MODAL */}

          <div
            className="
            relative
            h-full
            w-full
            flex
            items-center
            justify-center
            p-4
            md:p-6
          "
          >
            <div
              className="
              relative
              bg-white
              w-full
              max-w-5xl
              max-h-[92vh]
              rounded-2xl
              shadow-2xl
              overflow-hidden
              border
              border-slate-200
            "
            >
              {/* MODAL HEADER */}

              <div
                className="
                sticky
                top-0
                z-20
                bg-white
                border-b
                border-slate-200
              "
              >
                <div
                  className="
                  px-6
                  md:px-7
                  py-5
                  flex
                  items-center
                  justify-between
                "
                >
                  <div
                    className="
                    flex
                    items-center
                    gap-4
                  "
                  >
                    <div
                      className="
                      h-11
                      w-11
                      rounded-xl
                      bg-slate-100
                      border
                      border-slate-200
                      flex
                      items-center
                      justify-center
                    "
                    >
                      <UserRound size={20} className="text-slate-600" />
                    </div>

                    <div>
                      <h3
                        className="
                        text-xl
                        font-bold
                        text-slate-800
                      "
                      >
                        Customer Details
                      </h3>

                      <p
                        className="
                        text-sm
                        text-slate-400
                        mt-0.5
                      "
                      >
                        Complete customer information
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCloseModal}
                    className="
                      h-10
                      w-10
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      text-slate-400
                      bg-slate-50
                      border
                      border-slate-200
                      hover:bg-red-50
                      hover:text-red-500
                      hover:border-red-100
                      transition-all
                    "
                    title="Close"
                  >
                    <X size={19} />
                  </button>
                </div>
              </div>

              {/* MODAL BODY */}

              <div
                className="
                overflow-y-auto
                max-h-[calc(92vh-81px)]
                p-6
                md:p-8
                bg-slate-50
              "
              >
                {viewLoading ? (
                  <div
                    className="
                    h-72
                    flex
                    items-center
                    justify-center
                  "
                  >
                    <div
                      className="
                      bg-white
                      rounded-2xl
                      border
                      border-slate-200
                      shadow-sm
                      px-9
                      py-7
                      flex
                      flex-col
                      items-center
                    "
                    >
                      <div
                        className="
                        h-11
                        w-11
                        rounded-full
                        border-[3px]
                        border-slate-100
                        border-t-orange-500
                        animate-spin
                      "
                      />

                      <p
                        className="
                        mt-5
                        text-base
                        font-semibold
                        text-slate-700
                      "
                      >
                        Loading customer details...
                      </p>

                      <p
                        className="
                        text-sm
                        text-slate-400
                        mt-1
                      "
                      >
                        Please wait
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="
                    bg-white
                    rounded-2xl
                    border
                    border-slate-200
                    shadow-sm
                    p-5
                    md:p-7
                  "
                  >
                    <CustomerModelView customerData={selectedViewCustomer} />
                  </div>
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
