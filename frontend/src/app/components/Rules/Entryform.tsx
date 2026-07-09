"use client";

import {
  fetchAdvisorsByZone,
  fetchRuleEntries,
} from "@/app/features/Rules/rulesSlice";
import { RootState } from "@/app/redux/store";
import { useAppDispatch } from "@/hooks/useRedux";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export type EntryType = "T20" | "T60";

// Real entry shape as returned by the backend
export type Entry = {
  id: number;
  type: EntryType;
  months: string[];
  monthLeads: MonthLead[];
  advisorId: number;
  advisorName: string;
  shiftTiming: string;
  lead: number;
  overflow: string;
};

// One Month + Lead pair
export type MonthLead = {
  month: string;
  lead: number;
};

// UI-only state used while the user is filling the form
export type FormState = {
  type: EntryType;
  monthLeads: MonthLead[]; // exactly 2 rows: Month 1 + Lead, Month 2 + Lead
  advisorId: number | null;
  shiftTiming: string;
};

// Exact payload shape the backend controller/model expects.
// See rules.controller.js -> createEntry/updateEntry and rules.model.js -> createRuleEntry.
export type EntryPayload = {
  type: EntryType;
  months: string[];
  monthLeads: MonthLead[];
  advisorId: number;
  shiftTiming: string;
  lead: number;
  overflow: string;
};

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const emptyForm: FormState = {
  type: "T20",
  monthLeads: [
    { month: "", lead: 0 },
    { month: "", lead: 0 },
  ],
  advisorId: null,
  shiftTiming: "",
};

// Maps a backend Entry (months[] + monthLeads[]) into the 2-row monthLeads shape
function entryToForm(entry: Entry): FormState {
  const sourceLeads =
    entry.monthLeads && entry.monthLeads.length > 0
      ? entry.monthLeads
      : entry.months.map((m) => ({ month: m, lead: entry.lead ?? 0 }));

  const rows: MonthLead[] = [
    sourceLeads[0] ?? { month: "", lead: 0 },
    sourceLeads[1] ?? { month: "", lead: 0 },
  ];

  return {
    type: entry.type,
    monthLeads: rows,
    advisorId: entry.advisorId,
    shiftTiming: entry.shiftTiming,
  };
}

// Transforms the UI FormState into the flat payload the backend requires.
// - Drops rows where no month was selected.
// - Derives `months` (string[]) from the filled rows, since the backend
//   validates `Array.isArray(months) && months.length > 0`.
// - Derives a single top-level `lead` (backend column) from the first
//   filled row, while still sending the full per-month `monthLeads` array.
function formToPayload(form: FormState): EntryPayload {
  const filledRows = form.monthLeads.filter((ml) => ml.month !== "");

  return {
    type: form.type,
    months: filledRows.map((ml) => ml.month),
    monthLeads: filledRows,
    advisorId: form.advisorId as number,
    shiftTiming: form.shiftTiming,
    lead: filledRows[0]?.lead ?? 0,
    overflow: "",
  };
}

export default function EntryForm({
  editingEntry,
  onSubmit,
  onCancel,
}: {
  editingEntry: Entry | null;
  onSubmit: (payload: EntryPayload) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(
    editingEntry ? entryToForm(editingEntry) : emptyForm,
  );

  // Keep form in sync when a different entry is selected for editing,
  // or when editing is cancelled / completed.
  const [syncedId, setSyncedId] = useState<number | null>(
    editingEntry ? editingEntry.id : null,
  );

  const dispatch = useAppDispatch();
  const { zoneAdvisors } = useSelector((state: RootState) => state.rule);

  useEffect(() => {
    dispatch(fetchAdvisorsByZone());
  }, [dispatch]);

  if ((editingEntry?.id ?? null) !== syncedId) {
    setSyncedId(editingEntry ? editingEntry.id : null);
    setForm(editingEntry ? entryToForm(editingEntry) : emptyForm);
  }

  function handleMonthChange(index: number, value: string) {
    setForm((prev) => {
      const next = [...prev.monthLeads];
      next[index] = { ...next[index], month: value };
      return { ...prev, monthLeads: next };
    });
  }

  function handleLeadChange(index: number, value: string) {
    setForm((prev) => {
      const next = [...prev.monthLeads];
      next[index] = { ...next[index], lead: Number(value) };
      return { ...prev, monthLeads: next };
    });
  }

  const handleAdvisorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const advisorId = Number(e.target.value);
    const advisor = zoneAdvisors.find((a) => a.id === advisorId);

    setForm((prev) => ({
      ...prev,
      advisorId,
      shiftTiming: advisor?.shiftTiming || "",
    }));
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const hasAtLeastOneMonth = form.monthLeads.some((ml) => ml.month !== "");

    // Mirror the backend's own validation so bad payloads never leave the client:
    // type, advisorId, and at least one month are all required.
    if (!form.type || !form.advisorId || !hasAtLeastOneMonth) {
      return;
    }

    const payload = formToPayload(form);
    onSubmit(payload);
    dispatch(fetchRuleEntries());
    setForm(emptyForm);
  }

  function handleCancel() {
    setForm(emptyForm);
    onCancel();
  }

  const editingId = editingEntry !== null ? editingEntry.id : null;

  return (
    <div className="flex flex-col">
      <h2 className="text-green-600 font-semibold text-sm uppercase tracking-wider mb-5">
        {editingId !== null ? "Entry Edit " : "New Entry "}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        <div>
          <label className="text-md text-gray-700 font-semibold mb-2 block">
            Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["T20", "T60"] as EntryType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((p) => ({ ...p, type: t }))}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                  form.type === t
                    ? t === "T20"
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-green-600 border-green-600 text-white"
                    : "bg-white border-gray-300 text-gray-500 hover:border-gray-400"
                }`}
              >
                {t === "T20" ? "T-20" : "T-60"}
              </button>
            ))}
          </div>
        </div>

        {/* Month 1 + Lead */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-md text-gray-700 font-semibold mb-2 block">
              Month 1
            </label>
            <select
              value={form.monthLeads[0].month}
              onChange={(e) => handleMonthChange(0, e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500"
            >
              <option value="">Select Month</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-md text-gray-700 font-semibold mb-2 block">
              Lead/Day
            </label>
            <input
              type="number"
              value={form.monthLeads[0].lead}
              onChange={(e) => handleLeadChange(0, e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500"
              placeholder="Enter lead / day"
            />
          </div>
        </div>

        {/* Month 2 + Lead */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-md text-gray-700 font-semibold mb-2 block">
              Month 2
            </label>
            <select
              value={form.monthLeads[1].month}
              onChange={(e) => handleMonthChange(1, e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500"
            >
              <option value="">Select Month</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-md text-gray-700 font-semibold mb-2 block">
              Lead/Day
            </label>
            <input
              type="number"
              value={form.monthLeads[1].lead}
              onChange={(e) => handleLeadChange(1, e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500"
              placeholder="Enter lead / day"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-md text-gray-700 font-semibold mb-2 block">
              Advisor
            </label>

            <select
              value={form.advisorId ?? ""}
              onChange={handleAdvisorChange}
              required
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500"
            >
              <option value="">Select Advisor</option>

              {zoneAdvisors.map((advisor) => (
                <option key={advisor.id} value={advisor.id}>
                  {advisor.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-md text-gray-700 font-semibold mb-2 block">
              Shift Timing
            </label>

            <input
              value={form.shiftTiming}
              readOnly
              className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900"
            />
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg py-3 transition-colors"
          >
            {editingId !== null ? "Update Entry" : "+ Add Entry"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-semibold rounded-lg px-5"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
