"use client";

import { Loader, Plus } from "lucide-react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  text: string;
};

const SubmitButton: React.FC<SubmitButtonProps> = ({ text }) => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
    >
      {pending ? (
        <Loader strokeWidth={2} className="mr-2 animate-spin-slow" />
      ) : (
        <Plus strokeWidth={3} className="mr-2" />
      )}
      {text}
    </button>
  );
};

export default SubmitButton;
