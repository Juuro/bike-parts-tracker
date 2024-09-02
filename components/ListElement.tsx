import React from "react";

const ListElement = () => {
  return (
    <li className="flex gap-4">
      <img
        src="https://picsum.photos/100/100"
        className="block rounded-full h-20 w-20 object-cover"
      />
      <div>
        <div className="flex">
          <h4 className="font-bold text-sm">SRAM XX SL</h4>
          <span className="ring-1 text-xs inline-flex rounded-full ring-pink-500 text-pink-500 bg-pink-500/15 py-0 px-1.5 ml-2 items-center ring-inset whitespace-nowrap">
            On Sale
          </span>
          <span className="ring-1 text-xs inline-flex rounded-full ring-yellow-500 text-yellow-500 bg-yellow-500/15 py-0 px-1.5 ml-2 items-center ring-inset whitespace-nowrap">
            Maintenance
          </span>
        </div>
        <p>Kurbel</p>
      </div>
    </li>
  );
};

export default ListElement;
