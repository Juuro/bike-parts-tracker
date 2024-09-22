"use client";
import { useRef, useState, ReactNode, useEffect } from "react";

interface PopoverProps {
  children: ReactNode;
  content: ReactNode;
}

const Popover: React.FC<PopoverProps> = ({ children, content }) => {
  const [show, setShow] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const handleClick = () => {
    setShow((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative flex justify-center w-fit h-fit">
      <div onClick={handleClick}>{children}</div>
      {show && (
        <div className="min-w-fit h-fit absolute z-50 transition-all">
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-1/2 z-10 mb-2 min-w-fit origin-top-center rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-2">
              <div className="h-5 w-5 rotate-45 rounded bg-white"></div>
            </div>
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default Popover;
