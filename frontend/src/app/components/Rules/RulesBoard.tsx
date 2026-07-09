"use client";

import { useEffect, useState } from "react";
import EntryForm, { Entry, EntryType, EntryPayload } from "./Entryform";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Users,
  BarChart3,
  X,
  Target,
  AlertTriangle,
  CheckCircle2,
  Zap,
  BarChart,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  fetchRuleEntries,
  createRuleEntry,
  updateRuleEntry,
  deleteRuleEntry,
} from "@/app/features/Rules/rulesSlice";

type MonthEntry = {
  time?: string;
  name: string;
  lead: number;
};

type MonthColumn = {
  key: string;
  label: string;
  isCurrent: boolean;
};

function getMonthColumns(count = 2): MonthColumn[] {
  const now = new Date();
  const cols: MonthColumn[] = [];

  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    cols.push({ key, label, isCurrent: i === 0 });
  }

  return cols;
}

const ROW_COLORS = [
  "text-yellow-400",
  "text-cyan-300",
  "text-pink-400",
  "text-lime-300",
  "text-orange-300",
];

/**
 * `entry.monthLeads` holds short month names like "Jan", "Feb" (see MONTHS
 * in Entryform.tsx), while `monthColumns` uses labels like "JUL". Match
 * case-insensitively so the table actually finds the row's data.
 */
function getMonthLead(entry: Entry, columnLabel: string) {
  return entry.monthLeads?.find(
    (ml) => ml.month.toUpperCase() === columnLabel.toUpperCase(),
  );
}

