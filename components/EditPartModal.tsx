"use client";
import {
  fetchManufacturers,
  fetchPartsType,
  fetchPartStatus,
} from "@/utils/requestsClient";
import { X, Edit, Minus, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import SubmitButton from "./ui/SubmitButton";
import updatePart from "@/app/actions/updatePart";
import ManufacturerForm from "./ManufacturerForm";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { useEscapeToCloseModal } from "@/hooks/useEscapeToCloseModal";
import CustomSelect from "./ui/CustomSelect";
import StyledCheckbox from "./ui/StyledCheckbox";
import { getCurrencySymbol } from "@/utils/profileUtils";
import { useUserProfile } from "@/contexts/UserProfileContext";

type ModalProps = {
  showCloseButton?: boolean;
  part: Part;
  manufacturers?: Manufacturer[];
  partsType?: PartsType[];
  partStatus?: PartStatus[];
};

const EditPartModal: React.FC<ModalProps> = ({
  showCloseButton = true,
  part,
  manufacturers: manufacturersProp = [],
  partsType: partsTypeProp = [],
  partStatus: partStatusProp = [],
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
      console.error("Error fetching data: ", error);
    });
  }, [
    status,
    manufacturersProp.length,
    partStatusProp.length,
    partsTypeProp.length,
  ]);

  // Handle ESC key press to close modal and prevent body scrolling
  useEscapeToCloseModal(isModalOpen, () => setIsModalOpen(false));

  const handleSubmit = async (formData: FormData) => {
    try {
      await updatePart(formData);
      toast.success("Part updated successfully!");
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update part. Please try again.");
    }
  };

  const closeModal = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsModalOpen(false);
    }
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

  const getStatusColor = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case "installed":
        return "bg-green-100 text-green-800 border-green-200";
      case "available":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "broken":
        return "bg-red-100 text-red-800 border-red-200";
      case "sold":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const StatusTag = ({
    status,
    isSelected,
    onClick,
  }: {
    status: PartStatus;
    isSelected: boolean;
    onClick: () => void;
  }) => {
    const baseClasses =
      "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition-all duration-200 hover:scale-105";
    const selectedClasses = isSelected
      ? "bg-blue-600 text-white border-blue-600 shadow-lg font-semibold"
      : "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100";

    return (
      <button
        type="button"
        className={`${baseClasses} ${selectedClasses}`}
        onClick={onClick}
      >
        {status.name}
      </button>
    );
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
      {isModalOpen && (
        <div
          className="modal-overlay overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-gray-900/50 flex"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-part-modal-title"
        >
          <div className="relative p-4 w-full max-w-prose max-h-full">
            <article className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <header className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3
                  id="edit-part-modal-title"
                  className="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  Edit part
                </h3>

                {showCloseButton && (
                  <Button
                    type="button"
                    variant="close"
                    size="close"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <X />
                    <span className="sr-only">Close modal</span>
                  </Button>
                )}
              </header>

              <div className="p-4 md:p-5">
                <form action={handleSubmit}>
                  <input type="hidden" name="part_id" value={part.id} />

                  <div className="grid gap-4 mb-4 grid-cols-2 text-left">
                    <div className="col-span-2">
                      <label
                        htmlFor="manufacturer"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Manufacturer
                      </label>
                      <div className="flex items-center">
                        {!showManufacturerInput && (
                          <>
                            <input
                              type="hidden"
                              name="manufacturer"
                              value={selectedManufacturer}
                              required
                            />
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
                            <Button
                              type="button"
                              variant="icon"
                              size="icon"
                              title="Add new manufacturer"
                              onClick={
                                replaceManufacturerDropdownWithInputField
                              }
                            >
                              <Plus strokeWidth={3} />
                            </Button>
                          </>
                        )}
                        {showManufacturerInput && (
                          <>
                            <ManufacturerForm manufacturers={manufacturers} />
                            <Button
                              type="button"
                              variant="icon"
                              size="icon"
                              title="Cancel new manufacturer"
                              onClick={
                                replaceManufacturerDropdownWithInputField
                              }
                            >
                              <Minus strokeWidth={3} />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="col-span-1">
                      <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Model name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder=""
                        defaultValue={part.name}
                        required
                      />
                    </div>

                    <div className="col-span-1">
                      <label
                        htmlFor="year"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Model year
                      </label>
                      <input
                        type="number"
                        name="year"
                        min="1910"
                        id="year"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="1985"
                        defaultValue={part.model_year}
                        required
                      />
                    </div>

                    <div className="col-span-1">
                      <label
                        htmlFor="price"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Purchase price {getCurrencyLabel()}
                      </label>
                      <input
                        type="number"
                        name="price"
                        min="0"
                        step="0.01"
                        id="price"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="399"
                        defaultValue={part.buy_price}
                        required
                      />
                    </div>

                    <div className="col-span-1">
                      <label
                        htmlFor="purchase_date"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Purchase date
                      </label>
                      <input
                        type="date"
                        name="purchase_date"
                        id="purchase_date"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder=""
                        defaultValue={formatDateForInput(part.purchase_date)}
                        required
                      />
                    </div>

                    <div className="col-span-1">
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        State
                      </label>
                      {/* Hidden input to store selected status */}
                      <input
                        type="hidden"
                        name="part_status"
                        value={selectedStatus}
                        required
                      />
                      {partStatus.length === 0 ? (
                        <p className="text-gray-500">No part status found</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {partStatus.map((status) => (
                            <StatusTag
                              key={status.slug}
                              status={status}
                              isSelected={selectedStatus === status.slug}
                              onClick={() => setSelectedStatus(status.slug)}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="col-span-1">
                      <label
                        htmlFor="sell_price"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Sell price {getCurrencyLabel()}
                      </label>
                      <input
                        type="number"
                        name="sell_price"
                        min="0"
                        step="0.01"
                        id="sell_price"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="299"
                        defaultValue={part.sell_price || ""}
                      />
                    </div>

                    <div className="col-span-1">
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Secondhand
                      </label>
                      <input
                        type="hidden"
                        name="secondhand"
                        value={isSecondhand ? "true" : "false"}
                      />
                      <StyledCheckbox
                        checked={isSecondhand}
                        onChange={setIsSecondhand}
                        showDynamicLabel={true}
                        yesLabel="Yes"
                        noLabel="No"
                      />
                    </div>

                    <div className="col-span-1">
                      <label
                        htmlFor="shop_url"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Shop url
                      </label>
                      <input
                        type="url"
                        name="shop_url"
                        id="shop_url"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder=""
                        defaultValue={part.shop_url || ""}
                      />
                    </div>

                    <div className="col-span-1">
                      <label
                        htmlFor="type"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Type
                      </label>
                      <input
                        type="hidden"
                        name="type"
                        value={selectedType}
                        required
                      />
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

                    <div className="col-span-1">
                      <label
                        htmlFor="weight"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Weight {getWeightUnitLabel()}
                      </label>
                      <input
                        type="number"
                        name="weight"
                        min="0"
                        id="weight"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder=""
                        defaultValue={part.weight}
                        required
                      />
                    </div>
                  </div>

                  <SubmitButton text="Update part" />
                </form>
              </div>
            </article>
          </div>
        </div>
      )}
    </>
  );
};

export default EditPartModal;
