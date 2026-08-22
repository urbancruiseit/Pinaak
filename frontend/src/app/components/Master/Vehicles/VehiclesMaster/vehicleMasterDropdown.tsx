export interface VariantOption {
  label: string;
  code: string;
}

export interface AmenityOption {
  code: string;
  label: string;
}

export interface AmenityCategory {
  label: string;
  options: AmenityOption[];
}

export const VARIANT_OPTIONS: VariantOption[] = [
  { code: "ECO", label: "Economy" },
  { code: "PRE N", label: "Premium New" },
  { code: "PRE P", label: "Premium Plus" },
  { code: "RYL", label: "Royal" },
  { code: "RYL - V", label: "Royal VIP" },
  { code: "UC Class", label: "UC Class" },
];

// "Economy -ECO" jaisa combined string banata hai
export const getVariantDisplay = (label: string, code: string): string =>
  `${code} - ${label}`;

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
  "Ashok Leyland",
  "Bharat Benz",
  "Eicher",
  "Force Motors",
  "Mercedes Benz",
  "SML Mahindra",
  "Suzuki",
  "Tata",
  "Toyato",
  "Volvo",
];

export const MODEL_OPTIONS: string[] = [
  "Crysta",
  "Ertiga",
  "Lux Bus",
  "Mini Bus",
  "Traveller",
  "Urbania",
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
  "Caravan",
];

export const AMENITIES_OPTIONS: AmenityCategory[] = [
  {
    label: "Body Type",
    options: [
      { code: "MOD", label: "Modified" },
      { code: "RAW", label: "Rohit Auto Wheel" },
      { code: "RCE", label: "RCE" },
      { code: "SYN", label: "Synaty" },
      { code: "BUS", label: "Sheena" },
    ],
  },

  {
    label: "Seats",
    options: [
      { code: "NRS", label: "Non-Recline Seat" },
      { code: "RS", label: "Recline Seats" },
      { code: "VIP RS", label: "VIP Maharaja Recline Seat" },
      { code: "NSB", label: "No Seat Belts" },
      { code: "SB", label: "Seat Belts" },
      { code: "3SB", label: "3 Point Seat Belts" },
      { code: "ESM", label: "Electronic Seat Massager" },
      { code: "ESV", label: "Electronic Seat Ventilation" },
      { code: "SS", label: "Semi Sleeper" },
      { code: "HR AR LR", label: "Head Rest, Arm Rest, Leg Rest" },
      { code: "MCP 4/8/12", label: "Mobile Charging Points" },
    ],
  },

  {
    label: "Audio",
    options: [
      { code: "MS", label: "Basic Music System" },
      { code: "MSB", label: "Music System + Bluetooth" },
      { code: "MSBA", label: "Music System + BT + Android Auto" },
      { code: "SPK", label: "Normal Speakers" },
      { code: "SPK JB / SPK PI", label: "Power Speakers - JBL / Pioneer" },
      {
        code: "SPK JB SUB / SPK PI SUB",
        label: "Power Speakers + JBL / Pioneer + Sub-Woofer",
      },
    ],
  },

  {
    label: "Luggage",
    options: [
      { code: "LRC", label: "Roof Carrier" },
      { code: "LRB", label: "Rear Boot Luggage" },
      { code: "LSB", label: "Side Bottom" },
      { code: "LHD", label: "Head Rack, Inside Cabin Luggage" },
    ],
  },
  {
    label: "Window Type",
    options: [
      { code: "SLG", label: "Sliding Glass" },
      { code: "PKG", label: "Pack Glass" },
      { code: "PKGW", label: "Pack Glass + Small Openable Window" },
    ],
  },

  {
    label: "Curtain Type",
    options: [
      { code: "NC", label: "No Curtains due to Govt." },
      { code: "CR", label: "Cloth or Rexene" },
      { code: "RW", label: "Roller Blinds" },
    ],
  },

  {
    label: "A/C",
    options: [
      { code: "F&R", label: "Front & Rear A/C Vents" },
      { code: "IAV", label: "Individual A/C Vents" },
      { code: "IAVL", label: "Individual A/C Vents + Reading Lights" },
    ],
  },

  {
    label: "Video",
    options: [
      { code: "TV", label: "TV Non-HD" },
      { code: "TVHD", label: "HD TV" },
      { code: "TVHDS", label: "HD Smart TV" },
    ],
  },
];
