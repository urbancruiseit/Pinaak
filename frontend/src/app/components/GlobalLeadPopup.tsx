"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/app/redux/store";
import { fetchMyAssignedLeads } from "@/app/features/access/accessSlice";
import {
  connectSocket,
  disconnectSocket,
  listenToLeadUpdates,
  removeLeadListeners,
} from "@/app/socket/leadsocket";
import type { LeadRecord } from "@/types/types";
import { X, Bell, CalendarRange, Clock, User, Phone, Mail } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function GlobalLeadPopup() {
  const dispatch = useDispatch<AppDispatch>();

  const [isLoginPage, setIsLoginPage] = useState(false);

  useLayoutEffect(() => {
    const path = window.location.pathname;
    if (path === "/" || path === "/login" || path === "/page") {
      setIsLoginPage(true);
    }
  }, []);

  const { leads } = useSelector(
    (state: RootState) => state.travelAdvisor.assignedLeads,
  );

  const [lead, setLead] = useState<LeadRecord | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const pendingLeadIdsRef = useRef<Set<string>>(new Set());
  const leadsMapRef = useRef<Map<string, LeadRecord>>(new Map());
  const seenLeadIdsRef = useRef<Set<string> | null>(null);
  const currentLeadIdRef = useRef<string | null>(null);
  const snoozeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snoozedIdsRef = useRef<Set<string>>(new Set());

  // Koi bhi non-new status ek baar aane ke baad permanently block
  const permanentlyBlockedIdsRef = useRef<Set<string>>(new Set());

  // ─── Helper: Status check ─────────────────────────────────────────────────
  // Sirf "new" ya empty/null/undefined status wale leads allow karo
  // Baaki koi bhi status (KYC, contacted, closed, in-progress, etc.) block hai

  const isBlocked = useCallback((id: string, status?: string): boolean => {
    // Permanently blocked hai (pehle se non-new status aa chuka hai)
    if (permanentlyBlockedIdsRef.current.has(id)) return true;

    // Current status check karo
    const s = (status ?? "").trim().toLowerCase();
    return s !== "-" && s !== "new";
  }, []);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (snoozeTimerRef.current) clearTimeout(snoozeTimerRef.current);
    };
  }, []);

  // ─── Close helper ─────────────────────────────────────────────────────────

  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setLead(null);
      currentLeadIdRef.current = null;
      setIsAnimatingOut(false);
    }, 300);
  }, []);

  // ─── Show next pending lead ───────────────────────────────────────────────

  const showNextPending = useCallback(() => {
    if (currentLeadIdRef.current !== null) return;
    if (pendingLeadIdsRef.current.size === 0) return;

    const nextId = pendingLeadIdsRef.current.values().next().value as
      | string
      | undefined;
    if (!nextId) return;

    // Snoozed lead skip karo
    if (snoozedIdsRef.current.has(nextId)) {
      pendingLeadIdsRef.current.delete(nextId);
      return;
    }

    const nextLead = leadsMapRef.current.get(nextId);

    // Blocked ya lead nahi mila → skip
    if (!nextLead || isBlocked(nextId, nextLead.status)) {
      pendingLeadIdsRef.current.delete(nextId);
      return;
    }

    currentLeadIdRef.current = nextId;
    setLead(nextLead);
    setIsAnimatingOut(false);
  }, [isBlocked]);

  // ─── Snooze handler ──────────────────────────────────────────────────────

  const handleSnooze = useCallback(() => {
    const snoozedId = currentLeadIdRef.current;
    if (!snoozedId) return;

    if (snoozeTimerRef.current) clearTimeout(snoozeTimerRef.current);

    snoozedIdsRef.current.add(snoozedId);
    pendingLeadIdsRef.current.delete(snoozedId);

    setIsAnimatingOut(true);
    setTimeout(() => {
      setLead(null);
      currentLeadIdRef.current = null;
      setIsAnimatingOut(false);

      snoozeTimerRef.current = setTimeout(
        () => {
          snoozedIdsRef.current.delete(snoozedId);
          const updatedLead = leadsMapRef.current.get(snoozedId);

          // Snooze khatam hone pe bhi check karo — status change hua tha?
          if (updatedLead && !isBlocked(snoozedId, updatedLead.status)) {
            pendingLeadIdsRef.current.add(snoozedId);
            showNextPending();
          }
        },
        5 * 60 * 1000,
      );
    }, 300);
  }, [showNextPending, isBlocked]);

  // ─── Socket.io setup ──────────────────────────────────────────────────────

  useEffect(() => {
    dispatch(fetchMyAssignedLeads(1));

    connectSocket();

    listenToLeadUpdates(() => {
      dispatch(fetchMyAssignedLeads(1));
    });

    return () => {
      removeLeadListeners();
      disconnectSocket();
    };
  }, []);

  // ─── Process incoming leads ───────────────────────────────────────────────

  useEffect(() => {
    if (!leads || leads.length === 0) return;

    // Latest data map update karo
    const newMap = new Map<string, LeadRecord>();
    leads.forEach((l) => newMap.set(String(l.id), l));
    leadsMapRef.current = newMap;

    // ── FIRST FETCH ──────────────────────────────────────────────────────────
    if (seenLeadIdsRef.current === null) {
      const baseline = new Set<string>();

      leads.forEach((l) => {
        const id = String(l.id);
        baseline.add(id);

        // Non-new status hai → permanently block, pending mein mat daalo
        if (isBlocked(id, l.status)) {
          permanentlyBlockedIdsRef.current.add(id);
          return;
        }

        pendingLeadIdsRef.current.add(id);
      });

      seenLeadIdsRef.current = baseline;
      showNextPending();
      return;
    }

    // ── SUBSEQUENT FETCHES ───────────────────────────────────────────────────

    leads.forEach((l) => {
      const id = String(l.id);

      // Status "new" ya empty nahi hai → permanently block karo
      const s = (l.status ?? "").trim().toLowerCase();
      if (s !== "" && s !== "new") {
        permanentlyBlockedIdsRef.current.add(id);
      }

      // Naya lead hai
      if (!seenLeadIdsRef.current!.has(id)) {
        seenLeadIdsRef.current!.add(id);

        // Blocked nahi hai toh hi queue mein daalo
        if (!isBlocked(id, l.status)) {
          pendingLeadIdsRef.current.add(id);
        }
      }
    });

    // Pending queue mein jo blocked ho gaye unhe hataao
    pendingLeadIdsRef.current.forEach((id) => {
      if (permanentlyBlockedIdsRef.current.has(id)) {
        pendingLeadIdsRef.current.delete(id);
        snoozedIdsRef.current.delete(id);

        // Agar abhi yahi popup mein chal raha tha toh band karo
        if (currentLeadIdRef.current === id) {
          handleClose();
        }
      }
    });

    showNextPending();
  }, [leads, handleClose, showNextPending, isBlocked]);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!lead || isLoginPage) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
          isAnimatingOut ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Card */}
      <div
        style={{
          animation: isAnimatingOut
            ? "zoomOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards"
            : "zoomIn 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) forwards",
        }}
        className="relative w-full max-w-2xl mx-4"
      >
        <div className="relative bg-gradient-to-br from-white via-indigo-50/90 to-purple-50/90 backdrop-blur-sm border border-white/30 rounded-3xl shadow-2xl shadow-indigo-500/30 overflow-hidden">
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 opacity-75 blur-xl animate-pulse" />
          <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-white via-indigo-50/90 to-purple-50/90" />

          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="w-7 h-7 text-orange-500 animate-bounce" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                </div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  🚀 New Lead Arrived!
                </h2>
              </div>

              <button
                onClick={handleClose}
                className="w-8 h-8 bg-white/80 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-inner border border-white/50">
              <div className="space-y-4">
                {/* Arrival time */}
                <div className="flex items-start gap-3 text-gray-700 pb-2 border-b border-gray-100">
                  <Clock className="w-5 h-5 mt-0.5 text-indigo-500" />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800">
                      Arrival Time:
                    </span>
                    <span className="ml-2 text-sm font-medium text-indigo-600">
                      {formatDateTime(lead.createdAt || lead.date)}
                    </span>
                  </div>
                </div>

                {/* Customer name */}
                <div className="flex items-start gap-3 text-gray-700 pb-2 border-b border-gray-100">
                  <User className="w-5 h-5 mt-0.5 text-indigo-500" />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800">
                      Customer Name:
                    </span>
                    <span className="ml-2 text-base font-bold text-indigo-700">
                      {lead.fullName}
                    </span>
                  </div>
                </div>

                {/* Contact info */}
                {(lead.customerEmail || lead.customerPhone) && (
                  <div className="flex items-start gap-3 text-gray-700 pb-2 border-b border-gray-100">
                    <div className="flex gap-2 flex-wrap">
                      {lead.customerPhone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{lead.customerPhone}</span>
                        </div>
                      )}
                      {lead.customerEmail && (
                        <div className="flex items-center gap-1 ml-3">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{lead.customerEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Travel details */}
                <div className="flex items-start gap-3 text-gray-700">
                  <CalendarRange className="w-5 h-5 mt-0.5 text-indigo-500" />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800 block mb-2">
                      Travel Details:
                    </span>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-indigo-50 rounded-lg p-2">
                        <div className="text-xs text-gray-500">Start Date</div>
                        <div className="font-semibold text-indigo-700">
                          {formatDate(lead.pickupDateTime)}
                        </div>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-2">
                        <div className="text-xs text-gray-500">End Date</div>
                        <div className="font-semibold text-indigo-700">
                          {formatDate(lead.dropDateTime)}
                        </div>
                      </div>
                    </div>
                    {lead.days && (
                      <div className="mt-2 text-xs text-gray-500 bg-amber-50 inline-block px-2 py-1 rounded-full">
                        📅 Duration: {lead.days} days
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                Close
              </button>

              <button
                onClick={handleSnooze}
                className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-700 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Remind in 5 min</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes zoomIn {
          0%   { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1);   }
        }
        @keyframes zoomOut {
          0%   { opacity: 1; transform: scale(1);   }
          100% { opacity: 0; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}
