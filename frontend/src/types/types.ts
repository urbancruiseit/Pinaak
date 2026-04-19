export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  status: string;
  priority: string;
  source: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  value: number;
}

export interface SalesPerson {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  leadsCount: number;
  conversionRate: number;
  totalValue: number;
}

export interface SalesTeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  leadsCount: number;
  conversionRate: number;
  totalValue: number;
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  totalValue: number;
  conversionRate: number;
}

export interface FilterOptions {
  location: string;
  salesId: string;
  status: string;
}

export interface LeadRecord {
  aged: any;
  liveorexpiry: any;
  vehicle2: any;
  vehicle3: any;
  vehicles1: any;
  vehicles2: any;
  requirementVehicle: any;
  occasion: any;
  id: string;
  date: string;
  enquiryTime?: string;
  source:
    | "Call"
    | "Email"
    | "WA"
    | "GAC"
    | "GAQ"
    | "META"
    | "GA"
    | "REP-C"
    | "REF-C";
  status: "New" | "KYC" | "RFQ" | "HOT" | "Book" | "Veh-n" | "Lost" | "Blank";
  telecaller: string;
  region: string;
  city: string;
  pickupcity?: string;
  dropcity?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName: string;
  customerType: "Personal" | "Corporate" | "Travel Agent";
  customerCategoryType?: string;
  serviceType?:
    | "One Way"
    | "Pick & Drop"
    | "Round Trip"
    | "Long Term Lease"
    | "Round Trip Drop"
    | "Wedding"
    | "Vacation"
    | "Pilgrimage"
    | "Corporate"
    | "Local";
  occasionType?: string;
  tripType: "pickup" | "drop" | "both" | "Sightseeing" | "Point to Point";
  pickupDateTime: string;
  dropDateTime?: string;
  pickupAddress?: string;
  dropAddress?: string;
  itinerary?: string[];
  vehicles?: string;
  alternatePhone?: string;
  vehiclevehicle2?: string;
  vehiclevehicle3?: string;
  passengerTotal: number;
  days: number;
  km: number;
  petsNumber?: number;
  petsNames?: string;
  smallBaggage?: number;
  mediumBaggage?: number;
  largeBaggage?: number;
  airportBaggage?: number;
  totalBaggage?: number;
  remarks?: string;
  message?: string;
  lost_reason?: string;
  totalPages: Number;
  countryName?: string;
  lostReasonDetails?: string;
  followUp?: string;
  customerCity?: string;
  customerAddress?: string;
  customerState?: string;
  vehicle3Quantity?: number;
  vehicle2Quantity?: number;
  vehicle1Quantity?: number;
  unwanted_status?: "wanted" | "unwanted";
  state?: string;
  customercity?: string;
  city_id?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName?: string;
  customerCountry?: string;
}
export type UserRole =
  | "user"
  | "admin"
  | "presale"
  | "bdm"
  | "sales"
  | "city manager"
  | "team leader";

export interface User {
  name: string;
  email: string;
  password: string;
  subdepartname_name: string;
  role: UserRole;
  data?: any;
  uuid: string;
}
// types/types.ts
export interface User {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  city_names?: string;
  city_ids?: string;
  // Add other fields as needed
}

export interface countryData {
  id?: number;
  country_name: string;
  country_code: string;
  phone_code: string;
  created_at?: Date;
  data?: any;
}
export interface Vehicle {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at?: string;
}

export interface travelcity {
  id?: number;
  uuid?: string;
  cityName: string;
}

// Add or update these interfaces
export interface City {
  id: number;
  cityName: string;
  state_id: number;
}

export interface State {
  id: number;
  stateName: string;
}

export interface CustomerRecord {
  // Personal Info
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  anniversary: string;
  gender: string;

  // Address Info
  address: string;
  state: string;
  city: string;
  pincode: string;
}

export interface SaleUser {
  id: number;
  name: string;
  role: string;
}
