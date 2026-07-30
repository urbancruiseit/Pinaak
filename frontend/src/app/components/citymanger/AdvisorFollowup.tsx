"use client";

import { useEffect, useMemo, useState } from "react";
import { ListChecks, Eye, X, ChevronDown } from "lucide-react";
import {
  getAdvisorFollowupStatsApi,
  getAdvisorFollowupDetailsApi,
  AdvisorFollowupStat,
  AdvisorFollowupDetail,
} from "@/app/features/lead/leadApi";

interface AdvisorFollowupStatsProps {
  selectedAdvisorId: number | null;
}

export default function AdvisorFollowupStats({
  selectedAdvisorId,
}: AdvisorFollowupStatsProps) {
  const [followupStats, setFollowupStats] = useState<AdvisorFollowupStat[]>(
    [],
  );
  const [followupStatsLoading, setFollowupStatsLoading] = useState(false);
  const [followupStatsError, setFollowupStatsError] = useState<string | null>(
    null,
  );

  const [openFollowupAdvisor, setOpenFollowupAdvisor] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [followupDetails, setFollowupDetails] = useState<
    AdvisorFollowupDetail[]
  >([]);
  const [followupDetailsLoading, setFollowupDetailsLoading] = useState(false);
  const [followupDetailsError, setFollowupDetailsError] = useState<
    string | null
  >(null);

  const [expandedLeads, setExpandedLeads] = useState<Set<number>>(new Set());

  const toggleExpand = (leadId: number) => {
    setExpandedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };

  // ─── Fetch advisor-wise follow-up stats ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchFollowupStats = async () => {
      setFollowupStatsLoading(true);
      setFollowupStatsError(null);
      try {
        const data = await getAdvisorFollowupStatsApi();
        if (!cancelled) setFollowupStats(data);
      } catch (err: any) {
        if (!cancelled)
          setFollowupStatsError(err.message || "Failed to load follow-ups");
      } finally {
        if (!cancelled) setFollowupStatsLoading(false);
      }
    };

    fetchFollowupStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleViewFollowups = async (
    advisorId: number,
    advisorName: string,
  ) => {
    setOpenFollowupAdvisor({ id: advisorId, name: advisorName });
    setFollowupDetailsLoading(true);
    setFollowupDetailsError(null);
    try {
      const data = await getAdvisorFollowupDetailsApi(advisorId);
      setFollowupDetails(data);
    } catch (err: any) {
      setFollowupDetailsError(err.message || "Failed to load follow-ups");
      setFollowupDetails([]);
    } finally {
      setFollowupDetailsLoading(false);
    }
  };

  const closeFollowupModal = () => {
    setOpenFollowupAdvisor(null);
    setFollowupDetails([]);
    setFollowupDetailsError(null);
    setExpandedLeads(new Set());
  };

  const filteredFollowupStats = useMemo(() => {
    if (selectedAdvisorId === null) return followupStats;
    return followupStats.filter((r) => r.advisorId === selectedAdvisorId);
  }, [followupStats, selectedAdvisorId]);

  const totalFollowupsSet = useMemo(
    () => followupStats.reduce((sum, r) => sum + r.totalFollowups, 0),
    [followupStats],
  );
  const totalFollowupsPending = useMemo(
    () => followupStats.reduce((sum, r) => sum + r.pendingFollowups, 0),
    [followupStats],
  );

  const groupedFollowups = useMemo(() => {
    const groups: Record<
      number,
      {
        lead_id: number;
        fullName: string;
        customerPhone: string;
        status: string;
        entries: AdvisorFollowupDetail[];
        pendingCount: number;
      }
    > = {};

    followupDetails.forEach((f) => {
      if (!groups[f.lead_id]) {
        groups[f.lead_id] = {
          lead_id: f.lead_id,
          fullName: f.fullName,
          customerPhone: f.customerPhone,
          status: f.status,
          entries: [],
          pendingCount: 0,
        };
      }
      groups[f.lead_id].entries.push(f);
      if (f.isPending) groups[f.lead_id].pendingCount += 1;
    });

    Object.values(groups).forEach((g) =>
      g.entries.sort((a, b) => (a.date < b.date ? 1 : -1)),
    );

    return Object.values(groups);
  }, [followupDetails]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-lg font-bold tracking-wide flex items-center gap-2 text-blue-950">
            <ListChecks size={18} className="text-blue-600" />
            Advisor-wise Follow-ups
            {followupStatsLoading && (
              <span className="text-xs font-medium text-blue-600 ml-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                loading…
              </span>
            )}
          </h2>

          <div className="flex items-center gap-4 text-sm font-semibold text-blue-950">
            <span>
              Total:{" "}
              <span className="text-blue-700">{totalFollowupsSet}</span>
            </span>
            <span>
              Due:{" "}
              <span className="text-orange-600">{totalFollowupsPending}</span>
            </span>
          </div>
        </div>

        {followupStatsError && (
          <p className="text-sm text-red-600 mb-3">{followupStatsError}</p>
        )}

        {!followupStatsLoading && filteredFollowupStats.length === 0 && (
          <p className="text-sm text-slate-500 mb-3">
            Koi follow-up nahi mila.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {filteredFollowupStats.map((a) => (
            <div
              key={a.advisorId}
              className="rounded-xl border border-slate-200 p-4 bg-slate-50"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-blue-950">{a.advisorName}</p>
                <button
                  onClick={() =>
                    handleViewFollowups(a.advisorId, a.advisorName)
                  }
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-900"
                >
                  <Eye size={14} />
                  All Follow-ups
                </button>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black text-blue-700 leading-none">
                    {a.totalFollowups}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Follow-ups</p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-orange-600 font-semibold">
                    {a.pendingFollowups} due
                  </p>
                  <p className="text-emerald-600 font-semibold">
                    {a.upcomingFollowups} upcoming
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FOLLOW-UP MESSAGES MODAL ─── */}
      {openFollowupAdvisor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-blue-950">
                Follow-ups — {openFollowupAdvisor.name}
              </h3>
              <button
                onClick={closeFollowupModal}
                className="p-1.5 rounded-md hover:bg-slate-100"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 space-y-3">
              {followupDetailsLoading && (
                <p className="text-sm text-slate-500">Loading…</p>
              )}

              {followupDetailsError && (
                <p className="text-sm text-red-600">{followupDetailsError}</p>
              )}

              {!followupDetailsLoading &&
                !followupDetailsError &&
                groupedFollowups.length === 0 && (
                  <p className="text-sm text-slate-500">
                    Koi follow-up nahi mila.
                  </p>
                )}

              {groupedFollowups.map((g) => {
                const isOpen = expandedLeads.has(g.lead_id);
                return (
                  <div
                    key={g.lead_id}
                    className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleExpand(g.lead_id)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-100 transition-colors"
                    >
                      <div className="text-left">
                        <p className="text-sm font-semibold text-blue-950">
                          {g.fullName || "Unknown Customer"}
                        </p>
                        <div className="flex flex-wrap gap-x-3 text-[11px] text-slate-500 mt-0.5">
                          {g.customerPhone && (
                            <span>📞 {g.customerPhone}</span>
                          )}
                          {g.status && <span>Status: {g.status}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                          {g.entries.length} follow-up
                          {g.entries.length > 1 ? "s" : ""}
                        </span>
                        {g.pendingCount > 0 && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                            {g.pendingCount} due
                          </span>
                        )}
                        <ChevronDown
                          size={16}
                          className={`text-slate-500 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-3 space-y-2 border-t border-slate-200 pt-3">
                        {g.entries.map((f) => (
                          <div
                            key={f.id}
                            className={`rounded-lg border p-2.5 ${
                              f.isPending
                                ? "border-orange-200 bg-orange-50"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                📅 {f.date}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  f.isPending
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                {f.isPending ? "Due" : "Upcoming"}
                              </span>
                            </div>
                            <p className="text-sm text-blue-950">{f.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}