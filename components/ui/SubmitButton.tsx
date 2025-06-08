"use client";

import { Loader, Plus } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "./button";

interface SubmitButtonProps extends ButtonProps {
  text: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ text, ...props }) => {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      variant="default"
      size="form"
      {...props}
    >
      {pending ? (
        <Loader strokeWidth={2} className="mr-2 animate-spin-slow" />
      ) : (
        <Plus strokeWidth={3} className="mr-2" />
      )}
      {text}
    </Button>
  );
};

export default SubmitButton;
