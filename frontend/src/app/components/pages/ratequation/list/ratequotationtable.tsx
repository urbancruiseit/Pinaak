"use client";

import { useEffect, useState } from "react";
import { Edit, FileText, CheckCircle, Trash2, Eye, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { LeadRecord } from "../../../../../types/types";
import { fetchVehicles } from "@/app/features/vehicle/vehicleSlice";
import { RootState } from "@/app/redux/store";
import { AppDispatch } from "@/app/redux/store";
interface RateQuotationTableProps {
  leadData?: LeadRecord | null;
}

// Quotation type for storing generated quotations
interface Quotation {
  id: string;
  leadData: LeadRecord;
  quotationNumber: string;
  generatedDate: string;
  status: "draft" | "generated" | "sent";
  amount?: number;
}

export default function RateQuotationTable({
  leadData: propLeadData,
}: RateQuotationTableProps) {
  const dispatch = useDispatch<AppDispatch>(); // Type the dispatch properly
  const [leadData, setLeadData] = useState<LeadRecord | null>(null);
  const [quotationStatus, setQuotationStatus] = useState<
    "draft" | "generated" | "sent"
  >("draft");

  // Get vehicle codes from Redux store
  const { vehicleCodes } = useSelector((state: RootState) => state.vehicle);

  // State for storing all generated quotations
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  // Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<LeadRecord | null>(null);

  // View Quotation Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
    null,
  );

  // Vehicle description states
  const [vehicle1Desc, setVehicle1Desc] = useState("");
  const [vehicle2Desc, setVehicle2Desc] = useState("");
  const [vehicle3Desc, setVehicle3Desc] = useState("");

  // Fetch vehicles on component mount
  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  // Load lead from props
  useEffect(() => {
    if (propLeadData) {
      setLeadData(propLeadData);
      localStorage.setItem("selectedLead", JSON.stringify(propLeadData));
    }
  }, [propLeadData]);

  // Load from localStorage (page refresh case)
  useEffect(() => {
    const savedLead = localStorage.getItem("selectedLead");
    if (savedLead && !leadData) {
      setLeadData(JSON.parse(savedLead));
    }

    // Load saved quotations from localStorage
    const savedQuotations = localStorage.getItem("quotations");
    if (savedQuotations) {
      setQuotations(JSON.parse(savedQuotations));
    }
  }, [leadData]);

  // Save quotations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("quotations", JSON.stringify(quotations));
  }, [quotations]);

  // Date formatter
  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString() : "N/A";

  // Format date and time
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format date for display (DD-MMM-YY)
  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
      .replace(/ /g, "-");
  };

  // Format time (HH:MM AM/PM)
  const formatTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get vehicle name from code
  const getVehicleName = (code?: string) => {
    if (!code || !vehicleCodes || vehicleCodes.length === 0) return "N/A";
    const vehicle = vehicleCodes.find((v: { code: string }) => v.code === code);
    return vehicle ? `${vehicle.code} - ${vehicle.name}` : code;
  };

  // Generate unique quotation number
  const generateQuotationNumber = () => {
    const prefix = "QTN";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}-${timestamp}-${random}`;
  };

  // =========================
  // EDIT FUNCTIONS
  // =========================

  const handleEditQuotation = () => {
    if (!leadData) return;
    setEditForm({ ...leadData });

    // Initialize vehicle descriptions from existing data
    setVehicle1Desc((leadData as any).vehicle1Desc || "");
    setVehicle2Desc((leadData as any).vehicle2Desc || "");
    setVehicle3Desc((leadData as any).vehicle3Desc || "");

    setShowEditModal(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    if (!editForm) return;

    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveEdit = () => {
    if (!editForm) return;

    // Add vehicle descriptions to the edit form
    const updatedForm = {
      ...editForm,
      vehicle1Desc,
      vehicle2Desc,
      vehicle3Desc,
    };

    setLeadData(updatedForm);
    localStorage.setItem("selectedLead", JSON.stringify(updatedForm));
    setShowEditModal(false);
  };

  // Handle vehicle change
  const handleVehicleChange = (
    field: "vehicles" | "vehicle2" | "vehicle3",
    value: string,
  ) => {
    if (!editForm) return;

    setEditForm({
      ...editForm,
      [field]: value,
    });
  };

  // =========================
  // GENERATE QUOTATION
  // =========================

  const handleGenerateQuotation = () => {
    if (!leadData) return;

    // Create new quotation object
    const newQuotation: Quotation = {
      id: Date.now().toString(),
      leadData: { ...leadData },
      quotationNumber: generateQuotationNumber(),
      generatedDate: new Date().toISOString(),
      status: "generated",
      amount:
        (leadData as any).amount || Math.floor(Math.random() * 50000) + 20000,
    };

    // Add to quotations list
    setQuotations([newQuotation, ...quotations]);

    // Update current quotation status
    setQuotationStatus("generated");

    alert(`Quotation ${newQuotation.quotationNumber} generated successfully!`);
  };

  // =========================
  // DELETE QUOTATION
  // =========================

  const handleDeleteQuotation = (id: string) => {
    if (confirm("Are you sure you want to delete this quotation?")) {
      setQuotations(quotations.filter((q) => q.id !== id));
    }
  };

  // =========================
  // VIEW QUOTATION DETAILS
  // =========================

  const handleViewQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowViewModal(true);
  };

  // Calculate number of days between pickup and drop
  const calculateDays = (pickup?: string, drop?: string) => {
    if (!pickup || !drop) return 1;
    const start = new Date(pickup);
    const end = new Date(drop);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Current Lead/Quotation Section */}
      {leadData && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 mb-8">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Current Quotation
            </h3>

            <div className="flex items-center gap-3">
              {quotationStatus === "generated" && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                  <CheckCircle size={14} />
                  Generated
                </span>
              )}

              {quotationStatus === "sent" && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                  <CheckCircle size={14} />
                  Sent
                </span>
              )}
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Pickup Date</th>
                  <th className="px-4 py-3">Drop Date</th>
                  <th className="px-4 py-3">Pickup Address</th>
                  <th className="px-4 py-3">Drop Address</th>
                  <th className="px-4 py-3">Itinerary</th>
                  <th className="px-4 py-3">Service Type</th>
                  <th className="px-4 py-3">Passengers</th>
                  <th className="px-4 py-3">Veh. 1</th>
                  <th className="px-4 py-3">Veh. 2</th>
                  <th className="px-4 py-3">Veh. 3</th>
                  <th className="px-4 py-3">Remarks</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {formatDate(leadData.liveorexpiry)}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {leadData.customerName ?? "N/A"}
                  </td>

                  <td className="px-4 py-3">
                    {formatDate(leadData.pickupDateTime)}
                  </td>

                  <td className="px-4 py-3">
                    {formatDate(leadData.dropDateTime)}
                  </td>

                  <td className="px-4 py-3">
                    {leadData.pickupAddress ?? "N/A"}
                  </td>

                  <td className="px-4 py-3">{leadData.dropAddress ?? "N/A"}</td>
                  <td className="px-4 py-3">{leadData.itinerary ?? "N/A"}</td>
                  <td className="px-4 py-3">{leadData.serviceType ?? "N/A"}</td>

                  <td className="px-4 py-3">
                    {leadData.passengerTotal ?? "0"}
                  </td>
                  <td className="px-4 py-3">
                    {getVehicleName(leadData.vehicles)}
                  </td>
                  <td className="px-4 py-3">
                    {getVehicleName(leadData.vehicle2)}
                  </td>
                  <td className="px-4 py-3">
                    {getVehicleName(leadData.vehicle3)}
                  </td>

                  <td className="px-4 py-3">{leadData.remarks ?? "—"}</td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={handleEditQuotation}
                        className="px-3 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Edit
                      </button>

                      <button
                        onClick={handleGenerateQuotation}
                        className="px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center gap-1"
                      >
                        <FileText size={16} />
                        Generate
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= ALL RATE QUOTATIONS TABLE ================= */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          All Rate Quotations ({quotations.length})
        </h3>

        {quotations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3">S.No</th>
                  <th className="px-4 py-3">Quotation No.</th>
                  <th className="px-4 py-3">Generated Date</th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Service Type</th>
                  <th className="px-4 py-3">Pickup Date</th>
                  <th className="px-4 py-3">Drop Date</th>
                  <th className="px-4 py-3">Passengers</th>
                  <th className="px-4 py-3">Amount (₹)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((quotation, index) => (
                  <tr
                    key={quotation.id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{index + 1}</td>
                    <td className="px-4 py-3 font-mono text-blue-600">
                      {quotation.quotationNumber}
                    </td>
                    <td className="px-4 py-3">
                      {formatDateTime(quotation.generatedDate)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {quotation.leadData.customerName ?? "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {quotation.leadData.serviceType ?? "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(quotation.leadData.pickupDateTime)}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(quotation.leadData.dropDateTime)}
                    </td>
                    <td className="px-4 py-3">
                      {quotation.leadData.passengerTotal ?? "0"}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ₹{quotation.amount || 0}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          quotation.status === "sent"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {quotation.status === "sent" ? "Sent" : "Generated"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewQuotation(quotation)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs flex items-center gap-1"
                        >
                          <Eye size={12} />
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteQuotation(quotation.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs flex items-center gap-1"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FileText size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No quotations generated yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Click "Generate" button above to create your first quotation
            </p>
          </div>
        )}
      </div>

      {/* ================= VIEW QUOTATION MODAL (PDF Style) ================= */}
      {showViewModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300 z-10"
            >
              <X size={20} />
            </button>

            {/* Quotation PDF Design */}
            <div className="max-w-5xl mx-auto bg-white">
              {/* HEADER */}
              <div className="flex justify-between p-6 border-b">
                <div>
                  <h1 className="text-3xl font-bold text-red-600">
                    urban cruise
                  </h1>
                  <p className="text-xs font-semibold text-gray-600">
                    Most Preferred Bus Rental Service in INDIA
                  </p>

                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="px-2 py-1 bg-green-100 rounded">
                      Google ★★★★★
                    </span>
                    <span className="px-2 py-1 bg-blue-100 rounded">
                      Facebook
                    </span>
                    <span className="px-2 py-1 bg-red-100 rounded">
                      YouTube
                    </span>
                  </div>
                </div>

                <div className="text-xs text-right">
                  <p className="font-bold">
                    {formatDisplayDate(selectedQuotation.generatedDate)}
                  </p>
                  <p>B-14, Gali No. 10</p>
                  <p>Shashi Garden, Delhi</p>
                  <p>110091, INDIA</p>
                </div>
              </div>

              {/* RATE QUOTATION */}
              <div className="py-1 font-bold text-center text-white bg-green-600">
                RATE QUOTATION - {selectedQuotation.quotationNumber}
              </div>

              {/* GREETING */}
              <div className="p-4 text-sm">
                <p>
                  <strong>
                    Dear Mr./Ms.{" "}
                    {selectedQuotation.leadData.customerName?.split(" ")[0] ||
                      "Customer"}
                  </strong>
                </p>
                <p className="italic font-semibold text-red-600">
                  Greetings from Urban Cruise™
                </p>
                <p>
                  With reference to your enquiry, please find the trip details,
                  vehicle options & pricing.
                </p>
              </div>

              {/* TRAVEL REQUIREMENT */}
              <div className="mx-4 border">
                <div className="px-3 py-1 font-bold text-white bg-green-600">
                  YOUR TRAVEL REQUIREMENT
                </div>

                <div className="grid grid-cols-4 text-xs">
                  <div className="p-2 border">
                    <strong>Pickup Detail</strong>
                    <p>
                      {formatTime(selectedQuotation.leadData.pickupDateTime)}
                    </p>
                    <p className="truncate">
                      {selectedQuotation.leadData.pickupAddress?.split(
                        ",",
                      )[0] || "N/A"}
                    </p>
                  </div>

                  <div className="col-span-2 p-2 font-bold text-center border">
                    {selectedQuotation.leadData.dropAddress?.split(",")[0] ||
                      "Destination"}
                  </div>

                  <div className="p-2 text-right border">
                    <p>{formatTime(selectedQuotation.leadData.dropDateTime)}</p>
                    <p className="truncate">
                      {selectedQuotation.leadData.dropAddress?.split(",")[0] ||
                        "N/A"}
                    </p>
                  </div>

                  <div className="p-2 border">
                    <strong>Travel Date</strong>
                    <p>
                      {formatDisplayDate(
                        selectedQuotation.leadData.pickupDateTime,
                      )}{" "}
                      –{" "}
                      {formatDisplayDate(
                        selectedQuotation.leadData.dropDateTime,
                      )}
                    </p>
                    <p>
                      (
                      {calculateDays(
                        selectedQuotation.leadData.pickupDateTime,
                        selectedQuotation.leadData.dropDateTime,
                      )}{" "}
                      Days)
                    </p>
                  </div>

                  <div className="p-2 border">
                    <strong>Trip Type</strong>
                    <p>
                      {selectedQuotation.leadData.serviceType || "Round Trip"}
                    </p>
                  </div>

                  <div className="p-2 border">
                    <strong>PAX</strong>
                    <p>{selectedQuotation.leadData.passengerTotal || "1"}</p>
                  </div>

                  <div className="p-2 border">
                    <strong>Remarks</strong>
                    <p>{selectedQuotation.leadData.remarks || "—"}</p>
                  </div>
                </div>
              </div>

              {/* VEHICLE OPTIONS */}
              <div className="mx-4 mt-4 border">
                <div className="px-3 py-1 font-bold text-white bg-green-600">
                  VEHICLE OPTIONS & PRICING
                </div>

                <table className="w-full text-xs border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">#</th>
                      <th className="p-2 border">Vehicle Type</th>
                      <th className="p-2 border">No.</th>
                      <th className="p-2 border">Description</th>
                      <th className="p-2 border">Price (₹)</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="p-2 text-center border">1</td>
                      <td className="p-2 border">
                        {getVehicleName(selectedQuotation.leadData.vehicles)}
                      </td>
                      <td className="p-2 text-center border">1</td>
                      <td className="p-2 border">
                        {(selectedQuotation.leadData as any).vehicle1Desc || (
                          <b>PREMIUM</b>
                        )}
                        <br />
                        AC, Reclining Seats, Charging Point
                      </td>
                      <td className="p-2 font-bold text-green-600 border">
                        ₹
                        {selectedQuotation.amount
                          ? selectedQuotation.amount - 5000
                          : 35000}
                      </td>
                    </tr>

                    <tr>
                      <td className="p-2 text-center border">2</td>
                      <td className="p-2 border">
                        {getVehicleName(selectedQuotation.leadData.vehicle2)}
                      </td>
                      <td className="p-2 text-center border">1</td>
                      <td className="p-2 border">
                        {(selectedQuotation.leadData as any).vehicle2Desc || (
                          <b>ROYAL</b>
                        )}
                        <br />
                        Pushback Seats, Music System
                      </td>
                      <td className="p-2 font-bold text-green-600 border">
                        ₹{selectedQuotation.amount || 42000}
                      </td>
                    </tr>

                    <tr>
                      <td className="p-2 text-center border">3</td>
                      <td className="p-2 border">
                        {getVehicleName(selectedQuotation.leadData.vehicle3)}
                      </td>
                      <td className="p-2 text-center border">1</td>
                      <td className="p-2 border">
                        {(selectedQuotation.leadData as any).vehicle3Desc || (
                          <b>PREMIUM+</b>
                        )}
                        <br />
                        Luxury Interior, Premium Seats, WiFi
                      </td>
                      <td className="p-2 font-bold text-green-600 border">
                        ₹
                        {selectedQuotation.amount
                          ? selectedQuotation.amount + 8000
                          : 55000}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* OTHER CHARGES */}
              <div className="p-3 mx-4 mt-4 text-xs border">
                <h3 className="mb-1 font-bold">
                  OTHER CHARGES (if applicable)
                </h3>
                <ul className="pl-5 space-y-1 list-disc">
                  <li>Toll Charges – Included</li>
                  <li>Parking & Police Entry – Not Included</li>
                  <li>Extra KM above 500km – ₹41/km</li>
                  <li>Driver Night Charge – ₹500/night</li>
                </ul>
              </div>

              {/* ITINERARY */}
              {selectedQuotation.leadData.itinerary && (
                <div className="p-3 mx-4 mt-2 text-xs border">
                  <h3 className="mb-1 font-bold">TRIP ITINERARY</h3>
                  <p>{selectedQuotation.leadData.itinerary}</p>
                </div>
              )}

              {/* FOOTER */}
              <div className="flex items-center justify-between p-4 mt-4 text-xs border-t">
                <div>
                  <p className="font-bold text-green-700">
                    RASHMI – +91 86557 15975
                  </p>
                  <p>delhi@urbancruise.in</p>
                  <p>www.urbancruise.in/delhi</p>
                </div>

                <div className="px-4 py-2 font-bold text-red-700 bg-red-100 rounded-full">
                  Pay 20% to Book
                </div>
              </div>

              {/* Print Button */}
              <div className="flex justify-end p-4">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Print Quotation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <h2 className="text-lg font-semibold mb-5">
              Edit Customer Details :-
              <span className="text-blue-600 ml-1">
                {editForm?.customerName || "N/A"}
              </span>
            </h2>

            {/* FORM GRID */}

            <div className="grid grid-cols-3 gap-4">
              {/* Row 1: Customer Name, Pickup Date, Drop Date - 3 columns */}
              <div className="col-span-1">
                <label className="block text-md font-bold text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={editForm.customerName || ""}
                  onChange={handleInputChange}
                  placeholder="Customer Name"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-md font-bold text-gray-700 mb-1">
                  Pickup Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="pickupDateTime"
                  value={
                    editForm.pickupDateTime
                      ? editForm.pickupDateTime.slice(0, 16)
                      : ""
                  }
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-md font-bold text-gray-700 mb-1">
                  Drop Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="dropDateTime"
                  value={
                    editForm.dropDateTime
                      ? editForm.dropDateTime.slice(0, 16)
                      : ""
                  }
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              {/* Row 2: Passengers, Pickup Address, Drop Address - 3 columns */}
              <div className="col-span-1">
                <label className="block text-md font-bold text-gray-700 mb-1">
                  Passengers
                </label>
                <input
                  type="number"
                  name="passengerTotal"
                  value={editForm.passengerTotal || ""}
                  onChange={handleInputChange}
                  placeholder="Passengers"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-md font-bold text-gray-700 mb-1">
                  Pickup Address
                </label>
                <input
                  type="text"
                  name="pickupAddress"
                  value={editForm.pickupAddress || ""}
                  onChange={handleInputChange}
                  placeholder="Pickup Address"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-md font-bold text-gray-700 mb-1">
                  Drop Address
                </label>
                <input
                  type="text"
                  name="dropAddress"
                  value={editForm.dropAddress || ""}
                  onChange={handleInputChange}
                  placeholder="Drop Address"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              {/* Row 3: Service Type, Amount - 2 columns */}
              <div className="col-span-1">
                <label className="block text-md font-bold text-gray-700 mb-1">
                  Service Type
                </label>
                <select
                  name="serviceType"
                  value={editForm.serviceType || ""}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select Trip Type</option>
                  <option value="Local">Local</option>
                  <option value="Outstation">Outstation</option>
                  <option value="Airport Transfer">Airport Transfer</option>
                  <option value="Round Trip">Round Trip</option>
                </select>
              </div>

              {/* Empty div to maintain 3-column grid */}
              <div className="col-span-1"></div>

              {/* Vehicle 1 with Dropdown and Description */}
              <div className="col-span-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-md font-bold text-gray-700 mb-1">
                      Vehicle Type 1
                    </label>
                    <div className="relative group">
                      <select
                        value={editForm.vehicles || ""}
                        onChange={(e) =>
                          handleVehicleChange("vehicles", e.target.value)
                        }
                        className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select Vehicle Type 1</option>
                        {vehicleCodes && vehicleCodes.length > 0 ? (
                          vehicleCodes.map(
                            (
                              vehicle: { code: string; name: string },
                              index: number,
                            ) => (
                              <option
                                key={`${vehicle.code}-type1-${index}`}
                                value={vehicle.code}
                              >
                                {vehicle.code} - {vehicle.name}
                              </option>
                            ),
                          )
                        ) : (
                          <option value="" disabled>
                            No vehicles available
                          </option>
                        )}
                      </select>
                      <FileText
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none"
                        size={20}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-md font-bold text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={vehicle1Desc}
                      onChange={(e) => setVehicle1Desc(e.target.value)}
                      placeholder="Enter vehicle description"
                      className="w-full border rounded-md px-3 py-2"
                      rows={1}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-md font-bold text-gray-700 mb-1">
                      Total Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={(editForm as any).amount || ""}
                      onChange={handleInputChange}
                      placeholder="Total Amount (₹)"
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle 2 with Dropdown and Description */}
              <div className="col-span-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-md font-bold text-gray-700 mb-1">
                      Vehicle Type 2
                    </label>
                    <div className="relative group">
                      <select
                        value={editForm.vehicle2 || ""}
                        onChange={(e) =>
                          handleVehicleChange("vehicle2", e.target.value)
                        }
                        className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select Vehicle Type 2</option>
                        {vehicleCodes && vehicleCodes.length > 0 ? (
                          vehicleCodes.map(
                            (
                              vehicle: { code: string; name: string },
                              index: number,
                            ) => (
                              <option
                                key={`${vehicle.code}-type2-${index}`}
                                value={vehicle.code}
                              >
                                {vehicle.code} - {vehicle.name}
                              </option>
                            ),
                          )
                        ) : (
                          <option value="" disabled>
                            No vehicles available
                          </option>
                        )}
                      </select>
                      <FileText
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none"
                        size={20}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-md font-bold text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={vehicle2Desc}
                      onChange={(e) => setVehicle2Desc(e.target.value)}
                      placeholder="Enter vehicle description"
                      className="w-full border rounded-md px-3 py-2"
                      rows={1}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-md font-bold text-gray-700 mb-1">
                      Total Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={(editForm as any).amount || ""}
                      onChange={handleInputChange}
                      placeholder="Total Amount (₹)"
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle 3 with Dropdown and Description */}
              <div className="col-span-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-md font-bold text-gray-700 mb-1">
                      Vehicle Type 3
                    </label>
                    <div className="relative group">
                      <select
                        value={editForm.vehicle3 || ""}
                        onChange={(e) =>
                          handleVehicleChange("vehicle3", e.target.value)
                        }
                        className="w-full py-2 border bg-white px-12 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select Vehicle Type 3</option>
                        {vehicleCodes && vehicleCodes.length > 0 ? (
                          vehicleCodes.map(
                            (
                              vehicle: { code: string; name: string },
                              index: number,
                            ) => (
                              <option
                                key={`${vehicle.code}-type3-${index}`}
                                value={vehicle.code}
                              >
                                {vehicle.code} - {vehicle.name}
                              </option>
                            ),
                          )
                        ) : (
                          <option value="" disabled>
                            No vehicles available
                          </option>
                        )}
                      </select>
                      <FileText
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none"
                        size={20}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-md font-bold text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={vehicle3Desc}
                      onChange={(e) => setVehicle3Desc(e.target.value)}
                      placeholder="Enter vehicle description"
                      className="w-full border rounded-md px-3 py-2"
                      rows={1}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-md font-bold text-gray-700 mb-1">
                      Total Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={(editForm as any).amount || ""}
                      onChange={handleInputChange}
                      placeholder="Total Amount (₹)"
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Itinerary and Remarks - 2 columns */}
              <div className="col-span-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-md font-bold text-gray-700 mb-1">
                      Itinerary
                    </label>
                    <textarea
                      name="itinerary"
                      value={editForm.itinerary || ""}
                      onChange={handleInputChange}
                      placeholder="Trip Itinerary"
                      className="w-full border rounded-md px-3 py-2"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-md font-bold text-gray-700 mb-1">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={editForm.remarks || ""}
                      onChange={handleInputChange}
                      placeholder="Remarks"
                      className="w-full border rounded-md px-3 py-2"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* BUTTONS */}
            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
