"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// Configuration constants
const MAX_FILE_SIZE_MB = parseInt(
  process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB || "5",
  10
);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface ImageUploadProps {
  currentImage?: string;
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: () => void;
}

export default function ImageUpload({
  currentImage,
  onImageUpload,
  onImageRemove,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview with currentImage prop changes
  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const validateFile = (file: File): boolean => {
    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB`);
      return false;
    }

    return true;
  };

  const uploadImage = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setPreview(data.url);
      onImageUpload(data.url);
      toast.success("Profile image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadImage(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      uploadImage(files[0]);
    }
  };

  const handleRemoveImage = async () => {
    // If there's a current image that looks like a Cloudinary URL, delete it
    if (currentImage && currentImage.includes("cloudinary.com")) {
      try {
        const response = await fetch("/api/upload/profile-image/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl: currentImage }),
        });

        const result = await response.json();
        if (response.ok) {
          console.log("Image deleted from Cloudinary:", result.message);
        } else {
          console.error("Failed to delete from Cloudinary:", result.error);
          // Continue with removal even if Cloudinary deletion fails
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        // Continue with removal even if deletion API fails
      }
    }

    setPreview(null);
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        <Camera size={16} className="inline mr-1" />
        Profile Image
      </label>

      {/* Current Image Display */}
      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Profile preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            title="Remove image"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isUploading ? openFileDialog : undefined}
      >
        <div className="text-center">
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 size={32} className="text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload size={32} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium text-blue-600">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF or WebP (max {MAX_FILE_SIZE_MB}MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      <p className="text-xs text-gray-500">
        Your profile image will be visible to other users and displayed next to
        your name.
      </p>
    </div>
  );
}
