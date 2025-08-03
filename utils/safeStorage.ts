// Safe storage utilities that provide fallbacks when storage APIs are not available
// (e.g., in private browsing mode, SSR environments, or when storage is disabled)

import { useRef } from "react";

// In-memory fallback storage for when sessionStorage/localStorage isn't available
const memoryStorage = new Map<string, string>();

export interface SafeStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  hasKey: (key: string) => boolean;
  clear: () => void;
}

// Safe sessionStorage with in-memory fallback
export const safeSessionStorage: SafeStorage = {
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn("SessionStorage not available, using memory fallback:", error);
      return memoryStorage.get(key) || null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.warn("SessionStorage not available, using memory fallback:", error);
      memoryStorage.set(key, value);
    }
  },

  removeItem: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn("SessionStorage not available, using memory fallback:", error);
      memoryStorage.delete(key);
    }
  },

  hasKey: (key: string): boolean => {
    try {
      return sessionStorage.getItem(key) !== null;
    } catch (error) {
      // Fallback to in-memory check
      return memoryStorage.has(key);
    }
  },

  clear: (): void => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn("SessionStorage not available, clearing memory fallback:", error);
      memoryStorage.clear();
    }
  },
};

// Safe localStorage with in-memory fallback
export const safeLocalStorage: SafeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn("LocalStorage not available, using memory fallback:", error);
      return memoryStorage.get(`local_${key}`) || null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn("LocalStorage not available, using memory fallback:", error);
      memoryStorage.set(`local_${key}`, value);
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("LocalStorage not available, using memory fallback:", error);
      memoryStorage.delete(`local_${key}`);
    }
  },

  hasKey: (key: string): boolean => {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      // Fallback to in-memory check
      return memoryStorage.has(`local_${key}`);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn("LocalStorage not available, clearing memory fallback:", error);
      // Clear only localStorage keys from memory fallback
      const keysToDelete = Array.from(memoryStorage.keys()).filter(key => 
        key.startsWith("local_")
      );
      keysToDelete.forEach(key => memoryStorage.delete(key));
    }
  },
};

// Hook for component-specific in-memory storage (when you need isolated storage per component instance)
export const useSafeComponentStorage = () => {
  const componentStorageRef = useRef(new Map<string, string>());

  return {
    getItem: (key: string): string | null => {
      return componentStorageRef.current.get(key) || null;
    },
    setItem: (key: string, value: string): void => {
      componentStorageRef.current.set(key, value);
    },
    removeItem: (key: string): void => {
      componentStorageRef.current.delete(key);
    },
    hasKey: (key: string): boolean => {
      return componentStorageRef.current.has(key);
    },
    clear: (): void => {
      componentStorageRef.current.clear();
    },
  };
};

// Utility function to check if storage is available
export const isStorageAvailable = (type: 'localStorage' | 'sessionStorage'): boolean => {
  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

// Helper for JSON storage with safe parsing
export const createSafeJSONStorage = (storage: SafeStorage) => ({
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to parse JSON for key "${key}":`, error);
      return defaultValue;
    }
  },

  setItem: <T>(key: string, value: T): void => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to stringify value for key "${key}":`, error);
    }
  },

  removeItem: (key: string): void => {
    storage.removeItem(key);
  },

  hasKey: (key: string): boolean => {
    return storage.hasKey(key);
  },
});

// Pre-configured JSON storage instances
export const safeJSONSessionStorage = createSafeJSONStorage(safeSessionStorage);
export const safeJSONLocalStorage = createSafeJSONStorage(safeLocalStorage);