export default function RulesBoard() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | EntryType>("ALL");
  const [showForm, setShowForm] = useState(false);

  // Delete-confirmation + success toast state
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const { entries } = useSelector((state: RootState) => state.rule);

  const monthColumns = getMonthColumns(3);

  useEffect(() => {
    dispatch(fetchRuleEntries());
  }, [dispatch]);

  useEffect(() => {
    document.body.style.overflow =
      showForm || confirmDeleteId !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showForm, confirmDeleteId]);

  // Auto-hide the success toast after 3s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  function handleSubmit(payload: EntryPayload) {
    if (editingId !== null) {
      dispatch(updateRuleEntry({ id: editingId, ...payload }));
      setEditingId(null);
      dispatch(fetchRuleEntries());
    } else {
      dispatch(createRuleEntry(payload));
    }
    setShowForm(false);
  }

  function startEdit(entry: Entry) {
    setEditingId(entry.id);
    setShowForm(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setShowForm(false);
  }

  // Instead of deleting directly, open the confirm dialog
  function requestDelete(id: number) {
    setConfirmDeleteId(id);
  }

  // Called when user clicks "Delete" inside the confirm dialog
  function confirmDelete() {
    if (confirmDeleteId === null) return;
    dispatch(deleteRuleEntry(confirmDeleteId));
    if (editingId === confirmDeleteId) {
      setEditingId(null);
      setShowForm(false);
    }
    setConfirmDeleteId(null);
    setToast("Entry successfully deleted");
  }

  function cancelDelete() {
    setConfirmDeleteId(null);
  }

  function toggleAddForm() {
    setEditingId(null);
    setShowForm(true);
  }

  const visible: Entry[] = (entries || []).filter(
    (e: Entry) => activeFilter === "ALL" || e.type === activeFilter,
  );

  const t20Entries = visible.filter((e) => e.type === "T20");
  const t60Entries = visible.filter((e) => e.type === "T60");

  const editingEntry =
    (entries || []).find((e: Entry) => e.id === editingId) ?? null;

  const totalCount = (entries || []).reduce(
    (sum: number, e: Entry) => sum + (e.lead || 0),
    0,
  );
  const totalEntries = (entries || []).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8 px-4">
      <div className="max-w-full mx-auto">
        <div className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-orange-50 border order-grey-500 rounded-2xl px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-10 bg-orange-600 rounded-full" />
              <div className="p-2 bg-white rounded-xl shadow-sm border border-grey-500">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-orange-700 tracking-tight">
                Enquiry Mgmt Board
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-grey-500 shadow-sm">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-slate-700">
                  {totalEntries}
                </span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-grey-500 shadow-sm">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-slate-700">
                  {totalCount}
                </span>
              </div>

              <div className="flex gap-1 p-1 bg-white rounded-full border border-grey-500 shadow-sm">
                {(["ALL", "T20", "T60"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                      activeFilter === f
                        ? "bg-orange-600 text-white shadow-md shadow-orange-500/25"
                        : "text-slate-600 hover:text-orange-600 hover:bg-orange-50"
                    }`}
                  >
                    {f === "ALL" ? "All" : f === "T20" ? "T-20" : "T-60"}
                  </button>
                ))}
              </div>

              <button
                onClick={toggleAddForm}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-sm font-semibold shadow-md shadow-orange-500/25 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add New Rule
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BoardSection
            title="T-20 Tempo Traveller"
            icon={<Zap className="w-5 h-5 text-white" />}
            gradient="from-orange-500 to-amber-500"
            bgGradient="from-orange-50 to-amber-50/50"
            headerClass="bg-orange-700 text-white"
            tableTheme="orange"
            entries={t20Entries}
            monthColumns={monthColumns}
            onEdit={startEdit}
            onDelete={requestDelete}
            show={activeFilter === "ALL" || activeFilter === "T20"}
          />
          <BoardSection
            title="T-60 Bus"
            icon={<BarChart className="w-5 h-5 text-white" />}
            gradient="from-emerald-500 to-teal-500"
            bgGradient="from-emerald-50 to-teal-50/50"
            headerClass="bg-green-800 text-white"
            tableTheme="green"
            entries={t60Entries}
            monthColumns={monthColumns}
            onEdit={startEdit}
            onDelete={requestDelete}
            show={activeFilter === "ALL" || activeFilter === "T60"}
          />

          {visible.length === 0 && (
            <div className="lg:col-span-2 flex-1 flex flex-col items-center justify-center gap-4 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200 py-16 px-8">
              <div className="p-4 bg-slate-50 rounded-full">
                <Plus className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-600">No any Entry </p>
                <p className="text-sm">No any Entry in this Form</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={cancelEdit}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 w-full max-w-xl max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={cancelEdit}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
            <div className="p-6">
              <EntryForm
                editingEntry={editingEntry}
                onSubmit={handleSubmit}
                onCancel={cancelEdit}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {confirmDeleteId !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={cancelDelete}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Delete this entry?
              </h3>
              <p className="text-sm text-slate-500">
                Are you sure you want to delete this data?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={cancelDelete}
                className="px-5 py-2 rounded-full text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/25 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70]">
          <div className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-full shadow-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
type TableTheme = "orange" | "green";

type ThemeClasses = {
  bg: string;
  borderStrong: string;
  borderSoft: string;
  hover: string;
};

const TABLE_THEME_CLASSES: { orange: ThemeClasses; green: ThemeClasses } = {
  orange: {
    bg: "bg-orange-50/40",
    borderStrong: "border-grey-500",
    borderSoft: "border-grey-500",
    hover: "hover:bg-orange-100/60",
  },
  green: {
    bg: "bg-emerald-50/40",
    borderStrong: "border-grey-500",
    borderSoft: "border-grey-500",
    hover: "hover:bg-emerald-100/60",
  },
};

/**
 * Per-month-column colors so each of the 3 month columns is visually
 * distinct, while still staying within the T-20 (orange) / T-60 (green)
 * family. `header` colors the <th>, `cell` tints the <td> background for
 * that column.
 */
const MONTH_COLUMN_COLORS: Record<
  TableTheme,
  { header: string; cell: string; border: string }[]
> = {
  orange: [
    {
      header: "bg-amber-500 text-white",
      cell: "bg-amber-100",
      border: "border-grey-500",
    },
    {
      header: "bg-orange-600 text-white",
      cell: "bg-orange-100",
      border: "border-grey-500",
    },
    {
      header: "bg-red-500 text-white",
      cell: "bg-red-100",
      border: "border-grey-500",
    },
  ],
  green: [
    {
      header: "bg-emerald-500 text-white",
      cell: "bg-emerald-100",
      border: "border-grey-500",
    },
    {
      header: "bg-teal-600 text-white",
      cell: "bg-teal-100",
      border: "border-grey-500",
    },
    {
      header: "bg-cyan-700 text-white",
      cell: "bg-cyan-100",
      border: "border-grey-500",
    },
  ],
};

function getMonthColor(theme: TableTheme, index: number) {
  const palette = MONTH_COLUMN_COLORS[theme];
  return palette[index % palette.length];
}

function BoardSection({
  title,
  icon,
  gradient,
  bgGradient,
  headerClass,
  tableTheme,
  entries,
  monthColumns,
  onEdit,
  onDelete,
  show,
}: {
  title: string;
  icon: string;
  gradient: string;
  bgGradient: string;
  headerClass: string;
  tableTheme: TableTheme;
  entries: Entry[];
  monthColumns: MonthColumn[];
  onEdit: (e: Entry) => void;
  onDelete: (id: number) => void;
  show: boolean;
}) {
  if (!show) return null;

  const totalCount = entries.reduce((s, e) => s + (e.lead || 0), 0);
  const t = TABLE_THEME_CLASSES[tableTheme];

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden flex-1 flex flex-col transition-all hover:shadow-2xl hover:shadow-slate-200/60">
      <div
        className={`bg-gradient-to-r ${bgGradient} px-6 py-4 border-b border-slate-200/60 `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center text-white shadow-lg`}
            >
              <span className="text-lg">{icon}</span>
            </div>
            <div>
              <h3
                className={`text-lg font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
              >
                {title}
              </h3>
              <p className="flex items-center gap-5 text-md text-slate-500 font-medium">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>{entries.length} Persons</span>
                </span>

                <span className="w-1 h-1 rounded-full bg-slate-400"></span>

                <span className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <span>{totalCount} Leads</span>
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-md font-semibold text-slate-400 bg-white/60 px-3 py-1 rounded-full border border-slate-200/60 backdrop-blur-sm">
              {entries.length}
            </span>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-10">
          <span className="opacity-60">New entry</span>
        </div>
      ) : (
        <div className={`overflow-auto max-h-[420px] ${t.bg}`}>
          <table className={`w-full border-collapse text-center ${t.bg}`}>
            <thead>
              <tr>
                <th className={`border ${t.borderStrong} p-3 ${headerClass}`}>
                  Shift
                </th>
                {monthColumns.map((col, idx) => {
                  const c = getMonthColor(tableTheme, idx);
                  return (
                    <th
                      key={col.key}
                      className={`border ${c.border} p-3 ${c.header}`}
                    >
                      {col.label}
                    </th>
                  );
                })}
                <th
                  className={`border ${t.borderStrong} p-3 w-32 ${headerClass}`}
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {entries.map((e) => (
                <tr
                  key={e.id}
                  className={`${t.bg} ${t.hover} transition-colors`}
                >
                  <td className={`border ${t.borderSoft} p-3 font-semibold `}>
                    {e.shiftTiming}
                  </td>

                  {monthColumns.map((col, idx) => {
                    const ml = getMonthLead(e, col.label);
                    const c = getMonthColor(tableTheme, idx);
                    return (
                      <td
                        key={col.key}
                        className={`border ${c.border} p-3 text-center ${c.cell}`}
                      >
                        {ml ? (
                          <>
                            <span className="font-semibold">
                              {e.advisorName}
                            </span>
                            <span className="text-red-500 font-bold">
                              {" "}
                              ({ml.lead})
                            </span>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                    );
                  })}
                  <td className={`border ${t.borderSoft} p-3`}>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(e)}
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(e.id)}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="border border-slate-300 p-3 text-center font-extrabold bg-white text-slate-800">
                  Total Leads
                </td>
                {monthColumns.map((col) => {
                  const monthTotal = entries.reduce(
                    (sum, e) => sum + (getMonthLead(e, col.label)?.lead || 0),
                    0,
                  );
                  return (
                    <td
                      key={col.key}
                      className="border border-slate-300 p-3 text-center font-bold bg-white text-slate-800"
                    >
                      {monthTotal}
                    </td>
                  );
                })}
                <td className="border border-slate-300 p-3 font-bold bg-white text-slate-800"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
