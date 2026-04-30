import { useEffect, useState } from "react";

export default function useDebounce<T>(value: T, delay: number) {
  const [debounceValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debounceValue;
}
