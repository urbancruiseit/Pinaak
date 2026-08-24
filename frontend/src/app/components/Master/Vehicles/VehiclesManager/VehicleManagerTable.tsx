"use client";

import React, { useEffect, useRef, useState } from "react";
import VehicleManagerExtraFilters from "./VehicleManagerExtraFilters";
import VehicleFilters from "../VehicleFilters";
import {
  Loader2,
  Plus,
  ArrowLeft,
  ChevronDown,
  CalendarCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  CATEGORY_OPTIONS,
  VARIANT_OPTIONS,
} from "../../Vehicles/VehiclesMaster/vehicleMasterDropdown";
import type { AppDispatch, RootState } from "../../../../redux/store";
import VehicleCodeHover from "../VehicleCodeHover";

import {
  getVehicleManagers,
  getVehicleMasterCodes,
  getAllCities,
  updateVehicleStatus,
} from "../../../../features/vehicleManager/vehicleManagerSlice";
import { fetchSeatOptions } from "../../../../features/vehicle/vehicleSlice";
import Pagination from "../../../ui/pagination";
import VehicleForm from "./VehiclesManagerForm";
import VehicleManagerCalenderPopup, {
  type VehicleManagerRow,
} from "./VehicleManagerCalenderPopup";
import LeadPageHeader from "../../../../components/ui/PageHeader/TablePageHeader";
import Table from "../../../../components/ui/Table/Table";
import TableHeader from "../../../../components/ui/Table/TableHeader";
import TableRow from "../../../../components/ui/Table/TableRow";
import TableCell from "../../../../components/ui/Table/TableCell";

type VehicleStatus = "Active" | "Suspended" | "Blocked";

const STATUS_OPTIONS: VehicleStatus[] = ["Active", "Suspended", "Blocked"];

const STATUS_STYLES: Record<VehicleStatus, string> = {
  Active: "bg-green-100 text-green-700 border-green-300",
  Suspended: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Blocked: "bg-red-100 text-red-700 border-red-300",
};

const YEAR_OPTIONS = Array.from(
  { length: 2026 - 2018 + 1 },
  (_, i) => 2018 + i,
);

const PAGE_SIZE = 50;

const TABLE_COLUMN_COUNT = 14;

const VehiclesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    vehicles,
    loading,
    error,
    total,
    totalPages,
    vehicleMasterCodes,
    cities,
    statusUpdatingId,
  } = useSelector((state: RootState) => state.vehicleManager);

  const { seatOptions, seatOptionsLoading } = useSelector(
    (state: RootState) => state.vehicle,
  );

  const [search, setSearch] = useState("");
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [statusMenuOpenId, setStatusMenuOpenId] = useState<
    number | string | null
  >(null);
  const [availabilityVehicle, setAvailabilityVehicle] =
    useState<VehicleManagerRow | null>(null);

  const statusMenuRef = useRef<HTMLDivElement>(null);

  const categoryOptions = CATEGORY_OPTIONS.map((category) => ({
    code: category,
    label: category,
  }));

  const seatDropdownOptions = (seatOptions || []).map((seat) => ({
    code: seat,
    label: `${seat} Seater`,
  }));

  const variantOptions = VARIANT_OPTIONS.map((variant) => ({
    code: variant.code,
    label: variant.code,
  }));

  useEffect(() => {
    dispatch(getVehicleMasterCodes());
    dispatch(getAllCities());
    dispatch(fetchSeatOptions());
  }, [dispatch]);

  const uniqueCodeOptions = Array.from(
    new Set(
      (vehicleMasterCodes || [])
        .map((c) => c.code)
        .filter((c): c is string => !!c && c.trim().length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const fetchVehicles = () => {
    dispatch(
      getVehicleManagers({
        search: search.trim() || undefined,
        year: selectedYears.length > 0 ? selectedYears.join(",") : undefined,
        code: selectedCodes.length > 0 ? selectedCodes.join(",") : undefined,
        city: selectedCities.length > 0 ? selectedCities.join(",") : undefined,
        category:
          selectedCategories.length > 0
            ? selectedCategories.join(",")
            : undefined,
        seat: selectedSeats.length > 0 ? selectedSeats.join(",") : undefined,
        variant:
          selectedVariants.length > 0 ? selectedVariants.join(",") : undefined,
        page: currentPage,
        limit: PAGE_SIZE,
      }),
    );
  };

  useEffect(() => {
    if (showForm) {
      return;
    }

    const timer = setTimeout(() => {
      fetchVehicles();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [
    search,
    selectedYears,
    selectedCodes,
    selectedCities,
    selectedCategories,
    selectedSeats,
    selectedVariants,
    currentPage,
    showForm,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (statusMenuRef.current && !statusMenuRef.current.contains(target)) {
        setStatusMenuOpenId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleYear = (year: number) => {
    const value = String(year);

    setSelectedYears((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value],
    );

    setCurrentPage(1);
  };

  const toggleCode = (code: string) => {
    setSelectedCodes((previous) =>
      previous.includes(code)
        ? previous.filter((item) => item !== code)
        : [...previous, code],
    );

    setCurrentPage(1);
  };

  const toggleCity = (cityId: number) => {
    const value = String(cityId);

    setSelectedCities((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value],
    );

    setCurrentPage(1);
  };

  const handleStatusChange = async (
    id: number | string,
    status: VehicleStatus,
  ) => {
    setStatusMenuOpenId(null);

    try {
      await dispatch(updateVehicleStatus({ vehicleId: id, status })).unwrap();
    } catch (error) {
      console.error("Failed to update vehicle status:", error);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatAging = (aging?: string | number) => {
    if (aging === undefined || aging === null || aging === "") {
      return "-";
    }

    const value = Number(aging);

    if (isNaN(value)) {
      return aging.toString();
    }

    const years = Math.floor(value);

    const months = Math.round((value - years) * 10);

    if (months === 10) {
      return (
        <>
          {years} <span className="text-[9px] font-bold">Y</span> 0{" "}
          <span className="text-[9px] font-bold">M</span>
        </>
      );
    }

    return (
      <>
        {years} <span className="text-[9px] font-bold">Y</span> {months}{" "}
        <span className="text-[9px] font-bold">M</span>
      </>
    );
  };

  const handleAddVehicleManager = () => {
    setShowForm(true);
  };

  const handleBackToTable = () => {
    setShowForm(false);
    setCurrentPage(1);
    setSearch("");
    setSelectedYears([]);
    setSelectedCodes([]);
    setSelectedCities([]);
    setSelectedCategories([]);
    setSelectedSeats([]);
    setSelectedVariants([]);
    dispatch(getVehicleManagers({ page: 1, limit: PAGE_SIZE }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }

    setCurrentPage(newPage);
  };

  if (showForm) {
    return (
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToTable}
            className="flex items-center gap-2 rounded-lg bg-gray-600 px-5 py-3 font-bold text-white shadow-md transition hover:bg-gray-700"
          >
            <ArrowLeft size={20} />
            Back to Vehicles Manager
          </button>
        </div>

        <VehicleForm />
      </div>
    );
  }

  return (
    <div className="w-full">
    
    

      <div className="mb-4 shrink-0">
        <LeadPageHeader
          title="Vehicles Manager"
          description={`${total ?? 0} vehicles under management`}
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

          <div className="shrink-0">
            <VehicleManagerExtraFilters
              uniqueCodeOptions={uniqueCodeOptions}
              cities={cities || []}
              selectedCodes={selectedCodes}
              selectedCities={selectedCities}
              selectedYears={selectedYears}
              setSelectedCodes={setSelectedCodes}
              setSelectedCities={setSelectedCities}
              setSelectedYears={setSelectedYears}
              setCurrentPage={setCurrentPage}
            />
          </div>

          <button
            type="button"
            onClick={handleAddVehicleManager}
            className="flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-300 active:scale-[0.98]"
          >
            <Plus size={16} />
            Add Vehicle Manager
          </button>
        </LeadPageHeader>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
          {error}
        </div>
      )}

      <Table minWidth="min-w-[1500px]" maxHeight="max-h-[920px]">
        <TableHeader>
          <TableRow alternate={false}>
            <TableCell header sticky>
              S.no.{" "}
            </TableCell>
            <TableCell header>Code</TableCell>
            <TableCell header>Seater</TableCell>
            <TableCell header>Category</TableCell>
            <TableCell header>Variant</TableCell>
            <TableCell header>City</TableCell>
            <TableCell header>Vendor Name</TableCell>
            <TableCell header>Garage</TableCell>
            <TableCell header>Vehicle Number</TableCell>
            <TableCell header>Registration Date</TableCell>
            <TableCell header>Aging</TableCell>
            <TableCell header>Amenities</TableCell>
            <TableCell header>Status</TableCell>
            <TableCell header>Check Availability</TableCell>
          </TableRow>
        </TableHeader>

        <tbody>
          {loading && (
            <tr>
              <td
                colSpan={TABLE_COLUMN_COUNT}
                className="px-3 py-14 text-center"
              >
                <div className="flex items-center justify-center gap-3">
                  <Loader2 size={24} className="animate-spin" />
                  <span className="font-semibold">Loading vehicles...</span>
                </div>
              </td>
            </tr>
          )}

          {!loading && vehicles.length === 0 && (
            <tr>
              <td
                colSpan={TABLE_COLUMN_COUNT}
                className="px-3 py-14 text-center text-gray-500"
              >
                No vehicle records found.
              </td>
            </tr>
          )}

          {!loading &&
            (vehicles as VehicleManagerRow[]).map((vehicle, index) => {
              const currentStatus: VehicleStatus =
                (vehicle.status as VehicleStatus) || "Active";
              const isMenuOpen = statusMenuOpenId === vehicle.id;
              const isUpdating = statusUpdatingId === vehicle.id;

              return (
                <TableRow key={vehicle.id} index={index}>
                  <TableCell sticky rowIndex={index}>
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
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

                  <TableCell>{vehicle.seat || "-"}</TableCell>
                  <TableCell>{vehicle.category || "-"}</TableCell>
                  <TableCell>{vehicle.variant || "-"}</TableCell>
                  <TableCell>
                    {vehicle.city_name || vehicle.city || "-"}
                  </TableCell>
                  <TableCell>{vehicle.vendor || "-"}</TableCell>
                  <TableCell>{vehicle.garage || "-"}</TableCell>
                  <TableCell className="text-gray-800">
                    {vehicle.veh_no || "-"}
                  </TableCell>
                  <TableCell>{formatDate(vehicle.reg_date)}</TableCell>
                  <TableCell className="font-semibold">
                    {formatAging(vehicle.aging)}
                  </TableCell>

                  <TableCell className="max-w-[350px]">
                    <div className="whitespace-normal leading-5">
                      {vehicle.amenities || "-"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center">
                      <div
                        className="relative inline-block"
                        ref={isMenuOpen ? statusMenuRef : null}
                      >
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            setStatusMenuOpenId((previous) =>
                              previous === vehicle.id ? null : vehicle.id,
                            )
                          }
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-200 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_STYLES[currentStatus]}`}
                        >
                          {isUpdating && (
                            <Loader2 size={12} className="animate-spin" />
                          )}
                          {currentStatus}
                          {!isUpdating && (
                            <ChevronDown
                              size={12}
                              className={`transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                            />
                          )}
                        </button>

                        {/* STATUS MENU */}

                        {isMenuOpen && (
                          <div className="absolute left-0 z-50 mt-2 w-36 rounded-lg border border-gray-200 bg-white p-1.5 shadow-xl">
                            {STATUS_OPTIONS.map((option) => (
                              <button
                                key={option}
                                type="button"
                                disabled={option === currentStatus}
                                onClick={() =>
                                  handleStatusChange(vehicle.id, option)
                                }
                                className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs font-semibold transition hover:bg-gray-100 disabled:cursor-default disabled:bg-gray-50 ${option === currentStatus ? "text-orange-600" : "text-gray-700"}`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setAvailabilityVehicle(vehicle)}
                      className="flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition-all duration-200 hover:bg-orange-100 hover:shadow-sm"
                    >
                      <CalendarCheck size={13} />
                      Check Availability
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
        </tbody>
      </Table>

      {!loading && total > 0 && (
        <div className="mt-2 shrink-0 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            rowsPerPage={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {availabilityVehicle && (
        <VehicleManagerCalenderPopup
          vehicle={availabilityVehicle}
          onClose={() => setAvailabilityVehicle(null)}
        />
      )}
    </div>
  );
};

export default VehiclesManager;
