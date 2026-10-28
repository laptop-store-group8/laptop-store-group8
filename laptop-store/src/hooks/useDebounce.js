import { useEffect, useState } from 'react';

/**
 * Return the latest value after it has remained unchanged for `delay` ms.
 *
 * @template T
 * @param {T} value
 * @param {number} delay
 * @returns {T}
 *
 * @example
 * const debouncedSearch = useDebounce(search, 300);
 */
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
