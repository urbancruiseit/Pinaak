"use client";

import React, { useEffect, useRef } from "react";
import { Calendar, ChevronDown, MapPin, Tag, Check, X } from "lucide-react";

interface CityOption {
  id: number;
  name: string;
}

interface VehicleManagerExtraFiltersProps {
  uniqueCodeOptions: string[];
  cities: CityOption[];

  selectedCodes: string[];
  selectedCities: string[];
  selectedYears: string[];

  setSelectedCodes: (values: string[]) => void;
  setSelectedCities: (values: string[]) => void;
  setSelectedYears: (values: string[]) => void;

  setCurrentPage?: (page: number) => void;
}

const YEAR_OPTIONS = Array.from(
  { length: 2026 - 2018 + 1 },
  (_, i) => 2018 + i,
);

const VehicleManagerExtraFilters: React.FC<VehicleManagerExtraFiltersProps> = ({
  uniqueCodeOptions,
  cities,

  selectedCodes,
  selectedCities,
  selectedYears,

  setSelectedCodes,
  setSelectedCities,
  setSelectedYears,

  setCurrentPage,
}) => {
  const [codeMenuOpen, setCodeMenuOpen] = React.useState(false);

  const [cityMenuOpen, setCityMenuOpen] = React.useState(false);

  const [yearMenuOpen, setYearMenuOpen] = React.useState(false);

  const codeMenuRef = useRef<HTMLDivElement>(null);

  const cityMenuRef = useRef<HTMLDivElement>(null);

  const yearMenuRef = useRef<HTMLDivElement>(null);

  // =====================================================
  // OUTSIDE CLICK
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (codeMenuRef.current && !codeMenuRef.current.contains(target)) {
        setCodeMenuOpen(false);
      }

      if (cityMenuRef.current && !cityMenuRef.current.contains(target)) {
        setCityMenuOpen(false);
      }

      if (yearMenuRef.current && !yearMenuRef.current.contains(target)) {
        setYearMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =====================================================
  // CODE
  // =====================================================

  const toggleCode = (code: string) => {
    setSelectedCodes(
      selectedCodes.includes(code)
        ? selectedCodes.filter((item) => item !== code)
        : [...selectedCodes, code],
    );

    setCurrentPage?.(1);
  };

  const clearCodes = () => {
    setSelectedCodes([]);
    setCurrentPage?.(1);
  };

  // =====================================================
  // CITY
  // =====================================================

  const toggleCity = (cityId: number) => {
    const value = String(cityId);

    setSelectedCities(
      selectedCities.includes(value)
        ? selectedCities.filter((item) => item !== value)
        : [...selectedCities, value],
    );

    setCurrentPage?.(1);
  };

  const clearCities = () => {
    setSelectedCities([]);
    setCurrentPage?.(1);
  };

  // =====================================================
  // YEAR
  // =====================================================

  const toggleYear = (year: number) => {
    const value = String(year);

    setSelectedYears(
      selectedYears.includes(value)
        ? selectedYears.filter((item) => item !== value)
        : [...selectedYears, value],
    );

    setCurrentPage?.(1);
  };

  const clearYears = () => {
    setSelectedYears([]);
    setCurrentPage?.(1);
  };

  // =====================================================
  // FILTER BUTTON
  // =====================================================

  const filterButtonClass = (active: boolean, open: boolean) => `
    group
    flex
    h-[42px]
    items-center
    gap-2
    rounded-xl
    border
    px-3
    text-sm
    font-semibold
    transition-all
    duration-200
    ${
      active || open
        ? "border-blue-300 bg-blue-50 text-blue-700 shadow-sm"
        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
    }
  `;

  // =====================================================
  // DROPDOWN
  // =====================================================

  const dropdownClass = `
    absolute
    left-0
    top-full
    z-[100]
    mt-2
    overflow-hidden
    rounded-2xl
    border
    border-slate-200
    bg-white
    shadow-[0_12px_35px_rgba(15,23,42,0.12)]
    animate-in
    fade-in
    slide-in-from-top-1
    duration-150
  `;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* =================================================
          CODE FILTER
      ================================================= */}

      <div ref={codeMenuRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setCodeMenuOpen((prev) => !prev);

            setCityMenuOpen(false);
            setYearMenuOpen(false);
          }}
          className={filterButtonClass(selectedCodes.length > 0, codeMenuOpen)}
        >
          <span
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              bg-orange-50
              text-orange-500
              transition
              group-hover:bg-orange-100
            "
          >
            <Tag size={15} />
          </span>

          <span>{selectedCodes.length === 0 ? "Code" : "Code"}</span>

          {selectedCodes.length > 0 && (
            <span
              className="
                flex
                min-w-[21px]
                items-center
                justify-center
                rounded-full
                bg-orange-500
                px-1.5
                py-0.5
                text-[10px]
                font-bold
                text-white
              "
            >
              {selectedCodes.length}
            </span>
          )}

          <ChevronDown
            size={15}
            className={`
              ml-0.5
              text-slate-400
              transition-transform
              ${codeMenuOpen ? "rotate-180 text-blue-500" : ""}
            `}
          />
        </button>

        {codeMenuOpen && (
          <div className={`${dropdownClass} w-64`}>
            {/* HEADER */}

            <div className="border-b border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Vehicle Code
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Select one or more codes
                  </p>
                </div>

                {selectedCodes.length > 0 && (
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
                    {selectedCodes.length} selected
                  </span>
                )}
              </div>
            </div>

            {/* OPTIONS */}

            <div className="max-h-64 overflow-y-auto p-2">
              {uniqueCodeOptions.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <Tag size={22} className="mx-auto mb-2 text-slate-300" />

                  <p className="text-xs font-medium text-slate-400">
                    No codes found
                  </p>
                </div>
              ) : (
                uniqueCodeOptions.map((code) => {
                  const checked = selectedCodes.includes(code);

                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => toggleCode(code)}
                      className={`
                          flex
                          w-full
                          items-center
                          justify-between
                          rounded-xl
                          px-3
                          py-2.5
                          text-left
                          transition-all
                          ${checked ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}
                        `}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`
                              flex
                              h-5
                              w-5
                              items-center
                              justify-center
                              rounded-md
                              border
                              transition-all
                              ${checked ? "border-blue-500 bg-blue-500" : "border-slate-300 bg-white"}
                            `}
                        >
                          {checked && (
                            <Check
                              size={12}
                              strokeWidth={3}
                              className="text-white"
                            />
                          )}
                        </span>

                        <span className="text-xs font-semibold">{code}</span>
                      </span>

                      {checked && (
                        <span className="text-[10px] font-bold text-blue-500">
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* FOOTER */}

            {selectedCodes.length > 0 && (
              <div className="border-t border-slate-100 p-2">
                <button
                  type="button"
                  onClick={clearCodes}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-1.5
                    rounded-lg
                    py-2
                    text-xs
                    font-bold
                    text-red-500
                    transition
                    hover:bg-red-50
                  "
                >
                  <X size={13} />
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =================================================
          CITY FILTER
      ================================================= */}

      <div ref={cityMenuRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setCityMenuOpen((prev) => !prev);

            setCodeMenuOpen(false);
            setYearMenuOpen(false);
          }}
          className={filterButtonClass(selectedCities.length > 0, cityMenuOpen)}
        >
          <span
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              bg-emerald-50
              text-emerald-500
              transition
              group-hover:bg-emerald-100
            "
          >
            <MapPin size={15} />
          </span>

          <span>City</span>

          {selectedCities.length > 0 && (
            <span
              className="
                flex
                min-w-[21px]
                items-center
                justify-center
                rounded-full
                bg-emerald-500
                px-1.5
                py-0.5
                text-[10px]
                font-bold
                text-white
              "
            >
              {selectedCities.length}
            </span>
          )}

          <ChevronDown
            size={15}
            className={`
              ml-0.5
              text-slate-400
              transition-transform
              ${cityMenuOpen ? "rotate-180 text-blue-500" : ""}
            `}
          />
        </button>

        {cityMenuOpen && (
          <div className={`${dropdownClass} w-64`}>
            {/* HEADER */}

            <div className="border-b border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">City</p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Choose vehicle location
                  </p>
                </div>

                {selectedCities.length > 0 && (
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                    {selectedCities.length} selected
                  </span>
                )}
              </div>
            </div>

            {/* OPTIONS */}

            <div className="max-h-64 overflow-y-auto p-2">
              {!cities || cities.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <MapPin size={22} className="mx-auto mb-2 text-slate-300" />

                  <p className="text-xs font-medium text-slate-400">
                    No cities found
                  </p>
                </div>
              ) : (
                cities.map((city) => {
                  const value = String(city.id);

                  const checked = selectedCities.includes(value);

                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => toggleCity(city.id)}
                      className={`
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-xl
                        px-3
                        py-2.5
                        text-left
                        transition-all
                        ${checked ? "bg-emerald-50 text-emerald-700" : "text-slate-700 hover:bg-slate-50"}
                      `}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`
                            flex
                            h-5
                            w-5
                            items-center
                            justify-center
                            rounded-md
                            border
                            transition-all
                            ${checked ? "border-emerald-500 bg-emerald-500" : "border-slate-300 bg-white"}
                          `}
                        >
                          {checked && (
                            <Check
                              size={12}
                              strokeWidth={3}
                              className="text-white"
                            />
                          )}
                        </span>

                        <span className="text-xs font-semibold">
                          {city.name}
                        </span>
                      </span>

                      {checked && (
                        <span className="text-[10px] font-bold text-emerald-500">
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* FOOTER */}

            {selectedCities.length > 0 && (
              <div className="border-t border-slate-100 p-2">
                <button
                  type="button"
                  onClick={clearCities}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-1.5
                    rounded-lg
                    py-2
                    text-xs
                    font-bold
                    text-red-500
                    transition
                    hover:bg-red-50
                  "
                >
                  <X size={13} />
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =================================================
          YEAR FILTER
      ================================================= */}

      <div ref={yearMenuRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setYearMenuOpen((prev) => !prev);

            setCodeMenuOpen(false);
            setCityMenuOpen(false);
          }}
          className={filterButtonClass(selectedYears.length > 0, yearMenuOpen)}
        >
          <span
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              bg-violet-50
              text-violet-500
              transition
              group-hover:bg-violet-100
            "
          >
            <Calendar size={15} />
          </span>

          <span>Year</span>

          {selectedYears.length > 0 && (
            <span
              className="
                flex
                min-w-[21px]
                items-center
                justify-center
                rounded-full
                bg-violet-500
                px-1.5
                py-0.5
                text-[10px]
                font-bold
                text-white
              "
            >
              {selectedYears.length}
            </span>
          )}

          <ChevronDown
            size={15}
            className={`
              ml-0.5
              text-slate-400
              transition-transform
              ${yearMenuOpen ? "rotate-180 text-blue-500" : ""}
            `}
          />
        </button>

        {yearMenuOpen && (
          <div className={`${dropdownClass} w-56`}>
            {/* HEADER */}

            <div className="border-b border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Registration Year
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Select vehicle year
                  </p>
                </div>

                {selectedYears.length > 0 && (
                  <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-600">
                    {selectedYears.length} selected
                  </span>
                )}
              </div>
            </div>

            {/* OPTIONS */}

            <div className="max-h-64 overflow-y-auto p-2">
              {YEAR_OPTIONS.slice()
                .reverse()
                .map((year) => {
                  const value = String(year);

                  const checked = selectedYears.includes(value);

                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => toggleYear(year)}
                      className={`
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-xl
                        px-3
                        py-2.5
                        text-left
                        transition-all
                        ${checked ? "bg-violet-50 text-violet-700" : "text-slate-700 hover:bg-slate-50"}
                      `}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`
                            flex  h-5 w-5 items-center justify-center rounded-md  border   transition-all
                            ${checked ? "border-violet-500 bg-violet-500" : "border-slate-300 bg-white"}
                          `}
                        >
                          {checked && (
                            <Check
                              size={12}
                              strokeWidth={3}
                              className="text-white"
                            />
                          )}
                        </span>

                        <span className="text-xs font-semibold">{year}</span>
                      </span>

                      {checked && (
                        <span className="text-[10px] font-bold text-violet-500">
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>

            {/* FOOTER */}

            {selectedYears.length > 0 && (
              <div className="border-t border-slate-100 p-2">
                <button
                  type="button"
                  onClick={clearYears}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg  py-2 text-xs font-bold  text-red-500 transition hover:bg-red-50
                  "
                >
                  <X size={13} />
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleManagerExtraFilters;
