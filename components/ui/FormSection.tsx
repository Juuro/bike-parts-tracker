import { LucideIcon } from "lucide-react";

interface FormSectionProps {
  title: string;
  icon: LucideIcon;
  gradient?: "gray" | "green" | "blue";
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon: Icon,
  gradient = "gray",
  children,
}) => {
  const gradients = {
    gray: "from-gray-50 to-white border-gray-100",
    green: "from-green-50 to-white border-green-100",
    blue: "from-blue-50 to-white border-blue-100",
  };

  return (
    <div
      className={`bg-gradient-to-br ${gradients[gradient]} rounded-xl p-4 border shadow-sm`}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <Icon className="h-5 w-5 mr-2 text-gray-600" />
        {title}
      </h3>
      {children}
    </div>
  );
};
