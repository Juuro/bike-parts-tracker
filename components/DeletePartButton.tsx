"use client";

import deletePart from "@/app/actions/deletePart";
import React from "react";

type DeletePartButtonProps = {
  installationId: string;
  partId: string;
};

const DeletePartButton: React.FC<DeletePartButtonProps> = ({
  installationId,
  partId,
}) => {
  const handleDeletePart = async () => {
    try {
      await deletePart(installationId, partId); // Call the server action
      // Optionally refresh state or show success message here
      console.log("SUCCESS");
    } catch (error) {
      console.error("Error deleting part:", error);
    }
  };

  return (
    <button
      onClick={handleDeletePart}
      className="mx-5 py-2 px-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
      type="button"
    >
      Delete Part
    </button>
  );
};

export default DeletePartButton;
