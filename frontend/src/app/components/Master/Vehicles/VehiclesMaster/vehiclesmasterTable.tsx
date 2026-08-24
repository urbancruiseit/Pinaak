"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, X } from "lucide-react";
import Pagination from "../../../ui/pagination";
import type { AppDispatch, RootState } from "../../../../redux/store";
import {
  vehicleslice,
  fetchSeatOptions,
} from "../../../../features/vehicle/vehicleSlice";
import VehicleForm from "./VehiclesMasterForm";
import { CATEGORY_OPTIONS, VARIANT_OPTIONS } from "./vehicleMasterDropdown";
import VehicleFilters from "../VehicleFilters";
import Table from "../../../../components/ui/Table/Table";
import TableHeader from "../../../../components/ui/Table/TableHeader";
import TableRow from "../../../../components/ui/Table/TableRow";
import TableCell from "../../../../components/ui/Table/TableCell";
import VehicleCodeHover from "../VehicleCodeHover";
import LeadPageHeader from "../../../../components/ui/PageHeader/TablePageHeader";

const VehicleTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    vehicleCodes,
    loading,
    error,
    page,
    limit,
    totalPages,
    total,
    seatOptions,
    seatOptionsLoading,
  } = useSelector((state: RootState) => state.vehicle);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  // =====================================================
  // FETCH SEAT OPTIONS
  // =====================================================
  useEffect(() => {
    dispatch(fetchSeatOptions());
  }, [dispatch]);

  // =====================================================
  // CATEGORY OPTIONS
  // =====================================================
  const categoryOptions = CATEGORY_OPTIONS.map((category) => ({
    code: category,
    label: category,
  }));

  // =====================================================
  // SEAT OPTIONS
  // =====================================================
  const seatDropdownOptions = (seatOptions || []).map((seat) => ({
    code: seat,
    label: `${seat} Seater`,
  }));

  // =====================================================
  // VARIANT OPTIONS
  // =====================================================
  const variantOptions = VARIANT_OPTIONS.map((variant) => ({
    code: variant.code,
    label: variant.code,
  }));

  // =====================================================
  // BUILD API PARAMS
  // =====================================================
  const buildParams = (pageNum: number) => ({
    search: search.trim(),
    page: pageNum,
    limit: 20,

    category:
      selectedCategories.length > 0 ? selectedCategories.join(",") : undefined,

    seat: selectedSeats.length > 0 ? selectedSeats.join(",") : undefined,

    variant:
      selectedVariants.length > 0 ? selectedVariants.join(",") : undefined,
  });

  // =====================================================
  // FETCH VEHICLES
  // =====================================================
  useEffect(() => {
    dispatch(vehicleslice(buildParams(currentPage)));
  }, [
    dispatch,
    currentPage,
    selectedCategories,
    selectedSeats,
    selectedVariants,
  ]);

  // =====================================================
  // BODY SCROLL LOCK
  // =====================================================
  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showForm]);

  // =====================================================
  // SEARCH SUBMIT
  // =====================================================
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setCurrentPage(1);

    dispatch(
      vehicleslice({
        ...buildParams(1),
      }),
    );
  };

  // =====================================================
  // ADD VEHICLE SUCCESS
  // =====================================================
  const handleVehicleSuccess = () => {
    setShowForm(false);

    setCurrentPage(1);

    dispatch(
      vehicleslice({
        search: search.trim(),
        page: 1,
        limit: 20,

        category:
          selectedCategories.length > 0
            ? selectedCategories.join(",")
            : undefined,

        seat: selectedSeats.length > 0 ? selectedSeats.join(",") : undefined,

        variant:
          selectedVariants.length > 0 ? selectedVariants.join(",") : undefined,
      }),
    );
  };

  // =====================================================
  // PAGE CHANGE (for Pagination component)
  // =====================================================
  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
  };

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="w-full">
      <div className="mb-4 shrink-0">
        <LeadPageHeader
          title="Vehicles Master"
          description={`${total ?? 0} vehicles registered`}
        >
          <div className="shrink-0">
            <VehicleFilters
              categoryOptions={categoryOptions}
              seatDropdownOptions={seatDropdownOptions}
              variantOptions={variantOptions}
              selectedCategories={selectedCategories}
              selectedSeats={selectedSeats}
              selectedVariants={selectedVariants}
              seatOptionsLoading={seatOptionsLoading}
              setSelectedCategories={setSelectedCategories}
              setSelectedSeats={setSelectedSeats}
              setSelectedVariants={setSelectedVariants}
              setCurrentPage={setCurrentPage}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-300 active:scale-[0.98]"
          >
            <Plus size={16} />
            Add Vehicle
          </button>
        </LeadPageHeader>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
          {error}
        </div>
      )}

      <Table minWidth="min-w-[1400px]" maxHeight="max-h-[920px]">
        <TableHeader>
          <TableRow alternate={false}>
            <TableCell header sticky>
              #
            </TableCell>
            <TableCell header>Code</TableCell>
            <TableCell header>Seat</TableCell>
            <TableCell header>Config</TableCell>
            <TableCell header>Category</TableCell>
            <TableCell header>Make</TableCell>
            <TableCell header>Model</TableCell>
            <TableCell header>Variant</TableCell>
            <TableCell header>Description</TableCell>
            <TableCell header>Highlight</TableCell>
          </TableRow>
        </TableHeader>
        <tbody>
          {/* LOADING */}
          {loading && (
            <tr>
              <td colSpan={10} className="px-5 py-16 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500" />

                  <span className="text-sm font-medium">
                    Loading vehicles...
                  </span>
                </div>
              </td>
            </tr>
          )}

          {/* EMPTY */}
          {!loading && vehicleCodes.length === 0 && (
            <tr>
              <td colSpan={10} className="px-5 py-16 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-medium">No vehicles found</span>
                </div>
              </td>
            </tr>
          )}

          {/* DATA */}
          {!loading &&
            vehicleCodes.map((vehicle, index) => (
              <TableRow key={vehicle.id ?? index} index={index}>
                {/* S.NO */}
                <TableCell sticky rowIndex={index}>
                  {(currentPage - 1) * limit + index + 1}
                </TableCell>

                {/* CODE */}
                <TableCell>
                  <VehicleCodeHover
                    code={vehicle.code}
                    seat={vehicle.seat}
                    category={vehicle.category}
                    config={vehicle.config}
                  />
                </TableCell>

                {/* SEAT */}
                <TableCell>{vehicle.seat || "-"}</TableCell>

                {/* CONFIG */}
                <TableCell>{vehicle.config || "-"}</TableCell>

                {/* CATEGORY */}
                <TableCell>{vehicle.category || "-"}</TableCell>

                {/* MAKE */}
                <TableCell>{vehicle.make || "-"}</TableCell>

                {/* MODEL */}
                <TableCell>{vehicle.model || "-"}</TableCell>

                {/* VARIANT */}
                <TableCell>{vehicle.variant || "-"}</TableCell>

                {/* DESCRIPTION */}
                <TableCell
                  className="max-w-[350px]"
                  title={vehicle.description || ""}
                >
                  <div className="whitespace-normal leading-5">
                    {vehicle.description || "-"}
                  </div>
                </TableCell>

                {/* HIGHLIGHT / AMENITIES */}
                <TableCell
                  className="max-w-[350px]"
                  title={vehicle.amenities || ""}
                >
                  <div className="whitespace-normal leading-5">
                    {vehicle.amenities || "-"}
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </tbody>
      </Table>

      {/* =====================================================
          PAGINATION
      ===================================================== */}
      {total > 0 && (
        <div className="mt-2 shrink-0 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            rowsPerPage={limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* =====================================================
          ADD VEHICLE MODAL
      ===================================================== */}
      {showForm && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowForm(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-red-800 text-white transition hover:bg-red-200 hover:text-red-700"
            >
              <X size={18} />
            </button>

            {/* FORM */}
            <div className="p-6">
              <VehicleForm onSuccess={handleVehicleSuccess} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleTable;
