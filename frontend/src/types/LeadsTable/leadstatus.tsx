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
    return total > 0 ? Math.round((value / total) * 100).toString() : "0";
  };

  return {
    totalPercentage: total > 0 ? "100" : "0",
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

const BASE_CONTAINER =
  "flex items-center justify-between px-3 sm:px-4 py-1 shadow-md border rounded-md w-fit max-w-full h-10 whitespace-nowrap flex-shrink-0 gap-3";

export const STATUS_BADGE_STYLES = {
  total: {
    container: `${BASE_CONTAINER} bg-black border-white`,
    label: "font-bold text-sm text-white",
    value: "font-extrabold text-md text-white",
    percentage: "text-md font-bold text-white",
  },
  new: {
    container: `${BASE_CONTAINER} bg-blue-200 border-sky-800`,
    label: "font-bold text-sm text-black",
    value: "font-extrabold text-md text-black",
    percentage: "text-md font-bold text-black",
  },
  kyc: {
    container: `${BASE_CONTAINER} bg-orange-200 border-orange-800`,
    label: "font-extrabold text-md text-orange-950",
    value: "font-extrabold text-md text-orange-900",
    percentage: "text-md font-bold text-orange-700",
  },
  rfq: {
    container: `${BASE_CONTAINER} bg-blue-300 border-blue-800`,
    label: "font-extrabold text-md text-blue-950",
    value: "font-extrabold text-md text-blue-900",
    percentage: "text-md font-bold text-blue-700",
  },
  hot: {
    container: `${BASE_CONTAINER} bg-purple-200 border-purple-800`,
    label: "font-extrabold text-md text-purple-950",
    value: "font-extrabold text-md text-purple-900",
    percentage: "text-md font-bold text-purple-700",
  },
  vehn: {
    container: `${BASE_CONTAINER} bg-pink-200 border-pink-900`,
    label: "font-extrabold text-md text-pink-950",
    value: "font-extrabold text-md text-pink-900",
    percentage: "text-md font-bold text-pink-700",
  },
  lost: {
    container: `${BASE_CONTAINER} bg-red-500 border-red-600`,
    label: "font-bold text-md text-white",
    value: "font-extrabold text-white",
    percentage: "text-md font-bold text-white",
  },
  book: {
    container: `${BASE_CONTAINER} bg-green-800 border-green-800`,
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