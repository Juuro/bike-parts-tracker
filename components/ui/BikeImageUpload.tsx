"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface BikeImageUploadProps {
  existingImages?: string[]; // URLs of existing images
  onImagesChange: (files: FileList | null) => void; // Callback for new files
  onImageRemove: (index: number, imageUrl: string) => void; // Remove existing image
  maxImages?: number; // Default 4
  maxSizeMB?: number; // Default 10
  label?: string;
  description?: string;
  name?: string; // Form field name
}

const BikeImageUpload: React.FC<BikeImageUploadProps> = ({
  existingImages = [],
  onImagesChange,
  onImageRemove,
  maxImages = 4,
  maxSizeMB = 10,
  label = "Images",
  description,
  name = "images",
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please select only image files (JPEG, PNG, GIF, WebP)");
        return false;
      }

      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setError(`File size must be less than ${maxSizeMB}MB`);
        return false;
      }

      return true;
    },
    [maxSizeMB]
  );

  const createPreview = useCallback((file: File): string => {
    return URL.createObjectURL(file);
  }, []);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      setError("");
      const fileArray = Array.from(files);

      // Check total count
      const totalImages =
        existingImages.length + selectedFiles.length + fileArray.length;
      if (totalImages > maxImages) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }

      // Validate each file
      const validFiles: File[] = [];
      for (const file of fileArray) {
        if (validateFile(file)) {
          validFiles.push(file);
        } else {
          return; // Stop on first invalid file
        }
      }

      if (validFiles.length > 0) {
        const newFiles = [...selectedFiles, ...validFiles];
        setSelectedFiles(newFiles);

        // Create previews for new files
        const newPreviews = validFiles.map(createPreview);
        setPreviews([...previews, ...newPreviews]);

        // Create FileList for form submission
        const dataTransfer = new DataTransfer();
        newFiles.forEach((file) => dataTransfer.items.add(file));
        const fileList = dataTransfer.files;

        // Set files on the actual input element
        if (fileInputRef.current) {
          fileInputRef.current.files = fileList;
        }

        onImagesChange(fileList);
      }
    },
    [
      existingImages.length,
      selectedFiles,
      maxImages,
      validateFile,
      createPreview,
      previews,
      onImagesChange,
    ]
  );

  const removeNewFile = useCallback(
    (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      const newPreviews = previews.filter((_, i) => i !== index);

      setSelectedFiles(newFiles);
      setPreviews(newPreviews);

      // Update form with remaining files
      if (newFiles.length > 0) {
        const dataTransfer = new DataTransfer();
        newFiles.forEach((file) => dataTransfer.items.add(file));
        const fileList = dataTransfer.files;

        // Set files on the actual input element
        if (fileInputRef.current) {
          fileInputRef.current.files = fileList;
        }

        onImagesChange(fileList);
      } else {
        // Clear the input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onImagesChange(null);
      }
    },
    [selectedFiles, previews, onImagesChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const allImages = [...existingImages, ...previews];
  const remainingSlots = maxImages - allImages.length;

  return (
    <div className="space-y-4">
      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {description && (
            <span className="text-gray-500 ml-1">{description}</span>
          )}
        </label>
      </div>

      {/* Error Message */}
      {error && <div className="text-red-500 text-sm">{error}</div>}

      {/* Image Grid */}
      {allImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Existing Images */}
          {existingImages.map((imageUrl, index) => (
            <div key={`existing-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={imageUrl}
                  alt={`Existing image ${index + 1}`}
                  width={150}
                  height={150}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => onImageRemove(index, imageUrl)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {/* New File Previews */}
          {previews.map((preview, index) => (
            <div key={`new-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={preview}
                  alt={`New image ${index + 1}`}
                  width={150}
                  height={150}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeNewFile(index)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {remainingSlots > 0 && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-gray-100 rounded-full">
              {isDragging ? (
                <Upload className="h-6 w-6 text-blue-500" />
              ) : (
                <ImageIcon className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isDragging ? "Drop images here" : "Drag and drop images here"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                or{" "}
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="text-blue-600 hover:text-blue-500 underline"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Up to {remainingSlots} more image
                {remainingSlots !== 1 ? "s" : ""} • Max {maxSizeMB}MB each
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        name={name}
        accept="image/*"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />

      {/* File Count Indicator */}
      {allImages.length > 0 && (
        <div className="text-xs text-gray-500">
          {allImages.length} of {maxImages} images selected
        </div>
      )}
    </div>
  );
};

export default BikeImageUpload;
