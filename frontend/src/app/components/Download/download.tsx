"use client";

interface DownloadButtonProps {
  selectedMonth: string | null;
  startDate: string;
  endDate: string;
}

export function DownloadButton({
  selectedMonth,
  startDate,
  endDate,
}: DownloadButtonProps) {
  const handleDownloadCSV = async () => {
    const params = new URLSearchParams();
    if (selectedMonth) params.append("month", selectedMonth);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    params.append("format", "csv");

    const response = await fetch(`/api/leads/export?${params.toString()}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = async () => {
    const params = new URLSearchParams();
    if (selectedMonth) params.append("month", selectedMonth);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    params.append("format", "excel");

    const response = await fetch(`/api/leads/export?${params.toString()}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDownloadCSV}
        className="px-4 h-9 text-sm font-semibold rounded-lg shadow-sm bg-green-600 text-white hover:bg-green-700 transition-colors whitespace-nowrap"
      >
        ⬇ CSV
      </button>
      <button
        onClick={handleDownloadExcel}
        className="px-4 h-9 text-sm font-semibold rounded-lg shadow-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
      >
        ⬇ Excel
      </button>
    </div>
  );
}
