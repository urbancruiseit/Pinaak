"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bell, X, Clock, User, Phone } from "lucide-react";
import { AppDispatch, RootState } from "@/app/redux/store";
import {
  fetchDueReminders,
  markReminderAsShown,
} from "@/app/features/lead/leadSlice";

// Har kitne seconds me backend check karein ki koi reminder due hua ya nahi
const POLL_INTERVAL_MS = 15000; // 15 seconds — chaaho to 30000/60000 kar sakte ho

const ReminderPopupListener: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dueReminders } = useSelector((state: RootState) => state.lead);

  const [mounted, setMounted] = useState(false);
  const [activeReminder, setActiveReminder] = useState<
    (typeof dueReminders)[number] | null
  >(null);
  const [dismissingId, setDismissingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // SSR-safe portal mount
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // ── Poll backend periodically ──────────────────────────────
  useEffect(() => {
    // pehli baar turant check karo
    dispatch(fetchDueReminders());

    const interval = setInterval(() => {
      dispatch(fetchDueReminders());
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [dispatch]);

  // ── Jab bhi naya due reminder aaye aur abhi koi popup open nahi hai, dikhao ──
  useEffect(() => {
    if (!activeReminder && dueReminders && dueReminders.length > 0) {
      setActiveReminder(dueReminders[0]);
      // optional beep sound — agar file na ho to silently fail ho jayega
      try {
        audioRef.current?.play().catch(() => {});
      } catch {}
    }
  }, [dueReminders, activeReminder]);

  const handleDismiss = async (id: number) => {
    setDismissingId(id);
    try {
      await dispatch(markReminderAsShown(id)).unwrap();
    } catch (err) {
      console.error("Failed to mark reminder as shown:", err);
    } finally {
      setDismissingId(null);
      setActiveReminder(null); // close popup; next poll/dueReminders update will show next one if any
    }
  };

  if (!mounted || !activeReminder) return null;

  return createPortal(
    <div
      className="
    fixed inset-0 z-[999999]
    flex items-center justify-center
    px-4
    bg-black/20
    "
    >
      {/* Glass Card */}

      <div
        className="
      relative
      w-full
      max-w-md
      overflow-hidden
      rounded-[28px]
      border border-white/50
      bg-white/45
      shadow-[0_30px_90px_rgba(0,0,0,0.25)]
      backdrop-blur-lg
      "
      >
        {/* Top Accent Line */}
        <div className="h-1.5 w-full bg-orange-500"></div>

        {/* Header */}

        <div
          className="
        flex
        items-center
        justify-between
        px-6
        py-5
        "
        >
          <div className="flex items-center gap-4">
            <div
              className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-orange-500
            shadow-lg
            shadow-orange-500/30
            "
            >
              <Bell size={26} className="text-white" />
            </div>

            <div>
              <h2
                className="
              text-xl
              font-bold
              text-gray-900
              "
              >
                Reminder Alert
              </h2>

              <p
                className="
              text-sm
              text-gray-600
              "
              >
                Follow-up required now
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDismiss(activeReminder.id)}
            className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          bg-white/80
          border
          border-white
          text-red-500
          shadow-sm
          transition
          hover:bg-red-500
          hover:text-white
          "
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}

        <div
          className="
        space-y-4
        px-6
        pb-6
        "
        >
          {/* Customer */}

          <div
            className="
          rounded-2xl
          border
          border-white/60
          bg-white/55
          p-4
          backdrop-blur-sm
          "
          >
            <div
              className="
            flex
            items-center
            gap-3
            "
            >
              <div
                className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-orange-100
              "
              >
                <User size={21} className="text-orange-600" />
              </div>

              <div>
                <p className="text-xs text-gray-500">Customer</p>

                <h3
                  className="
                font-semibold
                text-gray-900
                "
                >
                  {activeReminder.fullName}
                </h3>
              </div>
            </div>

            {activeReminder.customerPhone && (
              <div
                className="
              mt-3
              flex
              items-center
              gap-2
              text-sm
              text-gray-700
              "
              >
                <Phone size={15} className="text-orange-500" />

                {activeReminder.customerPhone}
              </div>
            )}
          </div>

          {/* Time */}

          <div
            className="
          flex
          items-center
          gap-3
          rounded-2xl
          border
          border-orange-200
          bg-orange-50/80
          p-4
          "
          >
            <div
              className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-orange-500
            "
            >
              <Clock size={18} className="text-white" />
            </div>

            <div>
              <p
                className="
              text-xs
              text-gray-500
              "
              >
                Reminder Time
              </p>

              <p
                className="
              text-sm
              font-semibold
              text-gray-900
              "
              >
                {new Date(activeReminder.reminder_datetime).toLocaleString(
                  "en-IN",
                )}
              </p>
            </div>
          </div>

          {/* Message */}

          <div
            className="
          rounded-2xl
          border
          border-white/60
          bg-white/60
          p-4
          backdrop-blur-sm
          "
          >
            <p
              className="
            mb-2
            text-xs
            font-bold
            uppercase
            tracking-wide
            text-orange-600
            "
            >
              Message
            </p>

            <p
              className="
            text-sm
            leading-relaxed
            text-gray-800
            "
            >
              {activeReminder.message}
            </p>
          </div>

          {/* Button */}

          <button
            onClick={() => handleDismiss(activeReminder.id)}
            disabled={dismissingId === activeReminder.id}
            className="
          flex
          h-14
          w-full
          items-center
          justify-center
          rounded-2xl
          bg-orange-500
          text-base
          font-bold
          text-white
          shadow-lg
          shadow-orange-500/30
          transition
          hover:bg-orange-600
          active:scale-95
          disabled:opacity-50
          "
          >
            {dismissingId === activeReminder.id
              ? "Closing..."
              : "✓  OK, Got it"}
          </button>
        </div>
      </div>

      <style>{`

      @keyframes reminderPop {

        from{
          opacity:0;
          transform:scale(.95) translateY(15px);
        }

        to{
          opacity:1;
          transform:scale(1) translateY(0);
        }

      }

    `}</style>
    </div>,

    document.body,
  );
};

export default ReminderPopupListener;
