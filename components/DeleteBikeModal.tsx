"use client";

import React, { useState, useEffect } from "react";
import { Trash2, X } from "lucide-react";
import deleteBike from "@/app/actions/deleteBike";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEscapeToCloseModal } from "@/hooks/useEscapeToCloseModal";

type DeleteBikeModalProps = {
  bike: Bike;
  showCloseButton?: boolean;
};

const DeleteBikeModal: React.FC<DeleteBikeModalProps> = ({
  bike,
  showCloseButton = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleDeleteBike = async () => {
    try {
      await deleteBike(bike.id);
      toast.success(`Bike "${bike.name}" deleted successfully`);
      // Redirect to home page after successful deletion
      router.push("/");
    } catch (error) {
      console.error("Error deleting bike:", error);
      toast.error(`Failed to delete bike "${bike.name}". Please try again.`);
    }
  };

  const closeModal = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsModalOpen(false);
    }
  };

  // Handle ESC key press to close modal and prevent body scrolling
  useEscapeToCloseModal(isModalOpen, () => setIsModalOpen(false));

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="destructive"
        size="default"
        type="button"
        title="Delete this bike"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete Bike
      </Button>

      {isModalOpen && (
        <div
          onClick={closeModal}
          className="bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-bike-modal-title"
        >
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="relative w-full max-w-2xl max-h-full">
              <article className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <header className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                  <h3 id="delete-bike-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Bike: {bike.name}
                  </h3>
                  {showCloseButton && (
                    <Button
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
                  <div className="mb-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Trash2 className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Warning: This action cannot be undone
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>Deleting this bike will:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>
                                Permanently remove the bike from your collection
                              </li>
                              <li>
                                Set all currently installed parts to "not for
                                sale" status
                              </li>
                              <li>
                                Remove all installation history for this bike
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteBike}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Bike
                    </Button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteBikeModal;
