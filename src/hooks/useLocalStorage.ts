import { useEffect, useRef, useState } from "react";

type Serializer<T> = (value: T) => string;
type Deserializer<T> = (value: string | null) => T;

const noopSerializer: Serializer<unknown> = (value) =>
  JSON.stringify(value, (_key, val) => (val === undefined ? null : val));
const noopDeserializer: Deserializer<unknown> = (value) =>
  (value ? JSON.parse(value) : null) as unknown;

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    serializer?: Serializer<T>;
    deserializer?: Deserializer<T>;
  },
) {
  const serializer = useRef<Serializer<T>>(options?.serializer ?? noopSerializer as Serializer<T>);
  const deserializer = useRef<Deserializer<T>>(options?.deserializer ?? (noopDeserializer as Deserializer<T>));

  const readValue = () => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item === null ? initialValue : (deserializer.current(item) as T);
    } catch (error) {
      console.warn(`Unable to read localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = (value: T | ((prev: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);

    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, serializer.current(valueToStore));
    } catch (error) {
      console.warn(`Unable to write localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Unable to remove localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}
