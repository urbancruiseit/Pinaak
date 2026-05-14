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

// ─── camelCase — backend ke saath exact match ─────────────────────────────────
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ leadData se naam + IDs pre-fill
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
  }, [createSuccess, updateSuccess]);

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
  }, [createError, updateError]);

  const handleFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Directly camelCase payload bhejo — no mapping needed
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
      alert("Customer ID's is required");
      return;
    }
    if (!formData.dsrDate) {
      alert("DSR Date is required");
      return;
    }

    try {
      if (formData.id) {
        await dispatch(updateDsr({ id: formData.id, data: formData })).unwrap();
      } else {
        await dispatch(createDsr(formData)).unwrap();
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    dispatch(clearCurrentDsr());
  };

  const isLoading = createLoading || updateLoading;

  // ─── Renderers ────────────────────────────────────────────────────────────
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
          value={formData[name] || ""}
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
        value={formData[name] || ""}
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
            value={formData[name]}
            readOnly
            className="w-full py-2 border bg-gray-50 pl-10 pr-3 border-gray-300 rounded-md"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
            {icon}
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden relative">
      {/* Loading */}
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
          {/* 1 — Enquiry Information */}
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

          {/* 2 — Vehicle Information */}
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

          {/* 3 — Customer Financial Details */}
          <div className="border rounded-xl p-6 bg-purple-50">
            <h3 className="text-xl font-semibold text-purple-800 mb-6 pb-3 border-b">
              <span className="bg-purple-600 text-white px-3 py-1 rounded-md mr-2">
                3
              </span>
              Customer Financial Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              {field(
                "amountReceived",
                "Amount Received",
                "Received amount",
                <DollarSign size={20} />,
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

          {/* 4 — Vendor Financial Details */}
          <div className="border rounded-xl p-6 bg-yellow-50">
            <h3 className="text-xl font-semibold text-yellow-800 mb-6 pb-3 border-b">
              <span className="bg-yellow-600 text-white px-3 py-1 rounded-md mr-2">
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

          {/* 5 — Payment & Balance */}
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

          {/* 6 — Remarks */}
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
        </div>

        {/* Footer */}
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
