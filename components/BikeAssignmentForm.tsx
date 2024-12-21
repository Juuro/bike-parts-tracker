import insertInstallation from "@/app/actions/insertInstallation";
import React from "react";

interface BikeAssignmentFormProps {
  bike: Bike;
  partId: string;
}

const BikeAssignmentForm: React.FC<BikeAssignmentFormProps> = ({
  bike,
  partId,
}) => {
  return (
    <form
      action={insertInstallation}
      className="border-t last-of-type:border-b"
    >
      <input type="hidden" name="part_id" value={partId} />
      <input type="hidden" name="bike_id" value={bike.id} />
      <button
        key={bike.id}
        type="submit"
        className="block p-3 hover:bg-gray-200 hover:text-gray-900 text-center w-full"
      >
        {bike.name}
      </button>
    </form>
  );
};

export default BikeAssignmentForm;
