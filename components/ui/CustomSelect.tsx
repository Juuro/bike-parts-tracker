"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export interface CustomSelectProps {
  options: any[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  getDisplayText: (option: any) => string;
  allowEmpty?: boolean;
  className?: string;
}

const CustomSelect = ({
  options,
  selectedValue,
  onSelect,
  placeholder,
  isOpen,
  setIsOpen,
  getDisplayText,
  allowEmpty = false,
  className = "",
}: CustomSelectProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.id === selectedValue);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 text-left flex items-center justify-between min-w-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={`truncate ${
            selectedOption ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {selectedOption ? getDisplayText(selectedOption) : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {allowEmpty && (
            <button
              type="button"
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                !selectedValue ? "bg-blue-50 text-blue-700" : "text-gray-900"
              }`}
              onClick={() => {
                onSelect("");
                setIsOpen(false);
              }}
            >
              {placeholder === "Select bike"
                ? "Not assigned to a bike"
                : "None"}
            </button>
          )}
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">
              No options available
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                  option.id === selectedValue
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-900"
                }`}
                onClick={() => {
                  onSelect(option.id);
                  setIsOpen(false);
                }}
              >
                {getDisplayText(option)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
