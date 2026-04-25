"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/app/redux/store";
import { fetchMyAssignedLeads } from "@/app/features/access/accessSlice";
import type { LeadRecord } from "@/types/types";
import { X, Bell, CalendarRange, Clock, User, Phone, Mail } from "lucide-react";

const IST_TIMEZONE = "Asia/Kolkata";

const formatDate = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    timeZone: IST_TIMEZONE,
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
    timeZone: IST_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isNewStatus = (status?: string) => {
  const s = (status ?? "").trim();
  return s === "-" || s === "NEW";
};

const POLL_INTERVAL_MS = 15 * 1000; // 15 seconds

export default function GlobalLeadPopup() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { leads } = useSelector((state: RootState) => state.travelAdvisor.assignedLeads);

  const [lead, setLead] = useState<LeadRecord | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const activeLeadsMapRef = useRef<Map<string, LeadRecord>>(new Map());
  const initialSeenRef = useRef<Set<string> | null>(null);
  const currentLeadIdRef = useRef<string | null>(null);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // ─── Close with animation ─────────────────────────────────────────────────
  const closePopup = useCallback((cb?: () => void) => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setLead(null);
      currentLeadIdRef.current = null;
      setIsAnimatingOut(false);
      cb?.();
    }, 300);
  }, []);

  // ─── Show a lead ──────────────────────────────────────────────────────────
  const showLead = useCallback((l: LeadRecord) => {
    if (!isNewStatus(l.status)) return;
    if (currentLeadIdRef.current !== null) return;
    currentLeadIdRef.current = String(l.id);
    setLead(l);
    setIsAnimatingOut(false);
  }, []);

  // ─── Schedule re-show ─────────────────────────────────────────────────────
  const scheduleReshow = useCallback(
    (leadId: string, delayMs: number) => {
      const existing = timersRef.current.get(leadId);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        timersRef.current.delete(leadId);
        const latestLead = activeLeadsMapRef.current.get(leadId);
        if (latestLead && isNewStatus(latestLead.status)) {
          showLead(latestLead);
        }
      }, delayMs);

      timersRef.current.set(leadId, timer);
    },
    [showLead]
  );

  // ─── Close button — 10 sec baad wapas ────────────────────────────────────
  const handleClose = useCallback(() => {
    const closedId = currentLeadIdRef.current;
    closePopup(() => {
      if (closedId && activeLeadsMapRef.current.has(closedId)) {
        scheduleReshow(closedId, 10 * 1000);
      }
    });
  }, [closePopup, scheduleReshow]);

  // ─── Snooze button — 5 min baad wapas ────────────────────────────────────
  const handleSnooze = useCallback(() => {
    const snoozedId = currentLeadIdRef.current;
    closePopup(() => {
      if (snoozedId && activeLeadsMapRef.current.has(snoozedId)) {
        scheduleReshow(snoozedId, 5 * 60 * 1000);
      }
    });
  }, [closePopup, scheduleReshow]);

  // ─── Polling — socket ki jagah har 15 sec mein fetch ─────────────────────
  useEffect(() => {
    if (!currentUser) return;

    // Pehli baar turant fetch karo
    dispatch(fetchMyAssignedLeads(1));

    // Phir har 15 sec pe
    pollIntervalRef.current = setInterval(() => {
      dispatch(fetchMyAssignedLeads(1));
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [currentUser, dispatch]);

  // ─── Process leads from Redux ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser || !leads || leads.length === 0) return;

    // Pehli baar — baseline set karo, popup mat dikhaao
    if (initialSeenRef.current === null) {
      const baseline = new Set<string>();
      leads.forEach((l) => {
        const id = String(l.id);
        baseline.add(id);
        if (isNewStatus(l.status)) {
          activeLeadsMapRef.current.set(id, l);
        }
      });
      initialSeenRef.current = baseline;
      return;
    }

    // Subsequent polls
    leads.forEach((l) => {
      const id = String(l.id);
      const isNew = isNewStatus(l.status);

      if (!isNew) {
        // Status change ho gaya — remove karo
        activeLeadsMapRef.current.delete(id);
        if (currentLeadIdRef.current === id) {
          closePopup();
        }
        const t = timersRef.current.get(id);
        if (t) {
          clearTimeout(t);
          timersRef.current.delete(id);
        }
        return;
      }

      const isReallyNew = !initialSeenRef.current!.has(id);
      activeLeadsMapRef.current.set(id, l);
      initialSeenRef.current!.add(id);

      if (isReallyNew) {
        showLead(l);
      }
    });
  }, [leads, currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Logout reset ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) {
      setLead(null);
      currentLeadIdRef.current = null;
      activeLeadsMapRef.current.clear();
      initialSeenRef.current = null;
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [currentUser]);

  // ─── Render ───────────────────────────────────────────────────────────────
  if (!lead || !currentUser) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
          isAnimatingOut ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />
      <div
        style={{
          animation: isAnimatingOut
            ? "zoomOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards"
            : "zoomIn 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) forwards",
        }}
        className="relative w-full max-w-2xl mx-4"
      >
        <div className="relative bg-gradient-to-br from-white via-indigo-50/90 to-purple-50/90 backdrop-blur-sm border border-white/30 rounded-3xl shadow-2xl shadow-indigo-500/30 overflow-hidden">
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
                <div className="flex items-start gap-3 text-gray-700 pb-2 border-b border-gray-100">
                  <Clock className="w-5 h-5 mt-0.5 text-indigo-500" />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800">Arrival Time:</span>
                    <span className="ml-2 text-sm font-medium text-indigo-600">
                      {formatDateTime(lead.createdAt || lead.date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-gray-700 pb-2 border-b border-gray-100">
                  <User className="w-5 h-5 mt-0.5 text-indigo-500" />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800">Customer Name:</span>
                    <span className="ml-2 text-base font-bold text-indigo-700">{lead.fullName}</span>
                  </div>
                </div>

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

                <div className="flex items-start gap-3 text-gray-700">
                  <CalendarRange className="w-5 h-5 mt-0.5 text-indigo-500" />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800 block mb-2">Travel Details:</span>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-indigo-50 rounded-lg p-2">
                        <div className="text-xs text-gray-500">Start Date</div>
                        <div className="font-semibold text-indigo-700">{formatDate(lead.pickupDateTime)}</div>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-2">
                        <div className="text-xs text-gray-500">End Date</div>
                        <div className="font-semibold text-indigo-700">{formatDate(lead.dropDateTime)}</div>
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
                Close (10s mein wapas)
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

      <style>{`
        @keyframes zoomIn { 0% { opacity: 0; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes zoomOut { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.7); } }
      `}</style>
    </div>
  );
}