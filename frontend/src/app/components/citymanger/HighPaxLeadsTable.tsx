"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import { fetchHighPaxLeads } from "@/app/features/access/accessSlice";

const STATUS_LABEL: Record<string, string> = {
  NEW: "New",
  KYC: "KYC",
  RFQ: "RFQ",
  HOT: "Hot",
  "VEH-N": "Veh-N",
  LOST: "Lost",
  BOOK: "Book",
};

const fmtDateTime = (value: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const COLUMN_COUNT = 7;

export default function HighPaxLeadsTable({
  cityIds,
  selectedAdvisorId,
}: {
  cityIds: number[];
  selectedAdvisorId: number | null;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { leads, loading, error, page, totalPages, total, paxThreshold } =
    useSelector((state: RootState) => state.travelAdvisor.highPaxLeads);

  const [tablePage, setTablePage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchHighPaxLeads({
        page: tablePage,
        limit: 10,
        cityIds: cityIds.length ? cityIds : undefined,
        advisorId: selectedAdvisorId ?? undefined,
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-blue-950">Passenger Leads</h2>
        <span className="text-xs font-semibold text-slate-500">
          {loading ? "loading…" : `${total} leads · ${paxThreshold}+ pax`}
        </span>
      </div>

      {error && (
        <p className="mb-3 text-sm font-medium text-red-600">{error}</p>
      )}

      <div className="rounded-xl border border-slate-100 overflow-auto max-h-[300px]">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="text-[11px] font-bold uppercase tracking-wider">
              <th className="bg-emerald-50 px-4 py-3 text-left text-emerald-700">
                Customer
              </th>
              <th className="bg-indigo-50 px-4 py-3 text-left text-indigo-700">
                Pax
              </th>
              <th className="bg-teal-50 px-4 py-3 text-left text-teal-700">
                City
              </th>
              <th className="bg-sky-50 px-4 py-3 text-left text-sky-700">
                Assigned To
              </th>
              <th className="bg-cyan-50 px-4 py-3 text-left text-cyan-700">
                Pickup
              </th>
              <th className="bg-fuchsia-50 px-4 py-3 text-left text-fuchsia-700">
                Drop
              </th>
              <th className="bg-rose-50 px-4 py-3 text-left text-rose-700">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={COLUMN_COUNT}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  Loading…
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMN_COUNT}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  No high pax leads found
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-slate-700">
                    {lead.customerName?.trim() || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {lead.pax ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {lead.cityName || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {lead.advisorFullName || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {fmtDateTime(lead.pickupDateTime)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {fmtDateTime(lead.dropDateTime)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {STATUS_LABEL[lead.status] || lead.status || "-"}
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
