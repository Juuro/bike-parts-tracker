import React from "react";
import BikeAssignmentForm from "./BikeAssignmentForm";
import Popover from "./Popover";
import { PackagePlus } from "lucide-react";
import { Button } from "./ui/button";

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
      <Button variant="icon" size="icon" type="button" title={titleText}>
        <PackagePlus color="#00ff00" />
      </Button>
    </Popover>
  );
};

export default AssignPartButton;
