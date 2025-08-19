"use client";

import { LucideIcon } from "lucide-react";

interface SimpleModernInputProps {
  label: string;
  type?: string;
  value?: string | number;
  defaultValue?: string | number;
  name: string;
  required?: boolean;
  placeholder?: string;
  icon?: LucideIcon;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  className?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SimpleModernInput: React.FC<SimpleModernInputProps> = ({
  label,
  type = "text",
  value,
  defaultValue,
  name,
  required = false,
  placeholder,
  icon: Icon,
  min,
  max,
  step,
  className = "",
  disabled = false,
  onChange,
}) => {
  return (
    <div className={`${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
        )}
        <input
          type={type}
          id={name}
          name={name}
          {...(value !== undefined ? { value } : {})}
          {...(value === undefined && defaultValue !== undefined
            ? { defaultValue }
            : {})}
          min={min}
          max={max}
          step={step}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg text-sm
            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200
            hover:border-gray-400 transition-all duration-200
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${Icon ? "pl-12 pr-3" : "px-3"}
          `}
          onChange={onChange}
        />
      </div>
    </div>
  );
};
