"use client";
import { fetchDisciplines, fetchCategories } from "@/utils/requestsClient";
import { SquarePen, X, Bike } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import CustomSelect from "./ui/CustomSelect";
import StyledCheckbox from "./ui/StyledCheckbox";
import updateBike from "@/app/actions/updateBike";
import Image from "next/image";
import { Button } from "./ui/button";
import { useEscapeToCloseModal } from "@/hooks/useEscapeToCloseModal";
import toast from "react-hot-toast";
import { isCloudinaryUrl } from "@/utils/cloudinaryUtils";
import ModalWrapper from "./ui/ModalWrapper";

type ModalProps = {
  showCloseButton?: boolean;
  bike?: Bike;
  disciplines?: Discipline[];
  categories?: Category[];
};

const EditBikeModal: React.FC<ModalProps> = ({
  showCloseButton = true,
  bike = null,
  disciplines: disciplinesProp = [],
  categories: categoriesProp = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showManufacturerInput, setShowManufacturerInput] = useState(false);
  const [categories, setCategories] = useState<Category[]>(categoriesProp);
  const [disciplines, setDisciplines] = useState<Discipline[]>(disciplinesProp);
  const [disciplineDropdownOpen, setDisciplineDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>(
    bike?.discipline?.id || ""
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    bike?.category_id || ""
  );
  const [isEBike, setIsEBike] = useState<boolean>(bike?.ebike || false);
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
    setSelectedDiscipline(bike?.discipline?.id || "");
    setSelectedCategory(bike?.category_id || "");
    setIsEBike(bike?.ebike || false);
  }, [isModalOpen, bike]);

  useEffect(() => {
    const fetchData = async () => {
      if (status === "authenticated") {
        // Only fetch data if not provided as props
        if (disciplinesProp.length === 0) {
          const fetchedDiscipline = await fetchDisciplines();
          setDisciplines(fetchedDiscipline);
        }

        if (categoriesProp.length === 0) {
          const fetchedCategory = await fetchCategories();
          setCategories(fetchedCategory);
        }
      }
    };

    fetchData().catch((error) => {
      console.error("Error fetching disciplines: ", error);
    });
  }, [status, isModalOpen, disciplinesProp.length, categoriesProp.length]);

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
      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bike className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Bike</h2>
                <p className="text-sm text-gray-500">{bike?.name}</p>
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
            <form id="edit-bike-form" action={handleSubmit}>
              <input
                type="hidden"
                name="discipline"
                value={selectedDiscipline}
              />
              <input type="hidden" name="category" value={selectedCategory} />
              <input type="hidden" name="ebike" value={isEBike.toString()} />
              <div className="grid gap-4 mb-4 grid-cols-2">
                <div className="col-span-1">
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-700"
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
                    className="block mb-2 text-sm font-medium text-gray-700"
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
                  <CustomSelect
                    label="Discipline"
                    name="discipline"
                    options={disciplines}
                    selectedValue={selectedDiscipline}
                    onSelect={setSelectedDiscipline}
                    isOpen={disciplineDropdownOpen}
                    setIsOpen={setDisciplineDropdownOpen}
                    placeholder="Select discipline"
                    getDisplayText={(discipline) =>
                      `${discipline.name} (${discipline.abbr})`
                    }
                    required
                  />
                </div>

                <div className="col-span-1">
                  <CustomSelect
                    label="Category"
                    name="category"
                    options={categories}
                    selectedValue={selectedCategory}
                    onSelect={setSelectedCategory}
                    isOpen={categoryDropdownOpen}
                    setIsOpen={setCategoryDropdownOpen}
                    placeholder="Select category"
                    getDisplayText={(category) => category.name}
                    required
                  />
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
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Images (Select up to 4 images, 10 MB max. each){" "}
                    <span className="text-gray-500 ml-1">– optional</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Is this an eBike?
                  </label>
                  <StyledCheckbox
                    checked={isEBike}
                    onChange={setIsEBike}
                    showDynamicLabel={true}
                    yesLabel="Yes, it's an eBike"
                    noLabel="No, regular bike"
                  />
                </div>
                <input type="hidden" name="bike_id" value={bike?.id} readOnly />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-8 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-bike-form"
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Update Bike
            </button>
          </div>
        </div>
      </ModalWrapper>
    </>
  );
};

export default EditBikeModal;
