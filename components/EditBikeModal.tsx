"use client";
import { fetchDisciplines, fetchCategories } from "@/utils/requestsClient";
import { SquarePen, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import SubmitButton from "./ui/SubmitButton";
import updateBike from "@/app/actions/updateBike";
import Image from "next/image";
import { Button } from "./ui/button";
import { useEscapeToCloseModal } from "@/hooks/useEscapeToCloseModal";
import toast from "react-hot-toast";
import { isCloudinaryUrl } from "@/utils/cloudinaryUtils";

type ModalProps = {
  showCloseButton?: boolean;
  bike?: Bike;
};

const EditBikeModal: React.FC<ModalProps> = ({
  showCloseButton = true,
  bike = null,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showManufacturerInput, setShowManufacturerInput] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [initialImages, setInitialImages] = useState<string[]>([]);

  useEffect(() => {
    const imagesArray =
      bike?.images?.split(",").filter((image: string) => image.length > 0) ||
      [];
    setImages(imagesArray);
    setInitialImages(imagesArray);
  }, [isModalOpen]);

  useEffect(() => {
    const fetchData = async () => {
      if (status === "authenticated") {
        const discipline = await fetchDisciplines();
        setDisciplines(discipline);

        const category = await fetchCategories();
        setCategories(category);
      }
    };

    fetchData().catch((error) => {
      console.error("Error fetching disciplines: ", error);
    });
  }, [status, isModalOpen]);

  // Handle ESC key press to close modal and prevent body scrolling
  useEscapeToCloseModal(isModalOpen, () => setIsModalOpen(false));

  const handleSubmit = async (formData: FormData) => {
    try {
      await updateBike(formData);
      toast.success("Bike updated successfully!");
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update bike. Please try again.");
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

  const handleRemoveImage = async (
    index: number,
    image: string
  ): Promise<void> => {
    const remainingImages = [...images];
    remainingImages.splice(index, 1);

    // Update the UI immediately
    setImages(remainingImages);

    // If it's a Cloudinary image, attempt to delete it from Cloudinary
    if (isCloudinaryUrl(image)) {
      try {
        const response = await fetch("/api/upload/bike-image/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl: image }),
        });

        const result = await response.json();
        if (result.success) {
          console.log("Bike image deleted from Cloudinary:", result.message);
        } else {
          console.error("Failed to delete from Cloudinary:", result.error);
          // Continue with removal even if Cloudinary deletion fails
        }
      } catch (error) {
        console.error("Error deleting bike image:", error);
        // Continue with removal even if Cloudinary deletion fails
      }
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="secondary"
        size="default"
        type="button"
      >
        <SquarePen strokeWidth={2} size={20} className="mr-2" />
        Edit bike
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
              aria-labelledby="edit-bike-title"
              className="relative bg-white rounded-lg shadow dark:bg-gray-700"
            >
              <header className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3
                  id="edit-bike-title"
                  className="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  Edit {bike?.name}
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
                  <div className="grid gap-4 mb-4 grid-cols-2">
                    <div className="col-span-1">
                      <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Bike name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder=""
                        defaultValue={bike?.name}
                        required
                      />
                    </div>

                    <div className="col-span-1">
                      <label
                        htmlFor="strava_bike"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Strava Bike ID
                      </label>
                      <input
                        type="text"
                        name="strava_bike"
                        id="strava_bike"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder=""
                        defaultValue={bike?.strava_bike}
                        required
                      />
                    </div>

                    <div className="col-span-1">
                      <label
                        htmlFor="discipline"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Discipline
                      </label>
                      <div className="flex items-center">
                        <select
                          name="discipline"
                          id="discipline"
                          defaultValue={bike?.discipline.id}
                          required
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        >
                          <option value="" disabled hidden>
                            Select discipline
                          </option>
                          {disciplines.length == 0 ? (
                            <option value="" disabled hidden>
                              No disciplines found
                            </option>
                          ) : (
                            disciplines.map((discipline) => {
                              return (
                                <option
                                  key={discipline.id}
                                  value={discipline.id}
                                >
                                  {discipline.name} ({discipline.abbr})
                                </option>
                              );
                            })
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="col-span-1">
                      <label
                        htmlFor="category"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Category
                      </label>
                      <div className="flex items-center">
                        <select
                          name="category"
                          id="category"
                          defaultValue={bike?.category_id}
                          required
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        >
                          <option value="" disabled hidden>
                            Select category
                          </option>
                          {disciplines.length == 0 ? (
                            <option value="" disabled hidden>
                              No categories found
                            </option>
                          ) : (
                            categories.map((category) => {
                              return (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              );
                            })
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center justify-start gap-2">
                        {images?.map((image: string, index: number) => {
                          return (
                            <div key={index} className="relative">
                              <Image
                                src={image}
                                className="rounded-lg object-cover h-24 w-24"
                                width={150}
                                height={150}
                                alt=""
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 bg-white bg-opacity-70 rounded-full p-1 hover:bg-opacity-100 transition-opacity h-6 w-6"
                                onClick={() => handleRemoveImage(index, image)}
                                type="button"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label
                        htmlFor="images"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Images (Select up to 4 images, 10 MB max. each)
                      </label>
                      <input
                        type="file"
                        id="images"
                        name="images"
                        className="border rounded w-full py-2 px-3"
                        accept="image/*"
                        multiple
                      />
                      <input
                        type="hidden"
                        name="old_images"
                        value={images?.toString()}
                        readOnly
                      />
                      <input
                        type="hidden"
                        name="initial_images"
                        value={initialImages?.toString()}
                        readOnly
                      />
                    </div>

                    <div className="col-span-1">
                      <label
                        htmlFor="ebike"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Is this an eBike?
                      </label>
                      <input
                        tabIndex={0}
                        type="checkbox"
                        name="ebike"
                        id="ebike"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder=""
                        defaultChecked={bike?.ebike}
                        defaultValue="true"
                      />
                    </div>
                    <input
                      type="hidden"
                      name="bike_id"
                      value={bike?.id}
                      readOnly
                    />
                  </div>
                  <SubmitButton text="Confirm edit" />
                </form>
              </div>
            </article>
          </div>
        </div>
      )}
    </>
  );
};

export default EditBikeModal;
