"use client";

import { useState } from "react";
import { LucideIcon } from "lucide-react";

interface ModernInputProps {
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

export const ModernInput: React.FC<ModernInputProps> = ({
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
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value || defaultValue));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(Boolean(e.target.value));
    onChange?.(e);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
          />
        )}
        <input
          type={type}
          name={name}
          value={value}
          defaultValue={defaultValue}
          min={min}
          max={max}
          step={step}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl
            transition-all duration-200 ease-in-out
            focus:border-blue-500 focus:ring-4 focus:ring-blue-100
            hover:border-gray-300
            disabled:bg-gray-50 disabled:text-gray-500
            ${Icon ? "pl-11" : ""}
            ${focused || hasValue ? "pt-6 pb-2" : ""}
          `}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
        />
        <label
          className={`
            absolute left-4 text-gray-500 transition-all duration-200 pointer-events-none
            ${Icon ? "left-11" : "left-4"}
            ${
              focused || hasValue
                ? "top-2 text-xs font-medium text-blue-600"
                : "top-1/2 transform -translate-y-1/2 text-base"
            }
          `}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
    </div>
  );
};
