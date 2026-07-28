"use client";

import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Car,
  Layers,
  Hash,
  Tag,
  Users,
  Building2,
  Fingerprint,
} from "lucide-react";
import { vehicles, type Vehiclea } from "@/data/vehicles";

// Extend Vehiclea to include new fields
interface ExtendedVehicle extends Vehiclea {
  category?: string;
  seating?: string;
  modelVariant?: string;
  vendor?: string; // New vendor field
}

interface VehicleAddFormState {
  name: string;
  model: string;
  make: string;
  category: string;
  seating: string;
  modelVariant: string;
  vendor: string; // Added
}

const emptyForm: VehicleAddFormState = {
  name: "",
  model: "",
  make: "",
  category: "",
  seating: "",
  modelVariant: "",
  vendor: "", // Added
};

// Reusable icon-prefixed input field, styled to match the reference design
function Field({
  label,
  required,
  icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600">
          {icon}
        </span>
        <input
          className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
        />
      </div>
    </label>
  );
}

// Section wrapper: green numbered badge + title, light green background
function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
          {number}
        </span>
        <h3 className="text-base font-semibold text-emerald-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function VehicleAddForm() {
  const [formState, setFormState] = useState<VehicleAddFormState>(emptyForm);
  const [submitted, setSubmitted] = useState<ExtendedVehicle[]>([]);

  const nextId = useMemo(() => {
    const catalogMax = vehicles.reduce(
      (acc, vehicle) => Math.max(acc, vehicle.id),
      0,
    );
    const sessionMax = submitted.reduce(
      (acc, vehicle) => Math.max(acc, vehicle.id),
      0,
    );
    return Math.max(catalogMax, sessionMax) + 1;
  }, [submitted]);

  const handleChange =
    (field: keyof VehicleAddFormState) => (value: string) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!formState.name.trim() || !formState.model.trim()) {
      return;
    }

    const newVehicle: ExtendedVehicle = {
      id: nextId,
      name: formState.name.trim(),
      model: formState.model.trim(),
      make: formState.make.trim(),
      category: formState.category.trim(),
      seating: formState.seating.trim(),
      modelVariant: formState.modelVariant.trim(),
      vendor: formState.vendor.trim(), // Added
    };

    setSubmitted((prev) => [newVehicle, ...prev]);
    setFormState(emptyForm);
  };

  return (
    <div className="space-y-6">
      {/* Header banner - same orange style as the reference image */}
      <div className="sticky top-0 z-30 bg-orange-100 p-3 rounded-md shadow-sm">
        <div className="flex justify-between items-center">
          <div className="pl-4 border-l-8 border-orange-500 bg-white px-3 rounded-md shadow-md">
            <h2 className="text-4xl font-bold text-left py-4 text-orange-600">
              Vehicle Master
            </h2>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Section number={1} title="Vehicle Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                label="Vehicle name"
                required
                icon={<Car size={16} />}
                value={formState.name}
                onChange={handleChange("name")}
                placeholder="Eg. Tourist Shuttle"
              />
              <Field
                label="Vendor name"
                icon={<Building2 size={16} />}
                value={formState.vendor}
                onChange={handleChange("vendor")}
                placeholder="Eg. ABC Motors"
              />
              <Field
                label="Category"
                icon={<Tag size={16} />}
                value={formState.category}
                onChange={handleChange("category")}
                placeholder="Eg. Minibus"
              />
              <Field
                label="Seating"
                icon={<Users size={16} />}
                value={formState.seating}
                onChange={handleChange("seating")}
                placeholder="Eg. 16 seats"
              />
              <Field
                label="Make"
                icon={<Fingerprint size={16} />}
                value={formState.make}
                onChange={handleChange("make")}
                placeholder="Eg. Mercedes-Benz"
              />
              <Field
                label="Model"
                required
                icon={<Hash size={16} />}
                value={formState.model}
                onChange={handleChange("model")}
                placeholder="Eg. Sprinter"
              />
              <Field
                label="Model variant"
                icon={<Layers size={16} />}
                value={formState.modelVariant}
                onChange={handleChange("modelVariant")}
                placeholder="Eg. 4x4"
              />
            </div>
          </Section>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-emerald-700"
            >
              Save vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
