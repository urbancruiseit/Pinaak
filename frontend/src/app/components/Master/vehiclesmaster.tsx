"use client";

import { useMemo, useState } from "react";
import { vehicles, type Vehiclea } from "@/data/vehicles";

const columns: Array<keyof Vehiclea> = ["id", "name", "model", "year", "brand"];

export default function VehiclesMaster() {
  const [query, setQuery] = useState("");

  const filteredVehicles = useMemo(() => {
    if (!query.trim()) {
      return vehicles;
    }
    const lowered = query.toLowerCase();
    return vehicles.filter((vehicle) =>
      [vehicle.name, vehicle.model, vehicle.year, vehicle.brand]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(lowered))
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Vehicle catalogue</h2>
            <p className="mt-1 text-sm text-slate-500">
              Listing reflects the seed dataset while the integration service is being wired.
            </p>
          </div>
          <input
            className="w-full max-w-xs rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="Search vehicles"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                {columns.map((column) => (
                  <th key={column} className="px-3 py-2">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={columns.length}>
                    No vehicles match your search right now.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    {columns.map((column) => (
                      <td key={column} className="px-3 py-2 text-slate-700">
                        {vehicle[column] || "—"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
