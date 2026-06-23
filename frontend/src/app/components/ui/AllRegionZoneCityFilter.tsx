"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, Building2, Calendar } from "lucide-react";
import { AppDispatch, RootState } from "@/app/redux/store";
import { fetchCitiesByZone } from "@/app/features/access/accessSlice";

export interface AllRegionZoneCityFilterProps {
  selectedRegion: string;
  selectedZone: string;
  selectedCity: string;
  selectedYear?: string;

  onRegionChange: (region: string) => void;
  onZoneChange: (zone: string) => void;
  onCityChange: (cityId: string) => void;
  onYearChange?: (year: string) => void;

  regionOptions?: string[];
  zoneOptions?: Array<{
    id: string;
    name: string;
  }>;
  cityOptions?: Array<{
    id: string;
    name: string;
  }>;

  showYearMenu?: boolean;

  layout?: "grid" | "row";
}

export function AllRegionZoneCityFilter({
  selectedRegion,
  selectedZone,
  selectedCity,
  selectedYear = "",

  onRegionChange,
  onZoneChange,
  onCityChange,
  onYearChange = () => {},

  regionOptions,
  zoneOptions,
  cityOptions,

  showYearMenu = true,
  layout = "grid",
}: AllRegionZoneCityFilterProps) {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const { citiesByZone } = useSelector(
    (state: RootState) => state.travelAdvisor, // ya jo bhi slice naam ho
  );
  console.log("citiesByZone ", citiesByZone);
  // ✅ Zone select hone par cities fetch karo
  useEffect(() => {
    if (selectedZone) {
      dispatch(fetchCitiesByZone(Number(selectedZone)));
    }
  }, [selectedZone, dispatch]);

  const roleName = (currentUser as any)?.role_name?.toLowerCase() || "";

  const isCityManager = roleName === "city manager";
  const isTeamLeader = roleName === "team leader-sales";
  const isTravelAdvisor = roleName === "travel advisor";

  const userRegionNames = (currentUser as any)?.region_names ?? [];
  const userZoneNames = (currentUser as any)?.zone_names ?? [];
  const userZoneIds = (currentUser as any)?.zone_ids ?? [];
  const userCityNames = (currentUser as any)?.city_names ?? [];
  const userCityIds = (currentUser as any)?.city_ids ?? [];

  const finalRegionOptions = regionOptions ?? userRegionNames;

  // ✅ Zone ids + names ko zip karo — value me id jaaye, display me name
  const finalZoneOptions = useMemo(() => {
    if (zoneOptions) return zoneOptions;

    if (userZoneNames.length > 0) {
      return userZoneNames.map((name: string, idx: number) => ({
        id: String(userZoneIds?.[idx] ?? name),
        name,
      }));
    }

    return [];
  }, [zoneOptions, userZoneNames, userZoneIds]);

  // ✅ Priority order: explicit cityOptions > zone se aayi cities (API) > user ke default cities
  // ✅ Priority order: explicit cityOptions > zone se aayi cities (API) > user ke default cities
  const finalCityOptions = useMemo(() => {
    if (cityOptions) return cityOptions;

    if (
      selectedZone &&
      citiesByZone?.cities &&
      citiesByZone.cities.length > 0
    ) {
      return citiesByZone.cities.map((city: any) => ({
        id: String(city.id),
        name: city.city_name, // ✅ fix: city_name, not name
      }));
    }

    if (userCityNames.length > 0) {
      return userCityNames.map((name: string, idx: number) => ({
        id: String(userCityIds?.[idx] ?? name),
        name,
      }));
    }

    return [];
  }, [cityOptions, selectedZone, citiesByZone, userCityNames, userCityIds]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, index) => currentYear - 2 + index);
  }, []);

  const selectClass =
    "w-full px-3 py-1 pr-10 text-sm font-semibold text-black bg-white border border-orange-500 rounded-full focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-200 appearance-none cursor-pointer hover:border-orange-300 transition-all h-9";

  return (
    <div className="w-full flex justify-end">
      <div
        className={
          layout === "row"
            ? "flex items-center gap-2 flex-nowrap"
            : "grid grid-cols-2 gap-2 w-full max-w-md"
        }
      >
        {/* Region */}
        {!isCityManager && !isTeamLeader && !isTravelAdvisor && (
          <div className="relative w-full">
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className={selectClass}
              disabled={finalRegionOptions.length === 0}
            >
              <option value="">Region</option>
              {finalRegionOptions.map((region: string) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>

            <MapPin
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        )}

        {/* Zone */}
        {!isTeamLeader && !isTravelAdvisor && (
          <div className="relative w-full">
            <select
              value={selectedZone}
              onChange={(e) => {
                onZoneChange(e.target.value);
                onCityChange(""); // ✅ zone change hone par purani city reset
              }}
              className={selectClass}
              disabled={finalZoneOptions.length === 0}
            >
              <option value="">Zone</option>
              {finalZoneOptions.map((zone: { id: string; name: string }) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>

            <MapPin
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        )}

        {/* City */}
        {/* City */}
        {/* City */}
        <div className="relative w-full">
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className={`${selectClass} text-black bg-white`}
            disabled={finalCityOptions.length === 0}
          >
            <option value="">City</option>

            {finalCityOptions.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          <Building2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Year */}
        {showYearMenu && (
          <div className="relative w-full">
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className={selectClass}
            >
              <option value="">Year</option>

              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <Calendar
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
