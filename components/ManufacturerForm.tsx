import React, { useState } from "react";
import { ArrowLeft, Building2, Globe, Link } from "lucide-react";

type ManufacturerFormProps = {
  manufacturers: Manufacturer[];
  onBack: () => void;
  onManufacturerAdded: (manufacturer: {
    name: string;
    country: string;
    url?: string;
  }) => void;
};

const ManufacturerForm: React.FC<ManufacturerFormProps> = ({
  manufacturers = [],
  onBack,
  onManufacturerAdded,
}) => {
  const [newManufacturer, setNewManufacturer] = useState("");
  const [manufacturerCountry, setManufacturerCountry] = useState("");
  const [manufacturerUrl, setManufacturerUrl] = useState("");

  const handleNewManufacturerChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setNewManufacturer(event.target.value);
    if (
      manufacturers.some(
        (manufacturer) => manufacturer.name === event.target.value
      )
    ) {
      event.target.setCustomValidity("Manufacturer already exists");
    } else {
      event.target.setCustomValidity("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-sm font-medium text-gray-700">
          Add New Manufacturer
        </h4>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to list
        </button>
      </div>

      {/* Form fields */}
      <div className="space-y-3">
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            name="newManufacturer"
            id="newManufacturer"
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Manufacturer name"
            value={newManufacturer}
            onChange={handleNewManufacturerChange}
            required
          />
        </div>

        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            name="manufacturerCountry"
            id="manufacturerCountry"
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Country"
            value={manufacturerCountry}
            onChange={(e) => setManufacturerCountry(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="url"
            name="manufacturerUrl"
            id="manufacturerUrl"
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Website URL (optional)"
            value={manufacturerUrl}
            onChange={(e) => setManufacturerUrl(e.target.value)}
          />
        </div>
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={() => {
          if (newManufacturer.trim() && manufacturerCountry.trim()) {
            onManufacturerAdded({
              name: newManufacturer.trim(),
              country: manufacturerCountry.trim(),
              url: manufacturerUrl.trim() || undefined,
            });
          }
        }}
        disabled={!newManufacturer.trim() || !manufacturerCountry.trim()}
        className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
      >
        Add Manufacturer
      </button>
    </div>
  );
};

export default ManufacturerForm;
