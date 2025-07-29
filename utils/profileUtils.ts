// Profile utilities for the bike parts tracker application

export const SUPPORTED_CURRENCIES = [
  { value: "USD", label: "US Dollar (USD)", symbol: "$" },
  { value: "EUR", label: "Euro (EUR)", symbol: "€" },
  { value: "GBP", label: "British Pound (GBP)", symbol: "£" },
  { value: "CHF", label: "Swiss Franc (CHF)", symbol: "CHF" },
  { value: "CAD", label: "Canadian Dollar (CAD)", symbol: "C$" },
  { value: "AUD", label: "Australian Dollar (AUD)", symbol: "A$" },
  { value: "JPY", label: "Japanese Yen (JPY)", symbol: "¥" },
];

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
    // Check if URL ends with common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasValidExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    );
    
    // Allow common image hosting domains even without file extensions
    const imageDomains = ['imgur.com', 'gravatar.com', 'googleusercontent.com', 'githubusercontent.com'];
    const hasValidDomain = imageDomains.some(domain => 
      url.toLowerCase().includes(domain)
    );
    
    return hasValidExtension || hasValidDomain;
  } catch {
    return false;
  }
};

export const validateStravaUsername = (username: string): boolean => {
  if (!username) return true; // Empty username is valid
  
  // Strava usernames should be alphanumeric with underscores and hyphens
  const stravaUsernameRegex = /^[a-zA-Z0-9_-]+$/;
  return stravaUsernameRegex.test(username) && username.length >= 3 && username.length <= 30;
};

export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = SUPPORTED_CURRENCIES.find(c => c.value === currencyCode);
  return currency?.symbol || currencyCode;
};

export const formatWeight = (weight: number, unit: string): string => {
  if (unit === 'lbs') {
    return `${weight.toFixed(1)} lbs`;
  } else if (unit === 'g') {
    return `${weight} g`;
  }
  return `${weight} kg`;
};

export const formatDistance = (distance: number, unit: string): string => {
  if (unit === 'mi') {
    return `${distance.toFixed(1)} mi`;
  }
  return `${distance.toFixed(1)} km`;
};
