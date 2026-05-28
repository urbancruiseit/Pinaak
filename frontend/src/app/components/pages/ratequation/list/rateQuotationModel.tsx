"use client";

import React, { useEffect, useState } from "react";
import { FileText, X, IndianRupee, Car, Tag, AlignLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/app/redux/store";
import { fetchVehicles } from "@/app/features/vehicle/vehicleSlice";
import { createRateQuotation } from "@/app/features/Rate/rateSlice";
import type { LeadRecord } from "../../../../../types/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VehicleSlot {
  vehicleType: string;
  category: string;
  description: string;
  amount: number | string;
}

interface RateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadRecord | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_SLOT: VehicleSlot = {
  vehicleType: "",
  category: "",
  description: "",
  amount: "",
};

const CATEGORY_OPTIONS = [
  { value: "economy premium", label: "Economy Premium" },
  { value: "royal vip", label: "Royal VIP" },
  { value: "royal", label: "Royal" },
  { value: "vip", label: "VIP" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const RateQuotationModel = ({
  isOpen,
  onClose,
  lead,
}: RateQuotationModalProps) => {
  const dispatch = useDispatch<AppDispatch>();

  // Lead info (display only)
  const [leadInfo, setLeadInfo] = useState<LeadRecord | null>(null);

  // Vehicle slots — 3 rows, each holds its own data
  const [slots, setSlots] = useState<VehicleSlot[]>([
    { ...EMPTY_SLOT },
    { ...EMPTY_SLOT },
    { ...EMPTY_SLOT },
  ]);

  // Redux
  const { vehicleCodes } = useSelector((state: RootState) => state.vehicle);
  const { createLoading, createSuccess } = useSelector(
    (state: RootState) => state.rate,
  );

  // ── Effects ────────────────────────────────────────────────────────────────

  // Fetch vehicles on open
  useEffect(() => {
    if (isOpen && vehicleCodes.length === 0) {
      dispatch(fetchVehicles());
    }
  }, [isOpen, dispatch, vehicleCodes.length]);

  // Close on success
  useEffect(() => {
    if (createSuccess) {
      onClose();
    }
  }, [createSuccess, onClose]);

  // Populate from lead when modal opens
  useEffect(() => {
    if (!lead) return;

    setLeadInfo(lead);

    const lead_ = lead as any;

    const vehicles = Array.isArray(lead_?.vehicles) ? lead_.vehicles : [];

    setSlots([
      {
        vehicleType: vehicles[0]?.vehicleType || "",
        category: vehicles[0]?.category || "",
        description: vehicles[0]?.description || "",
        amount: vehicles[0]?.amount || "",
      },
      {
        vehicleType: vehicles[1]?.vehicleType || "",
        category: vehicles[1]?.category || "",
        description: vehicles[1]?.description || "",
        amount: vehicles[1]?.amount || "",
      },
      {
        vehicleType: vehicles[2]?.vehicleType || "",
        category: vehicles[2]?.category || "",
        description: vehicles[2]?.description || "",
        amount: vehicles[2]?.amount || "",
      },
    ]);
  }, [lead]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  // Update a single field in a specific slot
  const updateSlot = (
    index: number,
    field: keyof VehicleSlot,
    value: string | number,
  ) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)),
    );
  };

  // Get vehicle display name from code
  const getVehicleName = (code: string) => {
    if (!code || vehicleCodes.length === 0) return "";
    const v = vehicleCodes.find((v: { code: string }) => v.code === code);
    return v ? `${v.code} - ${v.name}` : code;
  };

  // Build final payload and dispatch
  const handleSave = async () => {
    const lead_ = lead as any;

    const vehiclesArray = slots
      .filter((slot) => slot.vehicleType !== "")
      .map((slot) => ({
        vehicleType: slot.vehicleType,
        category: slot.category,
        description: slot.description,
        amount: Number(slot.amount) || 0,
      }));

    if (vehiclesArray.length === 0) {
      alert("Kam se kam ek vehicle select karo.");
      return;
    }

    // ✅ Get advisorId from Redux store or localStorage
    const advisorId =
      localStorage.getItem("advisorId") ||
      lead_?.advisorId ||
      lead_?.advisor_id ||
      null;

    const payload = {
      leadId: lead_?.leadId || lead_?.id || lead_?.lead_id,
      customerId: lead_?.customerId || lead_?.customer_id,
      vehicles: vehiclesArray,
      advisorId: advisorId ? Number(advisorId) : null, // ✅ Add this
    };

    try {
      const res = await dispatch(createRateQuotation(payload)).unwrap();
      console.log("Rate Quotation Created:", res);
      onClose();
    } catch (error) {
      console.error("Rate Quotation Failed:", error);
    }
  };

  // ── Guard ──────────────────────────────────────────────────────────────────

  if (!isOpen || !leadInfo) return null;

  const lead_ = leadInfo as any;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto">
        {/* ── Header ── */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Rate Quotation</h2>
            <p className="text-sm text-blue-600 font-medium mt-0.5">
              {lead_?.fullName || lead_?.customerName || lead_?.name || "N/A"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* ── Lead Info ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <InfoItem
              label="Name"
              value={lead_?.customerName || lead_?.fullName}
            />
            <InfoItem label="Phone" value={lead_?.phone} />
            <InfoItem label="Pax" value={lead_?.passengerTotal} />
            <InfoItem label="Pickup" value={lead_?.pickupAddress} />
            <InfoItem label="Drop" value={lead_?.dropAddress} />
            <InfoItem label="Service Type" value={lead_?.serviceType} />
          </div>

          {/* ── Vehicle Slots ── */}
          <div className="space-y-5">
            {slots.map((slot, index) => (
              <VehicleRow
                key={index}
                index={index}
                slot={slot}
                vehicleCodes={vehicleCodes}
                getVehicleName={getVehicleName}
                onChange={updateSlot}
              />
            ))}
          </div>

          {/* ── Preview of what will be sent ── */}
          {slots.some((s) => s.vehicleType) && (
            <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-2">
                JSON Preview (jo backend ko jayega)
              </p>
              <pre className="text-xs text-blue-900 whitespace-pre-wrap break-all">
                {JSON.stringify(
                  slots
                    .filter((s) => s.vehicleType)
                    .map((s) => ({
                      vehicleType: s.vehicleType,
                      category: s.category,
                      description: s.description,
                      amount: Number(s.amount) || 0,
                    })),
                  null,
                  2,
                )}
              </pre>
            </div>
          )}

          {/* ── Footer Buttons ── */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createLoading}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Rate Quotation"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateQuotationModel;

// ─── Sub-components ───────────────────────────────────────────────────────────

// Single lead info cell
const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <div>
    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
      {label}
    </span>
    <p className="text-sm text-gray-800 font-medium mt-0.5">{value || "—"}</p>
  </div>
);

// One vehicle row (type + category + description + amount)
const VehicleRow = ({
  index,
  slot,
  vehicleCodes,
  getVehicleName,
  onChange,
}: {
  index: number;
  slot: VehicleSlot;
  vehicleCodes: { code: string; name: string }[];
  getVehicleName: (code: string) => string;
  onChange: (
    index: number,
    field: keyof VehicleSlot,
    value: string | number,
  ) => void;
}) => {
  const num = index + 1;

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white hover:border-blue-200 transition-colors">
      {/* Row label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {num}
        </span>
        <span className="text-sm font-semibold text-gray-700">
          Vehicle {num}
        </span>
        {slot.vehicleType && (
          <span className="ml-auto text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
            {getVehicleName(slot.vehicleType)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Vehicle Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Vehicle Type
          </label>
          <div className="relative">
            <Car
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none"
            />
            <select
              value={slot.vehicleType}
              onChange={(e) => onChange(index, "vehicleType", e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Select type {num}</option>
              {vehicleCodes.length > 0 ? (
                vehicleCodes.map(
                  (v: { code: string; name: string }, i: number) => (
                    <option key={`${v.code}-${num}-${i}`} value={v.code}>
                      {v.code} - {v.name}
                    </option>
                  ),
                )
              ) : (
                <option disabled>Loading...</option>
              )}
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Category
          </label>
          <div className="relative">
            <Tag
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 pointer-events-none"
            />
            <select
              value={slot.category}
              onChange={(e) => onChange(index, "category", e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Select category</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Description
          </label>
          <div className="relative">
            <AlignLeft
              size={16}
              className="absolute left-3 top-3 text-gray-400 pointer-events-none"
            />
            <textarea
              value={slot.description}
              onChange={(e) => onChange(index, "description", e.target.value)}
              placeholder="AC, Non-AC, model year..."
              rows={2}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Total Amount (₹)
          </label>
          <div className="relative">
            <IndianRupee
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none"
            />
            <input
              type="number"
              value={slot.amount}
              onChange={(e) => onChange(index, "amount", e.target.value)}
              placeholder="0"
              min={0}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
