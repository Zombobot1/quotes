import { useState, useEffect } from 'react'

/**
 * A hook that stores the last non-null/undefined value.
 * @param value The current value which may be null/undefined
 * @param initialValue Optional initial value to use before the first non-null value
 * @returns The last non-null/undefined value, or initialValue if no non-null value has been seen
 */
export function useLastNonNull<T>(value: T): T {
  const [lastValue, setLastValue] = useState(value)

  useEffect(() => {
    if (value !== null && value !== undefined) setLastValue(value)
  }, [value])

  return lastValue
}
