// Cloudinary utility functions for URL parsing and image management

/**
 * Extracts the public_id from a Cloudinary URL
 * Handles various Cloudinary URL formats with or without file extensions, versions, and transformations
 *
 * @param url - The Cloudinary URL to parse
 * @returns The extracted public_id or null if not a valid Cloudinary URL
 *
 * @example
 * extractPublicId('https://res.cloudinary.com/demo/image/upload/v123/folder/image.jpg')
 * // Returns: 'folder/image'
 *
 * extractPublicId('https://res.cloudinary.com/demo/image/upload/folder/image')
 * // Returns: 'folder/image'
 */
export const extractPublicIdFromCloudinaryUrl = (
  url: string
): string | null => {
  try {
    // Check if it's a Cloudinary URL
    if (!url.includes("cloudinary.com")) {
      return null;
    }

    // Parse the URL structure
    const urlParts = url.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");

    if (uploadIndex === -1) {
      return null;
    }

    // Find the public_id part (after upload and optional version)
    let publicIdIndex = uploadIndex + 1;

    // Skip version if present (starts with 'v' followed by numbers)
    if (urlParts[publicIdIndex] && /^v\d+$/.test(urlParts[publicIdIndex])) {
      publicIdIndex++;
    }

    // Get everything from publicIdIndex to the end
    const publicIdParts = urlParts.slice(publicIdIndex);
    if (publicIdParts.length === 0) {
      return null;
    }

    // Join the parts and clean up
    let publicId = publicIdParts.join("/");

    // Remove query parameters and fragments
    publicId = publicId.split("?")[0].split("#")[0];

    // Remove file extension if present
    publicId = publicId.replace(/\.[a-zA-Z0-9]+$/, "");

    return publicId || null;
  } catch (error) {
    console.error("Error parsing Cloudinary URL:", error);
    return null;
  }
};

/**
 * Validates if a URL is a Cloudinary URL
 *
 * @param url - The URL to validate
 * @returns True if it's a valid Cloudinary URL format
 */
export const isCloudinaryUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname.includes("cloudinary.com") &&
      url.includes("/image/upload/")
    );
  } catch {
    return false;
  }
};

/**
 * Extracts the cloud name from a Cloudinary URL
 *
 * @param url - The Cloudinary URL
 * @returns The cloud name or null if not found
 *
 * @example
 * extractCloudName('https://res.cloudinary.com/demo/image/upload/v123/sample.jpg')
 * // Returns: 'demo'
 */
export const extractCloudName = (url: string): string | null => {
  try {
    if (!isCloudinaryUrl(url)) {
      return null;
    }

    const urlParts = url.split("/");
    const cloudinaryIndex = urlParts.findIndex((part) =>
      part.includes("cloudinary.com")
    );

    if (cloudinaryIndex !== -1 && urlParts[cloudinaryIndex + 1]) {
      return urlParts[cloudinaryIndex + 1];
    }

    return null;
  } catch (error) {
    console.error("Error extracting cloud name:", error);
    return null;
  }
};

/**
 * Builds a Cloudinary URL with the given public_id and transformations
 *
 * @param cloudName - The Cloudinary cloud name
 * @param publicId - The public_id of the image
 * @param transformations - Optional transformation parameters
 * @returns The constructed Cloudinary URL
 */
export const buildCloudinaryUrl = (
  cloudName: string,
  publicId: string,
  transformations?: string
): string => {
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  const transformPart = transformations ? `/${transformations}` : "";
  return `${baseUrl}${transformPart}/${publicId}`;
};

/**
 * Generates a transformation string for Cloudinary URLs
 *
 * @param options - Transformation options
 * @returns Transformation string for use in Cloudinary URLs
 *
 * @example
 * generateTransformations({ width: 400, height: 400, crop: 'fill' })
 * // Returns: 'w_400,h_400,c_fill'
 */
export const generateTransformations = (options: {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string | number;
  format?: string;
  gravity?: string;
}): string => {
  const transformations: string[] = [];

  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  if (options.gravity) transformations.push(`g_${options.gravity}`);

  return transformations.join(",");
};

/**
 * Common transformation presets for different use cases
 */
export const CLOUDINARY_PRESETS = {
  // Profile images
  PROFILE_AVATAR: "w_400,h_400,c_fill,g_face,q_auto,f_auto",
  PROFILE_THUMBNAIL: "w_150,h_150,c_fill,g_face,q_auto,f_auto",

  // Bike images
  BIKE_CARD: "w_300,h_200,c_fill,q_auto,f_auto",
  BIKE_DETAIL: "w_800,h_600,c_fit,q_auto,f_auto",
  BIKE_THUMBNAIL: "w_100,h_100,c_fill,q_auto,f_auto",

  // Part images
  PART_CARD: "w_250,h_250,c_fill,q_auto,f_auto",
  PART_DETAIL: "w_600,h_600,c_fit,q_auto,f_auto",

  // General optimization
  AUTO_OPTIMIZE: "q_auto,f_auto",
} as const;

/**
 * Applies a preset transformation to a Cloudinary URL
 *
 * @param url - The original Cloudinary URL
 * @param preset - The transformation preset to apply
 * @returns The URL with transformations applied
 */
export const applyPresetToUrl = (url: string, preset: string): string => {
  const publicId = extractPublicIdFromCloudinaryUrl(url);
  const cloudName = extractCloudName(url);

  if (!publicId || !cloudName) {
    return url; // Return original if we can't parse it
  }

  return buildCloudinaryUrl(cloudName, publicId, preset);
};

/**
 * Extracts version number from a Cloudinary URL
 *
 * @param url - The Cloudinary URL
 * @returns The version number or null if not versioned
 */
export const extractVersion = (url: string): string | null => {
  try {
    const urlParts = url.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");

    if (uploadIndex !== -1 && urlParts[uploadIndex + 1]) {
      const versionPart = urlParts[uploadIndex + 1];
      if (/^v\d+$/.test(versionPart)) {
        return versionPart;
      }
    }

    return null;
  } catch {
    return null;
  }
};

// Type definitions for better TypeScript support
export interface CloudinaryUrlParts {
  cloudName: string | null;
  publicId: string | null;
  version: string | null;
  isValid: boolean;
}

/**
 * Parses a Cloudinary URL and returns all its components
 *
 * @param url - The Cloudinary URL to parse
 * @returns Object containing all parsed components
 */
export const parseCloudinaryUrl = (url: string): CloudinaryUrlParts => {
  return {
    cloudName: extractCloudName(url),
    publicId: extractPublicIdFromCloudinaryUrl(url),
    version: extractVersion(url),
    isValid: isCloudinaryUrl(url),
  };
};
