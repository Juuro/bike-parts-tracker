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

type ModalProps = {
  showCloseButton?: boolean;
  bike?: Bike;
  bikes?: Bike[];
};

const AddPartModal: React.FC<ModalProps> = ({
  showCloseButton = true,
  bike = null,
  bikes = [],
}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [PartStatus, setPartStatus] = useState<PartStatus[]>([]);
  const [partsType, setPartsType] = useState<PartsType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBikeId, setSelectedBikeId] = useState("");
  const [showManufacturerInput, setShowManufacturerInput] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const today = new Date();
    // TODO: This is wrong between 0 and 1 o'clock during summer time.
    const formattedDate = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    setSelectedDate(formattedDate);

    if (bike) {
      setSelectedBikeId(bike.id);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (status === "authenticated") {
        const manufacturers = await fetchManufacturers();
        setManufacturers(manufacturers);

        const partStatus = await fetchPartStatus();
        setPartStatus(partStatus);

        const partsType = await fetchPartsType();
        setPartsType(partsType);
      }
    };

    fetchData().catch((error) => {
      console.error("Error fetching bikes: ", error);
    });
  }, [status, isModalOpen]);

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

  const handleBikeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBikeId(event.target.value);
  };

  const replaceManufacturerDropdownWithInputField = (): void => {
    setShowManufacturerInput(!showManufacturerInput);
  };

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
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
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
              </div>

              <div className="p-4 md:p-5">
                <form action={handleSubmit}>
                  <div className="grid gap-4 mb-4 grid-cols-2">
                    <div className="col-span-2">
                      <label
                        htmlFor="bike"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Bike
                      </label>
                      <select
                        name="bike"
                        id="bike"
                        defaultValue={bike?.id}
                        required={bike ? true : false}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        onChange={handleBikeChange}
                      >
                        {bike ? (
                          <option value="" disabled hidden>
                            Select bike
                          </option>
                        ) : (
                          <option value="">Not assigned to a bike</option>
                        )}
                        {bikes.length == 0 ? (
                          <option value="" disabled hidden>
                            No bikes found
                          </option>
                        ) : (
                          bikes.map((bike: Bike) => {
                            return (
                              <option key={bike.id} value={bike.id}>
                                {bike.name}
                              </option>
                            );
                          })
                        )}
                      </select>
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
                            <select
                              name="manufacturer"
                              id="manufacturer"
                              defaultValue=""
                              required
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            >
                              <option value="" disabled hidden>
                                Select manufacturer
                              </option>
                              {manufacturers.length == 0 ? (
                                <option value="" disabled hidden>
                                  No parts found
                                </option>
                              ) : (
                                manufacturers.map((manufacturer) => {
                                  return (
                                    <option
                                      key={manufacturer.id}
                                      value={manufacturer.id}
                                    >
                                      {manufacturer.name}
                                    </option>
                                  );
                                })
                              )}
                            </select>
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
                        Purchase price
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
                    <fieldset className="col-span-1">
                      <legend className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        State
                      </legend>

                      {PartStatus.length == 0 ? (
                        <p>No sell status found</p>
                      ) : (
                        PartStatus.map((status) => {
                          return (
                            <p key={status.slug}>
                              <input
                                tabIndex={0}
                                name="part_status"
                                type="radio"
                                id={status.slug}
                                className="mr-2 bg-gray-50 border border-gray-300 text-gray-900 focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600"
                                value={status.slug}
                              />
                              <label htmlFor={status.slug}>{status.name}</label>
                            </p>
                          );
                        })
                      )}
                    </fieldset>

                    <div className="col-span-1">
                      <label
                        htmlFor="sell_price"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Sell price
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
                      <label
                        htmlFor="secondhand"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Secondhand
                      </label>
                      <input
                        tabIndex={0}
                        type="checkbox"
                        name="secondhand"
                        id="secondhand"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder=""
                        value="true"
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
                      <select
                        name="type"
                        id="type"
                        defaultValue=""
                        required
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      >
                        <option value="" disabled hidden>
                          Select type of part
                        </option>
                        {partsType.length == 0 ? (
                          <option value="" disabled hidden>
                            No parts found
                          </option>
                        ) : (
                          partsType.map((type) => {
                            return (
                              <option key={type.id} value={type.id}>
                                {type.name}
                              </option>
                            );
                          })
                        )}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label
                        htmlFor="weight"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Weight
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddPartModal;
