"use client";

import deleteInstallation from "@/app/actions/deleteInstallation";
import React from "react";

type DeleteInstallationButtonProps = {
  installationId: string;
};

const DeleteInstallationButton: React.FC<DeleteInstallationButtonProps> = ({
  installationId,
}) => {
  const handleDeleteInstallation = async () => {
    try {
      await deleteInstallation(installationId); // Call the server action
      // Optionally refresh state or show success message here
      console.log("SUCCESS");
    } catch (error) {
      console.error("Error deleting installation:", error);
    }
  };

  return (
    <button
      onClick={handleDeleteInstallation}
      className="mx-5 py-2 px-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
      type="button"
    >
      Remove
    </button>
  );
};

export default DeleteInstallationButton;
