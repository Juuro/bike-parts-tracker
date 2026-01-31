"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

type BikeImageGalleryProps = {
  images: string[];
  bikeName: string;
};

const BikeImageGallery: React.FC<BikeImageGalleryProps> = ({
  images,
  bikeName,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handlePrevImage = useCallback(() => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  }, [images.length]);

  const handleNextImage = useCallback(() => {
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  }, [images.length]);

  const openLightbox = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      switch (event.key) {
        case "ArrowLeft":
          if (images.length > 1) handlePrevImage();
          break;
        case "ArrowRight":
          if (images.length > 1) handleNextImage();
          break;
        case "Escape":
          closeLightbox();
          event.preventDefault();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handlePrevImage,
    handleNextImage,
    images.length,
    isLightboxOpen,
    closeLightbox,
  ]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLightboxOpen]);

  if (!images || images.length === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "320px" }}
      >
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">📷</span>
          </div>
          <p className="text-sm">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Masonry Gallery */}
      <div style={{ height: "320px" }}>
        <div
          className="h-full"
          style={{
            display: "grid",
            gridTemplateColumns: (() => {
              if (images.length <= 1) return "1fr";
              if (images.length <= 4) return "1fr 1fr";
              if (images.length <= 6) return "1fr 1fr 1fr";
              return "1fr 1fr 1fr 1fr";
            })(),
            gridTemplateRows: (() => {
              // Simple, reliable rows with uniform heights
              if (images.length <= 1) return "1fr";
              if (images.length <= 4) return "1fr 1fr";
              if (images.length <= 6) return "1fr 1fr";
              return "1fr 1fr 1fr";
            })(),
            gap: "8px",
          }}
        >
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group cursor-pointer min-h-[80px]"
            >
              <Image
                src={image}
                width={250}
                height={150}
                alt={`${bikeName} - Image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

              {/* Expand icon on hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="bg-white/90 text-gray-800 p-1.5 rounded shadow-sm">
                  <Expand size={12} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>

          {/* Main lightbox image */}
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <Image
              src={images[selectedImageIndex]}
              width={1200}
              height={800}
              alt={`${bikeName} - Image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              priority
            />

            {/* Navigation arrows - only show if more than 1 image */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-200 hover:scale-110"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={32} />
                </button>

                <button
                  onClick={handleNextImage}
                  className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-200 hover:scale-110"
                  aria-label="Next image"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full font-medium">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BikeImageGallery;
