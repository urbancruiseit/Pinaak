"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import { fetchLongDurationLeads } from "@/app/features/access/accessSlice";
import { Clock } from "lucide-react";

interface LongDurationLeadsTableProps {
  cityIds: number[];
  selectedAdvisorId: number | null;
}

export default function LongDurationLeadsTable({
  cityIds,
  selectedAdvisorId,
}: LongDurationLeadsTableProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { leads, loading, page, totalPages, total } = useSelector(
    (state: RootState) => state.travelAdvisor.longDurationLeads,
  );

  const [tablePage, setTablePage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchLongDurationLeads({
        page: tablePage,
        limit: 10,
        cityIds,
        advisorId: selectedAdvisorId,
        daysThreshold: 5,
      }),
    );
  }, [dispatch, tablePage, cityIds, selectedAdvisorId]);

  // =========================================
  // RESET PAGINATION WHEN FILTER CHANGES
  // =========================================
  useEffect(() => {
    setTablePage(1);
  }, [selectedAdvisorId, cityIds]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 text-blue-950 border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2 text-blue-950">
          <Clock size={18} className="text-red-600" />
          Long Duration Leads
          {loading && (
            <span className="text-xs font-medium text-blue-600 ml-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              syncing…
            </span>
          )}
        </h2>
      </div>

      {/* Table: single table, sticky thead (colored per-column, like HighPaxLeadsTable), scrollable body */}
      <div className="rounded-xl border border-slate-100 overflow-auto max-h-[300px]">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="text-[11px] font-bold uppercase tracking-wider">
              <th className="bg-emerald-50 px-4 py-3 text-left text-emerald-700">
                Customer
              </th>

              <th className="bg-teal-50 px-4 py-3 text-left text-teal-700">
                City
              </th>

              <th className="bg-sky-50 px-4 py-3 text-left text-sky-700">
                Assign To
              </th>

              <th className="bg-rose-50 px-4 py-3 text-left text-rose-700">
                Status
              </th>

              <th className="bg-indigo-50 px-4 py-3 text-left text-indigo-700">
                Days
              </th>

              <th className="bg-cyan-50 px-4 py-3 text-left text-cyan-700">
                Pickup
              </th>

              <th className="bg-fuchsia-50 px-4 py-3 text-left text-fuchsia-700">
                Drop
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  Loading…
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  No long duration leads found
                </td>
              </tr>
            ) : (
              leads.map((lead, idx) => (
                <tr key={lead.id ?? idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{lead.customerName ?? "-"}</td>

                  <td className="px-4 py-3">{lead.cityName ?? "-"}</td>

                  <td className="px-4 py-3">{lead.advisorFullName ?? "-"}</td>

                  <td className="px-4 py-3">{lead.status ?? "-"}</td>

                  <td className="px-4 py-3 font-semibold text-red-600">
                    {lead.days ?? 0}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {lead.pickupDateTime
                      ? new Date(lead.pickupDateTime).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                      : "-"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {lead.dropDateTime
                      ? new Date(lead.dropDateTime).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
        <span>Total: {total}</span>

        <div className="flex items-center gap-2">
          <button
            disabled={loading || tablePage <= 1}
            onClick={() => setTablePage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded-lg border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prev
          </button>

          <span>
            Page {totalPages > 0 ? page : 0} / {totalPages}
          </span>

          <button
            disabled={loading || tablePage >= totalPages || totalPages === 0}
            onClick={() => setTablePage((p) => p + 1)}
            className="px-3 py-1 rounded-lg border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
