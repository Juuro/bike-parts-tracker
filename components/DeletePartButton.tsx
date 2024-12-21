"use client";

import React, { useEffect } from "react";
import { Trash2 } from "lucide-react";
import deletePart from "@/app/actions/deletePart";
import uninstallInstallation from "@/app/actions/uninstallInstallation";
import Popover from "./Popover";

type DeletePartButtonProps = {
  partStatus?: PartStatus[];
  installationId?: string;
  partId: string;
};

const DeletePartButton: React.FC<DeletePartButtonProps> = ({
  partStatus,
  installationId,
  partId,
}) => {
  const handleDeletePart = async (formData: FormData) => {
    const partStatus = formData.get("part_status") as string;
    try {
      if (installationId) {
        await uninstallInstallation(installationId);
      }
      await deletePart(partId, partStatus);
    } catch (error) {
      console.error("Error deleting part:", error);
    }
  };

  return (
    <Popover
      content={
        <div className="pb-4" role="none">
          <p className="p-3 font-bold text-center">Select status</p>

          {partStatus
            ?.filter((status) => status.available === false)
            .map((status) => (
              <form
                action={handleDeletePart}
                key={status.slug}
                className="border-t last-of-type:border-b"
              >
                <input type="hidden" name="part_id" value={partId} />
                <input type="hidden" name="part_status" value={status.slug} />
                <button
                  key={status.slug}
                  className="block p-3 hover:bg-gray-200 hover:text-gray-900 text-center w-full"
                >
                  {status.name}
                </button>
              </form>
            ))}
        </div>
      }
    >
      <button
        className="py-2 px-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
        type="button"
        title="Delete this part"
      >
        <Trash2 color="#ff0000" />
      </button>
    </Popover>
  );
};

export default DeletePartButton;
