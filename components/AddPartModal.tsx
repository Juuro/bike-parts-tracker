"use client";
import addInstallation from "@/app/actions/addInstallation";
import {
  fetchManufacturers,
  fetchPartsType,
  fetchPartStatus,
} from "@/utils/requestsClient";
import { Minus, Plus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import SubmitButton from "./ui/SubmitButton";
import addPart from "@/app/actions/addPart";
import ManufacturerForm from "./ManufacturerForm";
import { Button } from "./ui/button";
import { useEscapeToCloseModal } from "@/hooks/useEscapeToCloseModal";
import CustomSelect from "./ui/CustomSelect";
import StyledCheckbox from "./ui/StyledCheckbox";
import { getCurrencySymbol } from "@/utils/profileUtils";
import { useUserProfile } from "@/contexts/UserProfileContext";

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
  const [selectedDate, setSelectedDate] = useState("");
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
  const { userProfile } = useUserProfile();
  const { data: session, status } = useSession();

  useEffect(() => {
    const today = new Date();
    // TODO: This is wrong between 0 and 1 o'clock during summer time.
    const formattedDate = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    setSelectedDate(formattedDate);

    // Set initial bike if provided
    if (bike?.id) {
      setSelectedBikeId(bike.id);
    }
  }, []);

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

  const handleSubmit = async (formData: FormData) => {
    try {
      if (bike) {
        await addInstallation(formData);
      } else {
        await addPart(formData);
      }
    } catch (error) {
      console.error(error);
    }
    if (bike) {
      redirect(`/bikes/${bike.id}`);
    } else {
      redirect("/parts");
    }
  };

  const closeModal = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsModalOpen(false);
    }
  };

  const handleBikeChange = (bikeId: string) => {
    setSelectedBikeId(bikeId);
  };

  const replaceManufacturerDropdownWithInputField = (): void => {
    setShowManufacturerInput(!showManufacturerInput);
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
          tabIndex={-1}
          aria-hidden="true"
          className="modal-overlay overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-gray-900/50 flex justify-center"
          onClick={closeModal}
        >
          <div className="relative p-4 w-full max-w-prose max-h-full">
            <article
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-part-title"
              className="relative bg-white rounded-lg shadow dark:bg-gray-700"
            >
              <header className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3
                  id="add-part-title"
                  className="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  Add part
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
                  <div className="grid gap-4 mb-4 grid-cols-2 text-left">
                    <div className="col-span-2">
                      <label
                        htmlFor="bike"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Bike
                      </label>
                      <input
                        type="hidden"
                        name="bike"
                        value={selectedBikeId}
                        required={bike ? true : false}
                      />
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
                              title="Add new manufacturer"
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
                        id="price"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="399"
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
                      {PartStatus.length === 0 ? (
                        <p className="text-gray-500">No part status found</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {PartStatus.map((status) => (
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
                        min="1"
                        id="sell_price"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="299"
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
                        required
                      />
                    </div>
                    {selectedBikeId && (
                      <div className="col-span-1">
                        <label
                          htmlFor="installed_at"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Installation date
                        </label>
                        <input
                          type="date"
                          name="installed_at"
                          id="installed_at"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder=""
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </div>
                  <SubmitButton text="Add new part" />
                </form>
              </div>
            </article>
          </div>
        </div>
      )}
    </>
  );
};

export default AddPartModal;
