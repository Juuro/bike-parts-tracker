import React from "react";
import Card from "./Card";
import ListElement from "./ListElement";

const ListCard = ({
  heading,
}: Readonly<{
  heading: string;
}>) => {
  return (
    <Card className="p-4">
      <h3 className="font-bold mb-4 text-xl">{heading}</h3>
      <ul className="space-y-4">
        <ListElement />
        <ListElement />
        <ListElement />
        <ListElement />
      </ul>
    </Card>
  );
};

export default ListCard;
