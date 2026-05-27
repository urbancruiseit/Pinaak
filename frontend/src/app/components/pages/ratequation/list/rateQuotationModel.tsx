"use client";

import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { AppDispatch } from "@/app/redux/store";
import { fetchVehicles } from "@/app/features/vehicle/vehicleSlice";
import type { LeadRecord } from "../../../../../types/types";

interface RateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadRecord | null;
}

const RateQuotationModel = ({
  isOpen,
  onClose,
  lead,
}: RateQuotationModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<any>(null);

  const [vehicle1Desc, setVehicle1Desc] = useState("");
  const [vehicle2Desc, setVehicle2Desc] = useState("");
  const [vehicle3Desc, setVehicle3Desc] = useState("");

  // Get vehicle codes from Redux store
  const { vehicleCodes } = useSelector((state: RootState) => state.vehicle);

  // Fetch vehicles when modal opens
  useEffect(() => {
    if (isOpen && vehicleCodes.length === 0) {
      dispatch(fetchVehicles());
    }
  }, [isOpen, dispatch, vehicleCodes.length]);

  useEffect(() => {
    if (lead) {
      setFormData({
        ...lead,
        vehicles: (lead as any).vehicles || "",
        vehicle2: (lead as any).vehicle2 || "",
        vehicle3: (lead as any).vehicle3 || "",
        amount1: (lead as any).amount1 || "",
        amount2: (lead as any).amount2 || "",
        amount3: (lead as any).amount3 || "",
      });
      
      // Load existing descriptions if any
      setVehicle1Desc((lead as any).vehicle1Desc || "");
      setVehicle2Desc((lead as any).vehicle2Desc || "");
      setVehicle3Desc((lead as any).vehicle3Desc || "");
    }
  }, [lead]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVehicleChange = (
    field: "vehicles" | "vehicle2" | "vehicle3",
    value: string,
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Helper function to get vehicle name from code
  const getVehicleName = (code?: string) => {
    if (!code || !vehicleCodes || vehicleCodes.length === 0) return "N/A";
    const vehicle = vehicleCodes.find((v: { code: string }) => v.code === code);
    return vehicle ? `${vehicle.code} - ${vehicle.name}` : code;
  };

  const handleSave = () => {
    // Prepare final data with descriptions
    const finalData = {
      ...formData,
      vehicle1Desc,
      vehicle2Desc,
      vehicle3Desc,
    };
    
    console.log("Saved Data =>", finalData);
    // Here you can dispatch an action to save or update the lead
    onClose();
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Edit Rate Quotation :-
            <span className="text-blue-600 ml-2">
              {formData?.fullName || formData?.name || "N/A"}
            </span>
          </h2>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Close
          </button>
        </div>

        {/* Lead Info */}
        <div className="grid grid-cols-3 gap-4 mb-5 bg-slate-100 p-4 rounded-lg">
          <div>
            <strong>Name:</strong> {formData?.customerName || formData?.fullName}
          </div>

          <div>
            <strong>Phone:</strong> {formData?.phone || formData?.mobile}
          </div>

          <div>
            <strong>Pax:</strong> {formData?.passengerTotal}
          </div>

          <div>
            <strong>Pickup:</strong> {formData?.pickupAddress}
          </div>

          <div>
            <strong>Drop:</strong> {formData?.dropAddress}
          </div>
          
          <div>
            <strong>Service Type:</strong> {formData?.serviceType}
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-3 gap-4">
          {/* Vehicle Sections for 1, 2, 3 */}
          {[1, 2, 3].map((num) => {
            const field =
              num === 1 ? "vehicles" : num === 2 ? "vehicle2" : "vehicle3";

            const desc =
              num === 1
                ? vehicle1Desc
                : num === 2
                  ? vehicle2Desc
                  : vehicle3Desc;

            const setDesc =
              num === 1
                ? setVehicle1Desc
                : num === 2
                  ? setVehicle2Desc
                  : setVehicle3Desc;

            // Get current selected vehicle code
            const currentVehicleCode = formData[field] || "";
            
            return (
              <div key={num} className="col-span-3">
                <div className="grid grid-cols-3 gap-4">
                  {/* Vehicle Type */}
                  <div>
                    <label className="block font-bold mb-1">
                      Vehicle Type {num}
                    </label>

                    <div className="relative">
                      <select
                        value={currentVehicleCode}
                        onChange={(e) =>
                          handleVehicleChange(
                            field as "vehicles" | "vehicle2" | "vehicle3",
                            e.target.value,
                          )
                        }
                        className="w-full py-2 border bg-white px-12 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Vehicle Type {num}</option>
                        {vehicleCodes && vehicleCodes.length > 0 ? (
                          vehicleCodes.map(
                            (
                              vehicle: { code: string; name: string },
                              index: number,
                            ) => (
                              <option
                                key={`${vehicle.code}-${num}-${index}`}
                                value={vehicle.code}
                              >
                                {vehicle.code} - {vehicle.name}
                              </option>
                            ),
                          )
                        ) : (
                          <option value="" disabled>
                            Loading vehicles...
                          </option>
                        )}
                      </select>

                      <FileText
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none"
                        size={20}
                      />
                      
                      {/* Display selected vehicle name */}
                      {currentVehicleCode && (
                        <div className="mt-1 text-xs text-green-600">
                          Selected: {getVehicleName(currentVehicleCode)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block font-bold mb-1">Description</label>
                    <textarea
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Enter vehicle description (e.g., AC, Non-AC, Model year, etc.)"
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block font-bold mb-1">
                      Total Amount (₹)
                    </label>
                    <input
                      type="number"
                      name={`amount${num}`}
                      value={formData[`amount${num}`] || ""}
                      onChange={handleInputChange}
                      placeholder="Total Amount (₹)"
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Rate Quotation
          </button>
        </div>
      </div>
    </div>
  );
};

export default RateQuotationModel;