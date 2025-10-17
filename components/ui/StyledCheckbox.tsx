"use client";

import { Check } from "lucide-react";

interface StyledCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  yesLabel?: string;
  noLabel?: string;
  showDynamicLabel?: boolean;
  className?: string;
}

const StyledCheckbox = ({
  checked,
  onChange,
  label,
  yesLabel = "Yes",
  noLabel = "No",
  showDynamicLabel = false,
  className = "",
}: StyledCheckboxProps) => {
  const displayLabel = showDynamicLabel
    ? checked
      ? yesLabel
      : noLabel
    : label;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <label
      className={`relative flex items-center cursor-pointer group ${className}`}
    >
      <div
        className={`flex items-center justify-center w-6 h-6 rounded-md border-2 transition-all duration-200 ${
          checked
            ? "bg-blue-600 border-blue-600 text-white"
            : "bg-white border-gray-300 group-hover:border-gray-400"
        }`}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {checked && <Check size={16} strokeWidth={3} />}
      </div>
      {displayLabel && (
        <span className="ml-3 text-sm text-gray-700 cursor-pointer group-hover:text-gray-900">
          {displayLabel}
        </span>
      )}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        aria-hidden="true"
      />
    </label>
  );
};

export default StyledCheckbox;
