"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { MapPin, Building2, Calendar } from "lucide-react";
import { RootState } from "@/app/redux/store";

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
  zoneOptions?: string[];
  cityOptions?: Array<{
    id: string;
    name: string;
  }>;

  showYearMenu?: boolean;
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
}: AllRegionZoneCityFilterProps) {
  const { currentUser } = useSelector((state: RootState) => state.user);

  // User data
  const userRegionNames = (currentUser as any)?.region_names ?? [];
  const userZoneNames = (currentUser as any)?.zone_names ?? [];
  const userCityNames = (currentUser as any)?.city_names ?? [];
  const userCityIds = (currentUser as any)?.city_ids ?? [];
  const finalRegionOptions = regionOptions ?? userRegionNames;
  const finalZoneOptions = zoneOptions ?? userZoneNames;
  const finalCityOptions =
    cityOptions ??
    (userCityNames.length > 0
      ? userCityNames.map((name: string, idx: number) => ({
          id: String(userCityIds?.[idx] ?? name),
          name,
        }))
      : []);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, index) => currentYear - 2 + index);
  }, []);

  const selectClass =
    "w-full px-3 py-1 pr-12 text-sm font-semibold text-gray-700  border border-orange-500 rounded-full focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-200 appearance-none cursor-pointer hover:border-orange-300 transition-all h-8";

  return (
    <div className="w-full flex justify-end ">
      <div className="flex items-center gap-2  py-1 overflow-x-auto ">
        {/* Region */}
        <div className="relative group w-auto">
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

        {/* Zone */}
        <div className="relative group w-auto">
          <select
            value={selectedZone}
            onChange={(e) => onZoneChange(e.target.value)}
            className={selectClass}
            disabled={finalZoneOptions.length === 0}
          >
            <option value="">Zone</option>
            {finalZoneOptions.map((zone: string) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>

          <MapPin
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* City */}
        <div className="relative group w-auto">
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className={selectClass}
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

        {showYearMenu && (
          <div className="relative group w-auto">
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
