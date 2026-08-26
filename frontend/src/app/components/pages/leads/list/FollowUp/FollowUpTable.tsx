"use client";

import { useEffect } from "react";
import { X, Loader2, CalendarDays, Phone, Mail, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@/app/redux/store";
import {
  getFollowupsByLeadId,
  clearFollowups,
} from "../../../../../features/leadsFollowups/lead_followupsSlice";

interface FollowUpTableProps {
  lead: any;
  onClose: () => void;
}

export default function FollowUpTable({ lead, onClose }: FollowUpTableProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { followups, followupsLoading, followupsError } = useSelector(
    (state: RootState) => state.followUp,
  );

  const leadId = lead?.id;

  useEffect(() => {
    if (!leadId) return;

    dispatch(getFollowupsByLeadId(Number(leadId)));

    return () => {
      dispatch(clearFollowups());
    };
  }, [dispatch, leadId]);

  /* =====================================================
     DATE FORMAT
  ====================================================== */
  const formatDate = (value: any) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  /* =====================================================
     FOLLOWUP DATE
  ====================================================== */
  const getFollowupDate = (item: any) =>
    item?.created_at ??
    item?.createdAt ??
    item?.followup_date ??
    item?.followUpDate ??
    item?.date ??
    item?.created_on;

  /* =====================================================
     REMARK
  ====================================================== */
  const getRemark = (item: any) =>
    item?.remark ??
    item?.remarks ??
    item?.description ??
    item?.comment ??
    item?.notes ??
    "-";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex h-[90vh] w-[95%] max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="flex shrink-0 items-center justify-between border-b bg-orange-600 px-5 py-3 text-white">
          <div>
            <h2 className="text-lg font-bold">Follow Up</h2>

            <p className="text-sm text-orange-100">
              {lead?.fullName || "Customer"}{" "}
              {lead?.id ? `• Lead #${lead.id}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 transition hover:bg-orange-700"
          >
            <X size={22} />
          </button>
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}
        <div className="flex-1 overflow-auto p-5">
          {/* ===================================================
              LEAD DETAILS
          ==================================================== */}
          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {/* Lead ID */}
            <div className="rounded-lg border bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500">Lead ID</p>

              <p className="mt-1 font-semibold text-gray-800">
                {lead?.id ?? "-"}
              </p>
            </div>

            {/* Customer */}
            <div className="rounded-lg border bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <User size={15} className="text-orange-600" />

                <p className="text-xs font-medium text-gray-500">Customer</p>
              </div>

              <p className="mt-1 font-semibold text-gray-800">
                {lead?.fullName || "-"}
              </p>
            </div>

            {/* Mobile */}
            <div className="rounded-lg border bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-orange-600" />

                <p className="text-xs font-medium text-gray-500">Mobile</p>
              </div>

              <p className="mt-1 font-semibold text-gray-800">
                {lead?.customerPhone || "-"}
              </p>
            </div>

            {/* Email */}
            <div className="rounded-lg border bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-orange-600" />

                <p className="text-xs font-medium text-gray-500">Email</p>
              </div>

              <p className="mt-1 break-all font-semibold text-gray-800">
                {lead?.customerEmail || "-"}
              </p>
            </div>
          </div>

          {/* ===================================================
              FOLLOWUP TITLE
          ==================================================== */}
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays size={20} className="text-orange-600" />

            <h3 className="text-base font-bold text-gray-800">
              Follow Up History
            </h3>

            {!followupsLoading && (
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                {followups.length}
              </span>
            )}
          </div>

          {/* ===================================================
              LOADING
          ==================================================== */}
          {followupsLoading && (
            <div className="flex min-h-[250px] items-center justify-center">
              <div className="flex items-center gap-2 text-orange-600">
                <Loader2 size={22} className="animate-spin" />

                <span className="font-medium">Loading followups...</span>
              </div>
            </div>
          )}

          {/* ===================================================
              ERROR
          ==================================================== */}
          {!followupsLoading && followupsError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
              <p className="font-medium text-red-600">{followupsError}</p>
            </div>
          )}

          {/* ===================================================
              NO FOLLOWUPS
          ==================================================== */}
          {!followupsLoading && !followupsError && followups.length === 0 && (
            <div className="flex min-h-[250px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
              <div className="text-center">
                <CalendarDays
                  size={36}
                  className="mx-auto mb-2 text-gray-400"
                />

                <p className="font-semibold text-gray-600">
                  No followups found
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  There are no followup records for this lead.
                </p>
              </div>
            </div>
          )}

          {/* ===================================================
              FOLLOWUP TABLE
          ==================================================== */}
          {!followupsLoading && followups.length > 0 && (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="bg-orange-100 text-left">
                    <th className="whitespace-nowrap border-b px-4 py-3 text-sm font-bold text-gray-700">
                      #
                    </th>

                    <th className="whitespace-nowrap border-b px-4 py-3 text-sm font-bold text-gray-700">
                      Follow Up Date
                    </th>

                    <th className="border-b px-4 py-3 text-sm font-bold text-gray-700">
                      FollowUp Message
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {followups.map((item: any, index: number) => (
                    <tr
                      key={item?.id ?? item?.uuid ?? `${leadId}-${index}`}
                      className="transition hover:bg-orange-50"
                    >
                      {/* Number */}
                      <td className="border-b px-4 py-3 text-sm text-gray-600">
                        {index + 1}
                      </td>

                      {/* Followup Date */}
                      <td className="border-b px-4 py-3 text-sm text-gray-700">
                        {formatDate(getFollowupDate(item))}
                      </td>

                      {/* Remark */}
                      <td className="max-w-[600px] border-b px-4 py-3 text-sm text-gray-700">
                        <div className="whitespace-pre-wrap">
                          {getRemark(item)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
