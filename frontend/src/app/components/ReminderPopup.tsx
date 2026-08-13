"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bell, X, Clock, User, Phone } from "lucide-react";

import { AppDispatch, RootState } from "@/app/redux/store";

import {
  fetchDueReminders,
  markReminderAsShown,
} from "@/app/features/lead/leadSlice";

const POLL_INTERVAL_MS = 15000;

const ReminderPopup: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // --------------------------------------------------
  // REDUX
  // --------------------------------------------------

  const dueReminders = useSelector((state: RootState) => {
    return state.lead.dueReminders || [];
  });

  const currentUser = useSelector((state: RootState) => {
    return state.user.currentUser;
  });

  const currentUserId = currentUser?.id;

  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [mounted, setMounted] = useState(false);

  const [activeReminder, setActiveReminder] = useState<
    (typeof dueReminders)[number] | null
  >(null);

  const [dismissingId, setDismissingId] = useState<number | null>(null);

  // --------------------------------------------------
  // MOUNT
  // --------------------------------------------------

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  // --------------------------------------------------
  // USER CHECK
  // --------------------------------------------------

  useEffect(() => {
    if (!currentUserId) {
      console.warn("⚠️ [ReminderPopup] currentUserId NOT AVAILABLE");

      return;
    }
  }, [currentUser, currentUserId]);

  // --------------------------------------------------
  // POLLING
  // --------------------------------------------------

  useEffect(() => {
    console.log("🟠 [ReminderPopup] POLLING EFFECT fired");

    console.log("🟠 [ReminderPopup] currentUserId:", currentUserId);

    if (!currentUserId) {
      console.warn("⚠️ [ReminderPopup] POLLING STOPPED - no currentUserId");

      return;
    }

    const fetchReminders = () => {
      const result = dispatch(fetchDueReminders());

      console.log("🚨 [ReminderPopup] dispatch result:", result);
    };

    fetchReminders();

    const interval = setInterval(() => {
      fetchReminders();
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [dispatch, currentUserId]);

  // --------------------------------------------------
  // DUE REMINDERS CHANGE
  // --------------------------------------------------

  useEffect(() => {
    console.log("🟡🟡🟡 [ReminderPopup] DUE REMINDERS EFFECT FIRED");

    console.log("🟡 [ReminderPopup] dueReminders:", dueReminders);

    console.log("🟡 [ReminderPopup] dueReminders.length:", dueReminders.length);

    console.log("🟡 [ReminderPopup] activeReminder:", activeReminder);

    if (!dueReminders) {
      console.warn("⚠️ [ReminderPopup] dueReminders is NULL/UNDEFINED");

      return;
    }

    if (dueReminders.length === 0) {
      console.log("⚪ [ReminderPopup] NO DUE REMINDERS");

      return;
    }

    if (activeReminder) {
      console.log("⚪ [ReminderPopup] POPUP ALREADY OPEN:", activeReminder.id);

      return;
    }

    const reminder = dueReminders[0];

    console.log("🔥🔥🔥 [ReminderPopup] REMINDER FOUND 🔥🔥🔥");

    console.log("🔥 [ReminderPopup] reminder:", reminder);

    console.log("🔥 [ReminderPopup] reminder id:", reminder.id);

    console.log("🔥 [ReminderPopup] reminder lead:", reminder.lead_id);

    console.log(
      "🔥 [ReminderPopup] reminder time:",
      reminder.reminder_datetime,
    );

    console.log("🔥 [ReminderPopup] reminder message:", reminder.message);

    console.log("🚨 [ReminderPopup] SETTING ACTIVE REMINDER");

    setActiveReminder(reminder);
  }, [dueReminders, activeReminder]);

  // --------------------------------------------------
  // ACTIVE REMINDER CHANGE
  // --------------------------------------------------

  useEffect(() => {
    console.log("🟣🟣🟣 [ReminderPopup] ACTIVE REMINDER CHANGED");

    console.log("🟣 [ReminderPopup] activeReminder:", activeReminder);

    if (activeReminder) {
      console.log("🚨🚨🚨 POPUP SHOULD NOW BE VISIBLE 🚨🚨🚨");

      console.log("🚨 Reminder ID:", activeReminder.id);
    } else {
      console.log("⚪ [ReminderPopup] activeReminder is NULL");
    }
  }, [activeReminder]);

  // --------------------------------------------------
  // DISMISS
  // --------------------------------------------------

  const handleDismiss = async (id: number) => {
    console.log("🔴 [ReminderPopup] DISMISS CLICKED");

    console.log("🔴 [ReminderPopup] reminder id:", id);

    setDismissingId(id);

    try {
      console.log("🟠 [ReminderPopup] Calling markReminderAsShown");

      await dispatch(markReminderAsShown(id)).unwrap();

      console.log("🟢 [ReminderPopup] Reminder marked as shown");

      setActiveReminder(null);

      console.log("🟢 [ReminderPopup] activeReminder cleared");
    } catch (error) {
      console.error("❌ [ReminderPopup] markReminderAsShown failed:", error);
    } finally {
      setDismissingId(null);
    }
  };

  // --------------------------------------------------
  // RENDER CONDITIONS
  // --------------------------------------------------

  if (!mounted) {
    console.log("⚪ [ReminderPopup] RETURN NULL: mounted = false");

    return null;
  }

  if (!activeReminder) {
    console.log("⚪ [ReminderPopup] RETURN NULL: activeReminder = null");

    return null;
  }

  console.log("🚨🚨🚨 [ReminderPopup] RENDERING POPUP 🚨🚨🚨");

  console.log("🚨 [ReminderPopup] activeReminder:", activeReminder);

  // --------------------------------------------------
  // POPUP
  // --------------------------------------------------

  return createPortal(
    <div
      className="
        fixed
        inset-0
        z-[999999]
        flex
        items-center
        justify-center
        bg-black/40
        px-4
      "
    >
      <div
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-[28px]
          bg-white
          shadow-[0_30px_90px_rgba(0,0,0,0.35)]
        "
      >
        <div className="h-1.5 w-full bg-orange-500" />

        {/* Header */}

        <div className="flex items-center justify-between px-6 py-5">
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
              "
            >
              <Bell size={26} className="text-white" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Reminder Alert
              </h2>

              <p className="text-sm text-gray-600">Follow-up required now</p>
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
              border
              text-red-500
              hover:bg-red-500
              hover:text-white
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* Customer */}

        <div className="space-y-4 px-6 pb-6">
          <div className="rounded-2xl border bg-gray-50 p-4">
            <div className="flex items-center gap-3">
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
                <p className="text-md text-gray-500">Customer</p>

                <h3 className="font-semibold text-gray-900">
                  {activeReminder.fullName || "Customer"}
                </h3>
              </div>
            </div>

            {activeReminder.customerPhone && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-900">
                <Phone size={15} className="text-orange-500" />

                {activeReminder.customerPhone}
              </div>
            )}
          </div>

          {/* Time */}

          <div className="flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
              <Clock size={18} className="text-white" />
            </div>

            <div>
              <p className="text-md text-gray-500 ">Reminder Time</p>

              <p className="text-sm font-semibold text-gray-900">
                {new Date(activeReminder.reminder_datetime).toLocaleString(
                  "en-IN",
                )}
              </p>
            </div>
          </div>

          {/* Message */}

          <div className="rounded-2xl border bg-gray-50 p-4">
            <p className="mb-2 text-xs font-bold uppercase text-orange-600">
              Message
            </p>

            <p className="text-sm leading-relaxed text-gray-800">
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
              hover:bg-orange-600
              disabled:opacity-50
            "
          >
            {dismissingId === activeReminder.id
              ? "Closing..."
              : "✓  OK, Got it"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ReminderPopup;
