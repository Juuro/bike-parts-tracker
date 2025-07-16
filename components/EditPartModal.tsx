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

type ModalProps = {
  showCloseButton?: boolean;
  part: Part;
};

const EditPartModal: React.FC<ModalProps> = ({
  showCloseButton = true,
  part,
}) => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [partStatus, setPartStatus] = useState<PartStatus[]>([]);
  const [partsType, setPartsType] = useState<PartsType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showManufacturerInput, setShowManufacturerInput] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

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
      console.error("Error fetching data: ", error);
    });
  }, [status, isModalOpen]);

  // Handle ESC key press to close modal and prevent body scrolling
  useEscapeToCloseModal(isModalOpen, () => setIsModalOpen(false));

  const handleSubmit = async (formData: FormData) => {
    try {
      await updatePart(formData);
      toast.success("Part updated successfully!");
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
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

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="py-2 px-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
        type="button"
        title="Edit this part"
      >
        <Edit />
      </button>
      {isModalOpen && (
        <div
          className="modal-overlay overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-gray-900/50 flex justify-center"
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

                  <div className="grid gap-4 mb-4 grid-cols-2">
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
                              defaultValue={part.manufacturer.id}
                              required
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            >
                              <option value="" disabled hidden>
                                Select manufacturer
                              </option>
                              {manufacturers.length == 0 ? (
                                <option value="" disabled hidden>
                                  No manufacturers found
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
                        Purchase price
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

                    <fieldset className="col-span-1">
                      <legend className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        State
                      </legend>

                      {partStatus.length == 0 ? (
                        <p>No part status found</p>
                      ) : (
                        partStatus.map((status) => {
                          return (
                            <p key={status.slug}>
                              <input
                                tabIndex={0}
                                name="part_status"
                                type="radio"
                                id={status.slug}
                                value={status.slug}
                                defaultChecked={
                                  part.part_status.slug === status.slug
                                }
                                className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                required
                              />
                              <label
                                htmlFor={status.slug}
                                className="text-sm font-medium text-gray-900 dark:text-gray-300"
                              >
                                {status.name}
                              </label>
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
                        min="0"
                        step="0.01"
                        id="sell_price"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="299"
                        defaultValue={part.sell_price || ""}
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
                        defaultChecked={part.secondhand}
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
                      <select
                        name="type"
                        id="type"
                        defaultValue={part.parts_type.id}
                        required
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      >
                        <option value="" disabled hidden>
                          Select type of part
                        </option>
                        {partsType.length == 0 ? (
                          <option value="" disabled hidden>
                            No part types found
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
                        Weight (g)
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
