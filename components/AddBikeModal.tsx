"use client";
import { fetchDisciplines, fetchCategories } from "@/utils/requestsClient";
import { Plus, X, Bike } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import ModalWrapper from "./ui/ModalWrapper";
import CustomSelect from "./ui/CustomSelect";
import StyledCheckbox from "./ui/StyledCheckbox";
import Link from "next/link";
import addBike from "@/app/actions/addBike";
import { Button } from "./ui/button";
import { useEscapeToCloseModal } from "@/hooks/useEscapeToCloseModal";

type ModalProps = {
  showCloseButton?: boolean;
  buttonText?: string;
  buttonClassName?: string;
};

const AddBikeModal: React.FC<ModalProps> = ({
  showCloseButton = true,
  buttonText = "Add bike",
  buttonClassName,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [disciplineDropdownOpen, setDisciplineDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isEBike, setIsEBike] = useState<boolean>(false);
  const { data: session, status } = useSession();

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
    let bike: Bike | null = null;
    try {
      bike = await addBike(formData);
    } catch (error) {
      console.error(error);
    }
    if (bike) {
      redirect(`/bikes/${bike.id}`);
    } else {
      redirect("/");
    }
  };

  return (
    <>
      {buttonClassName ? (
        <button
          onClick={() => setIsModalOpen(true)}
          className={buttonClassName}
        >
          <div className="bg-blue-600 p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <span>{buttonText}</span>
        </button>
      ) : (
        <Link
          href=""
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center justify-center h-full"
        >
          <span>{buttonText}</span>
          <Plus size={120} />
        </Link>
      )}
      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bike className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add Bike</h2>
                <p className="text-sm text-gray-500">Create a new bike entry</p>
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
            <form id="add-bike-form" action={handleSubmit}>
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
                    className="block mb-2 text-sm font-medium text-gray-700 text-left"
                  >
                    Bike name
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
                    htmlFor="strava_bike"
                    className="block mb-2 text-sm font-medium text-gray-700 text-left"
                  >
                    Strava Bike ID
                    <span className="text-gray-500 ml-1">– optional</span>
                  </label>
                  <input
                    type="text"
                    name="strava_bike"
                    id="strava_bike"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder=""
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
                  <label
                    htmlFor="images"
                    className="block mb-2 text-sm font-medium text-gray-700 text-left"
                  >
                    Images (Select up to 4 images){" "}
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
              form="add-bike-form"
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Bike
            </button>
          </div>
        </div>
      </ModalWrapper>
    </>
  );
};

export default AddBikeModal;
