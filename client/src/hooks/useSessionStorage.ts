
import { useState, useEffect } from "react";

export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Get initial value from sessionStorage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from sessionStorage", error);
      return initialValue;
    }
  });

  // Update sessionStorage whenever storedValue changes
  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Error writing to sessionStorage", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
