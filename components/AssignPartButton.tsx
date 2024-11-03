import React from "react";
import BikeAssignmentForm from "./BikeAssignmentForm";
import Popover from "./Popover";
import { PackagePlus } from "lucide-react";

interface AssignPartButtonProps {
  bikes: Bike[];
  partId: string;
  titleText: string;
}

const AssignPartButton: React.FC<AssignPartButtonProps> = ({
  bikes,
  partId,
  titleText,
}) => {
  return (
    <Popover
      content={
        <div className="pb-4" role="none">
          <p className="p-3 font-bold text-center">Assign to bike</p>
          {bikes?.map((bike: Bike) => (
            <BikeAssignmentForm key={bike.id} bike={bike} partId={partId} />
          ))}
        </div>
      }
    >
      <button
        className="py-2 px-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
        type="button"
        title={titleText}
      >
        <PackagePlus color="#00ff00" />
      </button>
    </Popover>
  );
};

export default AssignPartButton;
