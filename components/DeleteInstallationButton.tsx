"use client";

import React from "react";
import { PackageMinus } from "lucide-react";
import deleteInstallation from "@/app/actions/deleteInstallation";

type DeleteInstallationButtonProps = {
  installationId: string;
  bikeName: string;
};

const DeleteInstallationButton: React.FC<DeleteInstallationButtonProps> = ({
  installationId,
  bikeName,
}) => {
  const handleDeleteInstallation = async () => {
    try {
      await deleteInstallation(installationId);
    } catch (error) {
      console.error("Error deleting installation:", error);
    }
  };

  return (
    <button
      onClick={handleDeleteInstallation}
      className="py-2 px-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
      type="button"
      title={`Remove this part from ${bikeName}`}
    >
      <PackageMinus />
    </button>
  );
};

export default DeleteInstallationButton;
