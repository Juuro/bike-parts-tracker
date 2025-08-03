// Profile utilities for the bike parts tracker application
import { isCloudinaryUrl } from "./cloudinaryUtils";

export const SUPPORTED_CURRENCIES = [
  { value: "USD", label: "US Dollar (USD)", symbol: "$" },
  { value: "EUR", label: "Euro (EUR)", symbol: "€" },
  { value: "GBP", label: "British Pound (GBP)", symbol: "£" },
  { value: "CHF", label: "Swiss Franc (CHF)", symbol: "CHF" },
  { value: "CAD", label: "Canadian Dollar (CAD)", symbol: "C$" },
  { value: "AUD", label: "Australian Dollar (AUD)", symbol: "A$" },
  { value: "JPY", label: "Japanese Yen (JPY)", symbol: "¥" },
  { value: "NZD", label: "New Zealand Dollar (NZD)", symbol: "NZ$" },
  { value: "INR", label: "Indian Rupee (INR)", symbol: "₹" },
  { value: "ZAR", label: "South African Rand (ZAR)", symbol: "R" },
  { value: "SGD", label: "Singapore Dollar (SGD)", symbol: "S$" },
  { value: "HKD", label: "Hong Kong Dollar (HKD)", symbol: "HK$" },
];

export const getDefaultCurrencyByLocale = (): string => {
  // Try to use the browser's locale to guess a default currency
  if (typeof window !== "undefined" && window.navigator.language) {
    const locale = window.navigator.language;

    // Map common locales to currencies
    const localeToCurrency: { [key: string]: string } = {
      "en-US": "USD",
      "en-GB": "GBP",
      "en-AU": "AUD",
      "de-DE": "EUR",
      "de-CH": "CHF",
      "fr-FR": "EUR",
      "fr-CH": "CHF",
      "ja-JP": "JPY",
      "es-ES": "EUR",
      "en-CA": "CAD",
      "fr-CA": "CAD",
    };

    // Check for exact match first
    if (localeToCurrency[locale]) {
      return localeToCurrency[locale];
    }

    // Check for language prefix matches
    const language = locale.split("-")[0];
    if (language === "de") return "EUR";
    if (language === "fr") return "EUR";
    if (language === "es") return "EUR";
    if (language === "ja") return "JPY";
    if (language === "en") {
      // Try to infer currency from region if possible
      const region = locale.split("-")[1];
      switch (region) {
        case "GB":
          return "GBP";
        case "AU":
          return "AUD";
        case "NZ":
          return "NZD";
        case "IE":
          return "EUR";
        case "IN":
          return "INR";
        case "CA":
          return "CAD";
        case "ZA":
          return "ZAR";
        case "SG":
          return "SGD";
        case "HK":
          return "HKD";
        case "US":
          return "USD";
        default:
          return "USD"; // Fallback for unknown English region
      }
    }
  }

  // Fallback to USD
  return "USD";
};

export const SUPPORTED_WEIGHT_UNITS = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "lbs", label: "Pounds (lbs)" },
  { value: "g", label: "Grams (g)" },
];

export const SUPPORTED_DISTANCE_UNITS = [
  { value: "km", label: "Kilometers (km)" },
  { value: "mi", label: "Miles (mi)" },
];

export const validateProfileImage = (url: string): boolean => {
  if (!url) return true; // Empty URL is valid (will use default)

  try {
    new URL(url);

    // Enhanced validation using Cloudinary utilities
    if (isCloudinaryUrl(url)) {
      return true; // Cloudinary URLs are always valid
    }

    // Check if URL ends with common image extensions
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const hasValidExtension = imageExtensions.some((ext) =>
      url.toLowerCase().endsWith(ext)
    );

    // Allow common image hosting domains even without file extensions
    const imageDomains = [
      "imgur.com",
      "gravatar.com",
      "googleusercontent.com",
      "githubusercontent.com",
    ];
    const parsedUrl = new URL(url);
    const hasValidDomain = imageDomains.some((domain) => {
      const hostname = parsedUrl.hostname.toLowerCase();
      const normalizedDomain = domain.toLowerCase();
      return (
        hostname === normalizedDomain ||
        hostname.endsWith(`.${normalizedDomain}`)
      );
    });

    return hasValidExtension || hasValidDomain;
  } catch {
    return false;
  }
};

export const validateStravaUsername = (username: string): boolean => {
  if (!username) return true; // Empty username is valid

  // Strava usernames should be alphanumeric with underscores and hyphens
  const stravaUsernameRegex = /^[a-zA-Z0-9_-]+$/;
  return (
    stravaUsernameRegex.test(username) &&
    username.length >= 3 &&
    username.length <= 30
  );
};

export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.value === currencyCode);
  return currency?.symbol || currencyCode;
};

export const formatWeight = (weight: number, unit: string): string => {
  if (unit === "lbs") {
    return `${weight.toFixed(1)} lbs`;
  } else if (unit === "g") {
    return `${weight} g`;
  }
  return `${weight} kg`;
};

export const formatDistance = (distance: number, unit: string): string => {
  if (unit === "mi") {
    return `${distance.toFixed(1)} mi`;
  }
  return `${distance.toFixed(1)} km`;
};
