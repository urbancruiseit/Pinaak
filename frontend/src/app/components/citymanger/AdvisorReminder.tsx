"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, Eye, X } from "lucide-react";
import {
  getAdvisorReminderStatsApi,
  getAdvisorReminderDetailsApi,
  AdvisorReminderStat,
  AdvisorReminderDetail,
} from "@/app/features/lead/leadApi";

interface AdvisorReminderStatsProps {
  selectedAdvisorId: number | null;
  zonesAdvisors?: { id: number; name: string }[];
}

export default function AdvisorReminderStats({
  selectedAdvisorId,
  zonesAdvisors,
}: AdvisorReminderStatsProps) {
  const [reminderStats, setReminderStats] = useState<AdvisorReminderStat[]>(
    [],
  );
  const [reminderStatsLoading, setReminderStatsLoading] = useState(false);
  const [reminderStatsError, setReminderStatsError] = useState<string | null>(
    null,
  );

  const [openAdvisor, setOpenAdvisor] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [reminderDetails, setReminderDetails] = useState<
    AdvisorReminderDetail[]
  >([]);
  const [reminderDetailsLoading, setReminderDetailsLoading] = useState(false);
  const [reminderDetailsError, setReminderDetailsError] = useState<
    string | null
  >(null);

  // ─── Fetch advisor-wise reminder stats ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchReminderStats = async () => {
      setReminderStatsLoading(true);
      setReminderStatsError(null);
      try {
        const data = await getAdvisorReminderStatsApi();
        if (!cancelled) setReminderStats(data);
      } catch (err: any) {
        if (!cancelled)
          setReminderStatsError(err.message || "Failed to load reminders");
      } finally {
        if (!cancelled) setReminderStatsLoading(false);
      }
    };

    fetchReminderStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleViewMessages = async (
    advisorId: number,
    advisorName: string,
  ) => {
    setOpenAdvisor({ id: advisorId, name: advisorName });
    setReminderDetailsLoading(true);
    setReminderDetailsError(null);
    try {
      const data = await getAdvisorReminderDetailsApi(advisorId);
      setReminderDetails(data);
    } catch (err: any) {
      setReminderDetailsError(err.message || "Failed to load messages");
      setReminderDetails([]);
    } finally {
      setReminderDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setOpenAdvisor(null);
    setReminderDetails([]);
    setReminderDetailsError(null);
  };

  const filteredReminderStats = useMemo(() => {
    if (selectedAdvisorId === null) return reminderStats;
    return reminderStats.filter((r) => r.advisorId === selectedAdvisorId);
  }, [reminderStats, selectedAdvisorId]);

  const totalRemindersSet = useMemo(
    () => reminderStats.reduce((sum, r) => sum + r.totalReminders, 0),
    [reminderStats],
  );
  const totalRemindersPending = useMemo(
    () => reminderStats.reduce((sum, r) => sum + r.pendingReminders, 0),
    [reminderStats],
  );

  const advisorsWithNoReminders = useMemo(() => {
    if (!zonesAdvisors || zonesAdvisors.length === 0) return [];
    const setIds = new Set(reminderStats.map((r) => r.advisorId));
    return zonesAdvisors.filter((a) => !setIds.has(a.id));
  }, [zonesAdvisors, reminderStats]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-lg font-bold tracking-wide flex items-center gap-2 text-blue-950">
            <BellRing size={18} className="text-orange-800" />
            Advisor-wise Reminders Set
            {reminderStatsLoading && (
              <span className="text-xs font-medium text-blue-600 ml-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                loading…
              </span>
            )}
          </h2>

          <div className="flex items-center gap-4 text-sm font-semibold text-blue-950">
            <span>
              Total: <span className="text-blue-700">{totalRemindersSet}</span>
            </span>
            <span>
              Pending:{" "}
              <span className="text-orange-600">{totalRemindersPending}</span>
            </span>
          </div>
        </div>

        {reminderStatsError && (
          <p className="text-sm text-red-600 mb-3">{reminderStatsError}</p>
        )}

        {!reminderStatsLoading && filteredReminderStats.length === 0 && (
          <p className="text-sm text-slate-500 mb-3">
            Koi reminder set nahi mila.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {filteredReminderStats.map((a) => (
            <div
              key={a.advisorId}
              className="rounded-xl border border-slate-200 p-4 bg-slate-50"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-blue-950">{a.advisorName}</p>
                <button
                  onClick={() =>
                    handleViewMessages(a.advisorId, a.advisorName)
                  }
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-900"
                >
                  <Eye size={14} />
                  All Reminder
                </button>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black text-blue-700 leading-none">
                    {a.totalReminders}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Reminders set</p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-orange-600 font-semibold">
                    {a.pendingReminders} pending
                  </p>
                  <p className="text-emerald-600 font-semibold">
                    {a.shownReminders} shown
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {advisorsWithNoReminders.length > 0 && selectedAdvisorId === null && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-2">
              These Advisor are not Set any Reminders{" "}
            </p>
            <div className="flex flex-wrap gap-2">
              {advisorsWithNoReminders.map((a) => (
                <span
                  key={a.id}
                  className="text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1"
                >
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── REMINDER MESSAGES MODAL ─── */}
      {openAdvisor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-blue-950">
                Reminders — {openAdvisor.name}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-md hover:bg-slate-100"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 space-y-3">
              {reminderDetailsLoading && (
                <p className="text-sm text-slate-500">Loading…</p>
              )}

              {reminderDetailsError && (
                <p className="text-sm text-red-600">{reminderDetailsError}</p>
              )}

              {!reminderDetailsLoading &&
                !reminderDetailsError &&
                reminderDetails.length === 0 && (
                  <p className="text-sm text-slate-500">
                    Koi reminder nahi mila.
                  </p>
                )}

              {reminderDetails.map((r) => (
                <div
                  key={r.id}
                  className={`rounded-xl border p-3 ${
                    r.is_shown
                      ? "border-slate-200 bg-slate-50"
                      : "border-orange-200 bg-orange-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-blue-950">
                      {r.fullName || "Unknown Customer"}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        r.is_shown
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {r.is_shown ? "Shown" : "Pending"}
                    </span>
                  </div>
                  <p className="text-sm text-blue-950 mb-1">{r.message}</p>
                  <div className="flex flex-wrap gap-x-4 text-[11px] text-slate-500">
                    <span>
                      📅{" "}
                      {new Date(r.reminder_datetime).toLocaleString("en-IN")}
                    </span>
                    {r.customerPhone && <span>📞 {r.customerPhone}</span>}
                    {r.status && <span>Status: {r.status}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}