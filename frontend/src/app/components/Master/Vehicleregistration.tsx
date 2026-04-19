import React, { useState } from 'react';

interface Vehicle {
  id: number;
  vehicleId: string;
  registrationNumber: string;
  registrationDate: string;
  make: string;
  model: string;
  variant: string;
  vehicleType: string;
  fuelType: string;
  manufacturingYear: string;
  color: string;
  seatingCapacity: number;
  chassisNumber: string;
  engineNumber: string;
  ownerName: string;
  ownerType: string;
  insurance: {
    policyNumber: string;
    company: string;
    expiryDate: string;
    insuranceCopy: File | null;
  };
  puc: {
    certificateNumber: string;
    expiryDate: string;
    pucCopy: File | null;
  };
  fitness: {
    certificateNumber: string;
    expiryDate: string;
    fitnessCopy: File | null;
  };
  permit: {
    permitNumber: string;
    type: string;
    expiryDate: string;
    permitCopy: File | null;
  };
  roadTax: {
    taxPaid: string;
    expiryDate: string;
    taxCopy: File | null;
  };
  documents: {
    rcCopy: File | null;
    ownershipTransfer: File | null;
    invoice: File | null;
  };
  assignedTo: string;
  status: string;
  location: string;
  purchaseDetails: {
    purchaseDate: string;
    purchasePrice: string;
    sellerName: string;
    sellerContact: string;
  };
  serviceHistory: Array<{
    id: number;
    date: string;
    serviceType: string;
    odometerReading: string;
    cost: string;
    serviceCenter: string;
  }>;
}

const vehicleTypes = [
  'Car', 'SUV', 'MUV', 'Hatchback', 'Sedan', 'Convertible', 
  'Truck', 'Mini Truck', 'Heavy Truck', 'Pickup Truck',
  'Bus', 'Mini Bus', 'Luxury Bus', 'School Bus',
  'Motorcycle', 'Scooter', 'Moped', 'Electric Bike',
  'Van', 'Minivan', 'Ambulance', 'Taxi', 'Tempo'
];

const fuelTypes = ['Petrol', 'Diesel', 'CNG', 'LPG', 'Electric', 'Hybrid'];
const ownerTypes = ['Company Owned', 'Rented', 'Leased', 'Contract'];
const permitTypes = ['National', 'State', 'Tourist', 'Contract Carriage', 'Stage Carriage'];
const statusOptions = ['Active', 'In Service', 'Under Repair', 'Accident', 'Sold', 'Scrapped'];

