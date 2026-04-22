// AssignSalesModal.tsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/app/redux/store";
import { toast } from "react-toastify";

import {
  fetchTravelAdvisors,
  assignTravelAdvisor,
} from "@/app/features/access/accessSlice";

const AssignSalesModal = ({ isOpen, onClose, leadId, cityId }: any) => {
  const dispatch = useDispatch<AppDispatch>();

  const { advisors, loading, assignLoading } = useSelector(
    (state: RootState) => state.travelAdvisor,
  );
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<number | null>(
    null,
  );

  // 🔥 Fetch advisors by city
  useEffect(() => {
    if (isOpen && cityId) {
      dispatch(fetchTravelAdvisors(cityId));
    }
  }, [isOpen, cityId, dispatch]);

  // 🔥 Assign Handler
  const handleAssign = async () => {
    if (!selectedAdvisorId) {
      toast.warning("Please select advisor first ⚠️");
      return;
    }

    try {
      await dispatch(
        assignTravelAdvisor({
          leadId,
          travelAdvisorId: selectedAdvisorId,
        }),
      ).unwrap();

      toast.success("Assigned Successfully ✅");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Assignment failed ❌");
    }
  };
  if (!isOpen) return null;

  return (
    // 🔥 Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* 🔥 Modal */}
      <div
        className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Assign Travel Advisor
        </h2>

        {/* Loading */}
        {loading && (
          <p className="text-sm text-gray-500">Loading advisors...</p>
        )}

        {/* Empty */}
        {!loading && advisors.length === 0 && (
          <p className="text-sm text-red-500">No advisors found</p>
        )}

        {/* Advisors List */}
        <div className="max-h-60 overflow-y-auto space-y-2">
          {advisors.map((advisor: any) => (
            <label
              key={advisor.id}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition
                ${
                  selectedAdvisorId === advisor.id
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
            >
              <input
                type="radio"
                name="advisor"
                value={advisor.id}
                checked={selectedAdvisorId === advisor.id}
                onChange={() => setSelectedAdvisorId(advisor.id)}
                className="accent-blue-600"
              />

              <span className="text-sm font-medium text-gray-700">
                {advisor.fullName || advisor.name}
              </span>
            </label>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleAssign}
            disabled={!selectedAdvisorId || assignLoading}
            className={`px-4 py-2 text-sm text-white rounded-lg transition
              ${
                !selectedAdvisorId || assignLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {assignLoading ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignSalesModal;
