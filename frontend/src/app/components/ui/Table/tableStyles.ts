export const tableStyles = {
  // =====================================================
  // TABLE WRAPPER
  // =====================================================

  wrapper: "w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md",

  // =====================================================
  // SCROLL
  // =====================================================

  scroll: "w-full overflow-x-auto",

  // =====================================================
  // TABLE
  // =====================================================

  table: "w-full min-w-[1500px] border-collapse",

  // =====================================================
  // HEADER
  // =====================================================

  header: "sticky top-0 z-30",

  headerRow: "bg-orange-700 text-left text-sm font-semibold text-white shadow-md",

  // NORMAL HEADER
  headerCell: "whitespace-nowrap bg-orange-700 px-3 py-4 text-left text-sm font-semibold text-white",

  // STICKY # HEADER
  stickyHeaderCell:
    "sticky left-0 z-40 whitespace-nowrap bg-orange-700 px-3 py-4 text-left text-sm font-semibold text-white",

  // =====================================================
  // BODY ROW
  // =====================================================

  row: "group border-b border-slate-100 transition-all duration-200 hover:bg-orange-50 hover:shadow-sm",

  evenRow: "bg-white",

  oddRow: "bg-slate-50/70",

  // =====================================================
  // NORMAL CELL
  // =====================================================

  cell: "whitespace-nowrap px-3 py-3.5 text-sm text-gray-700",

  // =====================================================
  // STICKY FIRST CELL
  // =====================================================

  stickyCell:
    "sticky left-0 z-10 whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-700 transition-colors duration-200",

  stickyEvenCell: "bg-white group-hover:bg-orange-50",

  stickyOddCell: "bg-slate-50 group-hover:bg-orange-50",

  // =====================================================
  // EMPTY
  // =====================================================

  emptyCell: "px-3 py-14 text-center text-gray-500",
};
