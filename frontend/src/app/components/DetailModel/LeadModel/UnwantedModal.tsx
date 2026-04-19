"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { markUnwanted, fetchLeads } from "../../../features/lead/leadSlice";
import { AppDispatch } from "../../../redux/store";
import type { LeadRecord } from "@/types/types";

interface UnwantedModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadRecord; 
}

const UnwantedModal: React.FC<UnwantedModalProps> = ({
  isOpen,
  onClose,
  lead,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [selectedOption, setSelectedOption] = useState<"yes" | "no">("yes");
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null); 

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setErrorMsg(null);     
      setSelectedOption("yes"); 
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lead?.id) return;

    const unwanted_status = selectedOption === "yes" ? "unwanted" : "wanted";

    const payload: { id: number | string; unwanted_status: "wanted" | "unwanted" } = {
      id: Number(lead.id), 
      unwanted_status,
    };

    console.log("🚀 Modal Payload:", payload);

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await dispatch(markUnwanted(payload)).unwrap(); 
      onClose(); // ✅ Sirf success pe close
    } catch (error: any) {
      console.error("❌ Modal Error:", error);
      setErrorMsg(error?.message || "Something went wrong. Please try again."); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) { 
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div
        className={`relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-xl font-semibold text-gray-800">
          Confirm Action
        </h2>

        <p className="mb-4 text-sm text-gray-600">
          Are you sure you want to update status for{" "}
          <span className="font-semibold text-gray-800">
            {lead.customerName || `Lead #${lead.id}`} 
          </span>
          ?
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Select Option
            </label>

            <select
              value={selectedOption}
              onChange={(e) =>
                setSelectedOption(e.target.value as "yes" | "no")
              }
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none disabled:opacity-50"
            >
              <option value="yes">Move to Unwanted</option>
              <option value="no">Keep as Wanted</option>
            </select>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : selectedOption === "yes"
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-green-600 hover:bg-green-700" 
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Updating...
                </span>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </form>

        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default UnwantedModal;