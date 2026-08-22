"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Loader2,
  RefreshCw,
  History,
  X,
  Users,
  CalendarDays,
  MessageSquare,
} from "lucide-react";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  getAllLeads,
  getFollowupsByLeadId,
} from "../../../features/leadsFollowups/lead_followupsSlice";
import Pagination from "../../ui/pagination";
import Table from "../../../components/ui/Table/Table";
import TableHeader from "../../../components/ui/Table/TableHeader";
import TableRow from "../../../components/ui/Table/TableRow";
import TableCell from "../../../components/ui/Table/TableCell";

interface Followup {
  followup_date: string | null;
  remark: string | null;
}

const LeadFollowupsTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { leads, loading, error } = useSelector(
    (state: RootState) => state.lead,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [followupsLoading, setFollowupsLoading] = useState(false);
  const [followupsError, setFollowupsError] = useState<string | null>(null);

  const rowsPerPage = 50;
  const safeLeads = Array.isArray(leads) ? leads : [];

  useEffect(() => {
    dispatch(getAllLeads());
  }, [dispatch]);

  const filteredLeads = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return safeLeads;
    }

    return safeLeads.filter((lead) => {
      return (
        String(lead.id ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.uuid ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.customer_id ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.fullName ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.customerPhone ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.customerEmail ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.advisor_id ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.advisorFullName ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.source ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.status ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.serviceType ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.city_id ?? "")
          .toLowerCase()
          .includes(search) ||
        String(lead.cityName ?? "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [safeLeads, searchTerm]);

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredLeads.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredLeads, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    dispatch(getAllLeads());
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatFollowupDate = (date: string | null | undefined) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const getStatusClass = (status: string) => {
    const value = status?.toLowerCase().trim();
    if (
      value === "active" ||
      value === "open" ||
      value === "completed" ||
      value === "converted" ||
      value === "rfq"
    ) {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (
      value === "pending" ||
      value === "followup" ||
      value === "follow-up" ||
      value === "new"
    ) {
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }

    if (
      value === "closed" ||
      value === "cancelled" ||
      value === "canceled" ||
      value === "lost"
    ) {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (value === "kyc") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  const handleOpenHistory = async (lead: any) => {
    if (!lead?.id) {
      return;
    }

    // Previous data completely clear
    setFollowups([]);
    setFollowupsError(null);

    setSelectedLead(lead);
    setHistoryOpen(true);
    setFollowupsLoading(true);

    try {
      const result = await dispatch(
        getFollowupsByLeadId(Number(lead.id)),
      ).unwrap();

      console.log("FOLLOWUP API RESULT:", result);

      /*
       * IMPORTANT:
       * Only accept actual array.
       *
       * This prevents duplicate / extra / invalid
       * rows from being shown.
       */

      if (Array.isArray(result)) {
        setFollowups(result);
      } else if (
        result &&
        typeof result === "object" &&
        Array.isArray((result as any).data)
      ) {
        setFollowups((result as any).data);
      } else {
        setFollowups([]);
      }
    } catch (err: any) {
      console.error("Followup history error:", err);

      /*
       * If backend returns 404,
       * simply show No followups found.
       */

      const status =
        err?.status ||
        err?.response?.status ||
        err?.payload?.status ||
        err?.payload?.statusCode;

      if (Number(status) === 404) {
        setFollowups([]);
        setFollowupsError(null);
      } else {
        setFollowups([]);
        setFollowupsError(
          err?.message ||
            err?.payload?.message ||
            "Failed to fetch followup history",
        );
      }
    } finally {
      setFollowupsLoading(false);
    }
  };

  // ============================================================
  // CLOSE HISTORY
  // ============================================================

  const handleCloseHistory = () => {
    setHistoryOpen(false);
    setSelectedLead(null);
    setFollowups([]);
    setFollowupsError(null);
    setFollowupsLoading(false);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading && safeLeads.length === 0) {
    return (
      <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm font-medium text-gray-500">
              Loading leads...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-4">
        <div className="relative overflow-hidden rounded-[26px] border border-orange-100 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
          {/* AMBIENT BACKGROUND */}
          <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-orange-500/[0.08] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-amber-400/[0.06] blur-3xl" />

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="absolute left-0 top-0 h-full w-[4px] bg-gradient-to-b from-orange-500 via-orange-600 to-amber-500" />

          {/* MAIN HEADER */}
          <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            {/* LEFT CONTENT */}
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative shrink-0">
                <div className="absolute -inset-3 rounded-[24px] bg-orange-500/10 blur-xl" />
                <div className="absolute -inset-1 rounded-[21px] border border-orange-500/10" />

                <div className="relative flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-[19px] bg-gradient-to-br from-orange-500 via-orange-600 to-orange-800 shadow-[0_12px_30px_rgba(234,88,12,0.28)]">
                  <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/20 blur-2xl" />
                  <div className="absolute h-[34px] w-[34px] rounded-full border border-white/20" />
                  <Users className="relative z-10 h-[22px] w-[22px] text-white" />
                </div>

                <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-[3px] border-white bg-emerald-500 shadow-[0_3px_10px_rgba(16,185,129,0.35)]">
                  <span className="h-[5px] w-[5px] rounded-full bg-white" />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[20px] font-extrabold tracking-[-0.035em] text-slate-800">
                    Lead Followups
                  </h2>
                </div>

                <p className="mt-1 text-[12px] font-medium text-slate-400">
                  Manage, track & follow up with your leads
                </p>

                <div className="mt-2.5 flex items-center gap-1.5">
                  <div className="h-[3px] w-10 rounded-full bg-orange-600" />
                  <div className="h-[3px] w-2 rounded-full bg-orange-300" />
                  <div className="h-[3px] w-1 rounded-full bg-orange-200" />
                </div>
              </div>
            </div>

            {/* RIGHT ACTION AREA */}
            <div className="flex w-full items-center gap-2.5 lg:w-auto">
              {/* SEARCH BOX */}
              <div className="group relative min-w-0 flex-1 lg:w-[330px] lg:flex-none">
                <div className="pointer-events-none absolute -inset-1 rounded-[17px] bg-orange-500/10 opacity-0 blur-lg transition-all duration-300 group-focus-within:opacity-100" />

                <div className="relative flex h-11 items-center overflow-hidden rounded-[14px] border border-slate-200 bg-slate-50/70 transition-all duration-200 hover:border-slate-300 hover:bg-white focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10">
                  <div className="flex h-full w-10 shrink-0 items-center justify-center">
                    <Search className="h-[17px] w-[17px] text-slate-400 transition-all duration-200 group-focus-within:scale-110 group-focus-within:text-orange-600" />
                  </div>

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search leads..."
                    className="h-full min-w-0 flex-1 bg-transparent pr-2 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  />

                  <div className="mr-2 hidden shrink-0 items-center rounded-[7px] border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold text-slate-400 shadow-sm sm:flex">
                    ⌘ K
                  </div>
                </div>
              </div>

              {/* REFRESH BUTTON */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                title="Refresh leads"
                className="group/refresh relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-orange-100 bg-orange-50 text-orange-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-100 hover:shadow-[0_8px_22px_rgba(234,88,12,0.16)] active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 group-hover/refresh:translate-x-full" />

                <RefreshCw
                  className={`relative h-[17px] w-[17px] transition-transform duration-500 ${
                    loading
                      ? "animate-spin text-orange-600"
                      : "group-hover/refresh:rotate-180"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="text-sm font-semibold text-red-600 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* ======================================================
            LEADS TABLE
        ====================================================== */}

        <Table minWidth="min-w-[1350px]" maxHeight="max-h-[920px]">
          <TableHeader>
            <TableRow alternate={false}>
              <TableCell header sticky>
                #
              </TableCell>
              <TableCell header>Enquiry Date</TableCell>
              <TableCell header>Customer Name</TableCell>
              <TableCell header>Phone</TableCell>
              <TableCell header>Email</TableCell>
              <TableCell header>Source</TableCell>
              <TableCell header>Status</TableCell>
              <TableCell header>Service Type</TableCell>
              <TableCell header>City</TableCell>
              <TableCell header>Advisor Name</TableCell>
              <TableCell header>History</TableCell>
            </TableRow>
          </TableHeader>

          <tbody>
            {paginatedLeads.length > 0 ? (
              paginatedLeads.map((lead, index) => {
                const serialNumber =
                  (currentPage - 1) * rowsPerPage + index + 1;

                const customerName = lead.fullName || "-";
                const customerPhone = lead.customerPhone || "-";
                const customerEmail = lead.customerEmail || "-";
                const source = lead.source || "-";
                const status = lead.status || "-";
                const serviceType = lead.serviceType || "-";
                const cityName = lead.cityName || "-";
                const advisorName = lead.advisorFullName || "-";

                return (
                  <TableRow key={lead.id} index={index}>
                    {/* NUMBER */}
                    <TableCell sticky rowIndex={index}>
                      {serialNumber}
                    </TableCell>

                    {/* ENQUIRY DATE */}
                    <TableCell>{formatDate(lead.enquiryTime)}</TableCell>

                    {/* CUSTOMER */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-orange-600">
                          {customerName !== "-"
                            ? customerName.charAt(0).toUpperCase()
                            : "-"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {customerName}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* PHONE */}
                    <TableCell>{customerPhone}</TableCell>

                    {/* EMAIL */}
                    <TableCell className="max-w-[220px]" title={customerEmail}>
                      <p className="truncate text-sm text-gray-600">
                        {customerEmail}
                      </p>
                    </TableCell>

                    {/* SOURCE */}
                    <TableCell>
                      <span className="inline-flex rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {source}
                      </span>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(status)}`}
                      >
                        {status}
                      </span>
                    </TableCell>

                    {/* SERVICE */}
                    <TableCell>{serviceType}</TableCell>

                    {/* CITY */}
                    <TableCell>{cityName}</TableCell>

                    {/* ADVISOR */}
                    <TableCell>{advisorName}</TableCell>

                    {/* HISTORY */}
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleOpenHistory(lead)}
                        className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-600 transition hover:border-orange-300 hover:bg-orange-100"
                      >
                        <History className="h-4 w-4" />
                        History
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>

                    <p className="text-sm font-semibold text-gray-700">
                      No leads found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {searchTerm
                        ? "Try changing your search."
                        : "There are no leads available."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* ==================================================
            PAGINATION
        ================================================== */}

        {filteredLeads.length > 0 && (
          <div className="mt-2 shrink-0 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredLeads.length}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* ========================================================
          FOLLOWUP HISTORY MODAL
      ======================================================== */}

      {historyOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          onClick={handleCloseHistory}
        >
          <div
            className="relative flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <History className="h-5 w-5 text-orange-600" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    Followup History
                  </h3>
                  <p className="text-xs text-gray-500">
                    Lead #{selectedLead?.id} • {selectedLead?.fullName || "-"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseHistory}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="min-h-0 flex-1 overflow-auto p-5">
              {/* LOADING */}
              {followupsLoading && (
                <div className="flex min-h-[220px] flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <p className="mt-3 text-sm font-medium text-gray-500">
                    Loading followup history...
                  </p>
                </div>
              )}

              {/* ERROR */}
              {!followupsLoading && followupsError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                  <p className="text-sm font-semibold text-red-600">
                    {followupsError}
                  </p>
                </div>
              )}

              {/* EMPTY */}
              {!followupsLoading &&
                !followupsError &&
                followups.length === 0 && (
                  <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                      <History className="h-6 w-6 text-gray-400" />
                    </div>

                    <h4 className="text-sm font-bold text-gray-700">
                      No followups found
                    </h4>
                    <p className="mt-1 max-w-sm text-xs text-gray-400">
                      No followup history is available for this lead.
                    </p>
                  </div>
                )}

              {/* FOLLOWUP TABLE */}
              {!followupsLoading && !followupsError && followups.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="w-[80px] px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                            #
                          </th>
                          <th className="w-[250px] px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                            Followup Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                            Remark
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {followups.map((followup, index) => (
                          <tr
                            key={`${selectedLead?.id}-followup-${index}`}
                            className="transition hover:bg-orange-50/40"
                          >
                            {/* NUMBER */}
                            <td className="whitespace-nowrap px-4 py-4">
                              <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-orange-50 px-2 text-xs font-bold text-orange-600">
                                {index + 1}
                              </span>
                            </td>

                            {/* DATE */}
                            <td className="whitespace-nowrap px-4 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <CalendarDays className="h-4 w-4 shrink-0 text-orange-500" />
                                <span>
                                  {formatFollowupDate(followup.followup_date)}
                                </span>
                              </div>
                            </td>

                            {/* REMARK */}
                            <td className="px-4 py-4">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                                  {followup.remark?.trim()
                                    ? followup.remark
                                    : "-"}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* EXACT COUNT */}
                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-xs text-gray-500">
                      Total followups:{" "}
                      <span className="font-bold text-gray-700">
                        {followups.length}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="flex shrink-0 justify-end border-t border-gray-200 px-5 py-3">
              <button
                type="button"
                onClick={handleCloseHistory}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeadFollowupsTable;
