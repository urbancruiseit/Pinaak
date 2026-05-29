"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Printer, CreditCard } from "lucide-react";
import Image from "next/image";
import urbancruiselogo from "../../../../../../src/app/assets/urbanlogo.png";

interface QuotationPdfProps {
  data: any;
  onClose: () => void;
}

export default function QuotationPdf({ data, onClose }: QuotationPdfProps) {
  const vehicles: any[] = data?.vehicles || [];

  const formattedDate = data?.created_at
    ? new Date(data.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
    : "—";

  // Lock scroll + Escape to close
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // ── exact same wrapper as RateQuotationModel ──
  const modal = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto">
        {/* ── Header — same sticky pattern as RateQuotationModel ── */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Rate Quotation</h2>
            <p className="text-sm text-blue-600 font-medium mt-0.5">
              {data?.fullName || "Customer"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <Printer size={15} /> Print / PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5">
          {/* QUOTATION HEADER — Logo + Social + Date */}
          <div className="flex justify-between items-center pb-4 border-b gap-4">
            <div className="flex-shrink-0">
              <Image
                src={urbancruiselogo}
                alt="Urban Cruise Logo"
                width={90}
                priority
                className="rounded-xl object-contain"
              />
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="text-center mb-2">
                <h3 className="text-base font-bold text-gray-800">
                  Your Heading Text
                </h3>
                <p className="text-xs text-gray-500">
                  Add your description here
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
                    alt="Google"
                    className="h-4 w-auto"
                  />
                  <span className="text-[11px] font-medium text-gray-700">
                    ★★★★★
                  </span>
                </div>
                <div className="bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                    alt="Facebook"
                    className="h-4 w-auto"
                  />
                </div>
                <div className="bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg"
                    alt="YouTube"
                    className="h-4 w-auto"
                  />
                </div>
              </div>
            </div>
            <div className="text-[11px] text-right text-gray-600 flex-shrink-0">
              <p className="font-bold">{formattedDate}</p>
              <p>B-14, Gali No. 10</p>
              <p>Shashi Garden, Delhi - 110091</p>
            </div>
          </div>

          {/* RATE QUOTATION Banner */}
          <div className="py-1 font-bold text-center text-white bg-green-600 text-sm mt-3 rounded">
            RATE QUOTATION
          </div>

          {/* GREETING */}
          <div className="py-3 text-gray-900 text-sm space-y-0.5">
            <p>
              <strong>Dear {data?.fullName || "Customer"}</strong>
            </p>
            <p className="italic font-semibold text-red-600 text-xs">
              Greetings from Urban Cruise™
            </p>
            <p className="text-xs text-gray-600">
              With reference to your enquiry, please find the trip details,
              vehicle options &amp; pricing.
            </p>
          </div>

          {/* TRAVEL REQUIREMENT */}
          <div className="border-2 border-green-500 overflow-hidden rounded">
            <div className="bg-green-500 text-center py-1 font-bold text-[13px] uppercase tracking-wide text-white">
              YOUR TRAVEL REQUIREMENT
            </div>
            <div className="grid grid-cols-[70px_110px_1fr_110px] border-t border-green-500">
              <div className="border-r border-green-500 p-2 flex items-center text-red-600 justify-between font-bold text-[12px]">
                <span>Travel Detail</span>
                <span className="text-orange-500">▶</span>
              </div>
              <div className="border-r border-green-500 p-2 text-center">
                <p className="text-cyan-500 text-[12px] font-bold">
                  {data?.pickupTime || "—"}
                </p>
                <p className="text-cyan-500 text-[11px] mt-1">
                  {data?.pickupLocation || "—"}
                </p>
              </div>
              <div className="border-r border-green-500 p-2 text-[12px] font-semibold">
                {data?.routeDetails || "—"}
              </div>
              <div className="p-2 text-center">
                <p className="text-red-400 text-[12px] font-bold">
                  {data?.dropTime || "—"}
                </p>
                <p className="text-red-400 text-[11px] mt-1">
                  {data?.dropLocation || "—"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[70px_160px_90px_55px_1fr] border-t border-green-500">
              <div className="border-r border-green-500 p-2 flex items-center text-red-600 justify-between font-bold text-[12px]">
                <span>Travel Date</span>
                <span className="text-orange-500">▶</span>
              </div>
              <div className="border-r border-green-500 p-2 text-center">
                <p className="font-bold text-[12px]">
                  {data?.travelDate || "—"}
                </p>
                <p className="text-green-500 font-bold text-[11px]">
                  {data?.duration ? `(${data.duration})` : ""}
                </p>
              </div>
              <div className="border-r border-green-500 p-2 text-center">
                <p className="font-bold text-[12px] uppercase">TRIP TYPE</p>
                <p className="text-[11px] font-bold text-orange-500">
                  {data?.tripType || "—"}
                </p>
              </div>
              <div className="border-r border-green-500 p-2 text-center">
                <p className="font-bold text-[12px] uppercase">PAX</p>
                <p className="text-cyan-500 font-bold text-[20px] leading-none">
                  {data?.pax || "—"}
                </p>
              </div>
              <div className="p-2 text-[11px]">
                <span className="text-red-400 font-bold">Remarks- </span>
                <span className="text-gray-600">{data?.remarks || ""}</span>
              </div>
            </div>
          </div>

          {/* VEHICLE OPTIONS & PRICING */}
          <div className="mt-4 border border-gray-200 rounded overflow-hidden">
            <div className="px-3 py-1.5 font-bold text-white bg-green-600 text-sm">
              VEHICLE OPTIONS &amp; PRICING
            </div>
            <table className="w-full text-xs border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border border-gray-200 text-left">#</th>
                  <th className="p-2 border border-gray-200 text-left">
                    Vehicle Type
                  </th>
                  <th className="p-2 border border-gray-200 text-center">
                    Category
                  </th>
                  <th className="p-2 border border-gray-200 text-left">
                    Description
                  </th>
                  <th className="p-2 border border-gray-200 text-right">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length > 0 ? (
                  vehicles.map((v: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2 border border-gray-200">{idx + 1}</td>
                      <td className="p-2 border border-gray-200 font-medium">
                        {v?.vehicleType || "—"}
                      </td>
                      <td className="p-2 border border-gray-200 text-center">
                        {v?.category || "—"}
                      </td>
                      <td className="p-2 border border-gray-200">
                        {v?.description || "—"}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-bold text-green-700">
                        ₹{Number(v?.amount || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400">
                      No vehicle data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="px-3 py-1.5 text-[10px] text-gray-500 bg-gray-50 border-t border-gray-200">
              ✓ Pricing includes Vehicle Cost, Fuel, Driver &amp; Tax. | A/C
              switched OFF intermittently on Hills.
            </div>
          </div>

          {/* SCAN & PAY + Bank */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="border border-dashed border-gray-300 rounded p-3 bg-gray-50 text-center">
              <p className="text-xs font-bold flex items-center justify-center gap-1 mb-1">
                <CreditCard size={13} /> SCAN &amp; PAY
              </p>
              <div className="bg-white inline-block p-1.5 rounded shadow-sm">
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="100" height="100" rx="12" fill="#111" />
                  <rect
                    x="10"
                    y="10"
                    width="80"
                    height="80"
                    rx="6"
                    fill="white"
                  />
                  <path
                    d="M30 50 L70 50 M50 30 L50 70"
                    stroke="#111"
                    strokeWidth="3"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="12"
                    stroke="#111"
                    strokeWidth="3"
                    fill="white"
                  />
                </svg>
              </div>
              <p className="text-[9px] text-gray-400 mt-1">UPI / QR Code</p>
            </div>
            <div className="border border-gray-200 rounded p-3 text-[11px] space-y-1">
              <p className="font-bold text-xs">Bank Transfer Details:</p>
              <p>
                A/c Name:{" "}
                <span className="font-mono">Urban Cabs | AX05 Bank</span>
              </p>
              <p>
                A/c No.: <span className="font-mono">922020012721497</span>
              </p>
              <p>
                IFSC: <span className="font-mono">UTIB00000572</span>
              </p>
              <p className="text-green-700 pt-1">📞 89289 46056</p>
            </div>
          </div>

          {/* OTHER CHARGES */}
          <div className="mt-4 border border-gray-200 rounded overflow-hidden">
            <div className="px-3 py-1.5 font-bold text-white bg-green-600 text-sm">
              OTHER CHARGES (if applicable)
            </div>
            <div className="p-3 text-[11px] grid grid-cols-2 gap-x-4 gap-y-1">
              <p>
                <span className="font-semibold">✔ Toll:</span> Included in Cost.
              </p>
              <p>
                <span className="font-semibold">✘ State Entry Tax:</span> Client
                pays to Driver.
              </p>
              <p>
                <span className="font-semibold">
                  ✘ Parking &amp; Police Entry:
                </span>{" "}
                Client pays to Driver.
              </p>
              <p>
                <span className="font-semibold">🌙 Driver Night charge:</span>{" "}
                Client pays to Driver.
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 text-[11px]">
            <div>
              <p className="font-bold text-green-700">
                📞 RASHMI – +91 86557 15975
              </p>
              <p className="text-gray-500">
                ✉️ delhi@urbancruise.in &nbsp;|&nbsp; 🌐
                www.urbancruise.in/delhi
              </p>
              <p className="text-gray-400 text-[10px] mt-0.5">
                MUMBAI | PUNE | DELHI | NOIDA | GURUGRAM | CHANDIGARH | JAIPUR
              </p>
            </div>
            <div className="px-4 py-2 font-bold text-white bg-red-600 rounded-full text-sm">
              Pay 20% to Book
            </div>
          </div>

          {/* Close button at bottom — same as RateQuotationModel's Cancel */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Portal — directly into body, bypasses all parent overflow/z-index issues
  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
