"use client";
import { fetchDisciplines, fetchCategories } from "@/utils/requestsClient";
import { Plus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import SubmitButton from "./ui/SubmitButton";
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
  buttonClassName 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const closeModal = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsModalOpen(false);
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
      {isModalOpen && (
        <div
          className="modal-overlay overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-gray-900/50 flex justify-center"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-bike-modal-title"
        >
          <div className="relative p-4 w-full max-w-prose max-h-full">
            <article className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <header className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3
                  id="add-bike-modal-title"
                  className="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  Add bike
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
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left"
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
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left"
                      >
                        Strava Bike ID
                      </label>
                      <input
                        type="text"
                        name="strava_bike"
                        id="strava_bike"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder=""
                        required
                      />
                    </div>

                    <div className="col-span-1">
                      <label
                        htmlFor="discipline"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left"
                      >
                        Discipline
                      </label>
                      <div className="flex items-center">
                        <select
                          name="discipline"
                          id="discipline"
                          defaultValue=""
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
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left"
                      >
                        Category
                      </label>
                      <div className="flex items-center">
                        <select
                          name="category"
                          id="category"
                          defaultValue=""
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
                      <label
                        htmlFor="images"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left"
                      >
                        Images (Select up to 4 images)
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
                      <label
                        htmlFor="ebike"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left"
                      >
                        Is this an eBike?
                      </label>
                      <div className="flex justify-start">
                        <input
                          tabIndex={0}
                          type="checkbox"
                          name="ebike"
                          id="ebike"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          value="true"
                        />
                      </div>
                    </div>
                  </div>
                  <SubmitButton text="Add new bike" />
                </form>
              </div>
            </article>
          </div>
        </div>
      )}
    </>
  );
};

export default AddBikeModal;
