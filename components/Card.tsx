import React from "react";
import { cn } from "@/utils/functions";

const Card = ({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) => {
  return (
    <div
      className={cn("rounded-md overflow-hidden shadow-md bg-white", className)}
    >
      {children}
    </div>
  );
};

export default Card;
