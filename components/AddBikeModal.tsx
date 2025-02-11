"use client";
import { fetchDisciplines, fetchCategories } from "@/utils/requestsClient";
import { Plus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import SubmitButton from "./SubmitButton";
import Link from "next/link";
import addBike from "@/app/actions/addBike";

type ModalProps = {
  showCloseButton?: boolean;
};

const AddBikeModal: React.FC<ModalProps> = ({ showCloseButton = true }) => {
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
      <Link
        href=""
        onClick={() => setIsModalOpen(true)}
        className="flex flex-col items-center justify-center h-full"
      >
        <span>Add bike</span>
        <Plus size={120} />
      </Link>
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
                  Add bike
                </h3>

                {showCloseButton && (
                  <button
                    type="button"
                    className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    data-modal-hide="authentication-modal"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <X />
                    <span className="sr-only">Close modal</span>
                  </button>
                )}
              </div>

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
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
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
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
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
                        value="true"
                      />
                    </div>
                  </div>
                  <SubmitButton text="Add new bike" />
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddBikeModal;
