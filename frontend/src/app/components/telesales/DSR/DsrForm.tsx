"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  FileText,
  Building,
  Info,
  Calendar,
  Tag,
  UserCheck,
  DollarSign,
  Car,
  CreditCard,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  MessageCircle,
  Plus,
  Trash2,
} from "lucide-react";
import type { LeadRecord } from "@/types/types";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  createDsr,
  updateDsr,
  resetCreateState,
  resetUpdateState,
  clearCurrentDsr,
} from "../../../features/Dsr/dsrSlice";

// ─── Amount Received Row interface ───────────────────────────────────────────
interface AmountReceivedRow {
  amountReceivedDate: string;
  ucBankName: string;
  customerBankName: string;
  transactionId: string;
  remarksAmountReceived: string;
  enteredBy: string;
}

const emptyAmountRow = (): AmountReceivedRow => ({
  amountReceivedDate: "",
  ucBankName: "",
  customerBankName: "",
  transactionId: "",
  remarksAmountReceived: "",
  enteredBy: "",
});

// ─── Main DSR Form Data interface ────────────────────────────────────────────
interface DsrFormData {
  id: string;
  leadId: string;
  customerId: string;
  advisorId: string;
  telesales: string;
  dsrDate: string;
  fullName: string;
  bookingId: string;
  dsrVehicles: string;
  dsrCategory: string;
  vehNo: string;
  driver: string;
  vendorName: string;
  customerRate: string;
  customerToll: string;
  parkTax: string;
  gstAmt: string;
  total: string;
  bookingAmount: string;
  otherAmount: string;
  bankName: string;
  amountReceived: string;
  tds: string;
  remainingAmount: string;
  vendorRate: string;
  vendorToll: string;
  vendorParkTax: string;
  customerToVendor: string;
  outstanding: string;
  paymentStatus: string;
  balanceAmount: string;
  rate: string;
  pay: string;
  finalBalance: string;
  before: string;
  final: string;
  gst: string;
  remarksTS: string;
  remarksMIS: string;
  remarksbyAccounts: string;
  refundCancelShare: string;
  feedbackByOfcs?: string;
  feedbackByCustomer?: string;
  googleRating?: string;
  mobileAppRating?: string;
  amountReceivedRows?: AmountReceivedRow[];
  vendorAmountReceivedRows?: AmountReceivedRow[];
}

const initialFormData: DsrFormData = {
  id: "",
  leadId: "",
  customerId: "",
  advisorId: "",
  telesales: "",
  dsrDate: new Date().toISOString().split("T")[0],
  fullName: "",
  bookingId: "",
  dsrVehicles: "",
  dsrCategory: "",
  vehNo: "",
  driver: "",
  vendorName: "",
  customerRate: "",
  customerToll: "",
  parkTax: "",
  gstAmt: "",
  total: "",
  bookingAmount: "",
  otherAmount: "",
  bankName: "",
  amountReceived: "",
  tds: "",
  remainingAmount: "",
  vendorRate: "",
  vendorToll: "",
  vendorParkTax: "",
  customerToVendor: "",
  outstanding: "",
  paymentStatus: "",
  balanceAmount: "",
  rate: "",
  pay: "",
  finalBalance: "",
  before: "",
  final: "",
  gst: "",
  remarksTS: "",
  remarksMIS: "",
  remarksbyAccounts: "",
  refundCancelShare: "",
  feedbackByOfcs: "",
  feedbackByCustomer: "",
  googleRating: "",
  mobileAppRating: "",
  amountReceivedRows: [emptyAmountRow()],
  vendorAmountReceivedRows: [emptyAmountRow()],
};

interface DsrFormProps {
  leadData?: LeadRecord | null;
}

