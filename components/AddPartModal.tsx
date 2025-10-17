"use client";
import addInstallation from "@/app/actions/addInstallation";
import {
  fetchManufacturers,
  fetchPartsType,
  fetchPartStatus,
  addManufacturer,
} from "@/utils/requestsClient";
import {
  Package,
  DollarSign,
  Calendar,
  Weight,
  Link as LinkIcon,
  Settings,
  Plus,
  Minus,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import addPart from "@/app/actions/addPart";
import ManufacturerForm from "./ManufacturerForm";
import { Button } from "./ui/button";
import { useEscapeToCloseModal } from "@/hooks/useEscapeToCloseModal";
import CustomSelect from "./ui/CustomSelect";
import StyledCheckbox from "./ui/StyledCheckbox";
import { SimpleModernInput } from "./ui/SimpleModernInput";
import { StateSelector } from "./ui/StateSelector";
import { FormSection } from "./ui/FormSection";
import { useUserProfile } from "@/contexts/UserProfileContext";
import {
  formatDateForForm,
  getCurrencyLabel,
  getWeightUnitLabel,
} from "@/utils/partFormUtils";
import toast from "react-hot-toast";

type ModalProps = {
  showCloseButton?: boolean;
  bike?: Bike;
  bikes?: Bike[];
  manufacturers?: Manufacturer[];
  partsType?: PartsType[];
  partStatus?: PartStatus[];
};

const AddPartModal: React.FC<ModalProps> = ({
  showCloseButton = true,
  bike = null,
  bikes = [],
  manufacturers: manufacturersProp = [],
  partsType: partsTypeProp = [],
  partStatus: partStatusProp = [],
}) => {
  const [manufacturers, setManufacturers] =
    useState<Manufacturer[]>(manufacturersProp);
  const [PartStatus, setPartStatus] = useState<PartStatus[]>(partStatusProp);
  const [partsType, setPartsType] = useState<PartsType[]>(partsTypeProp);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBikeId, setSelectedBikeId] = useState("");
  const [showManufacturerInput, setShowManufacturerInput] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [bikeDropdownOpen, setBikeDropdownOpen] = useState(false);
  const [manufacturerDropdownOpen, setManufacturerDropdownOpen] =
    useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [isSecondhand, setIsSecondhand] = useState<boolean>(false);
  const [formFields, setFormFields] = useState({
    name: "",
    year: "",
    price: "",
    purchase_date: "",
    weight: "",
    sell_price: "",
    shop_url: "",
    installed_at: "",
  });
  const { userProfile } = useUserProfile();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const formattedDate = formatDateForForm();
    setFormFields((prev) => ({ ...prev, installed_at: formattedDate }));

    // Set initial bike if provided
    if (bike?.id) {
      setSelectedBikeId(bike.id);
    }
  }, [bike?.id]);

  useEffect(() => {
    const fetchData = async () => {
      if (status === "authenticated") {
        // Only fetch data if not provided as props
        if (manufacturersProp.length === 0) {
          const fetchedManufacturers = await fetchManufacturers();
          setManufacturers(fetchedManufacturers);
        }

        if (partStatusProp.length === 0) {
          const fetchedPartStatus = await fetchPartStatus();
          setPartStatus(fetchedPartStatus);
        }

        if (partsTypeProp.length === 0) {
          const fetchedPartsType = await fetchPartsType();
          setPartsType(fetchedPartsType);
        }
      }
    };

    fetchData().catch((error) => {
      console.error("Error fetching bikes: ", error);
    });
  }, [
    status,
    isModalOpen,
    manufacturersProp.length,
    partStatusProp.length,
    partsTypeProp.length,
  ]);

  const resetForm = () => {
    const formattedDate = formatDateForForm();

    setFormFields({
      name: "",
      year: "",
      price: "",
      purchase_date: "",
      weight: "",
      sell_price: "",
      shop_url: "",
      installed_at: formattedDate,
    });
    setSelectedManufacturer("");
    setSelectedType("");
    setSelectedStatus("");
    setSelectedBikeId(bike?.id || "");
    setIsSecondhand(false);
  };

  const handleSubmit = async (formData: FormData) => {
    // Validate required fields that aren't enforced by hidden inputs
    if (!selectedStatus) {
      toast.error("Please select a status for the part");
      return;
    }

    if (!selectedManufacturer) {
      toast.error("Please select a manufacturer");
      return;
    }

    if (!selectedType) {
      toast.error("Please select a part type");
      return;
    }

    // Validate bike selection if adding an installation
    if (bike && !selectedBikeId) {
      toast.error("Please select a bike");
      return;
    }

    try {
      if (bike) {
        await addInstallation(formData);
      } else {
        await addPart(formData);
      }

      // Close modal on success
      setIsModalOpen(false);

      // Reset form
      resetForm();

      // Show success message
      toast.success("Part added successfully!");

      // Navigate and refresh data
      if (bike) {
        router.push(`/bikes/${bike.id}`);
      } else {
        router.push("/parts");
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add part. Please try again.");
    }
  };

  const closeModal = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleBikeChange = (bikeId: string) => {
    setSelectedBikeId(bikeId);
  };

  const replaceManufacturerDropdownWithInputField = (): void => {
    setShowManufacturerInput(!showManufacturerInput);
  };

  const handleManufacturerAdded = async (manufacturer: {
    name: string;
    country: string;
    url?: string;
  }) => {
    try {
      // Add manufacturer to database
      const newManufacturer = await addManufacturer(manufacturer);

      // Add to manufacturers list
      setManufacturers((prev) => [...prev, newManufacturer]);

      // Go back to dropdown view
      setShowManufacturerInput(false);
    } catch (error) {
      console.error("Error adding manufacturer:", error);
      toast.error("Failed to add manufacturer. Please try again.");
    }
  };

  // Handle ESC key press to close modal and prevent body scrolling
  useEscapeToCloseModal(isModalOpen, () => setIsModalOpen(false));

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="default"
        size="default"
        type="button"
      >
        <Plus strokeWidth={2} size={20} className="mr-2" />
        Add new part
      </Button>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
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
                  <h2 className="text-2xl font-bold text-gray-900">Add Part</h2>
                  <p className="text-sm text-gray-500">
                    Create a new bike part
                  </p>
                </div>
              </div>
              {showCloseButton && (
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <form id="add-part-form" action={handleSubmit}>
                <input type="hidden" name="bike" value={selectedBikeId} />
                <input
                  type="hidden"
                  name="manufacturer"
                  value={selectedManufacturer}
                />
                <input type="hidden" name="type" value={selectedType} />
                <input
                  type="hidden"
                  name="part_status"
                  value={selectedStatus}
                />
                <input
                  type="hidden"
                  name="secondhand"
                  value={isSecondhand.toString()}
                />

                <div className="space-y-4">
                  {/* Basic Information Card */}
                  <FormSection
                    title="Basic Information"
                    icon={Package}
                    gradient="gray"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bike */}
                      {bikes && bikes.length > 0 && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Bike{" "}
                            <span className="text-gray-500 text-xs font-normal">
                              (optional)
                            </span>
                          </label>
                          <CustomSelect
                            options={bikes}
                            selectedValue={selectedBikeId}
                            onSelect={handleBikeChange}
                            placeholder="Select bike"
                            isOpen={bikeDropdownOpen}
                            setIsOpen={setBikeDropdownOpen}
                            getDisplayText={(bike) => bike.name}
                            allowEmpty={!bike}
                          />
                        </div>
                      )}

                      {/* Manufacturer */}
                      <div className="md:col-span-2">
                        {showManufacturerInput ? (
                          <ManufacturerForm
                            manufacturers={manufacturers}
                            onBack={() => setShowManufacturerInput(false)}
                            onManufacturerAdded={handleManufacturerAdded}
                          />
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Manufacturer
                            </label>
                            <CustomSelect
                              options={manufacturers}
                              selectedValue={selectedManufacturer}
                              onSelect={setSelectedManufacturer}
                              placeholder="Select manufacturer"
                              isOpen={manufacturerDropdownOpen}
                              setIsOpen={setManufacturerDropdownOpen}
                              getDisplayText={(manufacturer) =>
                                manufacturer.name
                              }
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
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Type
                        </label>
                        <CustomSelect
                          options={partsType}
                          selectedValue={selectedType}
                          onSelect={setSelectedType}
                          placeholder="Select type of part"
                          isOpen={typeDropdownOpen}
                          setIsOpen={setTypeDropdownOpen}
                          getDisplayText={(type) => type.name}
                        />
                      </div>

                      {/* Model Name */}
                      <SimpleModernInput
                        label="Model name"
                        name="name"
                        value={formFields.name}
                        onChange={(e) =>
                          setFormFields((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                        className="md:col-span-2"
                      />

                      {/* Model Year */}
                      <SimpleModernInput
                        label="Model year"
                        name="year"
                        type="number"
                        value={formFields.year}
                        onChange={(e) =>
                          setFormFields((prev) => ({
                            ...prev,
                            year: e.target.value,
                          }))
                        }
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                        icon={Calendar}
                      />

                      {/* Weight */}
                      <SimpleModernInput
                        label={`Weight ${getWeightUnitLabel(
                          userProfile?.weight_unit
                        )}`}
                        name="weight"
                        type="number"
                        value={formFields.weight}
                        onChange={(e) =>
                          setFormFields((prev) => ({
                            ...prev,
                            weight: e.target.value,
                          }))
                        }
                        min="0"
                        required
                        icon={Weight}
                      />
                    </div>
                  </FormSection>

                  {/* Pricing & Dates Card */}
                  <FormSection
                    title="Pricing & Dates"
                    icon={DollarSign}
                    gradient="green"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SimpleModernInput
                        label={`Purchase price ${getCurrencyLabel(
                          userProfile?.currency_unit
                        )}`}
                        name="price"
                        type="number"
                        value={formFields.price}
                        onChange={(e) =>
                          setFormFields((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        min="0"
                        step="0.01"
                        required
                        icon={DollarSign}
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Sell price{" "}
                          {getCurrencyLabel(userProfile?.currency_unit)}{" "}
                          <span className="text-gray-500 text-xs font-normal">
                            (optional)
                          </span>
                        </label>
                        <div className="relative">
                          <DollarSign
                            size={16}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                          />
                          <input
                            type="number"
                            name="sell_price"
                            value={formFields.sell_price}
                            onChange={(e) =>
                              setFormFields((prev) => ({
                                ...prev,
                                sell_price: e.target.value,
                              }))
                            }
                            min="0"
                            step="0.01"
                            className="w-full py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-gray-400 transition-all duration-200 pl-12 pr-3"
                          />
                        </div>
                      </div>

                      <SimpleModernInput
                        label="Purchase date"
                        name="purchase_date"
                        type="date"
                        value={formFields.purchase_date}
                        onChange={(e) =>
                          setFormFields((prev) => ({
                            ...prev,
                            purchase_date: e.target.value,
                          }))
                        }
                        required
                        icon={Calendar}
                      />
                    </div>
                  </FormSection>

                  {/* Condition & Status Card */}
                  <FormSection
                    title="Condition & Status"
                    icon={Settings}
                    gradient="blue"
                  >
                    <div className="space-y-4">
                      {/* State Selection */}
                      <StateSelector
                        statuses={PartStatus}
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
                          onChange={setIsSecondhand}
                          showDynamicLabel={true}
                          yesLabel="Secondhand"
                          noLabel="New"
                        />
                      </div>
                    </div>
                  </FormSection>

                  {/* Shop URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Shop URL{" "}
                      <span className="text-gray-500 text-xs font-normal">
                        (optional)
                      </span>
                    </label>
                    <div className="relative">
                      <LinkIcon
                        size={16}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                      />
                      <input
                        type="url"
                        name="shop_url"
                        value={formFields.shop_url}
                        onChange={(e) =>
                          setFormFields((prev) => ({
                            ...prev,
                            shop_url: e.target.value,
                          }))
                        }
                        placeholder="https://shop.example.com/product"
                        className="w-full py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-gray-400 transition-all duration-200 pl-12 pr-3"
                      />
                    </div>
                  </div>

                  {/* Installation Date - Only show when bike is selected */}
                  {selectedBikeId && (
                    <SimpleModernInput
                      label="Installation date"
                      name="installed_at"
                      type="date"
                      value={formFields.installed_at}
                      onChange={(e) =>
                        setFormFields((prev) => ({
                          ...prev,
                          installed_at: e.target.value,
                        }))
                      }
                      required
                      icon={Calendar}
                    />
                  )}
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="px-6 py-2.5"
              >
                Cancel
              </Button>
              <button
                type="submit"
                form="add-part-form"
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Add Part
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddPartModal;
