import { LeadRecord } from "../types";

export interface LeadStatusCounts {
  totalLeadsCount: number;
  newLeads: number;
  rfqLeads: number;
  kycLeads: number;
  hotLeads: number;
  vehnLeads: number;
  lostLeads: number;
  bookLeads: number;
  blankLeads: number;
}

export interface LeadStatusPercentages {
  totalPercentage: string;
  newPercentage: string;
  rfqPercentage: string;
  kycPercentage: string;
  hotPercentage: string;
  vehnPercentage: string;
  lostPercentage: string;
  bookPercentage: string;
  blankPercentage: string;
}

export const calculateLeadStatusCounts = (
  leads: LeadRecord[],
): LeadStatusCounts => {
  const totalLeadsCount = leads.length;

  return {
    totalLeadsCount,
    newLeads: leads.filter((lead) => lead.status === "New").length,
    rfqLeads: leads.filter((lead) => lead.status === "RFQ").length,
    kycLeads: leads.filter((lead) => lead.status === "KYC").length,
    hotLeads: leads.filter((lead) => lead.status === "HOT").length,
    vehnLeads: leads.filter((lead) => lead.status === "Veh-n").length,
    lostLeads: leads.filter((lead) => lead.status === "Lost").length,
    bookLeads: leads.filter((lead) => lead.status === "Book").length,
    blankLeads: leads.filter((lead) => lead.status === "Blank").length,
  };
};

export const calculateLeadStatusPercentages = (
  counts: LeadStatusCounts,
): LeadStatusPercentages => {
  const total = counts.totalLeadsCount;

  const calculatePercentage = (value: number): string => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
  };

  return {
    totalPercentage: total > 0 ? "100.0" : "0.0",
    newPercentage: calculatePercentage(counts.newLeads),
    rfqPercentage: calculatePercentage(counts.rfqLeads),
    kycPercentage: calculatePercentage(counts.kycLeads),
    hotPercentage: calculatePercentage(counts.hotLeads),
    vehnPercentage: calculatePercentage(counts.vehnLeads),
    lostPercentage: calculatePercentage(counts.lostLeads),
    bookPercentage: calculatePercentage(counts.bookLeads),
    blankPercentage: calculatePercentage(counts.blankLeads),
  };
};

export const STATUS_BADGE_STYLES = {
  total: {
    container:
      "flex items-center bg-black px-4 shadow-md border border-white rounded-md min-w-[140px] h-10 gap-3",
    label: "font-bold text-sm text-white",
    value: "font-extrabold text-md text-white",
    percentage: "text-md font-bold text-white",
  },
  new: {
    container:
      "flex items-center justify-between bg-blue-200 px-4 py-1 shadow-md border rounded-md border-sky-800 min-w-[140px] h-10",
    label: "font-bold text-sm text-black",
    value: "font-extrabold text-md text-black",
    percentage: "text-md font-bold text-black",
  },
  rfq: {
    container:
      "flex items-center justify-between bg-blue-300 px-4 py-1 shadow-md border rounded-md border-blue-800 min-w-[140px] h-10",
    label: "font-extrabold text-md text-blue-950",
    value: "font-extrabold text-md text-blue-900",
    percentage: "text-md font-bold text-blue-700",
  },
  kyc: {
    container:
      "flex items-center justify-between bg-orange-200 px-4 py-1 shadow-md border rounded-md border-orange-800 min-w-[140px] h-10",
    label: "font-extrabold text-md text-orange-950",
    value: "font-extrabold text-md text-orange-900",
    percentage: "text-md font-bold text-orange-700",
  },
  hot: {
    container:
      "flex items-center justify-between bg-purple-200 px-4 py-1 shadow-md border rounded-md border-purple-800 min-w-[140px] h-10",
    label: "font-extrabold text-md text-purple-950",
    value: "font-extrabold text-md text-purple-900",
    percentage: "text-md font-bold text-purple-700",
  },
  vehn: {
    container:
      "flex items-center justify-between bg-pink-200 px-4 py-1 shadow-md border rounded-md border-pink-900 min-w-[140px] h-10",
    label: "font-extrabold text-md text-pink-950",
    value: "font-extrabold text-md text-pink-900",
    percentage: "text-md font-bold text-pink-700",
  },
  lost: {
    container:
      "flex items-center justify-between bg-red-500 px-4 py-1 shadow-md border rounded-md border-red-600 min-w-[140px] h-10",
    label: "font-bold text-md text-white",
    value: "font-extrabold text-white",
    percentage: "text-md font-bold text-white",
  },
  book: {
    container:
      "flex items-center justify-between bg-green-800 px-4 py-1 shadow-md border rounded-md border-green-800 min-w-[140px] h-10",
    label: "font-extrabold text-md text-white",
    value: "font-extrabold text-md text-white",
    percentage: "text-md font-bold text-white",
  },
};

export interface LeadStatusBadgeProps {
  type: keyof typeof STATUS_BADGE_STYLES;
  label: string;
  value: number;
  percentage: string;
}

export const LeadStatusBadge = ({
  type,
  label,
  value,
  percentage,
}: LeadStatusBadgeProps) => {
  const styles = STATUS_BADGE_STYLES[type];

  return (
    <div className={styles.container}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      <span className={styles.percentage}>({percentage}%)</span>
    </div>
  );
};

export const calculateMonthPickupCounts = (
  leads: LeadRecord[],
  monthValue: string,
): number => {
  return (
    leads?.filter((lead) => {
      if (!lead.pickupDateTime) return false;
      const pickupDate = new Date(lead.pickupDateTime);
      if (isNaN(pickupDate.getTime())) return false;
      const leadMonth = pickupDate.getMonth() + 1;
      return leadMonth === Number(monthValue);
    }).length || 0
  );
};

export interface MonthPickupBadgeProps {
  month: { value: string; label: string };
  count: number;
  isCurrentMonth?: boolean;
}

export const MonthPickupBadge = ({
  month,
  count,
  isCurrentMonth,
}: MonthPickupBadgeProps) => {
  return (
    <div
      className={`text-md font-extrabold rounded-lg border-sky-800 shadow-sm min-w-[90px] h-8 px-3 flex items-center justify-between gap-2 ${
        isCurrentMonth
          ? "bg-blue-600 text-white ring-2 ring-blue-400"
          : "bg-slate-100 text-red-700 border border-red-300"
      }`}
    >
      <span className="text-left">{month.label}</span>
      <span className="text-[16px] font-bold bg-white bg-opacity-20 rounded-full px-2 py-0.5">
        {count}
      </span>
    </div>
  );
};