export default function DsrForm({ leadData }: DsrFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const {
    createLoading,
    updateLoading,
    createSuccess,
    updateSuccess,
    createError,
    updateError,
  } = useSelector((state: RootState) => state.dsr);

  const [formData, setFormData] = useState<DsrFormData>(initialFormData);
  const [amountRows, setAmountRows] = useState<AmountReceivedRow[]>([
    emptyAmountRow(),
  ]);
  const [vendorAmountRows, setVendorAmountRows] = useState<AmountReceivedRow[]>(
    [emptyAmountRow()],
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const MAX_ROWS = 5;

  // ─── leadData se naam + IDs pre-fill ────────────────────────────────────
  useEffect(() => {
    if (leadData) {
      const l = leadData as any;
      setFormData((prev) => ({
        ...prev,
        leadId: l.id || l.leadId || l.lead_id || "",
        customerId: l.customerId || l.customer_id || "",
        advisorId: l.advisorId || l.advisor_id || "",
        fullName: l.fullName || l.full_name || "",
      }));
    }
  }, [leadData]);

  useEffect(() => {
    if (createSuccess || updateSuccess) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        dispatch(resetCreateState());
        dispatch(resetUpdateState());
      }, 3000);
      handleReset();
    }
  }, [createSuccess, updateSuccess, dispatch]);

  useEffect(() => {
    const err = createError || updateError;
    if (err) {
      setErrorMessage(err);
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
        dispatch(resetCreateState());
        dispatch(resetUpdateState());
      }, 5000);
    }
  }, [createError, updateError, dispatch]);

  // ─── Main form field change ───────────────────────────────────────────────
  const handleFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ─── Amount Received Row handlers ────────────────────────────────────────
  const handleRowChange = (
    index: number,
    fieldName: keyof AmountReceivedRow,
    value: string,
  ) => {
    setAmountRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [fieldName]: value };
      return updated;
    });
  };

  const handleAddRow = () => {
    if (amountRows.length < MAX_ROWS) {
      setAmountRows((prev) => [...prev, emptyAmountRow()]);
    }
  };

  const handleRemoveRow = (index: number) => {
    if (amountRows.length > 1) {
      setAmountRows((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // ─── Vendor Amount Received Row handlers ─────────────────────────────────
  const handleVendorRowChange = (
    index: number,
    fieldName: keyof AmountReceivedRow,
    value: string,
  ) => {
    setVendorAmountRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [fieldName]: value };
      return updated;
    });
  };

  const handleVendorAddRow = () => {
    if (vendorAmountRows.length < MAX_ROWS) {
      setVendorAmountRows((prev) => [...prev, emptyAmountRow()]);
    }
  };

  const handleVendorRemoveRow = (index: number) => {
    if (vendorAmountRows.length > 1) {
      setVendorAmountRows((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) {
      alert("Please fill Customer Name");
      return;
    }
    if (!formData.leadId) {
      alert("Lead ID is required");
      return;
    }
    if (!formData.customerId) {
      alert("Customer ID is required");
      return;
    }
    if (!formData.dsrDate) {
      alert("DSR Date is required");
      return;
    }

    const payload = {
      ...formData,
      amountReceivedRows: amountRows,
      vendorAmountReceivedRows: vendorAmountRows,
    };

    try {
      if (formData.id) {
        await dispatch(updateDsr({ id: formData.id, data: payload })).unwrap();
      } else {
        await dispatch(createDsr(payload)).unwrap();
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setAmountRows([emptyAmountRow()]);
    setVendorAmountRows([emptyAmountRow()]);
    dispatch(clearCurrentDsr());
  };

  const isLoading = createLoading || updateLoading;

  // ─── Field Renderers ──────────────────────────────────────────────────────
  const field = (
    name: keyof DsrFormData,
    label: string,
    placeholder: string,
    icon: React.ReactNode,
    required = false,
    type = "text",
  ) => (
    <div className="w-full">
      <label className="block text-md font-bold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="relative group">
        <Info
          size={15}
          className="absolute -top-4 right-0 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <input
          name={name}
          type={type}
          value={(formData[name] as string) || ""}
          onChange={handleFieldChange}
          className="w-full py-2 border bg-white pl-10 pr-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          required={required}
          disabled={isLoading}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
          {icon}
        </div>
      </div>
    </div>
  );

  const selectField = (
    name: keyof DsrFormData,
    label: string,
    options: { value: string; label: string }[],
    required = false,
  ) => (
    <div className="w-full">
      <label className="block text-md font-bold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <select
        name={name}
        value={(formData[name] as string) || ""}
        onChange={handleFieldChange}
        className="w-full py-2 border bg-white px-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={required}
        disabled={isLoading}
      >
        <option value="">Select {label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  const readOnly = (
    name: keyof DsrFormData,
    label: string,
    icon: React.ReactNode,
  ) =>
    formData[name] ? (
      <div className="w-full">
        <label className="block text-md font-bold text-gray-700 mb-1">
          {label}
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData[name] as string}
            readOnly
            className="w-full py-2 border bg-gray-50 pl-10 pr-3 border-gray-300 rounded-md"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
            {icon}
          </div>
        </div>
      </div>
    ) : null;

  // ─── Row field renderer for Amount Received rows ─────────────────────────
  const rowField = (
    index: number,
    name: keyof AmountReceivedRow,
    label: string,
    placeholder: string,
    icon: React.ReactNode,
    type = "text",
  ) => (
    <div className="w-full">
      <label className="block text-sm font-bold text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={amountRows[index][name]}
          onChange={(e) => handleRowChange(index, name, e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full py-2 border bg-white pl-10 pr-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-600">
          {icon}
        </div>
      </div>
    </div>
  );

  // ─── Row field renderer for Vendor Amount Received rows ──────────────────
  const vendorRowField = (
    index: number,
    name: keyof AmountReceivedRow,
    label: string,
    placeholder: string,
    icon: React.ReactNode,
    type = "text",
  ) => (
    <div className="w-full">
      <label className="block text-sm font-bold text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={vendorAmountRows[index][name]}
          onChange={(e) => handleVendorRowChange(index, name, e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full py-2 border bg-white pl-10 pr-3 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-600">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-gray-700 font-medium">
              {updateLoading ? "Updating DSR..." : "Saving DSR..."}
            </p>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-green-800">Success!</p>
              <p className="text-sm text-green-700">
                DSR {updateSuccess ? "updated" : "saved"} successfully
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showError && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-800">Error!</p>
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-orange-100 p-3 rounded-md">
        <div className="flex justify-between items-center">
          <div className="pl-4 border-l-8 border-orange-500 bg-white px-3 rounded-md shadow-md">
            <h2 className="text-4xl font-bold text-left py-4 text-orange-600">
              DSR Form
            </h2>
          </div>
          {formData.fullName && (
            <div className="bg-white border border-orange-300 rounded-lg px-4 py-2 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Customer</p>
              <p className="text-lg font-bold text-orange-700">
                {formData.fullName}
              </p>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-8">
          {/* ── 1 — Enquiry Information ─────────────────────────────────── */}
          <div className="border rounded-xl p-6 bg-blue-50">
            <h3 className="text-xl font-semibold text-blue-800 mb-6 pb-3 border-b">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-md mr-2">
                1
              </span>
              Enquiry Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {readOnly("leadId", "Lead ID", <FileText size={20} />)}
              {readOnly("customerId", "Customer ID", <User size={20} />)}
              {field(
                "dsrDate",
                "Date",
                "Select date",
                <Calendar size={20} />,
                false,
                "date",
              )}
              {field(
                "fullName",
                "Customer Name",
                "Enter customer name",
                <User size={20} />,
                true,
              )}
              {field(
                "bookingId",
                "Booking ID",
                "Booking ID",
                <FileText size={20} />,
              )}
            </div>
          </div>

          {/* ── 2 — Vehicle Information ─────────────────────────────────── */}
          <div className="border rounded-xl p-6 bg-green-50">
            <h3 className="text-xl font-semibold text-green-800 mb-6 pb-3 border-b">
              <span className="bg-green-600 text-white px-3 py-1 rounded-md mr-2">
                2
              </span>
              Vehicle Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {field(
                "dsrVehicles",
                "Vehicles",
                "Vehicle type",
                <Car size={20} />,
              )}
              {field(
                "dsrCategory",
                "Category",
                "Vehicle category",
                <Tag size={20} />,
              )}
              {field(
                "vehNo",
                "Vehicle No",
                "Vehicle number",
                <Car size={20} />,
              )}
              {field("driver", "Driver", "Driver name", <User size={20} />)}
              {field(
                "vendorName",
                "Vendor Name",
                "Vendor name",
                <UserCheck size={20} />,
              )}
            </div>
          </div>

          {/* ── 3 — Customer Financial Details ──────────────────────────── */}
          <div className="border rounded-xl p-6 bg-purple-50">
            <h3 className="text-xl font-semibold text-purple-800 mb-6 pb-3 border-b">
              <span className="bg-purple-600 text-white px-3 py-1 rounded-md mr-2">
                3
              </span>
              Customer Financial Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {field(
                "customerRate",
                "Customer Rate",
                "Customer rate",
                <DollarSign size={20} />,
              )}
              {field(
                "customerToll",
                "Customer Toll",
                "Customer toll",
                <DollarSign size={20} />,
              )}
              {field(
                "parkTax",
                "Park Tax",
                "Park tax",
                <DollarSign size={20} />,
              )}
              {field(
                "gstAmt",
                "GST Amount",
                "GST amount",
                <DollarSign size={20} />,
              )}
              {field(
                "total",
                "Total",
                "Total amount",
                <DollarSign size={20} />,
              )}
              {field(
                "bookingAmount",
                "Booking Amount",
                "Booking amount",
                <CreditCard size={20} />,
              )}
              {field(
                "otherAmount",
                "Other Amount",
                "Other amount",
                <DollarSign size={20} />,
              )}
              {field(
                "bankName",
                "Bank Name",
                "Bank name",
                <Building size={20} />,
              )}
              {field("tds", "TDS", "TDS", <DollarSign size={20} />)}
              {field(
                "remainingAmount",
                "Remaining Amount",
                "Remaining amount",
                <DollarSign size={20} />,
              )}
            </div>
          </div>

          {/* ── 3A — Amount Received (Dynamic Rows) ─────────────────────── */}
          <div className="border rounded-xl p-6 bg-yellow-50">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-yellow-200">
              <h3 className="text-xl font-semibold text-yellow-800">
                <span className="bg-yellow-600 text-white px-3 py-1 rounded-md mr-2">
                  3 A
                </span>
                Amount Received
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-yellow-700 font-medium bg-yellow-100 px-3 py-1 rounded-full border border-yellow-300">
                  {amountRows.length} / {MAX_ROWS} rows
                </span>
                <button
                  type="button"
                  onClick={handleAddRow}
                  disabled={amountRows.length >= MAX_ROWS || isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-semibold shadow-sm"
                >
                  <Plus size={16} />
                  Add Row
                </button>
              </div>
            </div>

            {/* Dynamic Rows */}
            <div className="space-y-4">
              {amountRows.map((row, index) => (
                <div
                  key={index}
                  className="border border-yellow-200 rounded-xl p-4 bg-white shadow-sm transition-all"
                >
                  {/* Row Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 flex items-center justify-center bg-yellow-600 text-white text-xs font-bold rounded-full">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-yellow-700">
                        Row {index + 1}
                      </span>
                    </div>
                    {amountRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Row Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rowField(
                      index,
                      "amountReceivedDate",
                      "Amount Received Date",
                      "Date of amount received",
                      <Calendar size={16} />,
                      "date",
                    )}
                    {rowField(
                      index,
                      "ucBankName",
                      "UC Bank Name",
                      "UC Bank name",
                      <Building size={16} />,
                    )}
                    {rowField(
                      index,
                      "customerBankName",
                      "Customer Bank Name",
                      "Customer Bank name",
                      <Building size={16} />,
                    )}
                    {rowField(
                      index,
                      "transactionId",
                      "Transaction ID",
                      "Transaction ID",
                      <CreditCard size={16} />,
                    )}
                    {rowField(
                      index,
                      "remarksAmountReceived",
                      "Remarks - Amount Received",
                      "Remarks for amount received",
                      <MessageCircle size={16} />,
                    )}
                    {rowField(
                      index,
                      "enteredBy",
                      "Entered By",
                      "Person who entered the details",
                      <User size={16} />,
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Add Row Button (dashed) */}
            {amountRows.length < MAX_ROWS && (
              <button
                type="button"
                onClick={handleAddRow}
                disabled={isLoading}
                className="mt-4 w-full py-3 border-2 border-dashed border-yellow-400 text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100 rounded-xl transition-colors text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Another Row ({amountRows.length}/{MAX_ROWS})
              </button>
            )}

            {amountRows.length >= MAX_ROWS && (
              <p className="mt-3 text-center text-sm text-yellow-600 font-medium">
                Maximum {MAX_ROWS} rows reached
              </p>
            )}
          </div>

          {/* ── 4 — Vendor Financial Details ────────────────────────────── */}
          <div className="border rounded-xl p-6 bg-cyan-50">
            <h3 className="text-xl font-semibold text-cyan-800 mb-6 pb-3 border-b">
              <span className="bg-cyan-600 text-white px-3 py-1 rounded-md mr-2">
                4
              </span>
              Vendor Financial Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {field(
                "vendorRate",
                "Vendor Rate",
                "Vendor rate",
                <DollarSign size={20} />,
              )}
              {field(
                "vendorToll",
                "Vendor Toll",
                "Vendor toll",
                <DollarSign size={20} />,
              )}
              {field(
                "vendorParkTax",
                "Vendor Park Tax",
                "Vendor park tax",
                <DollarSign size={20} />,
              )}
              {field(
                "customerToVendor",
                "Customer To Vendor",
                "Customer to vendor",
                <DollarSign size={20} />,
              )}
              {field(
                "outstanding",
                "Outstanding",
                "Outstanding amount",
                <AlertCircle size={20} />,
              )}
            </div>
          </div>

          {/* ── 4A — Vendor Amount Received (Dynamic Rows) ─────────────────────── */}
          <div className="border rounded-xl p-6 bg-yellow-50">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-yellow-200">
              <h3 className="text-xl font-semibold text-yellow-800">
                <span className="bg-yellow-600 text-white px-3 py-1 rounded-md mr-2">
                  4 A
                </span>
                Vendor Amount Received
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-yellow-700 font-medium bg-yellow-100 px-3 py-1 rounded-full border border-yellow-300">
                  {vendorAmountRows.length} / {MAX_ROWS} rows
                </span>
                <button
                  type="button"
                  onClick={handleVendorAddRow}
                  disabled={vendorAmountRows.length >= MAX_ROWS || isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-semibold shadow-sm"
                >
                  <Plus size={16} />
                  Add Row
                </button>
              </div>
            </div>

            {/* Dynamic Rows */}
            <div className="space-y-4">
              {vendorAmountRows.map((row, index) => (
                <div
                  key={index}
                  className="border border-yellow-200 rounded-xl p-4 bg-white shadow-sm transition-all"
                >
                  {/* Row Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 flex items-center justify-center bg-yellow-600 text-white text-xs font-bold rounded-full">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-yellow-700">
                        Row {index + 1}
                      </span>
                    </div>
                    {vendorAmountRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleVendorRemoveRow(index)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Row Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vendorRowField(
                      index,
                      "amountReceivedDate",
                      "Vendor Amount Received Date",
                      "Date of vendor amount received",
                      <Calendar size={16} />,
                      "date",
                    )}
                    {vendorRowField(
                      index,
                      "ucBankName",
                      "UC Bank Name",
                      "UC Bank name",
                      <Building size={16} />,
                    )}
                    {vendorRowField(
                      index,
                      "customerBankName",
                      "Vendor Bank Name",
                      "Vendor Bank name",
                      <Building size={16} />,
                    )}
                    {vendorRowField(
                      index,
                      "transactionId",
                      "Transaction ID",
                      "Transaction ID",
                      <CreditCard size={16} />,
                    )}
                    {vendorRowField(
                      index,
                      "remarksAmountReceived",
                      "Remarks - Amount Received",
                      "Remarks for amount received",
                      <MessageCircle size={16} />,
                    )}
                    {vendorRowField(
                      index,
                      "enteredBy",
                      "Entered By",
                      "Person who entered the details",
                      <User size={16} />,
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Add Row Button (dashed) */}
            {vendorAmountRows.length < MAX_ROWS && (
              <button
                type="button"
                onClick={handleVendorAddRow}
                disabled={isLoading}
                className="mt-4 w-full py-3 border-2 border-dashed border-yellow-400 text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100 rounded-xl transition-colors text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Another Row ({vendorAmountRows.length}/{MAX_ROWS})
              </button>
            )}

            {vendorAmountRows.length >= MAX_ROWS && (
              <p className="mt-3 text-center text-sm text-yellow-600 font-medium">
                Maximum {MAX_ROWS} rows reached
              </p>
            )}
          </div>

          {/* ── 5 — Payment & Balance ────────────────────────────────────── */}
          <div className="border rounded-xl p-6 bg-pink-50">
            <h3 className="text-xl font-semibold text-pink-800 mb-6 pb-3 border-b">
              <span className="bg-pink-600 text-white px-3 py-1 rounded-md mr-2">
                5
              </span>
              Payment & Balance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectField("paymentStatus", "Payment Status", [
                { value: "Pending", label: "Pending" },
                { value: "Partial", label: "Partial" },
                { value: "Completed", label: "Completed" },
              ])}
              {field(
                "balanceAmount",
                "Balance Amount",
                "Balance amount",
                <DollarSign size={20} />,
              )}
              {field("rate", "Rate", "Rate", <DollarSign size={20} />)}
              {field("pay", "Pay", "Pay amount", <DollarSign size={20} />)}
              {field(
                "finalBalance",
                "Final Balance",
                "Final balance",
                <DollarSign size={20} />,
              )}
              {field(
                "before",
                "Before Amount",
                "Before amount",
                <DollarSign size={20} />,
              )}
              {field(
                "final",
                "Final Amount",
                "Final amount",
                <DollarSign size={20} />,
              )}
              {field("gst", "GST", "GST", <DollarSign size={20} />)}
            </div>
          </div>

          {/* ── 6 — Remarks ──────────────────────────────────────────────── */}
          <div className="border rounded-xl p-6 bg-indigo-50">
            <h3 className="text-xl font-semibold text-indigo-800 mb-6 pb-3 border-b">
              <span className="bg-indigo-600 text-white px-3 py-1 rounded-md mr-2">
                6
              </span>
              Remarks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-md font-bold text-gray-700 mb-1">
                  Remarks TS
                </label>
                <textarea
                  name="remarksTS"
                  value={formData.remarksTS}
                  onChange={handleFieldChange}
                  rows={3}
                  placeholder="Remarks by TS"
                  disabled={isLoading}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-md font-bold text-gray-700 mb-1">
                  Remarks MIS
                </label>
                <textarea
                  name="remarksMIS"
                  value={formData.remarksMIS}
                  onChange={handleFieldChange}
                  rows={3}
                  placeholder="Remarks MIS"
                  disabled={isLoading}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ── 7 — Account Remarks ───────────────────────────────────────── */}
          <div className="border rounded-xl p-6 bg-yellow-50">
            <h3 className="text-xl font-semibold text-yellow-800 mb-6 pb-3 border-b">
              <span className="bg-yellow-600 text-white px-3 py-1 rounded-md mr-2">
                7
              </span>
              Account Remarks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-md font-bold text-gray-700 mb-1">
                  Remarks by Accounts
                </label>
                <textarea
                  name="remarksbyAccounts"
                  value={formData.remarksbyAccounts}
                  onChange={handleFieldChange}
                  rows={3}
                  placeholder="Remarks by Accounts"
                  disabled={isLoading}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-md font-bold text-gray-700 mb-1">
                  Refund / Cancel / Share
                </label>
                <textarea
                  name="refundCancelShare"
                  value={formData.refundCancelShare}
                  onChange={handleFieldChange}
                  rows={3}
                  placeholder="Refund / Cancel / Share"
                  disabled={isLoading}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ── 8 — OFS Feedback ─────────────────────────────────────────── */}
          <div className="border rounded-xl p-6 bg-blue-50">
            <h3 className="text-xl font-semibold text-blue-800 mb-6 pb-3 border-b">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-md mr-2">
                8
              </span>
              Ofs Feedback
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-md font-bold text-gray-700 mb-1">
                  Feedback by ofcs
                </label>
                <textarea
                  name="feedbackByOfcs"
                  value={formData.feedbackByOfcs}
                  onChange={handleFieldChange}
                  rows={3}
                  placeholder="Feedback by ofcs"
                  disabled={isLoading}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-md font-bold text-gray-700 mb-1">
                  Feedback by Customer
                </label>
                <textarea
                  name="feedbackByCustomer"
                  value={formData.feedbackByCustomer}
                  onChange={handleFieldChange}
                  rows={3}
                  placeholder="Feedback by Customer"
                  disabled={isLoading}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-md font-bold text-gray-700 mb-1">
                  Google Rating
                </label>
                <textarea
                  name="googleRating"
                  value={formData.googleRating}
                  onChange={handleFieldChange}
                  rows={3}
                  placeholder="Google Rating"
                  disabled={isLoading}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-md font-bold text-gray-700 mb-1">
                  Mobile App Rating
                </label>
                <textarea
                  name="mobileAppRating"
                  value={formData.mobileAppRating}
                  onChange={handleFieldChange}
                  rows={3}
                  placeholder="Mobile App Rating"
                  disabled={isLoading}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer Buttons ────────────────────────────────────────────── */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {updateLoading ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <FileSpreadsheet size={18} />
                {formData.id ? "Update DSR" : "Save DSR"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
