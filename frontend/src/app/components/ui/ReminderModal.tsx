"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bell, X, Plus, CheckCircle, Loader2, Clock } from "lucide-react";
import { createReminder } from "@/app/features/lead/leadSlice";
import { AppDispatch, RootState } from "@/app/redux/store";

interface ReminderModalProps {
  leadId: number;
  customerName: string;
  onClose?: () => void;
  // inlineMode=true: sirf form content render karo (EditLeadForm use karta hai)
  // inlineMode=false (default): apna bell button + portal dono render karo
  inlineMode?: boolean;
}

const ReminderForm: React.FC<{
  leadId: number;
  customerName: string;
  onClose: () => void;
}> = ({ leadId, customerName, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { reminderLoading } = useSelector((state: RootState) => state.lead);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState({ datetime: "", message: "" });
  const [formErrors, setFormErrors] = useState<{
    datetime?: string;
    message?: string;
  }>({});

  const validate = () => {
    const errs: typeof formErrors = {};
    if (!form.datetime) errs.datetime = "Date & Time required";
    if (!form.message.trim()) errs.message = "Message is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    try {
      await dispatch(
        createReminder({
          lead_id: leadId,
          reminder_datetime: `${form.datetime}:00`,
          message: form.message.trim(),
        }),
      ).unwrap();

      setSaveSuccess(true);
      setForm({ datetime: "", message: "" });

      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.18)]">
      {/* Header */}
      <div className="relative overflow-hidden bg-orange-600  px-6 py-6">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <Bell className="h-7 w-7 text-white" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Add Reminder</h2>

              <p className="text-sm text-orange-100">{customerName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="
    flex 
    h-10 
    w-10 
    items-center 
    justify-center 
    rounded-full 
    bg-white 
    border 
    border-gray-200
    transition-all
    hover:bg-red-500
    group
  "
          >
            <X className="h-5 w-5 text-red-500 transition group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Body */}

      <div className="space-y-6 bg-gradient-to-b from-white to-orange-50 p-6">
        {/* Date */}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Date & Time
          </label>

          <div className="flex items-center rounded-2xl border border-gray-200 bg-white px-4 shadow-sm transition focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100">
            <Clock className="mr-3 h-5 w-5 text-orange-500" />

            <input
              type="datetime-local"
              value={form.datetime}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  datetime: e.target.value,
                }))
              }
              className="w-full bg-transparent py-4 text-gray-700 outline-none"
            />
          </div>

          {formErrors.datetime && (
            <p className="text-sm text-red-500">{formErrors.datetime}</p>
          )}
        </div>

        {/* Message */}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Reminder Message
          </label>

          <textarea
            rows={5}
            placeholder="Write your reminder..."
            value={form.message}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                message: e.target.value,
              }))
            }
            className="w-full rounded-2xl border border-gray-200 bg-white p-4  text-gray-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />

          {formErrors.message && (
            <p className="text-sm text-red-500">{formErrors.message}</p>
          )}
        </div>

        {/* Info Card */}

        <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <Clock className="mt-0.5 h-5 w-5 text-orange-500" />

          <div>
            <h4 className="font-semibold text-gray-800">Reminder Alert</h4>

            <p className="mt-1 text-sm text-gray-600">
              The system will notify you at your selected date and time.
            </p>
          </div>
        </div>

        {/* Button */}

        <button
          onClick={handleCreate}
          disabled={reminderLoading}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-lg font-semibold text-white shadow-lg shadow-orange-300 transition duration-300 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
        >
          {reminderLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle className="h-5 w-5" />
              Reminder Created
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Create Reminder
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Main Export ───────────────────────────────────────────────────────────────
const ReminderModal: React.FC<ReminderModalProps> = ({
  leadId,
  customerName,
  onClose,
  inlineMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const open = inlineMode ? true : isOpen;
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, inlineMode]);

  const handleClose = () => {
    if (inlineMode) {
      onClose?.();
    } else {
      setIsOpen(false);
    }
  };

  // inlineMode=true: sirf ReminderForm render karo (EditLeadForm ne pehle se portal + overlay bana rakha hai)
  if (inlineMode) {
    return (
      <ReminderForm
        leadId={leadId}
        customerName={customerName}
        onClose={handleClose}
      />
    );
  }

  // inlineMode=false (default): bell button + apna portal
  const modalOverlay: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          console.log("Reminder button clicked");

          setIsOpen(true);
        }}
        style={{
          padding: "8px",
          borderRadius: "6px",
          backgroundColor: "#f97316",
          border: "none",
          cursor: "pointer",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Add Reminder"
      >
        <Bell size={18} />
      </button>

      {mounted && isOpen
        ? createPortal(
            <div
              style={modalOverlay}
              onClick={(e) => e.target === e.currentTarget && handleClose()}
            >
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  width: "100%",
                  maxWidth: "460px",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                  overflow: "hidden",
                }}
              >
                <ReminderForm
                  leadId={leadId}
                  customerName={customerName}
                  onClose={handleClose}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
};

export default ReminderModal;
