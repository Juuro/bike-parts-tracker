// Safe storage utilities that provide fallbacks when storage APIs are not available
// (e.g., in private browsing mode, SSR environments, or when storage is disabled)

import { useRef } from "react";

// In-memory fallback storage for when sessionStorage/localStorage isn't available

// Returns a per-window memory storage (client-only), or a no-op storage on the server
function getMemoryStorage(): Map<string, string> {
  if (typeof window !== "undefined") {
    // Use a single Map per window (client)
    if (!(window as any).__memoryStorage) {
      (window as any).__memoryStorage = new Map<string, string>();
    }
    return (window as any).__memoryStorage as Map<string, string>;
  } else {
    // Server-side no-op storage that implements Map interface
    const serverMap = {
      get: (_key: string) => undefined,
      set: (key: string, value: string) => serverMap as any,
      delete: (_key: string) => false,
      has: (_key: string) => false,
      clear: () => {},
      keys: () => [][Symbol.iterator](),
      values: () => [][Symbol.iterator](),
      entries: () => [][Symbol.iterator](),
      forEach: () => {},
      size: 0,
      [Symbol.iterator]: () => [][Symbol.iterator](),
      [Symbol.toStringTag]: "Map",
    };
    return serverMap as unknown as Map<string, string>;
  }
}
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
      console.warn(
        "SessionStorage not available, using memory fallback:",
        error
      );
      return getMemoryStorage().get(key) || null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.warn(
        "SessionStorage not available, using memory fallback:",
        error
      );
      getMemoryStorage().set(key, value);
    }
  },

  removeItem: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(
        "SessionStorage not available, using memory fallback:",
        error
      );
      getMemoryStorage().delete(key);
    }
  },

  hasKey: (key: string): boolean => {
    try {
      return sessionStorage.getItem(key) !== null;
    } catch (error) {
      // Fallback to in-memory check
      return getMemoryStorage().has(key);
    }
  },

  clear: (): void => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn(
        "SessionStorage not available, clearing memory fallback:",
        error
      );
      getMemoryStorage().clear();
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
      return getMemoryStorage().get(`local_${key}`) || null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn("LocalStorage not available, using memory fallback:", error);
      getMemoryStorage().set(`local_${key}`, value);
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("LocalStorage not available, using memory fallback:", error);
      getMemoryStorage().delete(`local_${key}`);
    }
  },

  hasKey: (key: string): boolean => {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      // Fallback to in-memory check
      return getMemoryStorage().has(`local_${key}`);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn(
        "LocalStorage not available, clearing memory fallback:",
        error
      );
      // Clear only localStorage keys from memory fallback
      const memStorage = getMemoryStorage();
      const keysToDelete = Array.from(memStorage.keys()).filter((key: string) =>
        key.startsWith("local_")
      );
      keysToDelete.forEach((key) => memStorage.delete(key));
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
export const isStorageAvailable = (
  type: "localStorage" | "sessionStorage"
): boolean => {
  try {
    const storage = window[type];
    const testKey = "__storage_test__";
    storage.setItem(testKey, "test");
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
