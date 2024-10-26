import React, { useState } from "react";

type ManufacturerFormProps = {
  manufacturers: Manufacturer[];
};

const ManufacturerForm: React.FC<ManufacturerFormProps> = ({
  manufacturers = [],
}) => {
  const [newManufacturer, setNewManufacturer] = useState("");

  const handleNewManufacturerChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setNewManufacturer(event.target.value);
    if (
      manufacturers.some(
        (manufacturer) => manufacturer.name === event.target.value
      )
    ) {
      event.target.setCustomValidity("Manufacturer already exists");
    } else {
      event.target.setCustomValidity("");
    }
  };

  return (
    <>
      <input
        type="text"
        name="newManufacturer"
        id="newManufacturer"
        className={`mr-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
        placeholder="Manufacturer"
        value={newManufacturer}
        onChange={(event) => handleNewManufacturerChange(event)}
        required
      />
      <input
        type="text"
        name="manufacturerCountry"
        id="manufacturerCountry"
        className="mr-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        placeholder="Country"
        required
      />
      <input
        type="url"
        name="manufacturerUrl"
        id="manufacturerUrl"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:invalid:ring-red-500 focus:invalid:border-red-500 focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        placeholder="Url"
        required
      />
    </>
  );
};

export default ManufacturerForm;
