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
  label?: string;
  name?: string;
  required?: boolean;
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
  label,
  name,
  required = false,
}: CustomSelectProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const selectedOption = options.find((option) => option.id === selectedValue);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    getDisplayText(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Clear search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

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
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
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
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto flex flex-col"
          style={{
            minHeight: "100px",
            maxHeight: "240px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
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
            <div className="max-h-48 overflow-y-auto flex flex-col">
              <div className="px-3 py-1 text-xs text-gray-500 border-b sticky top-0 bg-white flex-shrink-0">
                {searchTerm
                  ? `${filteredOptions.length} of ${options.length} options`
                  : `${options.length} options available`}
              </div>
              <div className="flex flex-col flex-1">
                {filteredOptions.map((option, index) => (
                  <button
                    key={option.id || index}
                    type="button"
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex-shrink-0 ${
                      option.id === selectedValue
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-900"
                    }`}
                    onClick={() => {
                      console.log(`🔧 Clicked option:`, option);
                      onSelect(option.id);
                      setIsOpen(false);
                    }}
                  >
                    {getDisplayText(option)}
                  </button>
                ))}
                {filteredOptions.length === 0 && searchTerm && (
                  <div className="px-3 py-4 text-center text-gray-500 text-sm">
                    No results found for &quot;{searchTerm}&quot;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