const VehicleForm: React.FC = () => {
  const [formData, setFormData] = useState<Vehicle>({
    id: 0,
    vehicleId: '',
    registrationNumber: '',
    registrationDate: '',
    make: '',
    model: '',
    variant: '',
    vehicleType: '',
    fuelType: '',
    manufacturingYear: '',
    color: '',
    seatingCapacity: 5,
    chassisNumber: '',
    engineNumber: '',
    ownerName: '',
    ownerType: '',
    insurance: {
      policyNumber: '',
      company: '',
      expiryDate: '',
      insuranceCopy: null,
    },
    puc: {
      certificateNumber: '',
      expiryDate: '',
      pucCopy: null,
    },
    fitness: {
      certificateNumber: '',
      expiryDate: '',
      fitnessCopy: null,
    },
    permit: {
      permitNumber: '',
      type: '',
      expiryDate: '',
      permitCopy: null,
    },
    roadTax: {
      taxPaid: '',
      expiryDate: '',
      taxCopy: null,
    },
    documents: {
      rcCopy: null,
      ownershipTransfer: null,
      invoice: null,
    },
    assignedTo: '',
    status: 'Active',
    location: '',
    purchaseDetails: {
      purchaseDate: '',
      purchasePrice: '',
      sellerName: '',
      sellerContact: '',
    },
    serviceHistory: [],
  });

  const [newService, setNewService] = useState({
    date: '',
    serviceType: '',
    odometerReading: '',
    cost: '',
    serviceCenter: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      const numberValue = parseInt(value) || 0;
      setFormData(prev => ({
        ...prev,
        [name]: numberValue
      }));
    } else if (name.includes('.')) {
      const [parent, child, subchild] = name.split('.');
      
      if (subchild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof Vehicle] as any),
            [child]: {
              ...((prev[parent as keyof Vehicle] as any)[child] as any),
              [subchild]: value
            }
          }
        }));
      } else if (child) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof Vehicle] as any),
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    const [parent, child, subchild] = fieldName.split('.');
    
    if (subchild) {
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Vehicle] as any),
          [child]: {
            ...((prev[parent as keyof Vehicle] as any)[child] as any),
            [subchild]: file
          }
        }
      }));
    } else if (child) {
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Vehicle] as any),
          [child]: file
        }
      }));
    }
  };

  const handleAddService = () => {
    if (newService.date && newService.serviceType) {
      const serviceWithId = {
        ...newService,
        id: Date.now()
      };
      
      setFormData(prev => ({
        ...prev,
        serviceHistory: [...prev.serviceHistory, serviceWithId]
      }));
      
      setNewService({
        date: '',
        serviceType: '',
        odometerReading: '',
        cost: '',
        serviceCenter: '',
      });
    }
  };

  const handleRemoveService = (id: number) => {
    setFormData(prev => ({
      ...prev,
      serviceHistory: prev.serviceHistory.filter(service => service.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Vehicle Form Submitted:', formData);
    // Handle form submission
  };

  const renderFileUpload = (label: string, name: string, accept?: string) => (
    <div>
      <label className="block mb-1 text-sm font-extrabold text-gray-700">
        {label}
      </label>
      <input
        type="file"
        onChange={(e) => handleFileChange(e, name)}
        accept={accept}
        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
  );

  return (
    <div className="p-6 w-[170vh] mx-auto bg-white shadow-2xl rounded-lg">
     
<div className="items-center p-4 mx-auto mb-8 bg-orange-100 rounded-xl w-120 h-14">
        <h2 className="text-3xl font-bold text-center text-orange-600">Vehicle Registration Form</h2>
        <p className="mt-2 text-center text-gray-400">Complete all sections to register a new vehicle</p>
</div>
      <form onSubmit={handleSubmit} className="mt-12 space-y-14">
        {/* Section 1: Basic Vehicle Information */}
        <div className="p-6 border rounded-xl bg-blue-50">
          <h3 className="pb-3 mb-6 text-xl font-semibold text-blue-800 border-b border-blue-200">
            <span className="px-3 py-1 mr-2 text-white bg-blue-600 rounded-md">1</span>
            Basic Vehicle Information
          </h3>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Vendor Name  <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="👤 Enter vendor name"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="🚗 e.g., MH01AB1234"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Registration Date *
              </label>
              <input
                type="date"
                name="registrationDate"
                value={formData.registrationDate}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Company Vehicles *
              </label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="🏭 e.g., Tata, Mahindra, Toyota"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Model *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="🚙 e.g., Innova, XUV700, Safari"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Variant
              </label>
              <input
                type="text"
                name="variant"
                value={formData.variant}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="🔧 e.g., ZX, VX, EX"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Vehicle Type *
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Type</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Fuel Type *
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Fuel Type</option>
                {fuelTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Manufacturing Year *
              </label>
              <input
                type="text"
                name="manufacturingYear"
                value={formData.manufacturingYear}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="📅 e.g., 2023"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Color *
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="🎨 e.g., White, Black, Red"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Seating Capacity *
              </label>
              <input
                type="number"
                name="seatingCapacity"
                value={formData.seatingCapacity}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Chassis Number *
              </label>
              <input
                type="text"
                name="chassisNumber"
                value={formData.chassisNumber}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

           
          </div>
        </div>

        {/* Section 2: Ownership Information */}
        <div className="p-6 border rounded-xl bg-green-50">
          <h3 className="pb-3 mb-6 text-xl font-semibold text-green-800 border-b border-green-200">
            <span className="px-3 py-1 mr-2 text-white bg-green-600 rounded-md">2</span>
            Ownership Information
          </h3>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Owner Name 
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
           
                placeholder="👤 Company or Individual Name"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Owner Type 
              </label>
              <select
                name="ownerType"
                value={formData.ownerType}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Type</option>
                {ownerTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Assigned To
              </label>
              <input
                type="text"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="👨‍🚗 Driver or Department Name"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-extrabold text-gray-700">
                Current Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="📍 Garage, Depot, or Address"
              />
            </div>
          </div>
        </div>
        
        {/* Section 10: Other Documents */}
        <div className="p-6 border rounded-xl bg-gray-50">
          <h3 className="pb-3 mb-6 text-xl font-semibold text-gray-800 border-b border-gray-200">
            <span className="px-3 py-1 mr-2 text-white bg-gray-600 rounded-md">03</span>
            Other Documents
          </h3>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {renderFileUpload("RC Copy *", "documents.rcCopy", "image/*,.pdf")}
            {renderFileUpload("Ownership Transfer", "documents.ownershipTransfer", "image/*,.pdf")}
            {renderFileUpload("Invoice Copy", "documents.invoice", "image/*,.pdf")}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col justify-between gap-4 pt-8 border-t sm:flex-row">
          <div className="text-sm text-gray-500">
            <p>* Required fields must be filled</p>
            <p>Ensure all documents are clear and readable</p>
          </div>
          
          <div className="flex gap-4">
            <button
              type="button"
              className="px-6 py-3 font-extrabold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Save as Draft
            </button>
          
            <button
              type="submit"
              className="px-8 py-3 font-extrabold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
            >
              Register Vehicle
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;