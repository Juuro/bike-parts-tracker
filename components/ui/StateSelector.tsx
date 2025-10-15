"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  Package,
  Wrench,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";

interface PartStatus {
  slug: string;
  name: string;
  available: boolean;
}

interface StateSelectorProps {
  statuses: PartStatus[];
  selectedStatus: string;
  onStatusChange: (statusId: string) => void;
  placeholder?: string;
}

// State categories with icons and colors
const STATE_CATEGORIES = {
  storage: {
    label: "Storage & Active",
    icon: Package,
    color: "text-green-600",
    bgColor: "bg-green-50",
    states: ["in storage", "not for sale"],
  },
  maintenance: {
    label: "Maintenance",
    icon: Wrench,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    states: ["under repair", "broken", "worn", "warranty claim"],
  },
  selling: {
    label: "For Sale",
    icon: ShoppingCart,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    states: ["planned for sale", "for sale", "sold"],
  },
  issues: {
    label: "Issues & Loss",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    states: ["discarded", "stolen", "lost"],
  },
};

export const StateSelector: React.FC<StateSelectorProps> = ({
  statuses,
  selectedStatus,
  onStatusChange,
  placeholder = "Select state...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedStatusObj = statuses.find((s) => s.slug === selectedStatus);

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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Get category for a status
  const getCategoryForStatus = (statusName: string) => {
    const statusLower = statusName.toLowerCase();
    for (const [categoryKey, category] of Object.entries(STATE_CATEGORIES)) {
      if (category.states.some((state) => statusLower.includes(state))) {
        return { key: categoryKey, ...category };
      }
    }
    return null;
  };

  // Group statuses by category
  const categorizedStatuses = Object.entries(STATE_CATEGORIES)
    .map(([key, category]) => ({
      key,
      ...category,
      statuses: statuses.filter((status) =>
        category.states.some((state) =>
          status.name.toLowerCase().includes(state)
        )
      ),
    }))
    .filter((category) => category.statuses.length > 0);

  // Filter statuses based on search
  const filteredCategories = searchTerm
    ? categorizedStatuses
        .map((category) => ({
          ...category,
          statuses: category.statuses.filter((status) =>
            status.name.toLowerCase().includes(searchTerm.toLowerCase())
          ),
        }))
        .filter((category) => category.statuses.length > 0)
    : categorizedStatuses;

  const selectedCategory = selectedStatusObj
    ? getCategoryForStatus(selectedStatusObj.name)
    : null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Selector */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          State <span className="text-red-500">*</span>
        </label>

        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-3.5 border-2 rounded-xl text-left
            transition-all duration-200 ease-in-out
            hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100
            ${
              isOpen
                ? "border-blue-500 ring-4 ring-blue-100"
                : "border-gray-200"
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {selectedCategory && (
                <div className={`p-1.5 rounded-lg ${selectedCategory.bgColor}`}>
                  <selectedCategory.icon
                    size={16}
                    className={selectedCategory.color}
                  />
                </div>
              )}
              <div>
                {selectedStatusObj ? (
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedStatusObj.name}
                    </div>
                    {selectedCategory && (
                      <div className="text-xs text-gray-500">
                        {selectedCategory.label}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">{placeholder}</span>
                )}
              </div>
            </div>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search states..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="max-h-72 overflow-y-auto">
              {filteredCategories.map((category) => (
                <div key={category.key} className="py-2">
                  <div
                    className={`px-3 py-2 ${category.bgColor} ${category.color} text-xs font-semibold uppercase tracking-wide flex items-center space-x-2`}
                  >
                    <category.icon size={14} />
                    <span>{category.label}</span>
                  </div>
                  {category.statuses.map((status) => (
                    <button
                      key={status.slug}
                      type="button"
                      onClick={() => {
                        console.log(
                          `🖱️ Clicked status: ${status.name} (slug: ${status.slug})`
                        );
                        onStatusChange(status.slug);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      className={`
                        w-full px-4 py-3 text-left transition-colors
                        flex items-center justify-between
                        ${
                          selectedStatus === status.slug
                            ? "bg-blue-100 text-blue-800 font-semibold border-l-4 border-blue-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }
                      `}
                    >
                      <span className="capitalize">{status.name}</span>
                      {selectedStatus === status.slug && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                          <span className="text-xs text-blue-600 font-medium">
                            SELECTED
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ))}

              {filteredCategories.length === 0 && (
                <div className="px-4 py-6 text-center text-gray-500">
                  No states found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
