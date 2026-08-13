// src/app/components/Master/Vehicles/vehicleMasterDropdown.tsx

// =====================================================
// VARIANT (dropdown me "Name -CODE" format me dikhega)
// =====================================================
export interface VariantOption {
  label: string;
  code: string;
}

export const VARIANT_OPTIONS: VariantOption[] = [
  { label: "Economy", code: "ECO" },
  { label: "Premium New", code: "PRE N" },
  { label: "Premium Plus", code: "PRE P" },
  { label: "Royal", code: "RYL" },
  { label: "Royal VIP", code: "RYL - V" },
  { label: "UC Class", code: "UC Class" },
];

// "Economy -ECO" jaisa combined string banata hai
export const getVariantDisplay = (label: string, code: string): string =>
  `${label} -${code}`;

// Dropdown me dikhane ke liye combined display list
export const VARIANT_DISPLAY_OPTIONS: string[] = VARIANT_OPTIONS.map((v) =>
  getVariantDisplay(v.label, v.code),
);

// "Economy -ECO" select hone par sirf CODE nikaalne ke liye (backend ke liye)
export const getVariantCodeByDisplay = (display: string): string => {
  const found = VARIANT_OPTIONS.find(
    (v) => getVariantDisplay(v.label, v.code) === display,
  );
  return found ? found.code : "";
};

// Backend se CODE aaye (edit form ke case me) to wapas "Economy -ECO" banane ke liye
export const getVariantDisplayByCode = (code: string): string => {
  const found = VARIANT_OPTIONS.find((v) => v.code === code);
  return found ? getVariantDisplay(found.label, found.code) : "";
};

// =====================================================
// MAKE
// =====================================================
export const MAKE_OPTIONS: string[] = [
  "Force Motors",
  "Tata",
  "Ashok Leyland",
  "SML Mahindra",
  "Bharat Benz",
  "Eicher",
  "Volvo",
  "Toyato",
  "Mercedes Benz",
  "Suzuki",
];

export const MODEL_OPTIONS: string[] = [
  "Urbania",
  "Traveller",
  "Mini Bus",
  "Lux Bus",
  "Crysta",
  "Ertiga",
  "Vellfire",
];

// =====================================================
// CATEGORY
// =====================================================
export const CATEGORY_OPTIONS: string[] = [
  "Car",
  "SUV",
  "Lux Car",
  "Lux SUVs",
  "Lux Van",
  "Traveller",
  "Urbania",
  "Mini Bus",
  "Lux Bus",
  "Semi-Sleeper Bus",
  "Sleeper Bus",
  "Bus with Washroom",
];
