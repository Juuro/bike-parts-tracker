import React from "react";

const Card = ({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) => {
  return (
    <div
      className={`rounded-md overflow-hidden shadow-md bg-white ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
