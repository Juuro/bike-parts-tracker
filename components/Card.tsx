import React from "react";

const Card = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className={`rounded-md overflow-hidden shadow-md bg-white`}>
      {children}
    </div>
  );
};

export default Card;
