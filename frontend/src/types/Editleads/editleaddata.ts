export const SOURCE_OPTIONS = [
  "Call",
  "WA",
  "GAC",
  "GAQ",
  "Email",
  "META",
  "GA",
  "REP-C",
  "REF-C",
];

export const STATUS_OPTIONS = [
  "New",
  "KYC",
  "RFQ",
  "HOT",
  "Book",
  "Veh-n",
  "Lost",
  "Blank",
];

export const CITY_OPTIONS = ["delhi", "gurgoan", "hydrabad", "noida"];

export const SERVICE_TYPE_OPTIONS = [
  "One Way",
  "Pick & Drop",
  "Round Trip",
  "Round Trip Drop",
  "Long Term Lease",
];

export const OCCASION_OPTIONS = [
  "Wedding",
  "Vacation",
  "Pilgrimage",
  "Corporate",
  "Event",
  "Local",
];

export const LOST_REASON_OPTIONS = [
  "Price too high",
  "Found better offer",
  "Cancelled trip",
  "No response",
  "Other",
];

export const TRIP_TYPE_OPTIONS = ["Sightseeing", "Point to Point"];

export const CATEGORY_OPTIONS: Record<string, string[]> = {
  Personal: ["Personal"],
  Corporate: [
    "Company",
    "NGO",
    "Educational Institute",
    "Sporting Company",
    "Government",
  ],
  "Travel Agent": [
    "Travel Agent",
    "Tour Operator",
    "Hotel",
    "Wedding Planner",
    "DMC",
  ],
};

export const DEFAULT_VALUES = {
  smallbaggage: 0,
  mediumbaggage: 0,
  largebaggage: 0,
  airportbaggage: 0,
  totalbaggage: 0,
  petsNumber: 0,
  days: 1,
};
