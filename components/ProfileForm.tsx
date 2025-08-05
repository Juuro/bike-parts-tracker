"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { User, Camera, Scale, Route, Coins, FileText } from "lucide-react";
import updateUserProfile from "../app/actions/updateUserProfile";
import StravaConnection from "./StravaConnection";
import StravaBikesList from "./StravaBikesList";
import ImageUpload from "./ImageUpload";
import {
  validateProfileImage,
  validateStravaUsername,
  getDefaultCurrencyByLocale,
} from "@/utils/profileUtils";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  currency_unit?: string;
  weight_unit?: string;
  distance_unit?: string;
  strava_user?: string;
}

interface AvailableUnits {
  currency_unit: Array<{ unit: string; label: string; symbol: string }>;
  weight_unit: Array<{ unit: string; label: string }>;
  distance_unit: Array<{ unit: string; label: string }>;
}

interface ProfileFormProps {
  userProfile: UserProfile;
  availableUnits: AvailableUnits;
}

export default function ProfileForm({
  userProfile,
  availableUnits,
}: ProfileFormProps) {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(
    userProfile.image || null
  );
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Update uploadedImage when userProfile.image changes (after successful update)
  useEffect(() => {
    setUploadedImage(userProfile.image || null);
  }, [userProfile.image]);

  const validateForm = (formData: FormData): boolean => {
    const errors: Record<string, string> = {};

    const name = formData.get("name")?.toString() || "";
    const image = formData.get("image")?.toString() || "";
    const stravaUser = formData.get("strava_user")?.toString() || "";

    // Validate name
    if (!name || name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long";
    }

    // Validate profile image URL
    if (image && !validateProfileImage(image)) {
      errors.image = "Please enter a valid image URL";
    }

    // Validate Strava username
    if (stravaUser && !validateStravaUsername(stravaUser)) {
      errors.strava_user =
        "Strava username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setValidationErrors({});

    // Debug: Log all form data

    if (!validateForm(formData)) {
      setIsLoading(false);
      return;
    }

    try {
      // First, update the user profile
      await updateUserProfile(formData);

      // If there's an image marked for deletion, delete it now after successful profile update
      if (imageToDelete) {
        try {
          const response = await fetch("/api/upload/profile-image/delete", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ imageUrl: imageToDelete }),
          });

          const result = await response.json();
          if (response.ok) {
            console.log("Old image deleted from Cloudinary:", result.message);
            setImageToDelete(null); // Clear the deletion queue
          } else {
            console.error("Failed to delete old image:", result.error);
            // Don't fail the entire operation for this
          }
        } catch (deleteError) {
          console.error("Error deleting old image:", deleteError);
          // Don't fail the entire operation for this
        }
      }

      // Force session refresh by calling update with trigger refresh
      try {
        await update();
      } catch (sessionError) {
        console.error("Session refresh error:", sessionError);
        const errorMessage =
          sessionError instanceof Error
            ? sessionError.message
            : "An unknown error occurred during session refresh.";
        toast.error(
          `Profile updated, but failed to refresh session: ${errorMessage}. Please log out and log back in.`
        );
      }

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Profile update error:", error);
      const errorMessage =
        error.message || "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
              <FileText size={20} className="text-blue-600" />
              Basic Information
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Update your personal information and profile settings
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Display Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={userProfile.name}
                required
                className={`w-full ${
                  validationErrors.name ? "border-red-500" : ""
                }`}
                placeholder="Enter your full name"
              />
              {validationErrors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={userProfile.email}
                disabled
                className="w-full bg-gray-50 cursor-not-allowed"
                title="Email cannot be changed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email address is managed by your authentication provider
              </p>
            </div>

            <div>
              <ImageUpload
                currentImage={uploadedImage || undefined}
                onImageUpload={(imageUrl) => {
                  console.log(
                    "ImageUpload callback - setting uploadedImage to:",
                    imageUrl
                  );
                  setUploadedImage(imageUrl);
                }}
                onImageRemove={() => {
                  console.log("ImageUpload callback - removing image from UI");
                  setUploadedImage(null); // Clear the UI immediately
                }}
                onImageMarkForDeletion={(imageUrl) => {
                  console.log(
                    "ImageUpload callback - marking image for deletion:",
                    imageUrl
                  );
                  setImageToDelete(imageUrl); // Mark for deletion on form submit
                }}
              />
              {/* Hidden input to pass the image URL to the form */}
              <input type="hidden" name="image" value={uploadedImage ?? ""} />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
              <Scale size={20} className="text-green-600" />
              Units & Preferences
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure your preferred units and external integrations
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="weight_unit"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Scale size={16} className="inline mr-1" />
                Weight Unit
              </label>
              <select
                id="weight_unit"
                name="weight_unit"
                defaultValue={
                  userProfile.weight_unit ||
                  (availableUnits.weight_unit[0]?.unit ?? "kg")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {availableUnits.weight_unit.map((unit) => (
                  <option key={unit.unit} value={unit.unit}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="distance_unit"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Route size={16} className="inline mr-1" />
                Distance Unit
              </label>
              <select
                id="distance_unit"
                name="distance_unit"
                defaultValue={
                  userProfile.distance_unit ||
                  (availableUnits.distance_unit[0]?.unit ?? "km")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {availableUnits.distance_unit.map((unit) => (
                  <option key={unit.unit} value={unit.unit}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="currency_unit"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Coins size={16} className="inline mr-1" />
                Currency
              </label>
              <select
                id="currency_unit"
                name="currency_unit"
                defaultValue={
                  userProfile.currency_unit ||
                  (availableUnits.currency_unit[0]?.unit ??
                    getDefaultCurrencyByLocale())
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {availableUnits.currency_unit.map((currency) => (
                  <option key={currency.unit} value={currency.unit}>
                    {currency.label} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            <StravaConnection
              onConnectionChange={(connected) => {
                setStravaConnected(connected);
              }}
            />

            <StravaBikesList stravaConnected={stravaConnected} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="px-8 py-2">
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Updating...
            </>
          ) : (
            "Update Profile"
          )}
        </Button>
      </div>
    </form>
  );
}
