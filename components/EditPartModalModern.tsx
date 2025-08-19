"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  X,
  Package,
  DollarSign,
  Calendar,
  Weight,
  Link,
  Settings,
  Edit,
} from "lucide-react";
import SubmitButton from "./ui/SubmitButton";
import updatePart from "@/app/actions/updatePart";
import ManufacturerForm from "./ManufacturerForm";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { useEscapeToCloseModal } from "@/hooks/useEscapeToCloseModal";
import CustomSelect from "./ui/CustomSelect";
import StyledCheckbox from "./ui/StyledCheckbox";
import { SimpleModernInput } from "./ui/SimpleModernInput";
import { StateSelector } from "./ui/StateSelector";
import { getCurrencySymbol } from "@/utils/profileUtils";
import { useUserProfile } from "@/contexts/UserProfileContext";
import {
  fetchManufacturers,
  fetchPartStatus,
  fetchPartsType,
} from "@/utils/requestsClient";

type ModalProps = {
  showCloseButton?: boolean;
  part: Part;
  manufacturers?: Manufacturer[];
  partStatus?: PartStatus[];
  partsType?: PartsType[];
};

const EditPartModalModern: React.FC<ModalProps> = ({
  showCloseButton = true,
  part,
  manufacturers: manufacturersProp = [],
  partStatus: partStatusProp = [],
  partsType: partsTypeProp = [],
}) => {
  const [manufacturers, setManufacturers] =
    useState<Manufacturer[]>(manufacturersProp);
  const [partStatus, setPartStatus] = useState<PartStatus[]>(partStatusProp);
  const [partsType, setPartsType] = useState<PartsType[]>(partsTypeProp);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showManufacturerInput, setShowManufacturerInput] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    part.part_status.slug
  );
  const [manufacturerDropdownOpen, setManufacturerDropdownOpen] =
    useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>(
    part.manufacturer.id
  );
  const [selectedType, setSelectedType] = useState<string>(part.parts_type.id);
  const [isSecondhand, setIsSecondhand] = useState<boolean>(
    part.secondhand || false
  );

  const { userProfile } = useUserProfile();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (
        status === "authenticated" &&
        isModalOpen &&
        manufacturers.length === 0 &&
        partStatus.length === 0 &&
        partsType.length === 0
      ) {
        console.log("🔧 Modal opened - fetching data once");

        // Only fetch data once when modal opens AND data is empty
        try {
          const [fetchedManufacturers, fetchedPartStatus, fetchedPartsType] =
            await Promise.all([
              fetchManufacturers(),
              fetchPartStatus(),
              fetchPartsType(),
            ]);

          console.log("🔧 Fetched manufacturers:", fetchedManufacturers);
          console.log("🔧 Fetched parts types:", fetchedPartsType);

          setManufacturers(fetchedManufacturers || []);
          setPartStatus(fetchedPartStatus || []);
          setPartsType(fetchedPartsType || []);
        } catch (error) {
          console.error("Error fetching dropdown data:", error);
        }
      }
    };

    fetchData();
  }, [status, isModalOpen, manufacturers.length]); // Only fetch when modal opens AND data is empty

  // Handle ESC key press to close modal and prevent body scrolling
  useEscapeToCloseModal(isModalOpen, () => setIsModalOpen(false));

  const handleSubmit = async (formData: FormData) => {
    try {
      formData.set("part_status", selectedStatus);
      formData.set("manufacturer", selectedManufacturer);
      formData.set("type", selectedType);
      formData.set("secondhand", isSecondhand.toString());

      await updatePart(formData);
      toast.success("Part updated successfully!");
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating part:", error);
      toast.error("Failed to update part. Please try again.");
    }
  };

  const handleManufacturerChange = (manufacturerId: string) => {
    setSelectedManufacturer(manufacturerId);
  };

  const handleTypeChange = (typeId: string) => {
    setSelectedType(typeId);
  };

  const replaceManufacturerDropdownWithInputField = (): void => {
    setShowManufacturerInput(!showManufacturerInput);
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const getCurrencyLabel = () => {
    if (!userProfile?.currency_unit) {
      // Fallback to USD symbol while loading or if not set
      return "($)";
    }
    const symbol = getCurrencySymbol(userProfile.currency_unit);
    return `(${symbol})`;
  };

  const getWeightUnitLabel = () => {
    if (!userProfile?.weight_unit) return "(g)";
    const unit = userProfile.weight_unit;
    return `(${unit})`;
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="py-2 px-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm inline-flex justify-center items-center transition-colors"
        type="button"
        title="Edit this part"
      >
        <Edit size={18} />
      </button>
      <div
        className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-300 ${
          isModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="fixed inset-0 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsModalOpen(false)}
        ></div>
        <div className="flex items-center justify-center min-h-full p-4">
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Edit Part
                  </h2>
                  <p className="text-sm text-gray-500">{part.name}</p>
                </div>
              </div>
              {showCloseButton && (
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <form id="edit-part-form" action={handleSubmit}>
                <input type="hidden" name="part_id" value={part.id} />

                <div className="space-y-4">
                  {/* Basic Information Card */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Package className="h-5 w-5 mr-2 text-gray-600" />
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Manufacturer */}
                      <div>
                        {showManufacturerInput ? (
                          <ManufacturerForm manufacturers={manufacturers} />
                        ) : (
                          <div>
                            <CustomSelect
                              label="Manufacturer"
                              name="manufacturer"
                              options={manufacturers}
                              selectedValue={selectedManufacturer}
                              onSelect={handleManufacturerChange}
                              isOpen={manufacturerDropdownOpen}
                              setIsOpen={setManufacturerDropdownOpen}
                              placeholder="Select manufacturer"
                              getDisplayText={(manufacturer) =>
                                manufacturer.name
                              }
                              required
                            />
                            <button
                              type="button"
                              onClick={
                                replaceManufacturerDropdownWithInputField
                              }
                              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                              + Add new manufacturer
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Type */}
                      <div>
                        <CustomSelect
                          label="Type"
                          name="type"
                          options={partsType}
                          selectedValue={selectedType}
                          onSelect={handleTypeChange}
                          isOpen={typeDropdownOpen}
                          setIsOpen={setTypeDropdownOpen}
                          placeholder="Select type"
                          getDisplayText={(type) => type.name}
                          required
                        />
                      </div>

                      {/* Model Name */}
                      <SimpleModernInput
                        label="Model name"
                        name="name"
                        defaultValue={part.name}
                        required
                        className="md:col-span-2"
                      />

                      {/* Model Year */}
                      <SimpleModernInput
                        label="Model year"
                        name="year"
                        type="number"
                        defaultValue={part.model_year || undefined}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                        icon={Calendar}
                      />

                      {/* Weight */}
                      <SimpleModernInput
                        label={`Weight ${getWeightUnitLabel()}`}
                        name="weight"
                        type="number"
                        defaultValue={part.weight || undefined}
                        min="0"
                        icon={Weight}
                      />
                    </div>
                  </div>

                  {/* Pricing & Dates Card */}
                  <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-gray-600" />
                      Pricing & Dates
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SimpleModernInput
                        label={`Purchase price ${getCurrencyLabel()}`}
                        name="price"
                        type="number"
                        defaultValue={part.buy_price || undefined}
                        min="0"
                        step="0.01"
                        icon={DollarSign}
                      />

                      <SimpleModernInput
                        label={`Sell price ${getCurrencyLabel()}`}
                        name="sell_price"
                        type="number"
                        defaultValue={part.sell_price || undefined}
                        min="0"
                        step="0.01"
                        icon={DollarSign}
                      />

                      <SimpleModernInput
                        label="Purchase date"
                        name="purchase_date"
                        type="date"
                        defaultValue={formatDateForInput(part.purchase_date)}
                        required
                        icon={Calendar}
                      />
                    </div>
                  </div>

                  {/* Condition & Status Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-gray-600" />
                      Condition & Status
                    </h3>

                    <div className="space-y-4">
                      {/* State Selection */}
                      <StateSelector
                        statuses={partStatus}
                        selectedStatus={selectedStatus}
                        onStatusChange={setSelectedStatus}
                      />

                      {/* Secondhand Toggle */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Condition
                        </label>
                        <StyledCheckbox
                          checked={isSecondhand}
                          onChange={(checked) => setIsSecondhand(checked)}
                          showDynamicLabel={true}
                          yesLabel="Secondhand"
                          noLabel="New"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shop URL */}
                  <SimpleModernInput
                    label="Shop URL"
                    name="shop_url"
                    type="url"
                    defaultValue={part.shop_url || undefined}
                    placeholder="https://shop.example.com/product"
                    icon={Link}
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5"
              >
                Cancel
              </Button>
              <SubmitButton
                text="Update Part"
                form="edit-part-form"
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditPartModalModern;
